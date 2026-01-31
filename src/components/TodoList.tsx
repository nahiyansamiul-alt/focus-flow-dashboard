import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Todo {
  _id?: string;
  id?: number;
  text: string;
  completed: boolean;
}

interface AnimatedTodoProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  index: number;
}

const AnimatedTodo = ({ todo, onToggle, onDelete, index }: AnimatedTodoProps) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, x: -100 }}
      transition={{ 
        duration: 0.25, 
        delay: index * 0.05,
        layout: { duration: 0.2 }
      }}
      className="flex items-center gap-3 group"
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={onToggle}
        className="border-foreground data-[state=checked]:bg-foreground"
      />
      <motion.span
        animate={{ opacity: todo.completed ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
        className={`font-body text-sm flex-1 ${
          todo.completed ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {(todo as any).title || todo.text}
      </motion.span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity"
      >
        <X className="w-3 h-3" />
      </Button>
    </motion.div>
  );
};

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/todos");
      if (!res.ok) throw new Error(`Failed to fetch todos: ${res.statusText}`);
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add todo to backend
  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        const res = await fetch("http://localhost:5000/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTodo.trim() })
        });
        if (res.ok) {
          await fetchTodos();
          setNewTodo("");
        } else {
          console.error("Failed to add todo:", res.statusText);
        }
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  // Toggle todo completed in backend
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed })
    });
    await fetchTodos();
  };

  // Delete todo from backend
  const deleteTodo = async (id: string) => {
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "DELETE"
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
              onToggle={() => toggleTodo(todo._id || "")}
              onDelete={() => deleteTodo(todo._id || "")}
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
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          className="font-body text-sm border-border"
        />
        <Button onClick={addTodo} variant="outline" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default TodoList;
