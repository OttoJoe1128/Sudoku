import { translateRankName } from '../i18n/translations';

export function renderBrandLogoHTML(): string {
  return `
    <div class="flex flex-col items-center justify-center my-2 text-center select-none pointer-events-none">
      <div class="flex items-center gap-2.5 mb-1">
        <div class="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-strong)] p-1.5 shadow-xl flex items-center justify-center text-[var(--accent-gold)]">
          <svg viewBox="0 0 36 36" fill="none" class="w-full h-full">
            <rect x="4" y="4" width="28" height="28" rx="6" stroke="currentColor" stroke-width="2" stroke-opacity="0.8"/>
            <path d="M4 15H32M4 21H32M15 4V32M21 4V32" stroke="currentColor" stroke-width="1" stroke-opacity="0.3"/>
            <path d="M18 6L30 18L18 30L6 18L18 6Z" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.1"/>
            <circle cx="18" cy="18" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div class="flex flex-col text-left">
          <h1 class="text-lg font-black tracking-[0.22em] leading-none">
            <span class="text-[var(--text-primary)]">SUDOKU</span><span class="text-[var(--accent-gold)]">MAP</span>
          </h1>
          <span class="text-[8px] font-bold text-[var(--text-secondary)] tracking-[0.18em] uppercase mt-0.5 opacity-80">SMART PUZZLE ARENA</span>
        </div>
      </div>
      <div class="h-[1px] w-32 bg-gradient-to-r from-transparent via-[var(--accent-gold)]/60 to-transparent"></div>
    </div>
  `;
}

export const AVATAR_LIST: { key: string; name: string; svg: string }[] = [
  {
    key: 'av_prism',
    name: 'Prizm',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 4L28 11V21L16 28L4 21V11L16 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V28M4 11L28 21M28 11L4 21" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.5"/></svg>`
  },
  {
    key: 'av_fox',
    name: 'KİTSUNE',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 26L6 14L8 6L16 12L24 6L26 14L16 26Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/><circle cx="20" cy="16" r="1.5" fill="currentColor"/></svg>`
  },
  {
    key: 'av_owl',
    name: 'MİNİ',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><circle cx="11" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="21" cy="14" r="5" stroke="currentColor" stroke-width="2"/><path d="M16 16L13 21H19L16 16Z" fill="currentColor"/><path d="M6 26C6 22 10 20 16 20C22 20 26 22 26 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_crown',
    name: 'KURALCI',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M5 24L7 10L12 15L16 7L20 15L25 10L27 24H5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="19" r="2" fill="currentColor"/></svg>`
  },
  {
    key: 'av_shogun',
    name: 'SHOGUN',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M8 8L16 4L24 8V16C24 21 16 26 16 26C16 26 8 21 8 16V8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 13H20M16 9V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_lotus',
    name: 'LOTUS',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 6C16 6 10 12 10 18C10 21.3 12.7 24 16 24C19.3 24 22 21.3 22 18C22 12 16 6 16 6Z" stroke="currentColor" stroke-width="2"/><path d="M6 18C6 18 10 16 14 18M26 18C26 18 22 16 18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_wolf',
    name: 'LUPUS',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 26L4 12L9 4L16 10L23 4L28 12L16 26Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 16L16 20L20 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_aether',
    name: 'ESİR',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M16 2V6M16 26V30M2 16H6M26 16H30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  }
];

export function renderAvatarSVG(key: string = 'av_prism', size: number = 32): string {
  const legacyMap: Record<string, string> = {
    '🎮': 'av_prism',
    '🐯': 'av_shogun',
    '🦊': 'av_fox',
    '🐼': 'av_owl',
    '🤖': 'av_aether',
    '👑': 'av_crown',
    '🦁': 'av_wolf',
    '🦉': 'av_owl',
    '🦅': 'av_wolf',
    '🧙‍♀️': 'av_lotus',
    '🐥': 'av_fox'
  };

  const resolvedKey = legacyMap[key] || key;
  const avatarObj = AVATAR_LIST.find(a => a.key === resolvedKey) || AVATAR_LIST[0];

  return `<div class="inline-flex items-center justify-center shrink-0 text-[var(--accent-gold)]" style="width: ${size}px; height: ${size}px;">${avatarObj.svg}</div>`;
}

export function renderRankBadgeSVG(title: string = '🥉 Çırak'): string {
  let badgeIcon = `<svg class="w-3.5 h-3.5 inline-block mr-1 text-[var(--accent-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

  if (title.includes('Büyükusta')) {
    badgeIcon = `<svg class="w-3.5 h-3.5 inline-block mr-1 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
  } else if (title.includes('Üstat')) {
    badgeIcon = `<svg class="w-3.5 h-3.5 inline-block mr-1 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 22 22 7 12 2"/></svg>`;
  } else if (title.includes('Zihin Ustası')) {
    badgeIcon = `<svg class="w-3.5 h-3.5 inline-block mr-1 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
  } else if (title.includes('Kaşif')) {
    badgeIcon = `<svg class="w-3.5 h-3.5 inline-block mr-1 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>`;
  }

  const translatedTitle = translateRankName(title);

  return `<span class="inline-flex items-center font-black text-xs">${badgeIcon}<span>${translatedTitle}</span></span>`;
}

export const Icons = {
  sword: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`,
  fire: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  coin: `<svg class="w-4 h-4 inline-block text-[var(--accent-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 6v12M15 9.5a2.5 2.5 0 0 0-5 0c0 1.5 2 2.5 2.5 3s0 2.5-2.5 2.5"/></svg>`,
  lock: `<svg class="w-3.5 h-3.5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  crown: `<svg class="w-4 h-4 inline-block text-[var(--accent-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20L19 9l-5 5-2-7-2 7-5-5L2 20z"/></svg>`,
  bot: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h0M16 16h0"/></svg>`,
  bell: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  hint: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/></svg>`,
  pen: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
  trash: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  map: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  trophy: `<svg class="w-4 h-4 inline-block text-[var(--accent-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H7M14 14.66V17c0 .55.45 1 1 1h2M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
  user: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  zap: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  timer: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  infinity: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-2.3 0-3.961-1.58-5.178-3-1.217 1.42-2.878 3-5.178 3-5.096 0-5.096-8 0-8 2.3 0 3.961 1.58 5.178 3 1.217-1.42 2.878-3 5.178-3z"/></svg>`,
  info: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  inbox: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  dice: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></svg>`,
  target: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  check: `<svg class="w-3.5 h-3.5 inline-block text-[var(--accent-cyan)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
};
