const Airtable = require('airtable');

// Handler for the Netlify function
exports.handler = async (event, context) => {
  // Get API key and base ID from environment variables
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  // Check if we have the required credentials
  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing Airtable credentials'
      })
    };
  }

  // Get user information from headers
  const userId = event.headers['x-user-id'];
  const userRole = event.headers['x-user-role'];
  const selectedClientId = event.headers['x-selected-client'];
  let clientIds = [];

  try {
    if (event.headers['x-user-client']) {
      clientIds = JSON.parse(event.headers['x-user-client']);
    }
  } catch (error) {
    console.error('Error parsing client IDs:', error);
  }

  console.log('Netlify function received headers - userId:', userId, 'userRole:', userRole, 'selectedClientId:', selectedClientId, 'clientIds:', clientIds);

  // If we have a selected client ID that's not 'all' and the user is an admin, use that for filtering
  if (selectedClientId && selectedClientId !== 'all' && userRole === 'Admin') {
    console.log('Admin user with specific client selected:', selectedClientId);
    clientIds = [selectedClientId];
  }

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    // Table names
    const TABLES = {
      KEYWORDS: 'Keywords',
      TASKS: 'Tasks',
      BACKLINKS: 'Backlinks'
    };

    // Prepare filter formulas based on user role and client IDs
    let clientFilter = '';
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      const clientFilters = clientIds.map(clientId =>
        `SEARCH('${clientId}', ARRAYJOIN({Client}, ',')) > 0`
      );
      clientFilter = `OR(${clientFilters.join(',')})`;
    }

    // 1. Fetch Content Workflow data (briefs and articles from Keywords table)
    const keywordsFilter = clientFilter ?
      `AND(OR({Keyword/Content Status} = 'Brief Approved', {Keyword/Content Status} = 'In Progress', {Keyword/Content Status} = 'Review Brief', {Keyword/Content Status} = 'Needs Input', {Keyword/Content Status} = 'Review Draft', {Keyword/Content Status} = 'Draft Approved', {Keyword/Content Status} = 'To Be Published', {Keyword/Content Status} = 'Live'), ${clientFilter})` :
      `OR({Keyword/Content Status} = 'Brief Approved', {Keyword/Content Status} = 'In Progress', {Keyword/Content Status} = 'Review Brief', {Keyword/Content Status} = 'Needs Input', {Keyword/Content Status} = 'Review Draft', {Keyword/Content Status} = 'Draft Approved', {Keyword/Content Status} = 'To Be Published', {Keyword/Content Status} = 'Live')`;

    const keywordsRecords = await base(TABLES.KEYWORDS).select({
      filterByFormula: keywordsFilter
    }).all();

    console.log(`Fetched ${keywordsRecords.length} keywords records for homepage`);

    // Count delivered vs in progress
    const delivered = keywordsRecords.filter(record =>
      record.fields['Keyword/Content Status'] === 'Live' ||
      record.fields['Keyword/Content Status'] === 'To Be Published'
    ).length;

    const inProgress = keywordsRecords.length - delivered;

    // 2. Fetch Action Items (tasks that need attention)
    const actionItemsFilter = clientFilter ?
      `AND(OR({Status} = 'To Do', {Status} = 'In Progress', {Status} = 'Blocked'), ${clientFilter})` :
      `OR({Status} = 'To Do', {Status} = 'In Progress', {Status} = 'Blocked')`;

    const tasksRecords = await base(TABLES.TASKS).select({
      filterByFormula: actionItemsFilter,
      sort: [{ field: 'Priority', direction: 'desc' }],
      maxRecords: 3
    }).all();

    console.log(`Fetched ${tasksRecords.length} tasks for action items`);

    const actionItems = tasksRecords.map(record => ({
      id: record.id,
      title: record.fields.Title || record.fields.Name || 'Untitled Task',
      status: record.fields.Status || 'To Do',
      dueDate: record.fields.DueDate || undefined,
      priority: getPriorityLevel(record.fields.Priority),
      description: record.fields.Description || undefined
    }));

    // 3. Fetch Latest Activity
    // a. Recent briefs
    const recentBriefsFilter = clientFilter ?
      `AND({Keyword/Content Status} = 'Review Brief', ${clientFilter})` :
      `{Keyword/Content Status} = 'Review Brief'`;

    const recentBriefsRecords = await base(TABLES.KEYWORDS).select({
      filterByFormula: recentBriefsFilter,
      sort: [{ field: 'Created Time', direction: 'desc' }],
      maxRecords: 2
    }).all();

    const recentBriefs = recentBriefsRecords.map(record => ({
      id: record.id,
      title: record.fields['Meta Title'] || record.fields.Keyword || 'Untitled Brief',
      sentDate: formatRelativeDate(record.fields['Created Time'] || new Date().toISOString())
    }));

    // b. Recent plans approved
    const recentPlansFilter = clientFilter ?
      `AND({Keyword/Content Status} = 'Brief Approved', ${clientFilter})` :
      `{Keyword/Content Status} = 'Brief Approved'`;

    const recentPlansRecords = await base(TABLES.KEYWORDS).select({
      filterByFormula: recentPlansFilter,
      sort: [{ field: 'Last Modified Time', direction: 'desc' }],
      maxRecords: 2
    }).all();

    const recentPlans = recentPlansRecords.map(record => ({
      id: record.id,
      title: record.fields['Meta Title'] || record.fields.Keyword || 'Untitled Plan',
      approvedDate: formatRelativeDate(record.fields['Last Modified Time'] || new Date().toISOString())
    }));

    // c. Feedback requested
    const feedbackFilter = clientFilter ?
      `AND({Keyword/Content Status} = 'Review Draft', ${clientFilter})` :
      `{Keyword/Content Status} = 'Review Draft'`;

    const feedbackRecords = await base(TABLES.KEYWORDS).select({
      filterByFormula: feedbackFilter,
      sort: [{ field: 'Last Modified Time', direction: 'desc' }],
      maxRecords: 2
    }).all();

    const feedback = feedbackRecords.map(record => ({
      id: record.id,
      title: record.fields['Meta Title'] || record.fields.Keyword || 'Untitled Draft',
      status: 'Awaiting feedback'
    }));

    // 4. Fetch Campaign Progress
    // a. Calculate overall progress percentage
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const currentMonthYear = `${currentMonth} ${currentYear}`;

    const monthFilter = clientFilter ?
      `AND({Month (Keyword Targets)} = '${currentMonthYear}', ${clientFilter})` :
      `{Month (Keyword Targets)} = '${currentMonthYear}'`;

    const monthKeywordsRecords = await base(TABLES.KEYWORDS).select({
      filterByFormula: monthFilter
    }).all();

    // Calculate progress percentage based on completed items
    const completedKeywords = monthKeywordsRecords.filter(record =>
      record.fields['Keyword/Content Status'] === 'Live' ||
      record.fields['Keyword/Content Status'] === 'To Be Published'
    ).length;

    const progressPercentage = monthKeywordsRecords.length > 0 ?
      Math.round((completedKeywords / monthKeywordsRecords.length) * 100) : 0;

    // b. Get backlinks data
    // Use the same currentMonthYear that was defined earlier

    // Try to match both the full "Month Year" format and just the month name
    const backlinksFilter = clientFilter ?
      `AND(OR({Month} = '${currentMonth}', {Month} = '${currentMonthYear}'), ${clientFilter})` :
      `OR({Month} = '${currentMonth}', {Month} = '${currentMonthYear}')`;

    console.log('Backlinks filter:', backlinksFilter);

    const backlinksRecords = await base(TABLES.BACKLINKS).select({
      filterByFormula: backlinksFilter
    }).all();

    console.log(`Fetched ${backlinksRecords.length} backlinks records for homepage`);

    // Count only backlinks with 'Live' status
    const liveBacklinks = backlinksRecords.filter(record =>
      record.fields.Status === 'Live' || record.fields.Status === 'Link Live'
    ).length;

    console.log(`Found ${liveBacklinks} live backlinks for the current month`);

    // Log the backlinks data for debugging
    if (backlinksRecords.length > 0) {
      console.log('Sample backlink record:', {
        id: backlinksRecords[0].id,
        domain: backlinksRecords[0].fields.Domain,
        status: backlinksRecords[0].fields.Status,
        month: backlinksRecords[0].fields.Month
      });
    }

    // Count blogs from Keywords table that are live
    const liveBlogs = monthKeywordsRecords.filter(record =>
      record.fields['Keyword/Content Status'] === 'Live' &&
      record.fields['Content Type'] === 'Blog Post'
    ).length;

    // Construct the homepage data object
    const homepageData = {
      contentWorkflow: {
        delivered,
        inProgress
      },
      actionItems: {
        items: actionItems
      },
      latestActivity: {
        briefs: recentBriefs,
        plans: recentPlans,
        feedback
      },
      campaignProgress: {
        progressPercentage,
        content: {
          briefsDelivered: completedKeywords,
          totalBriefs: monthKeywordsRecords.length
        },
        links: {
          backlinks: liveBacklinks,
          blogsLive: liveBlogs
        }
      }
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ homepageData })
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch homepage data',
        details: error.message
      })
    };
  }
};

// Helper function to map priority string to priority level
function getPriorityLevel(priority) {
  if (!priority) return 'medium';

  const normalizedPriority = priority.toLowerCase();
  if (normalizedPriority.includes('high') || normalizedPriority === '1') return 'high';
  if (normalizedPriority.includes('low') || normalizedPriority === '3') return 'low';
  return 'medium';
}

// Helper function to format relative dates
function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'last week';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return 'last month';
  return `${Math.floor(diffDays / 30)} months ago`;
}
