import { redirect } from 'next/navigation';

export default function Root() {
  // Server-side redirect to the real landing page
  redirect('/home');
  return null;               // satisfy the TS/JS return value
}