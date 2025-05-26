'use client';
import { useState } from 'react';
import { Modal, Input, Button } from '@/components/ui';

export default function AccessModal({ clientId, record, onDone }:
  { clientId: string; record: any; onDone: () => void }) {

  const [username, setUsername] = useState(record.username ?? '');
  const [password, setPassword] = useState(''); // never shown in table

  const save = async () => {
    const payload = {
      id: record.id,
      name: record.name,
      username,
      ...(password && { password }),
    };

    await fetch(`/api/clients/${clientId}/access-logins`, {
      method: record.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    onDone();
  };

  return (
    <Modal isOpen title={`${record.id ? 'Edit' : 'Add'} ${record.name || 'access'}`} onClose={onDone}>
      <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <Button onClick={save}>Save</Button>
    </Modal>
  );
} 