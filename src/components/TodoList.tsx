import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Repeat, Flag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TodoForm, { TodoFormData } from "./TodoForm";
import GradientText from "@/components/ui/gradient-text";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Todo {
  _id?: string;
  id?: number;
  title?: string;
  text?: string;
  completed: boolean;
  repeatType?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  repeatInterval?: number;
  repeatDays?: number[];
  repeatLimit?: number | null;
  repeatCount?: number;
  repeatEndDate?: string | null;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
}

interface AnimatedTodoProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  index: number;
}

const priorityColors = {
  low: "text-muted-foreground",
  medium: "text-yellow-500",
  high: "text-red-500",
};

// Activity grid colors converted to hex
const activityGradientColors = ["#5ca8e0", "#9b7ed9", "#d96aa3", "#e09746"];

const AnimatedTodo = ({ todo, onToggle, onDelete, index }: AnimatedTodoProps) => {
  const hasRepeat = todo.repeatType && todo.repeatType !== "none";
  const title = todo.title || todo.text || "";

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, x: -100 }}
      transition={{
        duration: 0.25,
        delay: index * 0.05,
        layout: { duration: 0.2 },
      }}
      className="flex items-center gap-3 group"
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={onToggle}
        className="border-foreground data-[state=checked]:bg-foreground"
      />
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {todo.priority && todo.priority !== "medium" && (
          <Flag className={cn("w-3 h-3 shrink-0", priorityColors[todo.priority])} />
        )}
        {hasRepeat ? (
          <GradientText
            colors={activityGradientColors}
            animationSpeed={4}
            animateOnHover={true}
            className={cn(
              "font-body text-sm",
              todo.completed && "opacity-50"
            )}
          >
            <span className={todo.completed ? "line-through" : ""}>
              {title}
            </span>
          </GradientText>
        ) : (
          <motion.span
            animate={{ opacity: todo.completed ? 0.5 : 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "font-body text-sm truncate",
              todo.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}
          >
            {title}
          </motion.span>
        )}
        {hasRepeat && (
          <Repeat className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity shrink-0"
      >
        <X className="w-3 h-3" />
      </Button>
    </motion.div>
  );
};

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [quickTodo, setQuickTodo] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/todos`);
      if (!res.ok) throw new Error(`Failed to fetch todos: ${res.statusText}`);
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Quick add todo (simple)
  const addQuickTodo = async () => {
    if (quickTodo.trim()) {
      try {
        const res = await fetch(`${API_BASE_URL}/todos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: quickTodo.trim() }),
        });
        if (res.ok) {
          await fetchTodos();
          setQuickTodo("");
        } else {
          console.error("Failed to add todo:", res.statusText);
        }
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  // Add todo with full options
  const addTodoWithOptions = async (data: TodoFormData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          repeatType: data.repeatType,
          repeatInterval: data.repeatInterval,
          repeatDays: data.repeatDays,
          repeatLimit: data.repeatLimit,
          repeatEndDate: data.repeatEndDate?.toISOString() || null,
          priority: data.priority,
          dueDate: data.dueDate?.toISOString() || null,
        }),
      });
      if (res.ok) {
        await fetchTodos();
      } else {
        console.error("Failed to add todo:", res.statusText);
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Toggle todo completed in backend
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => (t._id === id || t.id === id));
    if (!todo) return;
    try {
      await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      await fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  // Delete todo from backend
  const deleteTodo = async (id: string) => {
    await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });
    await fetchTodos();
  };

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="border border-border p-6 bg-card">
      <div className="flex items-center justify-between mb-6">
        <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
          Today's Tasks
        </span>
        <span className="font-body text-xs text-muted-foreground">
          {todos.filter((t) => t.completed).length}/{todos.length}
        </span>
      </div>

      <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {todos.map((todo, index) => (
            <AnimatedTodo
              key={todo._id || todo.id}
              todo={todo}
              index={index}
              onToggle={() => toggleTodo(todo._id || todo.id || "")}
              onDelete={() => deleteTodo(todo._id || todo.id || "")}
            />
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Input
          value={quickTodo}
          onChange={(e) => setQuickTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addQuickTodo()}
          placeholder="Quick add task..."
          className="font-body text-sm border-border"
        />
        <Button onClick={addQuickTodo} variant="outline" size="icon" title="Quick add">
          <Plus className="w-4 h-4" />
        </Button>
        <Button onClick={() => setFormOpen(true)} variant="outline" size="icon" title="Add with options">
          <Repeat className="w-4 h-4" />
        </Button>
      </motion.div>

      <TodoForm
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={addTodoWithOptions}
      />
    </div>
  );
};

export default TodoList;
