/**
 * API route to test the refactored Airtable integration
 */
import { NextResponse } from 'next/server';
import * as airtable from '@/lib/airtable';
import * as clientApi from '@/lib/client-api';

export async function GET() {
  try {
    // Test the Airtable integration
    const testResults = {
      // Test user-related functions
      users: await airtable.getUsers(),
      
      // Test task-related functions
      tasks: await airtable.getTasks(),
      
      // Test content workflow-related functions
      briefs: await airtable.getBriefs(),
      articles: await airtable.getArticles(),
      backlinks: await airtable.getBacklinks(),
      
      // Test analytics-related functions
      kpiMetrics: await airtable.getKPIMetrics(),
      urlPerformance: await airtable.getURLPerformance(),
      keywordPerformance: await airtable.getKeywordPerformance(),
      
      // Test client-related functions
      clients: await airtable.getClients(),
      availableMonths: await airtable.getAvailableMonths(),
      
      // Test projections-related functions
      monthlyProjections: await airtable.getMonthlyProjections(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Refactoring test successful',
      results: {
        userCount: testResults.users.length,
        taskCount: testResults.tasks.length,
        briefCount: testResults.briefs.length,
        articleCount: testResults.articles.length,
        backlinkCount: testResults.backlinks.length,
        kpiMetricCount: testResults.kpiMetrics.length,
        urlPerformanceCount: testResults.urlPerformance.length,
        keywordPerformanceCount: testResults.keywordPerformance.length,
        clientCount: testResults.clients.length,
        availableMonthCount: testResults.availableMonths.length,
        monthlyProjectionCount: testResults.monthlyProjections.length,
      }
    });
  } catch (error) {
    console.error('Error testing refactoring:', error);
    return NextResponse.json({
      success: false,
      message: 'Refactoring test failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
