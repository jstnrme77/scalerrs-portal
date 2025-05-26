import { NextRequest, NextResponse } from "next/server";
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from "@/lib/server-env";
import { getTableName } from "@/lib/server-utils";

export async function POST(req: NextRequest) {
    const { boardType, data } = await req.json();
    const tableName = getTableName(boardType);

    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;

    try {
        const res = await fetch(airtableUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                records: [
                    {
                        fields: {
                            Name:            data.title,
                            "Assigned To":   data.assignedTo,
                            Priority:        data.priority,
                            Impact:          data.impact,
                            Effort:          data.effort,
                            Notes:           data.notes ?? "",
                            "Reference URL": data.referenceLinks ?? "",
                        },
                    },
                ],
            }),
        });

        if (!res.ok) throw new Error(await res.text());
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
} 