"use client";

import { useState, useEffect } from "react";
import { Task, TaskFilter } from "@/types/task";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();
        if (response.ok) {
          setTasks(data);
        } else {
          console.error("Failed to fetch tasks:", data.error);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });

      const newTask = await response.json();
      if (response.ok) {
        setTasks([newTask, ...tasks]);
        setNewTaskTitle("");
      } else {
        console.error('Failed to create task:', newTask.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (response.ok) {
        setTasks(tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ));
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const taskCounts = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <main className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-purple-600 mb-4">
              Task Manager
            </h1>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm">
              <span className="text-sm font-medium text-purple-600">
                {taskCounts.active} active
              </span>
              <span className="w-1 h-1 bg-purple-300 rounded-full"></span>
              <span className="text-sm font-medium text-purple-600">
                {taskCounts.completed} completed
              </span>
            </div>
          </div>

          <form onSubmit={addTask} className="flex gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Task
            </button>
          </form>

          <div className="flex gap-2 justify-center">
            {(["all", "active", "completed"] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-full ${
                  filter === filterOption
                    ? "bg-purple-600 text-white"
                    : "bg-white text-purple-600 hover:bg-purple-50"
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          <ul className="space-y-3">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600"
                />
                <span
                  className={`flex-1 ${
                    task.completed
                      ? "line-through text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
