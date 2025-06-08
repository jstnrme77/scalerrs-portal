// Helper function to map Airtable status to UI status
export function mapAirtableStatusToUIStatus(airtableStatus: string, fields?: Record<string, any>): string {
  // If fields are provided, check for dedicated approval fields first
  if (fields) {
    if (fields['Keyword Approval']) {
      return mapStatusString(fields['Keyword Approval']);
    }
    if (fields['Brief Approval']) {
      return mapStatusString(fields['Brief Approval']);
    }
    if (fields['Article Approval']) {
      return mapStatusString(fields['Article Approval']);
    }
  }

  // Otherwise, map the provided status string
  return mapStatusString(airtableStatus);
}

// Helper function to map a status string to UI status
export function mapStatusString(statusString: string): string {
  if (!statusString) return 'not_started';

  const statusLower = statusString.toLowerCase();

  // Map to new standardized statuses
  if (statusLower.includes('not started')) {
    return 'not_started';
  } else if (statusLower.includes('in progress')) {
    return 'in_progress';
  } else if (statusLower.includes('ready for review')) {
    return 'ready_for_review';
  } else if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
    return 'awaiting_approval';
  } else if (statusLower.includes('revision') || statusLower.includes('changes')) {
    return 'revisions_needed';
  } else if (statusLower.includes('approved')) {
    return 'approved';
  } else if (statusLower.includes('published') || statusLower.includes('live')) {
    return 'published';
  }

  // Legacy status mappings for backward compatibility
  else if (statusLower.includes('resubmit')) {
    return 'resubmitted';
  } else if (statusLower.includes('needs revision')) {
    return 'needs_revision';
  } else if (statusLower.includes('rejected')) {
    return 'rejected';
  }

  // Default to not_started if no match
  return 'not_started';
}

// Helper function to safely get a value from a record with multiple possible field names
export function getFieldValue<T>(fields: Record<string, any>, possibleNames: string[], defaultValue: T): T {
  for (const name of possibleNames) {
    if (fields[name] !== undefined) {
      return fields[name] as T;
    }
  }
  return defaultValue;
}

// Helper function to create client filter formula
export function createClientFilter(clientIds: string[]): string {
  // Check if client user has any assigned clients
  if (!clientIds || clientIds.length === 0) {
    console.warn('Client user has no assigned clients. Returning no data filter.');
    return 'OR(1=0)'; // This will always be false, returning no records
  }

  // Create a filter formula for client IDs that handles linked fields
  // For linked fields, we need to use SEARCH with the record ID
  const clientFilters = clientIds.map(clientId => {
    // For linked fields, Airtable stores arrays of record IDs like ["recXXXX", "recYYYY"]
    // We use SEARCH to find the client ID within the concatenated field
    return `SEARCH('${clientId}', CONCATENATE(Clients & "")) > 0`;
  });

  return `OR(${clientFilters.join(',')})`;
}

// Helper function to create user filter formula
export function createUserFilter(userId: string, fieldNames: string[]): string {
  if (!userId || !fieldNames || fieldNames.length === 0) {
    return '';
  }

  const userFilters = fieldNames.map(fieldName =>
    `SEARCH('${userId}', ARRAYJOIN({${fieldName}}, ',')) > 0`
  );

  return `OR(${userFilters.join(',')})`;
}

// Helper function to create month filter formula
export function createMonthFilter(month: string, fieldName: string = 'Month'): string {
  if (!month) {
    return '';
  }

  try {
    // Convert month to lowercase for case-insensitive comparison
    const monthLower = month.toLowerCase();
    
    // Extract just the month name (e.g., "June" from "June 2025")
    const monthOnly = month.split(' ')[0];
    const monthOnlyLower = monthOnly.toLowerCase();
    
    // For 'Target Month' field specifically (often used in YouTube data)
    const isTargetMonth = fieldName === 'Target Month';
    
    // Create an array of possible filter conditions for different month formats
    const monthFilters = [
      // Exact match
      `LOWER({${fieldName}}) = '${monthLower}'`,
      
      // Month name only match (e.g., "June" matches "June 2025")
      `OR(LOWER({${fieldName}}) = '${monthOnlyLower}', FIND('${monthOnlyLower}', LOWER({${fieldName}})) > 0)`,
      
      // Array field matching (for multiple select fields)
      `FIND('${monthLower}', LOWER(ARRAYJOIN({${fieldName}}, ','))) > 0`
    ];
    
    // For Target Month, add some additional checks that might help
    if (isTargetMonth) {
      // Sometimes the year might be first, e.g., "2025 June" instead of "June 2025"
      const yearPart = month.split(' ')[1];
      if (yearPart && /^\d{4}$/.test(yearPart)) {
        monthFilters.push(`FIND('${yearPart}', {${fieldName}}) > 0 AND FIND('${monthOnly}', {${fieldName}}) > 0`);
      }
    }

    // Combine all filter options with OR
    return `OR(${monthFilters.join(',')})`;
  } catch (error) {
    console.error('Error creating month filter:', error);
    return '';
  }
}

// Helper function to combine multiple filter parts with AND
export function combineFilters(filterParts: string[]): string {
  const nonEmptyFilters = filterParts.filter(part => part.trim() !== '');

  if (nonEmptyFilters.length === 0) {
    return '';
  }

  if (nonEmptyFilters.length === 1) {
    return nonEmptyFilters[0];
  }

  return `AND(${nonEmptyFilters.join(',')})`;
}

// Helper function to handle Airtable errors and provide fallback data
export function handleAirtableError(error: any, fallbackData: any, context: string): any {
  console.error(`Error in ${context}:`, error);

  // Log more detailed error information
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (error.message.includes('Rate Limit')) {
      console.error('Airtable rate limit exceeded. Try again later.');
    }

    if (error.message.includes('Authentication')) {
      console.error('Airtable authentication failed. Check your API key.');
    }

    if (error.message.includes('authorized')) {
      console.error('Authorization error. Your token may not have the correct permissions.');
      console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
    }
  }

  console.log(`Falling back to mock data for ${context}`);
  return fallbackData;
}
