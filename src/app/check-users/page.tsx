'use client';

import { useState, useEffect } from 'react';
import { getUsers } from '@/lib/airtable';
import { User } from '@/types';

export default function CheckUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const fetchedUsers = await getUsers();
        console.log('Fetched users:', fetchedUsers);
        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. See console for details.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Table Check</h1>
      
      {loading && <p>Loading users...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && users.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>No users found in the Users table. Please check your Airtable base.</p>
        </div>
      )}
      
      {!loading && !error && users.length > 0 && (
        <div>
          <p className="mb-2">Found {users.length} users:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Client</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Other Fields</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 border">{user.id}</td>
                    <td className="px-4 py-2 border">{user.Name || 'N/A'}</td>
                    <td className="px-4 py-2 border">{user.Email || 'N/A'}</td>
                    <td className="px-4 py-2 border">{user.Role || 'N/A'}</td>
                    <td className="px-4 py-2 border">
                      {user.Client ? (
                        Array.isArray(user.Client) 
                          ? user.Client.join(', ') 
                          : user.Client
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-2 border">{user.Status || 'N/A'}</td>
                    <td className="px-4 py-2 border">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(
                          Object.fromEntries(
                            Object.entries(user).filter(
                              ([key]) => !['id', 'Name', 'Email', 'Role', 'Client', 'Status'].includes(key)
                            )
                          ),
                          null,
                          2
                        )}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
