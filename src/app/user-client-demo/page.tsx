'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import UserClientInfo from '@/components/UserClientInfo';
import UserClientDisplay from '@/components/ui/UserClientDisplay';
import { getUserClientNames } from '@/utils/clientUtils';

export default function UserClientDemo() {
  const [clientNames, setClientNames] = useState<string[]>([]);
  
  // Example user with linked client records
  const exampleUser: User = {
    id: 'recAJUTqjqdhWRHFC',
    Name: 'Client User',
    Email: 'client@example.com',
    Role: 'Client',
    Clients: ['rec37fwEV09GUJccr'], // The linked client record ID
    Status: 'Active'
  };

  // Fetch client names on component mount
  useEffect(() => {
    const fetchClientNames = async () => {
      const names = await getUserClientNames(exampleUser.Clients);
      setClientNames(names);
    };
    
    fetchClientNames();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">User Client Demo</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Reading Linked Client Records</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Raw User Data:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(exampleUser, null, 2)}
          </pre>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Client Names from IDs:</h3>
          {clientNames.length > 0 ? (
            <ul className="list-disc pl-5">
              {clientNames.map((name, index) => (
                <li key={index}>
                  {name} 
                  <span className="text-gray-500 text-sm ml-2">
                    (ID: {Array.isArray(exampleUser.Clients) ? 
                      exampleUser.Clients[index] : exampleUser.Clients})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Loading client names...</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Using Components</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Simple Client Display:</h3>
          <UserClientDisplay clientIds={exampleUser.Clients} />
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Full User Client Info:</h3>
          <UserClientInfo user={exampleUser} showDetails={true} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Using the utility function:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
{`// Import the utility
import { getUserClientNames } from '@/utils/clientUtils';

// Use it in an async function
async function displayClientNames() {
  const clientNames = await getUserClientNames(user.Clients);
  console.log(clientNames); // Array of client names
}`}
          </pre>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Using the component:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
{`// Import the component
import UserClientDisplay from '@/components/ui/UserClientDisplay';

// Use it in your JSX
<UserClientDisplay clientIds={user.Clients} />`}
          </pre>
        </div>
      </div>
    </div>
  );
} 