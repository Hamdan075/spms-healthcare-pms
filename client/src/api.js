import { useEffect, useState } from 'react';
const req = async (method, url, body) => {
  const r = await fetch('/api' + url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || r.statusText);
  return d;
};
export const api = { get: (u) => req('GET', u), post: (u, b) => req('POST', u, b), put: (u, b) => req('PUT', u, b), del: (u) => req('DELETE', u) };
export const money = (n) => 'PKR ' + Math.round(n || 0).toLocaleString('en-US');
export const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-');
export const fix = (n) => (n == null ? '-' : Number(n).toFixed(2));
export function useData(path, dep = 0) {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get(path).then(setData).catch((e) => setError(e.message)); }, [path, dep]);
  return [data, error];
}
