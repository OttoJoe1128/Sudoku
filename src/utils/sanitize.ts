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
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/[<>"'`/]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ');
  return cleaned.slice(0, 20);
}
