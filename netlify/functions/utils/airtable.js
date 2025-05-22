// Shared Airtable utility functions for Netlify Functions
const Airtable = require('airtable');
const { TABLES } = require('./constants');
const { getFieldValue, mapAirtableStatusToUIStatus, createClientFilter, combineFilters } = require('./airtable-utils');

// Singleton instances for connection pooling
let airtableInstance = null;
let baseInstance = null;

/**
 * Initialize Airtable with API key from environment variables
 * Uses connection pooling to avoid creating new connections for each request
 * @returns {Object} Airtable base instance
 */
const getAirtableBase = () => {
  // Log environment variables for debugging
  console.log('Environment variables:');
  console.log('AIRTABLE_API_KEY exists:', !!process.env.AIRTABLE_API_KEY);
  console.log('AIRTABLE_BASE_ID exists:', !!process.env.AIRTABLE_BASE_ID);
  console.log('NEXT_PUBLIC_AIRTABLE_API_KEY exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY);
  console.log('NEXT_PUBLIC_AIRTABLE_BASE_ID exists:', !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);

  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  // Reuse existing instance if available
  if (!airtableInstance) {
    console.log('Creating new Airtable instance');
    airtableInstance = new Airtable({
      apiKey,
      requestTimeout: 30000 // 30 second timeout
    });
    baseInstance = airtableInstance.base(baseId);
  } else {
    console.log('Reusing existing Airtable instance');
  }

  return baseInstance;
};

// Helper function to map Airtable status to UI status
const mapAirtableStatusToUIStatus = (airtableStatus, fields = null) => {
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
    if (fields['Backlinks Approval']) {
      return mapStatusString(fields['Backlinks Approval']);
    }
  }

  // Otherwise, map the provided status string
  return mapStatusString(airtableStatus);
};

// Helper function to map a status string to UI status
const mapStatusString = (statusString) => {
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
};

// Helper function to create client filter formula
const createClientFilter = (clientIds) => {
  if (!clientIds || clientIds.length === 0) {
    return '';
  }

  const clientFilters = clientIds.map(clientId =>
    `SEARCH('${clientId}', ARRAYJOIN(Clients, ',')) > 0`
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
    // Determine which table to use based on type
    let tableName;
    if (type === 'backlinks') {
      tableName = 'Backlinks';
    } else {
      tableName = 'Keywords'; // Use Keywords table for briefs, articles, and keywords
    }

    // Build filter formula based on user role and client
    let filterParts = [];

    // Add client filter if user is not an admin and has assigned clients
    if (userRole !== 'admin' && clientIds && clientIds.length > 0) {
      filterParts.push(createClientFilter(clientIds));
    }

    // Filter by the dedicated approval fields
    if (type === 'keywords') {
      // Only show records with a value in the "Keyword Approval" field
      filterParts.push("NOT({Keyword Approval} = '')");
      // For Keywords table, also filter by Content Type
      filterParts.push("{Content Type} = 'Keyword'");
      console.log('Filtering keywords by Keyword Approval field');
    } else if (type === 'briefs') {
      // Only show records with a value in the "Brief Approval" field
      filterParts.push("NOT({Brief Approval} = '')");
      // For Keywords table, also filter by Content Type
      filterParts.push("{Content Type} = 'Brief'");
      console.log('Filtering briefs by Brief Approval field');
    } else if (type === 'articles') {
      // Only show records with a value in the "Article Approval" field
      filterParts.push("NOT({Article Approval} = '')");
      // For Keywords table, also filter by Content Type
      filterParts.push("{Content Type} = 'Article'");
      console.log('Filtering articles by Article Approval field');
    } else if (type === 'backlinks') {
      // Only show records with a value in the "Backlinks Approval" field
      filterParts.push("NOT({Backlinks Approval} = '')");
      console.log('Filtering backlinks by Backlinks Approval field');
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
    let items = records.map(record => {
      const fields = record.fields;

      const item = {
        id: record.id,
        item: type === 'briefs' ? fields['Meta Title'] || fields['Main Keyword'] || fields['Title'] :
              type === 'articles' ? fields['Main Keyword'] || fields['Title'] :
              type === 'backlinks' ? fields['Domain'] || fields['Domain URL'] :
              fields['Main Keyword'] || fields.Title,
        status: mapAirtableStatusToUIStatus(
          type === 'keywords' ? fields['Keyword Approval'] :
          type === 'briefs' ? fields['Brief Approval'] :
          type === 'articles' ? fields['Article Approval'] :
          type === 'backlinks' ? fields['Backlinks Approval'] :
          type === 'briefs' ? fields['Keyword/Content Status'] : fields.Status,
          fields
        ),
        dateSubmitted: fields['Created Time'] || fields['Created At'],
        lastUpdated: fields['Last Modified Time'] || fields['Updated At'],
        contentType: type, // Add the content type for filtering
        ...fields
      };

      // Add type-specific fields
      if (type === 'keywords') {
        item.volume = fields['Search Volume'];
        item.difficulty = fields['Keyword Difficulty'];
        item.strategist = fields['SEO Specialist'];
        item.keywordApproval = fields['Keyword Approval'] || '';
      } else if (type === 'briefs') {
        item.strategist = fields['SEO Strategist'] || fields['SEO Specialist'] || '';
        item.briefApproval = fields['Brief Approval'] || '';
        item.documentLink = fields['Content Brief Link (G Doc)'] || fields['Document Link'] || '';
      } else if (type === 'articles') {
        item.wordCount = fields['Word Count'] || fields['WordCount'] || 0;
        item.strategist = fields['Content Writer'] || fields['Writer'] || fields['SEO Strategist'] || fields['SEO Specialist'] || '';
        item.articleApproval = fields['Article Approval'] || '';
        item.documentLink = fields['Content Link (G Doc)'] || fields['Document Link'] || '';
      } else if (type === 'backlinks') {
        item.domainRating = fields['DR ( API )'] || fields['Domain Authority/Rating'] || 0;
        item.linkType = fields['Link Type'] || '';
        item.targetPage = fields['Target URL'] || fields['Client Target Page URL'] || '';
        item.wentLiveOn = fields['Went Live On'] || '';
        item.notes = fields['Notes'] || '';
        item.backlinksApproval = fields['Backlinks Approval'] || '';
      }

      return item;
    });

    // Additional post-processing filter to ensure we only return items with the appropriate approval field
    console.log(`Before post-processing filter: ${items.length} items`);
    items = items.filter(item => {
      if (type === 'keywords' && (!item.keywordApproval || item.keywordApproval.trim() === '')) {
        console.log(`Excluding keyword item ${item.id} because Keyword Approval field is empty`);
        return false;
      }
      if (type === 'briefs' && (!item.briefApproval || item.briefApproval.trim() === '')) {
        console.log(`Excluding brief item ${item.id} because Brief Approval field is empty`);
        return false;
      }
      if (type === 'articles' && (!item.articleApproval || item.articleApproval.trim() === '')) {
        console.log(`Excluding article item ${item.id} because Article Approval field is empty`);
        return false;
      }
      if (type === 'backlinks' && (!item.backlinksApproval || item.backlinksApproval.trim() === '')) {
        console.log(`Excluding backlink item ${item.id} because Backlinks Approval field is empty`);
        return false;
      }
      return true;
    });
    console.log(`After post-processing filter: ${items.length} items`);

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
    // Determine which table to use based on type
    let tableName;
    if (type === 'backlinks') {
      tableName = 'Backlinks';
    } else {
      tableName = 'Keywords'; // Use Keywords table for briefs, articles, and keywords
    }

    // Prepare update object
    const updateFields = {};

    // Map UI status to Airtable status
    let airtableStatus = '';

    // Map new standardized statuses
    if (status === 'not_started') {
      airtableStatus = 'Not Started';
    } else if (status === 'in_progress') {
      airtableStatus = 'In Progress';
    } else if (status === 'ready_for_review') {
      airtableStatus = 'Ready for Review';
    } else if (status === 'awaiting_approval') {
      airtableStatus = 'Awaiting Approval';
    } else if (status === 'revisions_needed') {
      airtableStatus = 'Revisions Needed';
    } else if (status === 'approved') {
      airtableStatus = 'Approved';
    } else if (status === 'published') {
      airtableStatus = 'Published';
    }
    // Legacy status mappings for backward compatibility
    else if (status === 'needs_revision') {
      airtableStatus = 'Revisions Needed'; // Map to new equivalent
    } else if (status === 'resubmitted') {
      airtableStatus = 'Resubmitted';
    } else if (status === 'rejected') {
      airtableStatus = 'Rejected';
    } else {
      airtableStatus = status; // Use as-is if no mapping
    }

    // Use the dedicated approval fields based on content type
    if (type === 'keywords') {
      updateFields['Keyword Approval'] = airtableStatus;
    } else if (type === 'briefs') {
      updateFields['Brief Approval'] = airtableStatus;
    } else if (type === 'articles') {
      updateFields['Article Approval'] = airtableStatus;
    } else if (type === 'backlinks') {
      updateFields['Backlinks Approval'] = airtableStatus;
    }

    // For backward compatibility, also update the general status fields
    if (type === 'briefs') {
      updateFields['Keyword/Content Status'] = airtableStatus;
    } else {
      updateFields['Status'] = airtableStatus;
    }

    // Also update the Approval Status field for consistency
    updateFields['Approval Status'] = `${type.charAt(0).toUpperCase() + type.slice(1, -1)} ${airtableStatus}`;

    // Add revision reason if provided
    if (revisionReason && (airtableStatus === 'Revisions Needed' || airtableStatus === 'Rejected')) {
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
