import React, { forwardRef, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Plus, X, Repeat, Flag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TodoForm, { TodoFormData } from "./TodoForm";
import GradientText from "@/components/ui/gradient-text";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api";

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
  onEdit: () => void;
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
const TODO_ROW_HEIGHT = 36;
const TODO_LIST_HEIGHT = 200;
const TODO_OVERSCAN = 6;

const AnimatedTodo = forwardRef<HTMLDivElement, AnimatedTodoProps>(({ todo, onToggle, onEdit, onDelete, index }, ref) => {
  const hasRepeat = todo.repeatType && todo.repeatType !== "none";
  const title = todo.title || todo.text || "";

  return (
    <motion.div
      ref={ref}
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
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity shrink-0"
        title="Edit task"
      >
        <Edit2 className="w-3 h-3" />
      </Button>
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
});
AnimatedTodo.displayName = "AnimatedTodo";

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [quickTodo, setQuickTodo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const getTodoId = (todo: Todo) => todo._id || String(todo.id) || "";

  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const parseRepeatDays = (value?: number[] | string | null) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const toFormData = (todo: Todo): Partial<TodoFormData> => ({
    title: todo.title || todo.text || "",
    repeatType: todo.repeatType || "none",
    repeatInterval: todo.repeatInterval || 1,
    repeatDays: parseRepeatDays(todo.repeatDays as number[] | string | null),
    repeatLimit: todo.repeatLimit ?? null,
    repeatEndDate: parseDate(todo.repeatEndDate),
    priority: todo.priority || "medium",
    dueDate: parseDate(todo.dueDate),
  });
  const visibleTodos = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / TODO_ROW_HEIGHT) - TODO_OVERSCAN);
    const count = Math.ceil(TODO_LIST_HEIGHT / TODO_ROW_HEIGHT) + TODO_OVERSCAN * 2;
    return {
      start,
      items: todos.slice(start, start + count),
      before: start * TODO_ROW_HEIGHT,
      after: Math.max(0, (todos.length - start - count) * TODO_ROW_HEIGHT),
    };
  }, [todos, scrollTop]);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/todos`);
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
        const res = await fetch(`${getApiBaseUrl()}/todos`, {
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
      const res = await fetch(`${getApiBaseUrl()}/todos`, {
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

  const updateTodoWithOptions = async (data: TodoFormData) => {
    if (!editingTodo) return;
    const id = getTodoId(editingTodo);
    if (!id) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/todos/${id}`, {
        method: "PUT",
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
        setEditingTodo(null);
      } else {
        console.error("Failed to update todo:", res.statusText);
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Toggle todo completed in backend
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => (t._id === id || String(t.id) === id));
    if (!todo) return;
    try {
      await fetch(`${getApiBaseUrl()}/todos/${id}`, {
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
    await fetch(`${getApiBaseUrl()}/todos/${id}`, {
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

      <div
        className="mb-6 max-h-[200px] overflow-y-auto"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <AnimatePresence mode="popLayout">
          <div style={{ height: visibleTodos.before }} />
          <div className="space-y-3">
            {visibleTodos.items.map((todo, index) => (
              <AnimatedTodo
                key={todo._id || todo.id}
                todo={todo}
                index={visibleTodos.start + index}
                onToggle={() => toggleTodo(getTodoId(todo))}
                onEdit={() => {
                  setEditingTodo(todo);
                  setFormOpen(true);
                }}
                onDelete={() => deleteTodo(getTodoId(todo))}
              />
            ))}
          </div>
          <div style={{ height: visibleTodos.after }} />
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
        <Button
          onClick={() => {
            setEditingTodo(null);
            setFormOpen(true);
          }}
          variant="outline"
          size="icon"
          title="Add with options"
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </motion.div>

      <TodoForm
        isOpen={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTodo(null);
        }}
        onSubmit={editingTodo ? updateTodoWithOptions : addTodoWithOptions}
        initialData={editingTodo ? toFormData(editingTodo) : undefined}
        mode={editingTodo ? "edit" : "create"}
      />
    </div>
  );
};

export default TodoList;
