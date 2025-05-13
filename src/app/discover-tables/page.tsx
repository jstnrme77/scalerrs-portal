'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Field {
  id: string;
  name: string;
  type: string;
}

interface Table {
  id?: string;
  name: string;
  primaryFieldId?: string;
  fields?: Field[];
  exists?: boolean;
  error?: string;
  sampleRecord?: any;
}

export default function DiscoverTablesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tablesData, setTablesData] = useState<{
    success?: boolean;
    method?: string;
    tables?: Table[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    const discoverTables = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/discover-tables');
        const data = await response.json();
        
        setTablesData(data);
        
        if (data.error) {
          setError(data.error);
        }
      } catch (err: any) {
        console.error('Error discovering tables:', err);
        setError(err.message || 'An error occurred while discovering Airtable tables');
      } finally {
        setLoading(false);
      }
    };

    discoverTables();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Airtable Tables Discovery</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : tablesData ? (
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Discovery Results</h2>
              <p><strong>Method:</strong> {tablesData.method || 'Unknown'}</p>
              <p><strong>Tables Found:</strong> {tablesData.tables?.length || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Tables</h2>
              
              {tablesData.tables && tablesData.tables.length > 0 ? (
                <div className="space-y-6">
                  {tablesData.tables.map((table, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h3 className="text-lg font-medium mb-2">
                        {table.name}
                        {table.exists === true ? (
                          <span className="ml-2 text-sm text-green-600">✓ Exists</span>
                        ) : table.exists === false ? (
                          <span className="ml-2 text-sm text-red-600">✗ Not Found</span>
                        ) : (
                          <span className="ml-2 text-sm text-blue-600">ℹ Metadata</span>
                        )}
                      </h3>
                      
                      {table.error && (
                        <div className="text-red-600 text-sm mb-2">{table.error}</div>
                      )}
                      
                      {table.id && (
                        <p className="text-sm text-gray-500 mb-2">ID: {table.id}</p>
                      )}
                      
                      {table.fields && table.fields.length > 0 && (
                        <div>
                          <h4 className="font-medium mt-2 mb-1">Fields ({table.fields.length}):</h4>
                          <ul className="list-disc pl-5 mb-3 grid grid-cols-3 gap-2">
                            {table.fields.map((field, fieldIndex) => (
                              <li key={fieldIndex} className="break-all">
                                {typeof field === 'string' ? field : field.name}
                                {field.type && <span className="text-xs text-gray-500 ml-1">({field.type})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {table.sampleRecord && (
                        <div>
                          <h4 className="font-medium mb-1">Sample Record:</h4>
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            {JSON.stringify(table.sampleRecord, null, 2)}
                          </pre>
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
