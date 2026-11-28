export interface ButtonOptions {
  id: string;
  variant?: 'gold' | 'cyan' | 'card' | 'ghost';
  title?: string;
  i18nTitleKey?: string;
  extraClasses?: string;
  content: string;
}

export function renderCustomButton(opts: ButtonOptions): string {
  const variantClassMap = {
    gold: 'btn-3d-gold font-black border border-[var(--border-strong)]',
    cyan: 'btn-3d-cyan font-black border border-cyan-400/50',
    card: 'btn-3d-card text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]',
    ghost: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] active:scale-95 transition-all'
  };

  const baseVariantClass = variantClassMap[opts.variant || 'card'];
  const titleAttr = opts.title ? `title="${opts.title}"` : '';
  const i18nAttr = opts.i18nTitleKey ? `data-i18n-title="${opts.i18nTitleKey}"` : '';
  const extra = opts.extraClasses || '';

  return `
    <button id="${opts.id}" ${titleAttr} ${i18nAttr} class="cursor-pointer select-none ${baseVariantClass} ${extra}">
      ${opts.content}
    </button>
  `;
}
