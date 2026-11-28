export interface CardOptions {
  id?: string;
  variant?: 'elevated' | 'hero' | 'rune';
  extraClasses?: string;
  extraStyles?: string;
  content: string;
}

export function renderCustomCard(opts: CardOptions): string {
  const idAttr = opts.id ? `id="${opts.id}"` : '';
  const styleAttr = opts.extraStyles ? `style="${opts.extraStyles}"` : '';

  const variantClassMap = {
    elevated: 'bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm',
    hero: 'border border-[var(--border-strong)] rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden',
    rune: 'rune-glow-card bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-md'
  };

  const baseClass = variantClassMap[opts.variant || 'elevated'];
  const extra = opts.extraClasses || '';

  return `
    <div ${idAttr} class="${baseClass} ${extra}" ${styleAttr}>
      ${opts.content}
    </div>
  `;
}
