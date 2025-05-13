'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/forms/Input';
import Button from '@/components/ui/forms/Button';

interface Client {
  id: string;
  name: string;
}

export default function UserRegistrationForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Client');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([
    { id: 'client1', name: 'Client 1' },
    { id: 'client2', name: 'Client 2' },
    { id: 'client3', name: 'Client 3' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  // Check if current user is admin
  useEffect(() => {
    if (user && user.Role !== 'Admin') {
      router.push('/home');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!name.trim() || !email.trim()) {
        setError('Name and email are required');
        setIsLoading(false);
        return;
      }

      // Check if user with this email already exists
      const checkResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setError('A user with this email already exists');
        setIsLoading(false);
        return;
      }

      // Create the user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          clientIds: selectedClients
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      
      // Reset form
      setName('');
      setEmail('');
      setRole('Client');
      setSelectedClients([]);
      
      setSuccess('User created successfully!');
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'An error occurred while creating the user');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register New User</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter user's full name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user's email"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="Admin">Admin</option>
            <option value="Client">Client</option>
          </select>
        </div>
        
        {role === 'Client' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Assign to Clients</label>
            <div className="space-y-2 mt-1">
              {availableClients.map(client => (
                <div key={client.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`client-${client.id}`}
                    checked={selectedClients.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`client-${client.id}`}>{client.name}</label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4"
        >
          {isLoading ? 'Creating User...' : 'Create User'}
        </Button>
      </form>
    </div>
  );
}
