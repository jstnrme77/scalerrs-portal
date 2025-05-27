import { fetchFromAirtable } from '../helpers';
import { getClientId } from '../getClientId';

// Fetches rows from the "Clients By Quarters" table for the current client.
export async function fetchClientsByQuarter(clientId?: string | null) {
  console.log('=== fetchClientsByQuarter CALLED ===');
  
  // Check provided clientId first
  let clientRecordID = clientId;
  console.log(`clientId parameter: ${clientId}`);
  
  // If no clientId provided, try to get from getClientId() utility
  if (!clientRecordID) {
    console.log('No clientId parameter provided, trying getClientId()');
    clientRecordID = getClientId();
    console.log(`getClientId() returned: ${clientRecordID}`);
  }
  
  // If still no clientId, try direct localStorage access as last resort
  if (!clientRecordID && typeof window !== 'undefined') {
    console.log('No clientId from getClientId(), trying direct localStorage access');
    clientRecordID = localStorage.getItem('clientRecordID') || 
                     localStorage.getItem('selected-client-id');
    console.log(`Direct localStorage access returned: ${clientRecordID}`);
  }
  
  // Check for cached client in localStorage
  if (!clientRecordID && typeof window !== 'undefined') {
    console.log('Checking cached-clients-data as last resort');
    try {
      const cachedClients = localStorage.getItem('cached-clients-data');
      if (cachedClients) {
        const clients = JSON.parse(cachedClients);
        if (Array.isArray(clients) && clients.length > 0) {
          clientRecordID = clients[0].id;
          console.log(`Found client ID in cached-clients-data: ${clientRecordID}`);
        }
      }
    } catch (e) {
      console.error('Error parsing cached-clients-data:', e);
    }
  }
  
  console.log(`Final clientRecordID being used: ${clientRecordID}`);
  
  if (!clientRecordID) {
    console.error('fetchClientsByQuarter: No clientId available after all fallbacks');
    return [];
  }
  
  console.log(`fetchClientsByQuarter: Fetching data for client ${clientRecordID}`);
  
  // Use the exact formula matching the CSV structure
  const formula = `{Client Record ID} = '${clientRecordID}'`;
  console.log(`Using formula: ${formula}`);
  
  try {
    // Use the exact table name from the CSV
    const tableName = 'Clients By Quarters';
    console.log(`Fetching from table: ${tableName}`);
    
    console.log('About to call fetchFromAirtable...');
    const results = await fetchFromAirtable<any>(tableName, formula);
    console.log('Returned from fetchFromAirtable call');
    
    console.log(`Found ${results.length} quarterly reports in table: ${tableName}`);
    
    // Debug log the first record if available
    if (results.length > 0) {
      console.log('First quarterly record fields:', Object.keys(results[0].fields || {}).join(', '));
      console.log('First quarterly record values:', JSON.stringify(results[0].fields));
    } else {
      console.warn(`No records found for client ${clientRecordID} in table ${tableName}`);
      console.log('Checking if the table exists by trying to fetch a single record with no filter');
      
      try {
        const tableCheck = await fetchFromAirtable<any>(tableName, '');
        console.log(`Table exists! Found ${tableCheck.length} total records in the table.`);
        if (tableCheck.length > 0) {
          console.log('Sample record Client Record ID:', tableCheck[0].fields['Client Record ID']);
          
          // If we have some records in the table but none for this client,
          // let's check if the client ID format matches what's in the table
          const sampleClientId = tableCheck[0].fields['Client Record ID'];
          if (sampleClientId && clientRecordID) {
            console.log(`Sample client ID format: ${sampleClientId}`);
            console.log(`Our client ID format: ${clientRecordID}`);
            
            if (sampleClientId.startsWith('rec') && !clientRecordID.startsWith('rec')) {
              console.warn('Client ID format mismatch! Table uses "rec" prefix but our ID does not.');
            } else if (!sampleClientId.startsWith('rec') && clientRecordID.startsWith('rec')) {
              console.warn('Client ID format mismatch! Our ID uses "rec" prefix but table does not.');
            }
          }
        }
      } catch (tableCheckError) {
        console.error(`Error checking table existence: ${tableCheckError}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error fetching quarterly reports:`, error);
    return [];
  }
} 