'use client';
import { useState } from 'react';
import { Modal, Input, Button } from '@/components/ui';

const sources = ['client', 'scalerrs'] as const;
const categories = [
  'Product materials',
  'Content guidelines & examples',
  'Brand assets',
] as const;

export default function ResourceModal({ clientId, onDone }:
  { clientId: string; onDone: () => void }) {

  const [name, setName] = useState('');
  const [source, setSource] = useState<typeof sources[number]>(sources[0]);
  const [category, setCategory] = useState<typeof categories[number]>(categories[0]);
  const [file, setFile] = useState<File | null>(null);

  const save = async () => {
    if (!file) return;
    const url = await uploadToStorage(file); // ⇦ implement / reuse existing helper

    await fetch(`/api/clients/${clientId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        source,
        category,
        attachments: [{ url, filename: file.name }],
      }),
    });
    onDone();
  };

  return (
    <Modal isOpen title="Upload resource" onClose={onDone}>
      <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
      {/* -------- Source -------- */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Source</label>
        <select
          className="w-full rounded-md border px-3 py-2"
          value={source}
          onChange={e => setSource(e.target.value as (typeof sources)[number])}
        >
          {sources.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* -------- Category -------- */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          className="w-full rounded-md border px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value as (typeof categories)[number])}
        >
          {categories.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <Input label="File" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <Button onClick={save} disabled={!file}>Upload</Button>
    </Modal>
  );
}

/* ----------------------------------------------------------------
 *  Tiny helper until you wire real storage (S3, Supabase, etc.)
 * ---------------------------------------------------------------- */
async function uploadToStorage(file: File): Promise<string> {
  // For dev-only: returns a local object-URL so the table renders
  return URL.createObjectURL(file);
} 