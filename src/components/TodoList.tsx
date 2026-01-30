import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

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

      <div className="space-y-3 mb-6">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 group"
          >
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id)}
              className="border-foreground data-[state=checked]:bg-foreground"
            />
            <span
              className={`font-body text-sm flex-1 ${
                todo.completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {todo.text}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
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
      </div>
    </div>
  );
};

export default TodoList;
