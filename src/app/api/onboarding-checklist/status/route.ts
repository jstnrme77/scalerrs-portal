import { NextRequest, NextResponse } from 'next/server';
import Airtable, { FieldSet, Records, Table } from 'airtable'; // Added FieldSet, Records, Table for typing
// import { getAirtableBase, getUserFromSession } from '@/lib/airtable-server-utils'; // Assuming this util exists for server-side auth
import { getAirtableClient } from '@/lib/airtable-utils'; // CORRECTED IMPORT (assumption)
// TODO: Re-integrate actual getUserFromSession or equivalent

// Configure for Netlify deployment / Next.js App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHECKLIST_TABLE_NAME = "Client Portal Checklist";
const CLIENTS_FIELD_NAME = "Clients"; // Field linking to Client records
const ITEM_ID_FIELD_NAME = "ItemID";
const NAME_FIELD_NAME = "Name";

interface ChecklistAirtableRecord extends FieldSet {
  [ITEM_ID_FIELD_NAME]: string;
  [NAME_FIELD_NAME]: string;
  [CLIENTS_FIELD_NAME]?: string[]; // Array of linked record IDs (client IDs)
}

export async function GET(request: NextRequest) {
  try {
    // const user = await getUserFromSession(request); // Your method to get current user // TEMP COMMENTED FOR TESTING
    // if (!user || !user.clientId) { 
    //   return NextResponse.json({ error: 'Unauthorized or Client ID not found' }, { status: 401 });
    // }
    // const currentClientRecordId = user.clientId; 
    const currentClientRecordId = request.nextUrl.searchParams.get("clientId"); // TEMP: Pass clientId as query param for testing
    if (!currentClientRecordId) {
        return NextResponse.json({ error: 'Test Error: clientId query parameter is required for this temporary setup.' }, { status: 400 });
    }

    const { base, hasCredentials } = getAirtableClient();
    if (!base || !hasCredentials) {
      return NextResponse.json({ error: 'Airtable configuration error or missing credentials' }, { status: 500 });
    }

    const table: Table<ChecklistAirtableRecord> = base(CHECKLIST_TABLE_NAME);
    const allChecklistItems: Records<ChecklistAirtableRecord> = await table.select({
      fields: [ITEM_ID_FIELD_NAME, NAME_FIELD_NAME, CLIENTS_FIELD_NAME],
    }).all();

    const checklistStatus = allChecklistItems.map(record => {
      const completedByClientIds = record.get(CLIENTS_FIELD_NAME) || [];
      return {
        ItemID: record.get(ITEM_ID_FIELD_NAME),
        Name: record.get(NAME_FIELD_NAME),
        isCompletedByCurrentUser: completedByClientIds.includes(currentClientRecordId),
      };
    });

    return NextResponse.json(checklistStatus);

  } catch (error) {
    console.error('[API /onboarding-checklist/status] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: 'Failed to fetch checklist status', details: errorMessage }, { status: 500 });
  }
} 