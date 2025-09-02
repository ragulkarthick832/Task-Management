import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

    useEffect(()=>{
    fetch("/api/tasks")
    .then(res=>res.json())
    .then(data => setTasks(data));
  },[])
  // done
  const addTask = async () => {
    if (!newTaskText.trim()) return;
    const res = await fetch("/api/tasks",{
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text: newTaskText}),

    });
    const data = await res.json();
    setTasks([...tasks,data]);
    setNewTaskText("");
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`,{method: "DELETE"});
    setTasks(tasks.filter(t => t.id !== id))
  };

  const toggleTask = async (id: string, completed: boolean) => {
    await fetch(`/api/tasks/${id}`,{
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({completed}),
    })
    setTasks(tasks.map(t => (t.id == id ? {...t, completed}: t)))
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = async (id: string) => {
      await fetch(`/api/tasks/${id}`,{
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({text:editText})
      })
      setTasks(tasks.map(t => (t.id === id ? {...t, text: editText}: t)))
      setEditingTask(null)
      setEditText('')
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const completedTasks = tasks.filter(task => task.completed);
  const activeTasks = tasks.filter(task => !task.completed);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Task Management
        </h1>
        <p className="text-muted-foreground">
          Keep track of your daily tasks with style ✨
        </p>
      </motion.div>

      {/* Add Task Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-gradient-card shadow-card">
          <div className="flex gap-3">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 border-border/50 focus:shadow-focus transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <Button
              onClick={addTask}
              disabled={!newTaskText.trim()}
              className="bg-gradient-primary hover:shadow-hover transition-all duration-200 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Task Stats */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-6 text-sm text-muted-foreground"
        >
          <span>{activeTasks.length} active</span>
          <span>•</span>
          <span>{completedTasks.length} completed</span>
          <span>•</span>
          <span>{tasks.length} total</span>
        </motion.div>
      )}

      {/* Active Tasks */}
      <AnimatePresence mode="popLayout">
        {activeTasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-200">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id,!task.completed)}
                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                
                {editingTask === task.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEdit(task.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={()=>saveEdit(task.id)}
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-foreground">
                      {task.text}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(task)}
                        className="hover:bg-accent/50"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-muted-foreground">
            Completed ({completedTasks.length})
          </h2>
          <AnimatePresence mode="popLayout">
            {completedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 bg-gradient-secondary shadow-card opacity-75">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id,!task.completed)}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <span className="flex-1 text-muted-foreground line-through">
                      {task.text}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTask(task.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No tasks yet
          </h3>
          <p className="text-muted-foreground">
            Add your first task above to get started!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TaskManager;