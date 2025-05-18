import AirtableDebugWrapper from '@/components/AirtableDebugWrapper';
import Link from 'next/link';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Airtable Connection Debug
        </h1>
        
        <p className="mb-8 text-gray-700 dark:text-gray-300">
          This page helps diagnose issues with the Airtable connection when deployed to Netlify.
          Use the debug panel to check environment variables, connection status, and clear any cached error flags.
        </p>
        
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </Link>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Troubleshooting Steps
          </h2>
          
          <ol className="list-decimal pl-6 space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Check Environment Variables:</strong> Make sure the Airtable API key and Base ID are correctly set in Netlify.
            </li>
            <li>
              <strong>Clear Connection Issues Flag:</strong> If the application is using mock data, try clearing the connection issues flag.
            </li>
            <li>
              <strong>Test Airtable Connection:</strong> Use the debug panel to test the connection to Airtable directly.
            </li>
            <li>
              <strong>Check Browser Console:</strong> Look for any errors in the browser console related to API calls.
            </li>
            <li>
              <strong>Verify Netlify Functions:</strong> Make sure all required Netlify functions are deployed and working.
            </li>
          </ol>
        </div>
      </div>
      
      <AirtableDebugWrapper />
    </div>
  );
}
