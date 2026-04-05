/** Normalizes common API list envelope shapes to a plain array. */
export function unwrapApiArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o['data'])) return o['data'] as unknown[];
    if (Array.isArray(o['results'])) return o['results'] as unknown[];
    if (Array.isArray(o['providers'])) return o['providers'] as unknown[];
    if (Array.isArray(o['items'])) return o['items'] as unknown[];
  }
  return [];
}

/** Flattens Strapi-style { id, attributes } into one object. */
export function unwrapEntity(raw: unknown): Record<string, unknown> {
  if (raw === null || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const attrs = o['attributes'];
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    return { ...o, ...(attrs as Record<string, unknown>) };
  }
  return { ...o };
}

export function pickString(r: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v);
    }
  }
  return '';
}

export function pickNumber(r: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const v = r[k];
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
