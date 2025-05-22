import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { mockArticles } from '../../mock-data';
import { Article } from '../types';
import {
  handleAirtableError,
  createClientFilter,
  createUserFilter,
  createMonthFilter,
  combineFilters
} from '../utils';

/**
 * Get articles from Airtable, filtered by user role, client, and month
 * @param userId Optional user ID to filter articles
 * @param userRole Optional user role to filter articles
 * @param clientIds Optional client IDs to filter articles
 * @param month Optional month to filter articles
 * @returns Array of article objects
 */
export async function getArticles(
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null,
  month?: string | null
): Promise<Article[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock articles data');
    return mockArticles;
  }

  try {
    console.log('Fetching articles from Keywords table in Airtable...');
    console.log('Using base ID:', base._id);
    console.log('Using table name:', TABLES.KEYWORDS);

    // Check if the Keywords table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.KEYWORDS).select({ maxRecords: 1 }).firstPage();
      console.log('Keywords table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample Keywords record structure:', checkRecord[0].fields);
        console.log('Available fields in Keywords:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('Keywords table is empty. Using mock data...');
        return mockArticles;
      }
    } catch (checkError: any) {
      console.error('Error checking Keywords table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The Keywords table does not exist in this base');
        return mockArticles;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockArticles;
      }

      // For other errors, fall back to mock data
      return mockArticles;
    }

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering keywords by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }
    // If user is not an admin or client, filter by assigned user
    else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering keywords for user: ${userId}, role: ${userRole}`);
      filterParts.push(createUserFilter(userId, ['Content Writer', 'Content Editor']));
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering keywords by month:', month);
      filterParts.push(createMonthFilter(month, 'Month (Keyword Targets)'));
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.KEYWORDS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.KEYWORDS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} keywords records from Airtable`);

    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('First keyword record fields:', records[0].fields);
      console.log('First keyword record field keys:', Object.keys(records[0].fields));
    }

    // Try to find the field that contains status information
    const statusFieldName = records.length > 0 ?
      Object.keys(records[0].fields).find(key =>
        key === 'Keyword/Content Status' ||
        key === 'Status' ||
        key.toLowerCase().includes('status')
      ) : null;

    console.log('Found status field name for articles:', statusFieldName);

    // Filter and map the records to our expected Article format
    // We'll consider keywords with Status containing "Article" or specific article statuses as articles
    const articleRecords = records.filter((record: any) => {
      // If we found a specific status field, use it
      if (statusFieldName && record.fields[statusFieldName]) {
        const status = record.fields[statusFieldName];
        const statusLower = status.toLowerCase();

        return status.includes('Article') ||
               statusLower.includes('article') ||
               status === 'In Production' ||
               statusLower === 'in production' ||
               status === 'Review Draft' ||
               statusLower === 'review draft' ||
               status === 'Client Review' ||
               statusLower === 'client review' ||
               status === 'Published' ||
               statusLower === 'published';
      }

      // Otherwise try our previous approach
      const status = record.fields['Keyword/Content Status'] || record.fields.Status || '';
      const statusLower = status.toLowerCase();

      return status.includes('Article') ||
             statusLower.includes('article') ||
             status === 'In Production' ||
             statusLower === 'in production' ||
             status === 'Review Draft' ||
             statusLower === 'review draft' ||
             status === 'Client Review' ||
             statusLower === 'client review' ||
             status === 'Published' ||
             statusLower === 'published';
    });

    console.log(`Filtered ${articleRecords.length} records as articles`);

    // Map the records to our expected format
    return articleRecords.map((record: any) => {
      const fields = record.fields;

      // Process the Client field - check multiple possible field names
      let clientValue = fields['Clients'] || fields.Client || fields['Client'];

      // If no client field is found, use "Example Client" as a fallback
      if (!clientValue) {
        clientValue = "Example Client";
      }

      // Map the keyword status to article status
      let articleStatus = 'In Production';
      const keywordStatus = fields['Keyword/Content Status'] || fields['Article Status'] || fields.Status || '';

      // Use the status values from the "Keyword/Content Status" field
      if (keywordStatus === 'Awaiting Writer Assignment') {
        articleStatus = 'Awaiting Writer Assignment';
      } else if (keywordStatus === 'Writing In Progress') {
        articleStatus = 'Writing In Progress';
      } else if (keywordStatus === 'Under Client Review') {
        articleStatus = 'Under Client Review';
      } else if (keywordStatus === 'Under Editor Review') {
        articleStatus = 'Under Editor Review';
      } else if (keywordStatus === 'Writer Revision Needed') {
        articleStatus = 'Writer Revision Needed';
      } else if (keywordStatus === 'Content Approved') {
        articleStatus = 'Content Approved';
      } else if (keywordStatus === 'Visual Assets Needed') {
        articleStatus = 'Visual Assets Needed';
      } else if (keywordStatus === 'Visual Assets Complete') {
        articleStatus = 'Visual Assets Complete';
      } else if (keywordStatus === 'Ready for CMS Upload') {
        articleStatus = 'Ready for CMS Upload';
      } else if (keywordStatus === 'Internal Linking Needed') {
        articleStatus = 'Internal Linking Needed';
      } else if (keywordStatus === 'Ready for Publication') {
        articleStatus = 'Ready for Publication';
      } else if (keywordStatus === 'Published') {
        articleStatus = 'Published';
      } else if (keywordStatus === 'Reverse Internal Linking Needed') {
        articleStatus = 'Reverse Internal Linking Needed';
      } else if (keywordStatus === 'Complete') {
        articleStatus = 'Complete';
      } else if (keywordStatus === 'Cancelled') {
        articleStatus = 'Cancelled';
      } else if (keywordStatus === 'On Hold') {
        articleStatus = 'On Hold';
      } else if (keywordStatus === 'Content Published') {
        articleStatus = 'Content Published';
      } else if (keywordStatus.includes('Article')) {
        // Extract the article status from the keyword status for backward compatibility
        articleStatus = keywordStatus;
      } else if (keywordStatus === 'In Production') {
        articleStatus = 'Writing In Progress'; // Map to new status
      } else if (keywordStatus === 'Review Draft') {
        articleStatus = 'Under Editor Review'; // Map to new status
      } else if (keywordStatus === 'Draft Approved') {
        articleStatus = 'Content Approved'; // Map to new status
      } else if (keywordStatus === 'To Be Published') {
        articleStatus = 'Ready for Publication'; // Map to new status
      } else if (keywordStatus === 'Live') {
        articleStatus = 'Published'; // Map to new status
      }

      // Return an object with our expected structure
      return {
        id: record.id,
        Title: fields['Main Keyword'],
        Writer: fields['Content Writer'],
        Editor: fields.ContentEditor || fields['Content Editor'],
        WordCount: fields['Final Word Count']|| 0,
        DueDate: fields['Due Date (Publication)'],
        DocumentLink: fields['Written Content (G Doc)'],
        ArticleURL: fields['Target Page URL'],
        Month: fields['Month (Keyword Targets)'],
        Status: articleStatus,
        Client: clientValue,
        Clients: clientValue, // Add Clients field for compatibility
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, mockArticles, 'getArticles');
  }
}

/**
 * Update an article's status in Airtable
 * @param articleId Article ID to update
 * @param status New status value
 * @returns Updated article object
 */
export async function updateArticleStatus(articleId: string, status: string): Promise<Article> {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating article status (no credentials):', articleId, status);
    const updatedArticle = mockArticles.find(article => article.id === articleId);
    if (updatedArticle) {
      updatedArticle.Status = status;
    }
    return updatedArticle || { id: articleId, Status: status };
  }

  try {
    console.log(`Updating article ${articleId} status to ${status} in Airtable...`);

    // First, check if the article exists
    try {
      const checkRecord = await base(TABLES.KEYWORDS).find(articleId);
      console.log('Found article to update:', checkRecord.id);
      console.log('Current article fields:', checkRecord.fields);
    } catch (findError) {
      console.error(`Article with ID ${articleId} not found:`, findError);
      throw new Error(`Article with ID ${articleId} not found`);
    }

    // Check what fields are available in the record
    const checkRecord = await base(TABLES.KEYWORDS).find(articleId);
    console.log('Available fields in article record:', Object.keys(checkRecord.fields));

    // Always use 'Keyword/Content Status' field for article status
    // This ensures we're consistently using the same field for status updates
    const updateObject: Record<string, any> = {
      'Keyword/Content Status': status
    };

    console.log('Updating article with:', updateObject);

    // Now update the article
    const updatedRecord = await base(TABLES.KEYWORDS).update(articleId, updateObject);

    console.log('Article updated successfully:', updatedRecord.id);
    console.log('Updated fields:', updatedRecord.fields);

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    const updatedArticle = mockArticles.find(article => article.id === articleId);
    if (updatedArticle) {
      updatedArticle.Status = status;
    }
    return handleAirtableError(error, updatedArticle || { id: articleId, Status: status }, 'updateArticleStatus');
  }
}
