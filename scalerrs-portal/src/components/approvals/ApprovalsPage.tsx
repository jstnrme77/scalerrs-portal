import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import fetcher from '@/lib/fetcher';

/* ------------------------------------------------------------------
   Keep clientId in state –  null on SSR, populated on first run
-------------------------------------------------------------------*/
const [clientId, setClientId] = useState<string | null>(null);

useEffect(() => {
  /* if the key is missing or accidentally set to "all", treat as null */
  const stored = localStorage.getItem('clientRecordID');
  setClientId(stored && stored !== 'all' ? stored : null);
}, []);

useEffect(() => {
  if (!clientId) return;          // skips when clientId == null or "all"
  /* fire-and-forget; the LRU cache on the server will make these cheap */
  ['keywords', 'briefs', 'articles'].forEach(t => {
    const key = `/api/approvals?type=${t}&page=1&pageSize=${pageSize}&clientId=${clientId}`;
    mutate(key, fetcher(key));          // prime SWR + browser cache
  });
}, [clientId]);

/* Compose the URL only when we actually have a client id  */
const url =
  clientId !== null
    ? `/api/approvals?type=${activeTab}&page=${page}&pageSize=${pageSize}&clientId=${clientId}`
    : null;

/* SWR only runs when url !== null  */
const { data } = useSWR(url, fetcher, {
  revalidateOnFocus   : false,  // no "tab switch" refetch
  dedupingInterval    : 60_000, // if we *do* call again, wait 60 s
  keepPreviousData    : true,   // keep the old list while switching pages
});

const swrKey = clientId
  ? `/api/approvals?type=${activeTab}&page=${page}&pageSize=${pageSize}&clientId=${clientId}`
  : null;
const { data: swrData, error: swrError } = useSWR(swrKey, fetcher); 