'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/forms/Input';
import Button from '@/components/ui/forms/Button';
import { fetchTasks, fetchComments, updateTaskStatus as updateTask, addComment as addTaskComment } from '@/lib/client-api';

interface Task {
  id: string;
  Name: string;
  Status: string;
  Description?: string;
}

interface Comment {
  id: string;
  Comment: string;
  CreatedAt: string;
  User: string[];
}

export default function AirtableDemoPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  useEffect(() => {
    const getTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('An error occurred while fetching tasks');
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, []);

  // Fetch comments when a task is selected
  useEffect(() => {
    if (!selectedTask) {
      setComments([]);
      return;
    }

    const getComments = async () => {
      try {
        const data = await fetchComments(selectedTask.id);
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('An error occurred while fetching comments');
      }
    };

    getComments();
  }, [selectedTask]);

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updatedTask = await updateTask(taskId, newStatus);

      // Update tasks list
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, Status: newStatus } : task
      ));

      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, Status: newStatus });
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('An error occurred while updating task status');
    }
  };

  // Add comment
  const addComment = async () => {
    if (!selectedTask || !user || !newComment.trim()) {
      return;
    }

    try {
      const newCommentData = await addTaskComment(selectedTask.id, user.id, newComment);

      // Add new comment to the list
      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('An error occurred while adding comment');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Airtable Integration Demo</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              className="float-right font-bold"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasks List */}
            <div className="bg-white dark:bg-darkGray rounded-scalerrs shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Tasks</h2>

              {tasks.length === 0 ? (
                <p className="text-mediumGray">No tasks found</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map(task => (
                    <li
                      key={task.id}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedTask?.id === task.id
                          ? 'bg-primary/20'
                          : 'hover:bg-lightGray dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{task.Name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.Status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : task.Status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.Status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Task Details */}
            <div className="bg-white dark:bg-darkGray rounded-scalerrs shadow p-4 md:col-span-2">
              {selectedTask ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{selectedTask.Name}</h2>

                  {selectedTask.Description && (
                    <p className="text-mediumGray mb-4">{selectedTask.Description}</p>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Status</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant={selectedTask.Status === 'To Do' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateTaskStatus(selectedTask.id, 'To Do')}
                      >
                        To Do
                      </Button>
                      <Button
                        variant={selectedTask.Status === 'In Progress' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateTaskStatus(selectedTask.id, 'In Progress')}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={selectedTask.Status === 'Completed' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateTaskStatus(selectedTask.id, 'Completed')}
                      >
                        Completed
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Comments</h3>

                    <div className="mb-4 max-h-60 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-mediumGray">No comments yet</p>
                      ) : (
                        <ul className="space-y-3">
                          {comments.map(comment => (
                            <li key={comment.id} className="bg-lightGray dark:bg-gray-800 p-3 rounded-md">
                              <p className="text-sm">{comment.Comment}</p>
                              <p className="text-xs text-mediumGray mt-1">
                                {new Date(comment.CreatedAt).toLocaleString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-grow"
                      />
                      <Button
                        variant="primary"
                        onClick={addComment}
                        disabled={!newComment.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-mediumGray">Select a task to view details</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
