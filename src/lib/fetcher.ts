export default async function fetcher<T = any>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error(`Request failed with ${res.status}`);
  }
  return res.json();
} 