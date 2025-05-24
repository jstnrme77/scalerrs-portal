import { SWRConfig } from 'swr';
import fetcher from '@/lib/fetcher';

export default function App({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval : 60_000,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
} 