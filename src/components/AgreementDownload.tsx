'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

type Props = { clientId: string };

export default function AgreementDownload({ clientId }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/agreement`)
      .then(r => r.json())
      .then(d => setUrl(d.url));
  }, [clientId]);

  if (!url) {
    return (
      <div className="flex h-10 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Button asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Download signed contract
      </a>
    </Button>
  );
} 