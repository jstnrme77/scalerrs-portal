import { NextRequest, NextResponse } from 'next/server';
import Airtable, { FieldSet, Table } from 'airtable';
import { getAirtableClient } from '@/lib/airtable-utils'; // CORRECTED IMPORT (assumption)

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHECKLIST_TABLE_NAME = "Client Portal Checklist";
const CLIENTS_FIELD_NAME = "Clients"; // Field linking to Client records
const ITEM_ID_FIELD_NAME = "ItemID";

interface UpdateRequestBody {
  itemID: string;
  completed: boolean;
}

interface ChecklistAirtableRecord extends FieldSet {
    [CLIENTS_FIELD_NAME]?: string[];
    [ITEM_ID_FIELD_NAME]?: string; // Assuming ItemID might also be a field you want to access
}

export async function POST(request: NextRequest) {
  try {
    // const user = await getUserFromSession(request); // TEMP COMMENTED FOR TESTING
    // if (!user || !user.clientId) {
    //   return NextResponse.json({ error: 'Unauthorized or Client ID not found' }, { status: 401 });
    // }
    // const currentClientRecordId = user.clientId;
    const body = await request.json() as UpdateRequestBody & { clientId?: string }; // TEMP: Expect clientId in body for testing
    const { itemID, completed, clientId: testClientId } = body;

    if (!testClientId) { // TEMP: Check for clientId from body for testing
        return NextResponse.json({ error: 'Test Error: clientId is required in request body for this temporary setup.' }, { status: 400 });
    }
    const currentClientRecordId = testClientId;

    if (!itemID) {
      return NextResponse.json({ error: 'itemID is required' }, { status: 400 });
    }
    if (typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'completed status (boolean) is required' }, { status: 400 });
    }

    const { base, hasCredentials } = getAirtableClient();
    if (!base || !hasCredentials) {
      return NextResponse.json({ error: 'Airtable configuration error or missing credentials' }, { status: 500 });
    }

    const table: Table<ChecklistAirtableRecord> = base(CHECKLIST_TABLE_NAME);
    const records = await table.select({
      filterByFormula: `{${ITEM_ID_FIELD_NAME}} = \'${itemID}\'`,
      fields: [CLIENTS_FIELD_NAME, ITEM_ID_FIELD_NAME]
    }).firstPage();

    if (!records || records.length === 0) {
      return NextResponse.json({ error: `Checklist item with ItemID '${itemID}' not found` }, { status: 404 });
    }
    const airtableRecord = records[0];
    const airtableRecordId = airtableRecord.id;

    let currentClientIds = airtableRecord.get(CLIENTS_FIELD_NAME) || [];
    const clientAlreadyCompleted = currentClientIds.includes(currentClientRecordId);

    let needsUpdate = false;
    if (completed && !clientAlreadyCompleted) {
      currentClientIds.push(currentClientRecordId);
      needsUpdate = true;
    } else if (!completed && clientAlreadyCompleted) {
      currentClientIds = currentClientIds.filter(id => id !== currentClientRecordId);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await table.update([
        {
          id: airtableRecordId,
          fields: {
            [CLIENTS_FIELD_NAME]: currentClientIds,
          } as Partial<ChecklistAirtableRecord>,
        },
      ]);
      console.log(`[API /item/update] Updated item '${itemID}' for client '${currentClientRecordId}' to completed: ${completed}`);
    } else {
      console.log(`[API /item/update] No update needed for item '${itemID}' for client '${currentClientRecordId}'. Requested completed: ${completed}, already in that state.`);
    }

    return NextResponse.json({ success: true, itemID, completed });

  } catch (error) {
    console.error('[API /onboarding-checklist/item/update] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: 'Failed to update checklist item', details: errorMessage }, { status: 500 });
  }
} 