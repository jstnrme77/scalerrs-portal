import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from "@/lib/server-env";
import { getTableName } from "@/lib/server-utils";

// Configure for Netlify/Next dynamic function
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Environment variables must exist
const { AIRTABLE_API_KEY: envAIRTABLE_API_KEY, AIRTABLE_BASE_ID: envAIRTABLE_BASE_ID } = process.env;

if (!envAIRTABLE_API_KEY || !envAIRTABLE_BASE_ID) {
  console.warn('[task-field-options] Missing Airtable credentials; this route will return empty option lists.');
}

// Lazily-initialised Airtable base
let base: Airtable.Base | null = null;
const getBase = () => {
  if (!base && envAIRTABLE_API_KEY && envAIRTABLE_BASE_ID) {
    Airtable.configure({ apiKey: envAIRTABLE_API_KEY });
    base = Airtable.base(envAIRTABLE_BASE_ID);
  }
  return base;
};

export async function GET(req: NextRequest) {
  const boardType = req.nextUrl.searchParams.get("boardType") ?? "";
  const tableName = getTableName(boardType);

  console.log(`API task-field-options: boardType='${boardType}', resolved tableName='${tableName}'`);

  try {
    const metaRes = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } },
    );
    if (!metaRes.ok) throw new Error("Meta-data fetch failed");
    const { tables } = await metaRes.json();

    const table = tables.find((t: any) => t.name === tableName);
    if (!table) return NextResponse.json({}, { status: 404 });

    const pick = (col: string) =>
      (table?.fields.find((f: any) => f.name === col)?.options?.choices ?? []).map((c: any) => c.name);

    // get all users in the base for collaborator dropdowns
    let userNames: string[] = [];
    try {
      console.log("[task-field-options] Attempting to fetch users for Assigned To.");
      const userRes = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/users`, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });
      console.log("[task-field-options] Users API response status:", userRes.status);
      if (userRes.ok) {
        const ujson = await userRes.json();
        console.log("[task-field-options] Users API JSON response:", ujson);
        if (ujson && Array.isArray(ujson.users)) {
          userNames = ujson.users
            .map((user: any) => {
              // Log each user object to see its structure
              // console.log("[task-field-options] Raw user object from Airtable:", user);
              return user.name; // Assuming 'name' is the correct property
            })
            .filter(Boolean);
          console.log("[task-field-options] Parsed user names:", userNames);
        } else {
          console.warn("[task-field-options] ujson.users is not an array or ujson is null/undefined.", ujson);
        }
      } else {
        console.warn("[task-field-options] Failed to fetch users, status:", userRes.status, "statusText:", userRes.statusText);
        const errorText = await userRes.text();
        console.warn("[task-field-options] Users API error response text:", errorText);
      }
    } catch (e) {
      console.warn('[task-field-options] unable to fetch users', e);
    }

    // Build response object with common fields
    const response: any = {
      assignedTo: userNames,
      priority:   pick("Priority"),
      impact:     pick("Impact"),
      effort:     pick("Effort"),
      status:     pick("Status"),
    };

    // Add board-specific fields
    if (tableName === 'CRO') {
      response.type = pick("Type");
    } else if (tableName === 'WQA') {
      response.actionType = pick("Action Type");
      response.whoIsResponsible = pick("Who Is Responsible");
    }

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 