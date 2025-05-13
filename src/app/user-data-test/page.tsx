'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useClientData } from '@/context/ClientDataContext';
import { fetchTasks } from '@/lib/client-api';
import { Task } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UserDataTestPage() {
  const { user } = useAuth();
  const { clientId, filterDataByClient } = useClientData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError('Invalid data format received');
          setTasks([]);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('An error occurred while fetching tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [clientId]); // Re-fetch when client ID changes

  // Filter tasks by client
  const filteredTasks = filterDataByClient(tasks);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">User-Specific Data Test</h1>
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            {user ? (
              <div>
                <p><strong>Name:</strong> {user.Name}</p>
                <p><strong>Email:</strong> {user.Email}</p>
                <p><strong>Role:</strong> {user.Role}</p>
                <p><strong>Client IDs:</strong> {user.Client ? (
                  Array.isArray(user.Client) 
                    ? user.Client.join(', ') 
                    : user.Client
                ) : 'None'}</p>
                <p><strong>Selected Client ID:</strong> {clientId || 'All'}</p>
              </div>
            ) : (
              <p>Not logged in</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tasks (Filtered by Client)</h2>
            
            {loading ? (
              <p>Loading tasks...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredTasks.length === 0 ? (
              <p>No tasks found for the selected client.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{task.Title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{task.Status}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{task.Priority}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.Client ? (
                            Array.isArray(task.Client) 
                              ? task.Client.join(', ') 
                              : task.Client
                          ) : 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
