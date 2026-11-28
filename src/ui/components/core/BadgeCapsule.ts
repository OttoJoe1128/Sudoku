export interface CapsuleOptions {
  id: string;
  icon: string;
  valueId: string;
  initialValue: string | number;
  textColorClass?: string;
  borderColorClass?: string;
  title?: string;
  i18nTitleKey?: string;
  extraClasses?: string;
  isButton?: boolean;
}

export function renderBadgeCapsule(opts: CapsuleOptions): string {
  const titleAttr = opts.title ? `title="${opts.title}"` : '';
  const i18nAttr = opts.i18nTitleKey ? `data-i18n-title="${opts.i18nTitleKey}"` : '';
  const textClass = opts.textColorClass || 'text-[var(--accent-gold)]';
  const borderClass = opts.borderColorClass || 'border-[var(--border-strong)]';
  const extra = opts.extraClasses || '';

  const innerHTML = `
    <span>${opts.icon}</span>
    <span id="${opts.valueId}" class="font-mono font-black text-xs">${opts.initialValue}</span>
  `;

  const tag = opts.isButton ? 'button' : 'div';
  const tagType = opts.isButton ? 'type="button"' : '';

  return `
    <${tag} id="${opts.id}" ${tagType} ${titleAttr} ${i18nAttr} class="bg-[var(--bg-elevated)] ${textClass} font-mono font-black px-1.5 sm:px-2 py-1 rounded-xl text-xs border ${borderClass} shadow-sm flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform ${extra}">
      ${innerHTML}
    </${tag}>
  `;
}
