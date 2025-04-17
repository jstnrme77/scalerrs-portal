'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/forms/Input';
import Button from '@/components/ui/forms/Button';
import { fetchTasks, fetchComments, updateTaskStatus as updateTask, addComment as addTaskComment } from '@/lib/client-api';
import { mockTasks, mockComments } from '@/lib/mock-data';

interface Task {
  id: string;
  Name?: string;  // Make Name optional
  Title?: string; // Add Title as an alternative
  Status: string;
  Description?: string;
  AssignedTo?: string[];
  Priority?: string;
}

interface Comment {
  id: string;
  Title?: string;     // Add Title field
  Comment: string;
  CreatedAt: string;
  User: string[];
  Task?: string[];    // Add Task field
  'Created Time'?: string; // Add Created Time field from Airtable
  [key: string]: any; // Allow any additional fields
}

export default function AirtableDemoPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Fetch tasks
  useEffect(() => {
    const getTasks = async () => {
      try {
        setLoading(true);
        console.log('Fetching tasks...');
        const data = await fetchTasks();
        console.log('Tasks fetched:', data);
        if (data && Array.isArray(data)) {
          setTasks(data);
          setError(null);
        } else {
          console.warn('No tasks data returned or invalid format');
          setError('Using mock data - API returned invalid data format');
          // Use mock data as fallback
          setTasks(mockTasks);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('An error occurred while fetching tasks. Using mock data.');
        // Use mock data as fallback
        setTasks(mockTasks);
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
        // Show loading state for comments
        setLoadingComments(true);
        setComments([]);

        console.log('Fetching comments for task:', selectedTask.id);

        // Log the task ID format to help debug
        console.log('Task ID type:', typeof selectedTask.id);
        console.log('Task ID value:', selectedTask.id);

        const data = await fetchComments(selectedTask.id);
        console.log('Comments fetched:', data);

        // If we got data but it's empty, log a more specific message
        if (data && Array.isArray(data) && data.length === 0) {
          console.log('No comments found for this task. This could be due to:');
          console.log('1. No comments exist for this task');
          console.log('2. Task ID format mismatch between Airtable and our app');
          console.log('3. Field name mismatch in the Airtable schema');
        }

        if (data && Array.isArray(data)) {
          if (data.length === 0) {
            console.log('No comments found for this task');
          } else {
            console.log(`Found ${data.length} comments for task ${selectedTask.id}`);
            // Log the first comment to help debug
            if (data.length > 0) {
              console.log('First comment:', data[0]);
            }
          }

          setComments(data);
          setError(null);
          setLoadingComments(false);
        } else {
          console.warn('No comments data returned or invalid format');
          // Use mock comments as fallback
          const mockTaskComments = mockComments.filter(c => c.Task.includes(selectedTask.id));
          console.log('Using mock comments as fallback:', mockTaskComments);
          setComments(mockTaskComments);
          setLoadingComments(false);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('An error occurred while fetching comments. Using mock data.');
        // Use mock comments as fallback
        const mockTaskComments = mockComments.filter(c => c.Task.includes(selectedTask.id));
        console.log('Using mock comments as fallback after error:', mockTaskComments);
        setComments(mockTaskComments);
        setLoadingComments(false);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Airtable Integration Demo</h1>
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="px-3 py-1 text-sm bg-primary/20 hover:bg-primary/30 text-primary-foreground dark:bg-primary/30 dark:hover:bg-primary/40 rounded-md transition-colors"
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>

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

        {/* Debug panel - only shown when debug mode is enabled */}
        {debugMode && (
          <div className="bg-white dark:bg-darkGray border border-lightGray dark:border-gray-700 p-4 rounded-scalerrs shadow-sm mb-4">
            <h2 className="text-lg font-semibold mb-2">Debug Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-md font-medium mb-1">Tasks ({tasks.length})</h3>
                <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-lightGray dark:border-gray-700">
                  <pre className="text-xs">
                    {JSON.stringify(tasks, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-1">Selected Task</h3>
                <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-lightGray dark:border-gray-700">
                  <pre className="text-xs">
                    {selectedTask ? JSON.stringify(selectedTask, null, 2) : 'No task selected'}
                  </pre>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-md font-medium mb-1">Comments ({comments.length})</h3>
                <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-lightGray dark:border-gray-700">
                  <pre className="text-xs">
                    {JSON.stringify(comments, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  if (selectedTask) {
                    // Force refresh comments
                    setLoadingComments(true);
                    fetchComments(selectedTask.id).then(data => {
                      console.log('Manually refreshed comments:', data);
                      if (data && Array.isArray(data)) {
                        setComments(data);
                      }
                      setLoadingComments(false);
                    }).catch(err => {
                      console.error('Error refreshing comments:', err);
                      setLoadingComments(false);
                    });
                  }
                }}
                className="px-3 py-1 text-sm bg-primary hover:bg-primary/80 text-white rounded-md transition-colors"
                disabled={!selectedTask || loadingComments}
              >
                {loadingComments ? 'Refreshing...' : 'Refresh Comments'}
              </button>
            </div>
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
                      className={`p-3 rounded-md cursor-pointer border transition-all duration-200 ${
                        selectedTask?.id === task.id
                          ? 'bg-primary/20 border-primary'
                          : 'border-lightGray hover:bg-primary/10 hover:border-primary hover:shadow-md dark:border-gray-700 dark:hover:bg-primary/20'
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{task.Name || task.Title}</span>
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
                  <h2 className="text-xl font-semibold mb-4">{selectedTask.Name || selectedTask.Title}</h2>

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
                      {loadingComments ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : comments.length === 0 ? (
                        <p className="text-mediumGray">No comments yet</p>
                      ) : (
                        <ul className="space-y-3">
                          {comments.map(comment => (
                            <li key={comment.id} className="p-3 rounded-md border border-lightGray bg-primary/5 dark:border-gray-700 dark:bg-primary/10">
                              {/* Display the title if available */}
                              {comment.Title && (
                                <p className="text-sm font-medium mb-1">{comment.Title}</p>
                              )}

                              {/* Display the comment text */}
                              <p className="text-sm">
                                {comment.Comment || 'No comment text'}
                              </p>

                              {/* Display the date */}
                              <p className="text-xs text-mediumGray mt-1">
                                {(() => {
                                  // Safely handle date conversion with proper type checking
                                  const dateValue = comment.CreatedAt || comment['Created Time'];
                                  if (dateValue) {
                                    try {
                                      return new Date(dateValue).toLocaleString();
                                    } catch (e) {
                                      console.error('Error parsing date:', dateValue, e);
                                      return 'Invalid date';
                                    }
                                  }
                                  return 'No date available';
                                })()}
                              </p>

                              {/* Display the user */}
                              {comment.User && (
                                <p className="text-xs text-primary mt-1">
                                  By: {(() => {
                                    if (Array.isArray(comment.User) && comment.User.length > 0) {
                                      // For linked records, this will be a record ID
                                      // In a real app, you'd fetch the user details
                                      return `User ${comment.User[0]}`;
                                    }
                                    if (typeof comment.User === 'string') return comment.User;
                                    return 'Unknown user';
                                  })()}
                                </p>
                              )}

                              {/* Debug info - shown when debug mode is enabled */}
                              {debugMode && (
                                <details className="mt-2 text-xs text-mediumGray">
                                  <summary>Debug Info</summary>
                                  <pre className="whitespace-pre-wrap overflow-x-auto">
                                    {JSON.stringify(comment, null, 2)}
                                  </pre>
                                </details>
                              )}
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
