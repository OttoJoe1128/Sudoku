export function escapeHTML(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUsername(raw: string): string {
  if (typeof raw !== 'string') return '';
  // Yalnızca harfler (Türkçe dahil: a-z, A-Z, çÇğĞıİöÖşŞüÜ), rakamlar (0-9) ve alt çizgi (_) kabul et, maks 12 karakter
  let cleaned = raw.replace(/[^a-zA-Z0-9_çÇğĞıİöÖşŞüÜ]/g, '');
  return cleaned.slice(0, 12);
}

export function formatDisplayName(rawUsername?: string | null, uid?: string | null): string {
  if (!rawUsername || typeof rawUsername !== 'string') {
    const suffix = uid && uid.length >= 4 ? uid.slice(-4) : 'xxxx';
    return `Oyuncu_${suffix}`;
  }
  const trimmed = rawUsername.trim();
  if (trimmed.length === 0) {
    const suffix = uid && uid.length >= 4 ? uid.slice(-4) : 'xxxx';
    return `Oyuncu_${suffix}`;
  }
  // Ham Firebase UID tespiti (20+ alfanümerik/tire/alt çizgi karakter)
  if (trimmed.length >= 20 && /^[A-Za-z0-9_-]+$/.test(trimmed)) {
    const suffix = trimmed.slice(-4);
    return `Oyuncu_${suffix}`;
  }
  return trimmed;
}
