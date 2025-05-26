import { NextRequest, NextResponse } from 'next/server';
import { getStrategyTasks, updateCROTaskStatus } from '@/lib/airtable';

// Configure for Netlify / Vercel edge runtime behaviour
export const dynamic   = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/strategy-tasks
 * Returns tasks stored in the "Strategy Tasks" Airtable table.
 * – honours the caller's user id / role headers to filter appropriately.
 * – supports client-level filtering via the x-user-client header OR the explicit ?clientId= param.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[strategy-tasks] Fetching Strategy / Ad-hoc tasks');

    /*───────────────────────────────────────────────────────────*/
    /* 1.  Extract auth / filter hints from headers             */
    /*───────────────────────────────────────────────────────────*/
    const userId     = request.headers.get('x-user-id');
    const userRole   = request.headers.get('x-user-role');
    const headerClientIds = request.headers.get('x-user-client');

    /* Also honour an explicit query param (e.g. ?clientId=abc) */
    const { searchParams } = new URL(request.url);
    const qpClientId = searchParams.get('clientId');

    let clientIds: string[] | null = null;
    try {
      if (qpClientId && qpClientId !== 'all') {
        clientIds = [qpClientId];
      } else if (headerClientIds) {
        // header is expected to be a JSON array → parse
        clientIds = JSON.parse(headerClientIds);
      }
    } catch (err) {
      console.warn('[strategy-tasks] Could not parse client id(s):', err);
    }

    console.log('[strategy-tasks] user:', { userId, userRole, clientIds });

    /*───────────────────────────────────────────────────────────*/
    /* 2.  Fetch records from Airtable                           */
    /*───────────────────────────────────────────────────────────*/
    const tasks = await getStrategyTasks(userId, userRole, clientIds);

    console.log(`[strategy-tasks] Found ${tasks.length} row(s)`);

    return NextResponse.json({ tasks });
  } catch (err: any) {
    console.error('[strategy-tasks] Fatal error:', err);
    return NextResponse.json(
      { tasks: [], isMockData: true, error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 