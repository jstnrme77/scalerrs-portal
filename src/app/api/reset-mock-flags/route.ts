import { NextResponse } from 'next/server';

// Configure for Vercel deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Return HTML with embedded JavaScript that clears the flags
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset API Flags</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
        .success { color: green; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f1f1f1; padding: 1rem; border-radius: 4px; overflow: auto; }
        button { padding: 0.5rem 1rem; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0051cc; }
      </style>
    </head>
    <body>
      <h1>Reset API Connection Flags</h1>
      <div id="status">Checking localStorage flags...</div>
      <div id="flags"></div>
      <br>
      <button id="resetBtn">Reset Flags & Reload</button>
      <br><br>
      <h2>Manual Reset Instructions</h2>
      <p>You can also reset flags manually by running these commands in your browser console:</p>
      <pre>
localStorage.removeItem('api-connection-issues');
localStorage.removeItem('airtable-connection-issues');
localStorage.removeItem('api-error-timestamp');
localStorage.removeItem('use-mock-data');
location.reload(); // Refresh the page
      </pre>
      
      <script>
        // Check current flags
        const flags = {
          'api-connection-issues': localStorage.getItem('api-connection-issues'),
          'airtable-connection-issues': localStorage.getItem('airtable-connection-issues'),
          'api-error-timestamp': localStorage.getItem('api-error-timestamp'),
          'use-mock-data': localStorage.getItem('use-mock-data')
        };
        
        const statusEl = document.getElementById('status');
        const flagsEl = document.getElementById('flags');
        
        let hasMockFlags = false;
        let flagsHtml = '<h3>Current localStorage flags:</h3><ul>';
        
        for (const [key, value] of Object.entries(flags)) {
          if (value) {
            hasMockFlags = true;
            flagsHtml += \`<li><strong>\${key}:</strong> \${value}</li>\`;
          }
        }
        
        if (!hasMockFlags) {
          flagsHtml += '<li>No API connection flags found in localStorage.</li>';
          statusEl.innerHTML = '<p class="success">No flags found! API calls should work correctly.</p>';
        } else {
          statusEl.innerHTML = '<p class="warning">API connection flags found! These will cause API calls to use mock data instead of real data.</p>';
        }
        
        flagsHtml += '</ul>';
        flagsEl.innerHTML = flagsHtml;
        
        // Reset flags on button click
        document.getElementById('resetBtn').addEventListener('click', function() {
          localStorage.removeItem('api-connection-issues');
          localStorage.removeItem('airtable-connection-issues');
          localStorage.removeItem('api-error-timestamp');
          localStorage.removeItem('use-mock-data');
          
          statusEl.innerHTML = '<p class="success">Flags cleared successfully! Reloading page...</p>';
          
          // Reload after a short delay
          setTimeout(() => {
            location.reload();
          }, 1000);
        });
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 