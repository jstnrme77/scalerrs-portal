'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TableInfo {
  name: string;
  exists: boolean | null;
  fields?: string[];
  sampleRecord?: any;
  error?: string;
}

export default function SchemaCheckPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemaData, setSchemaData] = useState<{
    success?: boolean;
    apiKeyPrefix?: string;
    baseId?: string;
    tables?: TableInfo[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    const checkSchema = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/check-schema');
        const data = await response.json();
        
        setSchemaData(data);
        
        if (data.error) {
          setError(data.error);
        }
      } catch (err: any) {
        console.error('Error checking schema:', err);
        setError(err.message || 'An error occurred while checking the Airtable schema');
      } finally {
        setLoading(false);
      }
    };

    checkSchema();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Airtable Schema Checker</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : schemaData ? (
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Connection Info</h2>
              <p><strong>API Key:</strong> {schemaData.apiKeyPrefix}</p>
              <p><strong>Base ID:</strong> {schemaData.baseId}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Tables</h2>
              
              {schemaData.tables && schemaData.tables.length > 0 ? (
                <div className="space-y-6">
                  {schemaData.tables.map((table, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h3 className="text-lg font-medium mb-2">
                        {table.name}
                        {table.exists === true ? (
                          <span className="ml-2 text-sm text-green-600">✓ Exists</span>
                        ) : table.exists === false ? (
                          <span className="ml-2 text-sm text-red-600">✗ Not Found</span>
                        ) : (
                          <span className="ml-2 text-sm text-yellow-600">? Unknown</span>
                        )}
                      </h3>
                      
                      {table.error && (
                        <div className="text-red-600 text-sm mb-2">{table.error}</div>
                      )}
                      
                      {table.exists && table.fields && (
                        <div>
                          <h4 className="font-medium mt-2 mb-1">Fields ({table.fields.length}):</h4>
                          <ul className="list-disc pl-5 mb-3 grid grid-cols-3 gap-2">
                            {table.fields.map((field, fieldIndex) => (
                              <li key={fieldIndex} className="break-all">{field}</li>
                            ))}
                          </ul>
                          
                          {table.sampleRecord && (
                            <div>
                              <h4 className="font-medium mb-1">Sample Record:</h4>
                              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {JSON.stringify(table.sampleRecord, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tables found</p>
              )}
            </div>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </ProtectedRoute>
  );
}
