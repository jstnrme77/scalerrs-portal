'use client';
import { useEffect, useMemo, useState } from 'react';
import AccessModal from './modals/AccessModal';
import { Button } from '@/components/ui';

const DEFAULT_SERVICES = [
  'Google Analytics',
  'Google Search Console',
  'WordPress Admin',
  'Ahrefs',
  'Phrase',
] as const;

type Record = {
  id: string;
  name: string;
  username?: string;
  lastModified?: string;
};

type Props = { clientId: string };

export default function AccessLoginsTable({ clientId }: Props) {
  const [records, setRecords] = useState<Record[]>([]);
  const [editing, setEditing] = useState<Record | null>(null);

  /* fetch on mount */
  useEffect(() => {
    fetch(`/api/clients/${clientId}/access-logins`)
      .then(r => r.json())
      .then(setRecords);
  }, [clientId]);

  /* build final list incl. N/A fall-backs */
  const rows = useMemo(() => {
    const map = new Map(records.map(r => [r.name, r]));
    return DEFAULT_SERVICES.map(name => map.get(name) ?? { id: '', name });
  }, [records]);

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            <th>Service</th><th>Username</th><th>Last updated</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.username ?? 'N/A'}</td>
              <td>{r.lastModified ? new Date(r.lastModified).toLocaleDateString() : 'N/A'}</td>
              <td>
                <Button size="sm" onClick={() => setEditing(r)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button className="mt-4" onClick={() => setEditing({} as Record)}>Add new access</Button>

      {editing && (
        <AccessModal
          clientId={clientId}
          record={editing}
          onDone={() => {
            setEditing(null);
            // refetch
            fetch(`/api/clients/${clientId}/access-logins`)
              .then(r => r.json())
              .then(setRecords);
          }}
        />
      )}
    </>
  );
} 