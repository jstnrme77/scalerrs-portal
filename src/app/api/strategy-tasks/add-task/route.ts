import { NextRequest, NextResponse } from 'next/server';
import { createStrategyTask } from '@/lib/airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from "@/lib/server-env";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Given a display name or email that the modal sends, look up the matching
 * Airtable user id via the Meta API. Returns null when not found.
 */
async function lookupUserId(search: string): Promise<string | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return null;

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/users`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        // Tiniest cache-busting to keep function cold-start simple
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error("[strategy-tasks/add] users lookup failed", await res.text());
      return null;
    }

    const data = (await res.json()) as { users?: any[] };
    const users = data.users ?? [];

    const needle = search.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.name && u.name.toLowerCase() === needle) ||
        (u.email && u.email.toLowerCase() === needle)
    );

    return found?.id ?? null;
  } catch (err) {
    console.error("[strategy-tasks/add] users lookup error", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // The client modal now sends a structured `taskData` object
    // which includes a `task` field for the name.
    if (!body || !body.task) {
      return NextResponse.json({ error: 'Missing task name' }, { status: 400 });
    }

    // Prepare data for Airtable, passing select fields directly as received
    const airtableTaskData: any = {
      Name: body.task, // Client sends `task` for name
      Status: body.status || 'To Do', // Default if not provided
    };

    // Pass frontend values (from metadata) directly to Airtable fields
    if (body.priority) airtableTaskData.Priority = body.priority;
    if (body.impact !== undefined)  airtableTaskData.Impact = body.impact;
    if (body.effort)   airtableTaskData.Effort = body.effort;
    if (body.notes) airtableTaskData.Comments = body.notes; // Map notes to Comments
    
    // Assigned To logic (if it were still in use)
    // if (body.assignedTo && body.assignedTo !== 'Unassigned') {
    //   const uid = await lookupUserId(body.assignedTo);
    //   if (uid) {
    //     airtableTaskData['Assigned To'] = [uid]; 
    //   } else {
    //     console.warn(`[strategy-tasks/add] No Airtable user id found for "${body.assignedTo}" – leaving task unassigned.`);
    //   }
    // }

    if (body.clients && Array.isArray(body.clients) && body.clients.length > 0) {
        airtableTaskData.Clients = body.clients;
    }

    console.log('[strategy-tasks/add] Airtable payload (direct values):', airtableTaskData);

    const newRecord = await createStrategyTask(airtableTaskData);

    // Return structured response like other routes
    return NextResponse.json({
      success: true,
      task: {
        id         : newRecord.id,
        task       : newRecord.Name || newRecord.Title || newRecord["Action Item Name"],
        status     : newRecord.Status,
        priority   : newRecord.Priority,
        assignedTo : newRecord.Assignee || newRecord["Assigned To"] || 'Unassigned',
        impact     : newRecord.Impact,
        effort     : newRecord.Effort,
        notes      : newRecord.Comments || newRecord.Notes,
        dateLogged : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments   : [],
        commentCount: 0
      }
    });
  } catch (err: any) {
    console.error('[strategy-tasks/add] Fatal:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
} 