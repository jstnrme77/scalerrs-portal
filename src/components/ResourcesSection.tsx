'use client';
import { useEffect, useState } from 'react';
import { Accordion,
         AccordionItem,
         AccordionTrigger,
         AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui';
import ResourceModal from './modals/ResourceModal';

type Record = {
  id: string;
  name: string;
  url: string;
  category: string;
  source: 'client' | 'scalerrs';
};

const CATEGORIES = [
  'Product materials',
  'Content guidelines & examples',
  'Brand assets',
];

export default function ResourcesSection({ clientId }: { clientId: string }) {
  const [recs, setRecs] = useState<Record[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/resources`)
      .then(r => r.json())
      .then(setRecs);
  }, [clientId]);

  return (
    <>
      <Accordion type="multiple" className="w-full">
        {CATEGORIES.map(cat => (
          <AccordionItem value={cat} key={cat}>
            <AccordionTrigger>{cat}</AccordionTrigger>
            <AccordionContent>
              <ul>
                {recs.filter(r => r.category === cat).map(r => (
                  <li key={r.id}>
                    <a href={r.url} target="_blank" rel="noopener">{r.name}</a>
                    <small className="ml-2 text-muted">({r.source})</small>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button className="mt-4" onClick={() => setAdding(true)}>Upload a resource</Button>
      {adding && (
        <ResourceModal
          clientId={clientId}
          onDone={() => {
            setAdding(false);
            fetch(`/api/clients/${clientId}/resources`)
              .then(r => r.json())
              .then(setRecs);
          }}
        />
      )}
    </>
  );
} 