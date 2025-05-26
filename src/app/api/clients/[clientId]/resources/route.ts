import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

const TABLE = 'client resources';

export async function GET(_: Request, { params }: { params: { clientId: string } }) {
  const rs = await base(TABLE)
    .select({ filterByFormula: `{Client Record ID} = '${params.clientId}'` })
    .all();

  return NextResponse.json(
    rs.map(r => ({
      id: r.id,
      name: r.get('Name') as string,
      url: (r.get('Attachments') as Airtable.Attachment[])?.[0]?.url,
      category: r.get('Category') as string,
      source: r.get('Source') as string,
    }))
  );
}

export async function POST(req: Request, context: { params: { clientId: string } }) {
  const body = await req.json(); // first async op
  const clientId = context.params.clientId; // safe to access after await

  /* --------------------------------------------------------------
   * Determine if we have a data-URL that must be uploaded via
   * Airtable's /uploadAttachment endpoint or an ordinary HTTPS URL
   * that can be stored directly in the Attachments field.
   * -------------------------------------------------------------- */
  let attachmentsField: Airtable.Attachment[] | undefined = undefined;
  let needsUpload = false;
  let uploadPayload: { filename: string; contentType: string; fileBase64: string } | null = null;

  const firstAtt = body.attachments?.[0];
  if (firstAtt && typeof firstAtt.url === 'string') {
    const url: string = firstAtt.url;

    if (url.startsWith('data:')) {
      // data-URL from the browser – extract contentType & base64 part
      const [meta, fileBase64] = url.split(',');
      const contentType = meta.split(':')[1].split(';')[0]; // e.g. image/png

      // fall back to a generic name when none provided
      const filename = firstAtt.filename ?? body.filename ?? `upload.${contentType.split('/')[1] || 'bin'}`;

      needsUpload = true;
      uploadPayload = { filename, contentType, fileBase64 };
    } else {
      // Already a public HTTPS URL → can be stored as-is
      attachmentsField = body.attachments as Airtable.Attachment[];
    }
  }

  /* --------------------------------------------------------------
   * 1) Create the record (without Attachments when we still need to
   *    upload the file via the content API).
   * -------------------------------------------------------------- */
  const sourceSelect = (typeof body.source === 'string' && body.source.toLowerCase() === 'client') ? 'Client' : 'Scalerrs';

  const rec = await base(TABLE).create({
    Name: body.name,
    Source: sourceSelect,
    Category: body.category,
    ...(attachmentsField ? { Attachments: attachmentsField } : {}),
    // "Clients" is the linked-record column pointing at the Clients table
    Clients: [clientId],
  });

  /* --------------------------------------------------------------
   * 2) If we deferred attachment upload, call the new content API
   * -------------------------------------------------------------- */
  if (needsUpload && uploadPayload) {
    const endpoint = `https://content.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${rec.id}/Attachments/uploadAttachment`;

    const uploadRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_PAT ?? process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: uploadPayload.contentType,
        file: uploadPayload.fileBase64,
        filename: uploadPayload.filename,
      }),
    });

    if (!uploadRes.ok) {
      console.error('[Airtable uploadAttachment] Failed', await uploadRes.text());
      return NextResponse.json({ error: 'Attachment upload failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ id: rec.id });
} 