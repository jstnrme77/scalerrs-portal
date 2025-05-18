// Shared Airtable utility functions for Netlify Functions
const Airtable = require('airtable');

// Initialize Airtable with API key from environment variables
const getAirtableBase = () => {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  const airtable = new Airtable({ apiKey });
  return airtable.base(baseId);
};

// Helper function to map Airtable status to UI status
const mapAirtableStatusToUIStatus = (airtableStatus) => {
  const statusLower = airtableStatus.toLowerCase();

  if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
    return 'awaiting_approval';
  } else if (statusLower.includes('resubmit')) {
    return 'resubmitted';
  } else if (statusLower.includes('revision') || statusLower.includes('changes')) {
    return 'needs_revision';
  } else if (statusLower.includes('approved')) {
    return 'approved';
  } else if (statusLower.includes('rejected')) {
    return 'rejected';
  }
  
  return 'awaiting_approval'; // Default status
};

// Helper function to create client filter formula
const createClientFilter = (clientIds) => {
  if (!clientIds || clientIds.length === 0) {
    return '';
  }
  
  const clientFilters = clientIds.map(clientId =>
    `SEARCH('${clientId}', ARRAYJOIN(Client, ',')) > 0`
  );
  
  return `OR(${clientFilters.join(',')})`;
};

// Helper function to combine multiple filter parts with AND
const combineFilters = (filterParts) => {
  const nonEmptyFilters = filterParts.filter(part => part.trim() !== '');
  
  if (nonEmptyFilters.length === 0) {
    return '';
  }
  
  if (nonEmptyFilters.length === 1) {
    return nonEmptyFilters[0];
  }
  
  return `AND(${nonEmptyFilters.join(',')})`;
};

// Function to get approval items with pagination
const getApprovalItems = async (type, userId, userRole, clientIds, page = 1, pageSize = 10, offset = null) => {
  try {
    const base = getAirtableBase();
    const tableName = type === 'articles' ? 'Articles' : 'Keywords'; // Use Keywords table for briefs
    
    // Build filter formula based on user role and client
    let filterParts = [];
    
    // Add client filter if user is not an admin and has assigned clients
    if (userRole !== 'admin' && clientIds && clientIds.length > 0) {
      filterParts.push(createClientFilter(clientIds));
    }
    
    // For briefs, filter by status
    if (type === 'briefs') {
      filterParts.push("OR({Keyword/Content Status} = 'Awaiting Approval', {Keyword/Content Status} = 'Needs Revision', {Keyword/Content Status} = 'Approved', {Keyword/Content Status} = 'Rejected')");
    } else {
      // For articles, filter by status
      filterParts.push("OR(Status = 'Awaiting Approval', Status = 'Needs Revision', Status = 'Approved', Status = 'Rejected')");
    }
    
    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);
    
    // Set up query parameters
    const queryParams = {
      pageSize: pageSize
    };
    
    // Add filter formula if it exists
    if (filterFormula) {
      queryParams.filterByFormula = filterFormula;
    }
    
    // Add offset if provided
    if (offset) {
      queryParams.offset = offset;
    }
    
    // Execute the query
    const query = base(tableName).select(queryParams);
    const records = await query.firstPage();
    
    // Get pagination info
    const queryInfo = query.getPageInfo();
    
    // Map records to the expected format
    const items = records.map(record => {
      const fields = record.fields;
      
      return {
        id: record.id,
        item: type === 'briefs' ? fields['Meta Title'] || fields['Main Keyword'] : fields.Title,
        status: type === 'briefs' ? fields['Keyword/Content Status'] : fields.Status,
        dateSubmitted: fields['Created Time'] || fields['Created At'],
        lastUpdated: fields['Last Modified Time'] || fields['Updated At'],
        volume: fields['Search Volume'],
        difficulty: fields['Keyword Difficulty'],
        strategist: type === 'briefs' ? fields['SEO Strategist'] : fields['SEO Specialist'],
        wordCount: fields['Word Count'],
        ...fields
      };
    });
    
    // Prepare pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(queryInfo.total / pageSize),
      totalItems: queryInfo.total,
      hasNextPage: !!queryInfo.offset,
      hasPrevPage: page > 1,
      nextOffset: queryInfo.offset || null,
      prevOffset: null // We don't track previous offsets in this implementation
    };
    
    return { items, pagination };
  } catch (error) {
    console.error('Error fetching approval items:', error);
    throw error;
  }
};

// Function to update approval status
const updateApprovalStatus = async (type, itemId, status, revisionReason = null) => {
  try {
    const base = getAirtableBase();
    const tableName = type === 'articles' ? 'Articles' : 'Keywords'; // Use Keywords table for briefs
    
    // Prepare update object
    const updateFields = {};
    
    // Set the appropriate status field based on type
    if (type === 'briefs') {
      updateFields['Keyword/Content Status'] = status;
    } else {
      updateFields['Status'] = status;
    }
    
    // Add revision reason if provided
    if (revisionReason && (status === 'Needs Revision' || status === 'Rejected')) {
      updateFields['Revision Notes'] = revisionReason;
    }
    
    // Update the record
    const updatedRecord = await base(tableName).update(itemId, updateFields);
    
    return {
      id: updatedRecord.id,
      ...updatedRecord.fields
    };
  } catch (error) {
    console.error('Error updating approval status:', error);
    throw error;
  }
};

module.exports = {
  getAirtableBase,
  getApprovalItems,
  updateApprovalStatus,
  mapAirtableStatusToUIStatus,
  createClientFilter,
  combineFilters
};
