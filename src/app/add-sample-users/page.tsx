'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AddSampleUsers() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddSampleUsers = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/add-sample-users');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to add sample users');
      }
    } catch (err) {
      console.error('Error adding sample users:', err);
      setError('An error occurred while adding sample users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Sample Users</h1>
      
      <p className="mb-4">
        This page will add sample users to your Airtable Users table. The following users will be added:
      </p>
      
      <ul className="list-disc pl-5 mb-6">
        <li className="mb-2">
          <strong>Admin User</strong> (admin@example.com) - Role: Admin
        </li>
        <li className="mb-2">
          <strong>Client User</strong> (client@example.com) - Role: Client
        </li>
        <li className="mb-2">
          <strong>SEO Specialist</strong> (seo@example.com) - Role: SEO Specialist
        </li>
        <li className="mb-2">
          <strong>Content Writer</strong> (writer@example.com) - Role: Content Writer
        </li>
      </ul>
      
      <div className="mb-6">
        <button
          onClick={handleAddSampleUsers}
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md mr-4 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {loading ? 'Adding Sample Users...' : 'Add Sample Users'}
        </button>
        
        <Link href="/login" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          Go to Login
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">{result.message}</p>
          
          {result.users && result.users.length > 0 && (
            <div className="mt-4">
              <h2 className="font-bold mb-2">Users:</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Email</th>
                      <th className="px-4 py-2 border">Role</th>
                      <th className="px-4 py-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.users.map((user: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border">{user.Name}</td>
                        <td className="px-4 py-2 border">{user.Email}</td>
                        <td className="px-4 py-2 border">{user.Role}</td>
                        <td className="px-4 py-2 border">
                          {user.status === 'created' ? (
                            <span className="text-green-600">Created</span>
                          ) : (
                            <span className="text-yellow-600">Already Exists</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {result.errors && result.errors.length > 0 && (
            <div className="mt-4">
              <h2 className="font-bold mb-2">Errors:</h2>
              <ul className="list-disc pl-5">
                {result.errors.map((err: any, index: number) => (
                  <li key={index} className="text-red-600">
                    {err.user}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
