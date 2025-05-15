import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { ApprovalItem, PaginatedResponse, ApprovalType, GetApprovalItemsParams } from '../types';
import { handleAirtableError, mapAirtableStatusToUIStatus, createClientFilter, createUserFilter, combineFilters } from '../utils';

/**
 * Get approval items from Airtable with pagination
 * @param params Parameters for filtering and pagination
 * @returns Paginated response with approval items
 */
export async function getApprovalItems(params: GetApprovalItemsParams): Promise<PaginatedResponse<ApprovalItem> | ApprovalItem[]> {
  const { 
    type, 
    status, 
    currentPage = 1, 
    itemsPerPage = 10, 
    offset, 
    userId, 
    userRole, 
    clientIds 
  } = params;
  
  const isPaginatedRequest = currentPage !== undefined && itemsPerPage !== undefined;
  
  // Default response for empty results
  const defaultResponse: PaginatedResponse<ApprovalItem> = {
    items: [],
    pagination: {
      currentPage: currentPage || 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: false,
      nextOffset: null,
      prevOffset: null
    }
  };

  // Determine which table to use based on the type
  let tableName = TABLES.KEYWORDS;

  if (!hasAirtableCredentials) {
    console.log(`Using mock ${type} data for approval items`);
    return defaultResponse;
  }

  try {
    console.log(`Fetching ${type} approval items from Airtable...`);
    console.log('Using base ID:', base._id);
    console.log('Using table name:', tableName);
    console.log('Current page:', currentPage);
    console.log('Items per page:', itemsPerPage);
    console.log('Offset:', offset);

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }
    // If user is not an admin or client, filter by assigned user
    else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering for user: ${userId}, role: ${userRole}`);
      
      // Different fields to check based on the type
      let userFields: string[] = [];
      if (type === 'keywords') {
        userFields = ['Content Writer', 'SEO Strategist', 'SEO Specialist'];
      } else if (type === 'briefs') {
        userFields = ['SEO Assignee', 'SEO Strategist', 'Brief Owner'];
      } else if (type === 'articles') {
        userFields = ['Content Writer', 'Writer', 'Author'];
      }
      
      filterParts.push(createUserFilter(userId, userFields));
    }

    // If status is specified, add status filter
    if (status) {
      console.log('Filtering by status:', status);
      
      // Map UI status back to Airtable status
      let airtableStatus = '';
      if (status === 'awaiting_approval') {
        airtableStatus = 'Awaiting Approval';
      } else if (status === 'resubmitted') {
        airtableStatus = 'Resubmitted';
      } else if (status === 'needs_revision') {
        airtableStatus = 'Needs Revision';
      } else if (status === 'approved') {
        airtableStatus = 'Approved';
      } else if (status === 'rejected') {
        airtableStatus = 'Rejected';
      }
      
      if (airtableStatus) {
        filterParts.push(`{Approval Status} = '${airtableStatus}'`);
      }
    }

    // Add type-specific filters
    if (type === 'keywords') {
      // For keywords tab, we'll use a more permissive filter
      filterParts.push(`
        OR(
          SEARCH('Keyword', {Approval Status}) > 0,
          SEARCH('keyword', {Approval Status}) > 0,
          {Approval Status} = 'Keyword Research',
          {Approval Status} = 'Keyword Approved',
          {Approval Status} = 'Keyword Under Review',
          {Approval Status} = 'Keyword Needs Revision',
          {Approval Status} = 'Keyword Rejected',
          {Approval Status} = 'Keyword Pending',
          {Approval Status} = 'Keyword Awaiting Approval',
          {Approval Status} = 'Keyword Resubmitted',
          {Approval Status} = 'Research',
          {Approval Status} = 'Research Approved',
          {Approval Status} = 'Research Under Review'
        )
      `);
    } else if (type === 'briefs') {
      filterParts.push(`
        OR(
          SEARCH('Brief', {Approval Status}) > 0,
          SEARCH('brief', {Approval Status}) > 0,
          {Approval Status} = 'Brief Creation Needed',
          {Approval Status} = 'Brief Approved',
          {Approval Status} = 'Brief Under Review',
          {Approval Status} = 'Brief Needs Revision',
          {Approval Status} = 'Brief Rejected',
          {Approval Status} = 'Brief Pending',
          {Approval Status} = 'Brief Awaiting Approval',
          {Approval Status} = 'Brief Resubmitted'
        )
      `);
    } else if (type === 'articles') {
      filterParts.push(`
        OR(
          SEARCH('Article', {Approval Status}) > 0,
          SEARCH('article', {Approval Status}) > 0,
          {Approval Status} = 'Article Draft',
          {Approval Status} = 'Article Approved',
          {Approval Status} = 'Article Under Review',
          {Approval Status} = 'Article Needs Revision',
          {Approval Status} = 'Article Rejected',
          {Approval Status} = 'Article Pending',
          {Approval Status} = 'Article Awaiting Approval',
          {Approval Status} = 'Article Resubmitted',
          {Approval Status} = 'Draft',
          {Approval Status} = 'Draft Approved',
          {Approval Status} = 'Draft Under Review'
        )
      `);
    }

    // Combine all filter parts with AND
    const filterFormula = combineFilters(filterParts);

    // Prepare query options
    const queryOptions: Record<string, any> = {
      pageSize: itemsPerPage
    };

    // Only add filter if we have one
    if (filterFormula && filterParts.length > 0) {
      queryOptions.filterByFormula = filterFormula;
    }

    // Only add offset if it's provided
    if (offset) {
      queryOptions.offset = offset;
    }

    console.log('Using query options:', queryOptions);
    const query = base(tableName).select(queryOptions);

    // Fetch only the first page of records
    console.log('Calling query.firstPage() to fetch records...');
    const result = await query.firstPage();
    console.log(`Successfully fetched ${result.length} records from Airtable for ${type} approvals`);

    // Get the offset for the next page
    const nextOffset = query.offset || null;
    console.log(`Next page offset: ${nextOffset || 'None (last page)'}`);

    // Log the first record to see its structure
    if (result.length > 0) {
      console.log(`Sample record for ${type}:`, {
        id: result[0].id,
        fields: result[0].fields,
        fieldKeys: Object.keys(result[0].fields)
      });
    } else {
      console.log(`No records found for ${type} with the current filter`);
      console.log('Filter formula:', filterFormula);

      // Return empty array if no records found
      if (isPaginatedRequest) {
        return defaultResponse;
      } else {
        return [];
      }
    }

    // Map the records to our expected format
    const items = result.map((record: Record<string, unknown>) => {
      const fields = record.fields as Record<string, unknown>;

      // Try to find the right field names by checking multiple possibilities
      const getFieldValue = <T>(possibleNames: string[], defaultValue: T): T => {
        for (const name of possibleNames) {
          if (fields[name] !== undefined) {
            return fields[name] as T;
          }
        }
        return defaultValue;
      };

      // Common fields for all types
      const commonFields = {
        id: record.id,
        item: getFieldValue([
          'Main Keyword',
          'Keyword',
          'Title',
          'Name',
          'Content',
          'Brief Title'
        ], 'Untitled'),
        status: mapAirtableStatusToUIStatus(getFieldValue([
          'Approval Status',
          'Status',
          'Content Status',
          'Keyword/Content Status'
        ], '')),
        dateSubmitted: getFieldValue([
          'Created Time',
          'Created',
          'Date Created',
          'Submission Date'
        ], new Date().toISOString().split('T')[0]),
        lastUpdated: getFieldValue([
          'Last Updated',
          'Last Modified',
          'Modified Time',
          'Last Modified Time',
          'Update Date'
        ], '3 days ago'),
      };

      // Type-specific fields
      if (type === 'keywords') {
        return {
          ...commonFields,
          volume: getFieldValue(['Search Volume', 'Volume', 'Monthly Volume'], 0),
          difficulty: getFieldValue(['Difficulty', 'Keyword Difficulty', 'SEO Difficulty'], 'Medium'),
          strategist: getFieldValue([
            'Content Writer',
            'Writer',
            'SEO Strategist',
            'SEO Specialist',
            'Assigned To'
          ], 'Not Assigned')
        };
      } else if (type === 'briefs') {
        return {
          ...commonFields,
          strategist: getFieldValue([
            'SEO Assignee',
            'SEO Strategist',
            'SEO Specialist',
            'Assigned To',
            'Brief Owner'
          ], 'Not Assigned')
        };
      } else if (type === 'articles') {
        return {
          ...commonFields,
          wordCount: getFieldValue([
            'Final Word Count',
            'Word Count',
            'Content Length',
            'Length'
          ], 0),
          strategist: getFieldValue([
            'Content Writer',
            'Writer',
            'Author',
            'Assigned To'
          ], 'Not Assigned')
        };
      }

      return commonFields;
    });

    // If this is a simple request (no pagination), return the items directly
    if (!isPaginatedRequest) {
      return items;
    }

    // Calculate pagination info
    // We don't know the total count from Airtable, so we'll estimate
    // We know there's a next page if we have an offset
    const hasNextPage = !!nextOffset;

    // For total items, we'll use a rough estimate
    // If we have a full page and there's a next page, we'll estimate 100 items total
    // Otherwise, we'll just use the current items length
    const totalItems = hasNextPage ? Math.max(items.length * 5, 100) : items.length;
    const totalPages = hasNextPage ? Math.max(currentPage + 1, Math.ceil(totalItems / itemsPerPage)) : currentPage;

    return {
      items,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage: currentPage > 1,
        nextOffset: nextOffset,
        prevOffset: currentPage > 1 ? String(currentPage - 1) : null
      }
    };
  } catch (error) {
    return handleAirtableError(error, defaultResponse, `getApprovalItems for ${type}`);
  }
}
