import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";

interface Todo {
  id: number;
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
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
        className={`font-body text-sm flex-1 ${
          todo.completed ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {todo.text}
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
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Deep work session", completed: false },
    { id: 2, text: "Review project notes", completed: true },
    { id: 3, text: "Plan tomorrow", completed: false },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

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
              key={todo.id}
              todo={todo}
              index={index}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
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
