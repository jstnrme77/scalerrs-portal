import { getYouTubeData } from '@/lib/airtable';
import { NextRequest, NextResponse } from 'next/server';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define a type for YouTube script items
interface YouTubeScriptItem {
  id: string;
  Clients?: string[];
  'Target Month'?: string;
  'Keyword Topic'?: string;
  'Video Title'?: string;
  'Script Status for Deliverables'?: string;
  'Script (G-Doc URL)'?: string;
  'YouTube Scripter'?: any;
  'Script Title'?: string;
  [key: string]: any; // Allow for additional fields
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const status = searchParams.get('status');
    
    // Extract user information from headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    let clientIds: string[] = [];
    
    try {
      const clientIdsHeader = request.headers.get('x-user-clients');
      if (clientIdsHeader) {
        clientIds = JSON.parse(clientIdsHeader);
      }
    } catch (e) {
      console.error('Error parsing client IDs from header:', e);
    }

    console.log('YouTube API Route Called with parameters:');
    console.log('- Month:', month);
    console.log('- Status:', status);
    console.log('- User ID:', userId);
    console.log('- User Role:', userRole);
    console.log('- Client IDs:', clientIds);

    // First try with all parameters
    try {
      console.log('Attempting to fetch YouTube data with client and month filters...');
      const youtubeWithClientAndMonth = await getYouTubeData(userId, userRole, clientIds, month);
      console.log(`Retrieved ${youtubeWithClientAndMonth.length} YouTube items with client and month filters`);
      
      if (youtubeWithClientAndMonth.length > 0) {
        return NextResponse.json({ youtube: youtubeWithClientAndMonth }, { status: 200 });
      }
    } catch (error) {
      console.error('Error fetching YouTube data with client and month filters:', error);
    }

    // If that fails or returns empty, try with just the month filter (as admin to bypass client filtering)
    try {
      console.log('Attempting to fetch YouTube data with month filter only (as admin)...');
      const youtubeWithMonthOnly = await getYouTubeData(userId, 'Admin', [], month);
      console.log(`Retrieved ${youtubeWithMonthOnly.length} YouTube items with month filter only`);
      
      if (youtubeWithMonthOnly.length > 0) {
        console.log('Filtering YouTube items client-side by client ID...');
        // Manually filter by client IDs
        const filteredByClient = youtubeWithMonthOnly.filter((item: YouTubeScriptItem) => {
          try {
            // Enhanced debugging for client filtering
            console.log(`Checking item ${item.id} for client match:`, {
              itemClients: item.Clients,
              userClientIds: clientIds,
              keywordTopic: item['Keyword Topic'],
              targetMonth: item['Target Month']
            });
            
            // Case 1: No client filtering if client IDs is empty
            if (!clientIds || clientIds.length === 0) {
              console.log(`No client filtering needed for ${item.id}`);
              return true;
            }
            
            // Case 2: If the item has no Clients field, check related fields
            if (!item.Clients || 
                (Array.isArray(item.Clients) && item.Clients.length === 0)) {
              
              // Check for other client-related fields
              const clientFields = ['Client', 'clients', 'client', 'Related Clients'];
              for (const field of clientFields) {
                if (item[field]) {
                  console.log(`Found alternative client field '${field}' in item ${item.id}:`, item[field]);
                  
                  if (Array.isArray(item[field])) {
                    // If it's an array, check if any client ID matches
                    const hasMatch = clientIds.some(id => item[field].includes(id));
                    if (hasMatch) {
                      console.log(`Match found in ${field} array for item ${item.id}`);
                      return true;
                    }
                  } else {
                    // If it's a single value, check if it matches any client ID
                    const hasMatch = clientIds.includes(item[field]);
                    if (hasMatch) {
                      console.log(`Match found in ${field} value for item ${item.id}`);
                      return true;
                    }
                  }
                }
              }
              
              // If no client field is found, show this item to all clients
              // This assumes that items without client association should be visible to all
              console.log(`No client field found for item ${item.id} - showing to all clients`);
              return true;
            }
            
            // Case 3: Normal client field check
            // Check if any of the item's clients match the user's client IDs
            const hasMatch = clientIds.some(id => 
              Array.isArray(item.Clients) && 
              item.Clients.includes(id)
            );
            
            console.log(`Client match result for ${item.id}: ${hasMatch}`);
            return hasMatch;
          } catch (error) {
            console.error(`Error filtering item ${item.id} by client:`, error);
            return false;
          }
        });
        
        console.log(`After client filtering: ${filteredByClient.length} YouTube items remain`);
        return NextResponse.json({ youtube: filteredByClient }, { status: 200 });
      }
    } catch (error) {
      console.error('Error fetching YouTube data with month filter only:', error);
    }

    // If that fails too, try without month filter
    try {
      console.log('Attempting to fetch YouTube data without month filter...');
      const youtubeWithoutMonthFilter = await getYouTubeData(userId, userRole, clientIds, null);
      console.log(`Retrieved ${youtubeWithoutMonthFilter.length} YouTube items without month filter`);
      
      if (month) {
        console.log('Filtering YouTube items client-side by month...');
        // Manually filter by month
        const monthStr = month.toLowerCase();
        const monthNameOnly = month.split(' ')[0].toLowerCase(); // Extract just the month name
        const filteredByMonth = youtubeWithoutMonthFilter.filter((item: YouTubeScriptItem) => {
          try {
            // Handle different month formats
            let itemMonth: any = item['Target Month'];
            
            // Handle case where Month is an object with a name property
            if (itemMonth && typeof itemMonth === 'object' && 'name' in itemMonth) {
              itemMonth = itemMonth.name;
            } else if (itemMonth && typeof itemMonth === 'object' && 'value' in itemMonth) {
              itemMonth = itemMonth.value;
            }
            
            // Convert to string for comparison and make case-insensitive
            const itemMonthStr = String(itemMonth || '').toLowerCase();
            
            // More flexible matching
            const passes = itemMonthStr === monthStr || 
                          itemMonthStr.includes(monthNameOnly) ||
                          monthStr.includes(itemMonthStr);
                          
            console.log('Month comparison:', {
              id: item.id,
              keyword: item['Keyword Topic'],
              itemMonth: itemMonthStr,
              filterMonth: monthStr,
              monthNameOnly,
              passes
            });
            
            return passes;
          } catch (e) {
            console.error('Error in month comparison:', e);
            return false;
          }
        });
        
        console.log(`After month filtering: ${filteredByMonth.length} YouTube items remain`);
        return NextResponse.json({ youtube: filteredByMonth }, { status: 200 });
      }
      
      // If status is specified, filter by status
      if (status) {
        console.log('Filtering YouTube items client-side by status...');
        const statusStr = status.toLowerCase();
        
        const filteredByStatus = youtubeWithoutMonthFilter.filter((item: YouTubeScriptItem) => {
          try {
            // Use only Script Status for Deliverables field for status
            const itemStatus = String(item['Script Status for Deliverables'] || '').toLowerCase();
            
            // Check if the status matches or contains the filter status
            return itemStatus === statusStr || 
                   itemStatus.includes(statusStr) || 
                   (statusStr === 'idea' && itemStatus.includes('idea')) ||
                   (statusStr === 'review' && itemStatus.includes('review')) ||
                   (statusStr === 'draft' && itemStatus.includes('draft'));
          } catch (e) {
            console.error('Error filtering YouTube item by status:', e);
            return false;
          }
        });
        
        console.log(`Filtered by status: ${filteredByStatus.length} YouTube items left`);
        return NextResponse.json({ youtube: filteredByStatus }, { status: 200 });
      }
      
      return NextResponse.json({ youtube: youtubeWithoutMonthFilter }, { status: 200 });
    } catch (error) {
      console.error('Error fetching YouTube data without month filter:', error);
    }

    // If all attempts fail, try one more approach - check if any YouTube videos exist with matching keyword topics
    console.log('Trying to find YouTube videos based on keyword topics');
    try {
      // Fetch all YouTube scripts without any filtering
      const allYoutubeScripts = await getYouTubeData(null, 'Admin', [], null);
      console.log(`Retrieved ${allYoutubeScripts.length} total YouTube items without any filtering`);
      
      if (allYoutubeScripts.length > 0) {
        // If month is specified, filter by month
        let relevantScripts = allYoutubeScripts;
        
        if (month) {
          const monthStr = month.toLowerCase();
          const monthNameOnly = month.split(' ')[0].toLowerCase();
          
          relevantScripts = allYoutubeScripts.filter((item: YouTubeScriptItem) => {
            try {
              let itemMonth: any = item['Target Month'];
              
              // Handle object month formats
              if (itemMonth && typeof itemMonth === 'object' && 'name' in itemMonth) {
                itemMonth = itemMonth.name;
              } else if (itemMonth && typeof itemMonth === 'object' && 'value' in itemMonth) {
                itemMonth = itemMonth.value;
              }
              
              const itemMonthStr = String(itemMonth || '').toLowerCase();
              
              return itemMonthStr === monthStr || 
                     itemMonthStr.includes(monthNameOnly) ||
                     monthStr.includes(itemMonthStr);
            } catch (e) {
              return false;
            }
          });
        }
        
        console.log(`Found ${relevantScripts.length} YouTube scripts for month ${month || 'any'}`);
        
        if (relevantScripts.length > 0) {
          // Since we don't have client association, return all scripts for this month
          // This is a fallback approach when no client matching is possible
          console.log('Returning all available YouTube scripts as fallback');
          return NextResponse.json({ youtube: relevantScripts }, { status: 200 });
        }
      }
    } catch (error) {
      console.error('Error in fallback YouTube fetch:', error);
    }

    // If all attempts fail, return empty array
    console.log('All attempts to fetch YouTube data failed. Returning empty array.');
    return NextResponse.json({ youtube: [] }, { status: 200 });
  } catch (error) {
    console.error('Error in YouTube API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube data' },
      { status: 500 }
    );
  }
} 