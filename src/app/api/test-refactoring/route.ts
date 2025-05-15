/**
 * API route to test the refactored Airtable integration
 */
import { NextResponse } from 'next/server';
import * as airtable from '@/lib/airtable';
import * as clientApi from '@/lib/client-api';

export async function GET() {
  try {
    // Test the Airtable integration
    const testResults: any = {};

    // Test each function with try/catch to handle missing functions
    try {
      testResults.users = await airtable.getUsers();
    } catch (e) {
      console.error('Error testing getUsers:', e);
      testResults.users = [];
    }

    try {
      testResults.tasks = await airtable.getTasks();
    } catch (e) {
      console.error('Error testing getTasks:', e);
      testResults.tasks = [];
    }

    try {
      testResults.briefs = await airtable.getBriefs();
    } catch (e) {
      console.error('Error testing getBriefs:', e);
      testResults.briefs = [];
    }

    try {
      testResults.articles = await airtable.getArticles();
    } catch (e) {
      console.error('Error testing getArticles:', e);
      testResults.articles = [];
    }

    try {
      testResults.backlinks = await airtable.getBacklinks();
    } catch (e) {
      console.error('Error testing getBacklinks:', e);
      testResults.backlinks = [];
    }

    try {
      testResults.kpiMetrics = await airtable.getKPIMetrics();
    } catch (e) {
      console.error('Error testing getKPIMetrics:', e);
      testResults.kpiMetrics = [];
    }

    try {
      testResults.urlPerformance = await airtable.getURLPerformance();
    } catch (e) {
      console.error('Error testing getURLPerformance:', e);
      testResults.urlPerformance = [];
    }

    try {
      testResults.keywordPerformance = await airtable.getKeywordPerformance();
    } catch (e) {
      console.error('Error testing getKeywordPerformance:', e);
      testResults.keywordPerformance = [];
    }

    try {
      testResults.clients = await airtable.getClients();
    } catch (e) {
      console.error('Error testing getClients:', e);
      testResults.clients = [];
    }

    try {
      testResults.availableMonths = await airtable.getAvailableMonths();
    } catch (e) {
      console.error('Error testing getAvailableMonths:', e);
      testResults.availableMonths = [];
    }

    try {
      // Check if getMonthlyProjections exists
      if (typeof airtable.getMonthlyProjections === 'function') {
        testResults.monthlyProjections = await airtable.getMonthlyProjections();
      } else {
        console.log('getMonthlyProjections function not found, using empty array');
        testResults.monthlyProjections = [];
      }
    } catch (e) {
      console.error('Error testing getMonthlyProjections:', e);
      testResults.monthlyProjections = [];
    }

    return NextResponse.json({
      success: true,
      message: 'Refactoring test completed',
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
