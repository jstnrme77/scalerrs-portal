import { TABLES, getAirtableClient } from '../airtable-utils';
import { mockBriefs, mockArticles, mockBacklinks, mockTasks } from '../mock-data';
// Using local implementations instead of imports
// import { formatRelativeDate, getPriorityLevel } from '../utils';

// Interface for homepage data
export interface HomepageData {
  contentWorkflow: {
    delivered: number;
    inProgress: number;
  };
  actionItems: {
    items: Array<{
      id: string;
      title: string;
      status: string;
      dueDate?: string;
      priority: 'high' | 'medium' | 'low';
      description?: string;
    }>;
  };
  latestActivity: {
    briefs: Array<{
      id: string;
      title: string;
      sentDate: string;
    }>;
    plans: Array<{
      id: string;
      title: string;
      approvedDate: string;
    }>;
    feedback: Array<{
      id: string;
      title: string;
      status: string;
    }>;
  };
  campaignProgress: {
    progressPercentage: number;
    content: {
      briefsDelivered: number;
      totalBriefs: number;
    };
    links: {
      backlinks: number;
      blogsLive: number;
    };
  };
}

/**
 * Fetches all data needed for the homepage
 * @param userId The current user's ID
 * @param userRole The current user's role
 * @param clientIds Array of client IDs the user has access to
 * @returns Homepage data
 */
export async function getHomepageData(
  userId?: string | null,
  userRole?: string | null,
  clientIds?: string[] | null
): Promise<HomepageData> {
  // Get Airtable client
  const { base, hasCredentials } = getAirtableClient();

  // Check if we have Airtable credentials and if Airtable was initialized successfully
  if (!hasCredentials || !base) {
    console.log('Using mock data for homepage - Airtable not available');
    return getMockHomepageData();
  }

  // Initialize variables that will be used throughout the function and in error handling
  let monthKeywordsRecords: readonly any[] = [];
  let completedKeywords = 0;
  let progressPercentage = 0;
  let actionItems: any[] = [];
  let recentBriefs: any[] = [];
  let recentPlans: any[] = [];
  let feedback: any[] = [];
  let liveBacklinks = 0;
  let liveBlogs = 0;

  try {
    console.log('Fetching homepage data from Airtable...');
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('Client IDs:', clientIds);

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

    const keywordsQuery = base(TABLES.KEYWORDS).select({
      filterByFormula: keywordsFilter
    });

    const keywordsRecords = await keywordsQuery.all();
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

    const tasksQuery = base(TABLES.TASKS).select({
      filterByFormula: actionItemsFilter,
      sort: [{ field: 'Priority', direction: 'desc' }],
      maxRecords: 3
    });

    const tasksRecords = await tasksQuery.all();
    console.log(`Fetched ${tasksRecords.length} tasks for action items`);

    // Map task records to action items
    actionItems = tasksRecords.map(record => ({
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

    const recentBriefsQuery = base(TABLES.KEYWORDS).select({
      filterByFormula: recentBriefsFilter,
      sort: [{ field: 'Created Time', direction: 'desc' }],
      maxRecords: 2
    });

    const recentBriefsRecords = await recentBriefsQuery.all();

    // Map brief records to recent briefs
    recentBriefs = recentBriefsRecords.map(record => ({
      id: record.id,
      title: record.fields['Meta Title'] || record.fields.Keyword || 'Untitled Brief',
      sentDate: formatRelativeDate(record.fields['Created Time'] || new Date().toISOString())
    }));

    // b. Recent plans approved
    const recentPlansFilter = clientFilter ?
      `AND({Keyword/Content Status} = 'Brief Approved', ${clientFilter})` :
      `{Keyword/Content Status} = 'Brief Approved'`;

    const recentPlansQuery = base(TABLES.KEYWORDS).select({
      filterByFormula: recentPlansFilter,
      sort: [{ field: 'Last Modified Time', direction: 'desc' }],
      maxRecords: 2
    });

    const recentPlansRecords = await recentPlansQuery.all();

    // Map plan records to recent plans
    recentPlans = recentPlansRecords.map(record => ({
      id: record.id,
      title: record.fields['Meta Title'] || record.fields.Keyword || 'Untitled Plan',
      approvedDate: formatRelativeDate(record.fields['Last Modified Time'] || new Date().toISOString())
    }));

    // c. Feedback requested
    const feedbackFilter = clientFilter ?
      `AND({Keyword/Content Status} = 'Review Draft', ${clientFilter})` :
      `{Keyword/Content Status} = 'Review Draft'`;

    const feedbackQuery = base(TABLES.KEYWORDS).select({
      filterByFormula: feedbackFilter,
      sort: [{ field: 'Last Modified Time', direction: 'desc' }],
      maxRecords: 2
    });

    const feedbackRecords = await feedbackQuery.all();

    // Map feedback records to feedback items
    feedback = feedbackRecords.map(record => ({
      id: record.id,
      title: record.fields['Meta Title'] || record.fields.Keyword || 'Untitled Draft',
      status: 'Awaiting feedback'
    }));

    / 4. Fetch Campaign Progress
    // a. Calculate overall progress percentage
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const currentMonthYear = `${currentMonth} ${currentYear}`;

    const monthFilter = clientFilter ?
      `AND({Month (Keyword Targets)} = '${currentMonthYear}', ${clientFilter})` :
      `{Month (Keyword Targets)} = '${currentMonthYear}'`;

    const monthKeywordsQuery = base(TABLES.KEYWORDS).select({
      filterByFormula: monthFilter
    });

    // Get month keywords records
    monthKeywordsRecords = await monthKeywordsQuery.all();

    // Calculate progress percentage based on completed items
    completedKeywords = monthKeywordsRecords.filter(record =>
      record.fields['Keyword/Content Status'] === 'Live' ||
      record.fields['Keyword/Content Status'] === 'To Be Published'
    ).length;

    progressPercentage = monthKeywordsRecords.length > 0 ?
      Math.round((completedKeywords / monthKeywordsRecords.length) * 100) : 0;

    // b. Get backlinks data
    // Use the same currentMonthYear that was defined earlier

    // Try to match both the full "Month Year" format and just the month name
    const backlinksFilter = clientFilter ?
      `AND(OR({Month} = '${currentMonth}', {Month} = '${currentMonthYear}'), ${clientFilter})` :
      `OR({Month} = '${currentMonth}', {Month} = '${currentMonthYear}')`;

    console.log('Backlinks filter:', backlinksFilter);

    const backlinksQuery = base(TABLES.BACKLINKS).select({
      filterByFormula: backlinksFilter
    });

    const backlinksRecords = await backlinksQuery.all();
    console.log(`Fetched ${backlinksRecords.length} backlinks records for homepage`);

    // Count only backlinks with 'Live' status
    liveBacklinks = backlinksRecords.filter(record =>
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
    liveBlogs = monthKeywordsRecords.filter(record =>
      record.fields['Keyword/Content Status'] === 'Live' &&
      record.fields['Content Type'] === 'Blog Post'
    ).length;

    return {
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
  } catch (error) {
    console.error('Error fetching homepage data from Airtable:', error);

    // Check if we have partial data before falling back to mock data
    if (monthKeywordsRecords && monthKeywordsRecords.length > 0) {
      console.log('Using partial real data for homepage');

      // We have some real data, so let's use what we have
      return {
        contentWorkflow: {
          delivered: completedKeywords || 0,
          inProgress: (monthKeywordsRecords.length - completedKeywords) || 0
        },
        actionItems: {
          items: actionItems || []
        },
        latestActivity: {
          briefs: recentBriefs || [],
          plans: recentPlans || [],
          feedback: feedback || []
        },
        campaignProgress: {
          progressPercentage: progressPercentage || 0,
          content: {
            briefsDelivered: completedKeywords || 0,
            totalBriefs: monthKeywordsRecords.length || 0
          },
          links: {
            backlinks: liveBacklinks || 0,
            blogsLive: liveBlogs || 0
          }
        }
      };
    }

    // If we don't have any real data, fall back to mock data
    console.log('Falling back to mock homepage data');
    return getMockHomepageData();
  }
}

// Helper function to get mock homepage data
export function getMockHomepageData(): HomepageData {
  // Count delivered vs in progress from mock data
  const delivered = mockArticles.filter(article =>
    article.Status === 'Live' || article.Status === 'To Be Published'
  ).length;

  const inProgress = mockArticles.length - delivered;

  // Get action items from mock tasks
  const actionItems = mockTasks
    .filter(task => ['To Do', 'In Progress', 'Blocked'].includes(task.Status))
    .slice(0, 3)
    .map(task => ({
      id: task.id,
      title: task.Title,
      status: task.Status,
      dueDate: undefined,
      priority: getPriorityLevel(task.Priority),
      description: task.Description
    }));

  // Calculate mock campaign progress
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const briefsForCurrentMonth = mockBriefs.filter(brief =>
    brief.Month && brief.Month.includes(currentMonth)
  );

  const completedBriefs = briefsForCurrentMonth.filter(brief =>
    brief.Status === 'Brief Approved'
  ).length;

  const progressPercentage = briefsForCurrentMonth.length > 0 ?
    Math.round((completedBriefs / briefsForCurrentMonth.length) * 100) : 63; // Default to 63% if no data

  // Get backlinks data
  const backlinksForCurrentMonth = mockBacklinks.filter(backlink =>
    backlink.Month === currentMonth
  );

  const liveBacklinks = backlinksForCurrentMonth.filter(backlink =>
    backlink.Status === 'Live'
  ).length;

  return {
    contentWorkflow: {
      delivered: 12, // Mock values
      inProgress: 8
    },
    actionItems: {
      items: actionItems.length > 0 ? actionItems : [
        {
          id: 'mock1',
          title: 'Content Brief Approval',
          status: 'To Do',
          dueDate: '2 days',
          priority: 'high',
          description: 'Review and approve content brief'
        },
        {
          id: 'mock2',
          title: 'Review Monthly Report',
          status: 'In Progress',
          dueDate: undefined,
          priority: 'medium',
          description: 'New report available'
        },
        {
          id: 'mock3',
          title: 'Feedback on Article Draft',
          status: 'To Do',
          dueDate: undefined,
          priority: 'low',
          description: 'Submitted yesterday'
        }
      ]
    },
    latestActivity: {
      briefs: [
        {
          id: 'brief1',
          title: 'Product Comparison Guide',
          sentDate: '2 days ago'
        },
        {
          id: 'brief2',
          title: 'SEO Strategy Update',
          sentDate: '5 days ago'
        }
      ],
      plans: [
        {
          id: 'plan1',
          title: 'Q2 Content Calendar',
          approvedDate: 'yesterday'
        },
        {
          id: 'plan2',
          title: 'Link Building Strategy',
          approvedDate: 'last week'
        }
      ],
      feedback: [
        {
          id: 'feedback1',
          title: 'Competitor Analysis',
          status: 'Awaiting feedback'
        },
        {
          id: 'feedback2',
          title: 'Homepage Copy Draft',
          status: 'Awaiting feedback'
        }
      ]
    },
    campaignProgress: {
      progressPercentage: progressPercentage,
      content: {
        briefsDelivered: completedBriefs,
        totalBriefs: briefsForCurrentMonth.length || 1
      },
      links: {
        backlinks: liveBacklinks,
        blogsLive: 0
      }
    }
  };
}

// Helper function to map priority to priority level
function getPriorityLevel(priority: any): 'high' | 'medium' | 'low' {
  if (!priority) return 'medium';

  if (typeof priority === 'string') {
    const normalizedPriority = priority.toLowerCase();
    if (normalizedPriority.includes('high') || normalizedPriority === '1') return 'high';
    if (normalizedPriority.includes('low') || normalizedPriority === '3') return 'low';
    return 'medium';
  }

  if (typeof priority === 'number') {
    if (priority === 1 || priority >= 8) return 'high';
    if (priority === 3 || priority <= 3) return 'low';
    return 'medium';
  }

  return 'medium';
}

// Helper function to format relative dates
function formatRelativeDate(dateInput: any): string {
  if (!dateInput) return 'unknown date';

  let dateString: string;

  if (typeof dateInput === 'string') {
    dateString = dateInput;
  } else if (dateInput instanceof Date) {
    dateString = dateInput.toISOString();
  } else {
    // Try to convert to string
    try {
      dateString = String(dateInput);
    } catch (e) {
      return 'unknown date';
    }
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'invalid date';
  }

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
