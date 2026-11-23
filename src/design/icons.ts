import { translateRankName } from '../i18n/translations';

export function renderBrandLogoHTML(): string {
  return `
    <div class="flex flex-col items-center justify-center my-1 text-center select-none pointer-events-none">
      <div class="flex items-center gap-2.5 mb-1">
        <img src="./logo.png" alt="SudokuMap" class="w-12 h-12 rounded-2xl object-cover shadow-md border border-[var(--border-strong)] shrink-0" />
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

export const AVATAR_LIST: { key: string; name: string; nameEn: string; svg: string }[] = [
  // 🎨 8 Renkli İllüstrasyonlu Karakter Avatarı
  {
    key: 'av_squirrel',
    name: 'Şapkalı Sincap',
    nameEn: 'Hat Squirrel',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#7C2D12"/><circle cx="32" cy="36" r="18" fill="#D97706"/><circle cx="32" cy="40" r="10" fill="#FDE68A"/><path d="M22 26L32 12L42 26H22Z" fill="#B45309"/><rect x="18" y="24" width="28" height="4" rx="2" fill="#78350F"/><circle cx="26" cy="34" r="2.5" fill="#1E293B"/><circle cx="38" cy="34" r="2.5" fill="#1E293B"/><ellipse cx="32" cy="38" rx="3" ry="2" fill="#78350F"/></svg>`
  },
  {
    key: 'av_violet',
    name: 'Mor Saçlı Kız',
    nameEn: 'Violet Girl',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#3B0764"/><path d="M16 18C16 10 48 10 48 18V36C48 44 38 48 32 48C26 48 16 44 16 36V18Z" fill="#A855F7"/><circle cx="32" cy="32" r="14" fill="#FDE68A"/><path d="M18 16C22 24 42 24 46 16C40 12 24 12 18 16Z" fill="#7E22CE"/><circle cx="26" cy="32" r="2" fill="#1E293B"/><circle cx="38" cy="32" r="2" fill="#1E293B"/><path d="M29 38C30 40 34 40 35 38" stroke="#E11D48" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_cybercat',
    name: 'Siber Kedi',
    nameEn: 'Cyber Cat',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#0F172A"/><path d="M14 14L24 28H14V14Z" fill="#334155"/><path d="M50 14L40 28H50V14Z" fill="#334155"/><circle cx="32" cy="36" r="18" fill="#1E293B"/><rect x="18" y="28" width="28" height="8" rx="4" fill="#06B6D4"/><circle cx="25" cy="32" r="2" fill="#ECFEFF"/><circle cx="39" cy="32" r="2" fill="#ECFEFF"/><polygon points="32,38 29,42 35,42" fill="#F43F5E"/></svg>`
  },
  {
    key: 'av_samurai_fox',
    name: 'Samuray Tilki',
    nameEn: 'Samurai Fox',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#451A03"/><path d="M12 12L24 32H8L12 12Z" fill="#EA580C"/><path d="M52 12L40 32H56L52 12Z" fill="#EA580C"/><path d="M32 54L14 30H50L32 54Z" fill="#F97316"/><polygon points="32,54 24,34 40,34" fill="#FFFBEB"/><rect x="14" y="24" width="36" height="6" rx="2" fill="#D97706"/><circle cx="32" cy="27" r="2" fill="#FEF08A"/><circle cx="25" cy="36" r="2.5" fill="#1E293B"/><circle cx="39" cy="36" r="2.5" fill="#1E293B"/></svg>`
  },
  {
    key: 'av_astro',
    name: 'Astronot',
    nameEn: 'Astronaut',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#0284C7"/><circle cx="32" cy="32" r="20" fill="#F8FAFC"/><ellipse cx="32" cy="30" rx="14" ry="10" fill="#F59E0B"/><path d="M22 26C24 22 36 22 40 26C36 25 24 25 22 26Z" fill="#FEF08A" opacity="0.8"/><rect x="24" y="48" width="16" height="6" rx="3" fill="#64748B"/></svg>`
  },
  {
    key: 'av_knight',
    name: 'Altın Şövalye',
    nameEn: 'Gold Knight',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#713F12"/><circle cx="32" cy="34" r="18" fill="#F59E0B"/><rect x="20" y="28" width="24" height="12" rx="3" fill="#B45309"/><line x1="32" y1="28" x2="32" y2="40" stroke="#FEF08A" stroke-width="2"/><line x1="22" y1="34" x2="42" y2="34" stroke="#FEF08A" stroke-width="2"/><path d="M32 6C36 12 36 20 32 24C28 20 28 12 32 6Z" fill="#DC2626"/></svg>`
  },
  {
    key: 'av_mage',
    name: 'Yıldız Büyücü',
    nameEn: 'Star Mage',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#1E1B4B"/><path d="M32 6L46 36H18L32 6Z" fill="#312E81"/><path d="M12 34C12 34 32 30 52 34C52 34 32 38 12 34Z" fill="#4338CA"/><circle cx="32" cy="42" r="12" fill="#FDE68A"/><polygon points="32,16 34,21 39,21 35,24 37,29 32,26 27,29 29,24 25,21 30,21" fill="#F59E0B"/><circle cx="28" cy="42" r="2" fill="#1E293B"/><circle cx="36" cy="42" r="2" fill="#1E293B"/></svg>`
  },
  {
    key: 'av_panda',
    name: 'Bilge Panda',
    nameEn: 'Wise Panda',
    svg: `<svg viewBox="0 0 64 64" fill="none" class="w-full h-full"><rect width="64" height="64" rx="16" fill="#0F172A"/><circle cx="16" cy="18" r="7" fill="#1E293B"/><circle cx="48" cy="18" r="7" fill="#1E293B"/><circle cx="32" cy="34" r="20" fill="#F8FAFC"/><ellipse cx="23" cy="32" rx="5" ry="7" fill="#1E293B"/><ellipse cx="41" cy="32" rx="5" ry="7" fill="#1E293B"/><circle cx="23" cy="32" r="2" fill="#FFFFFF"/><circle cx="41" cy="32" r="2" fill="#FFFFFF"/><circle cx="23" cy="32" r="7" stroke="#F59E0B" stroke-width="1.5" fill="none"/><circle cx="41" cy="32" r="7" stroke="#F59E0B" stroke-width="1.5" fill="none"/><line x1="30" y1="32" x2="34" y2="32" stroke="#F59E0B" stroke-width="1.5"/><ellipse cx="32" cy="40" rx="3" ry="2" fill="#1E293B"/></svg>`
  },
  // 🔷 Mevcut Geometrik Avatarlar (Geriye Dönük Uyumluluk)
  {
    key: 'av_prism',
    name: 'Prizm',
    nameEn: 'Prism',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 4L28 11V21L16 28L4 21V11L16 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4V28M4 11L28 21M28 11L4 21" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.5"/></svg>`
  },
  {
    key: 'av_fox',
    name: 'KİTSUNE',
    nameEn: 'Kitsune',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 26L6 14L8 6L16 12L24 6L26 14L16 26Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/><circle cx="20" cy="16" r="1.5" fill="currentColor"/></svg>`
  },
  {
    key: 'av_owl',
    name: 'MİNİ',
    nameEn: 'Mini Owl',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><circle cx="11" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="21" cy="14" r="5" stroke="currentColor" stroke-width="2"/><path d="M16 16L13 21H19L16 16Z" fill="currentColor"/><path d="M6 26C6 22 10 20 16 20C22 20 26 22 26 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_crown',
    name: 'KURALCI',
    nameEn: 'Ruler',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M5 24L7 10L12 15L16 7L20 15L25 10L27 24H5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="19" r="2" fill="currentColor"/></svg>`
  },
  {
    key: 'av_shogun',
    name: 'SHOGUN',
    nameEn: 'Shogun',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M8 8L16 4L24 8V16C24 21 16 26 16 26C16 26 8 21 8 16V8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 13H20M16 9V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_lotus',
    name: 'LOTUS',
    nameEn: 'Lotus',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 6C16 6 10 12 10 18C10 21.3 12.7 24 16 24C19.3 24 22 21.3 22 18C22 12 16 6 16 6Z" stroke="currentColor" stroke-width="2"/><path d="M6 18C6 18 10 16 14 18M26 18C26 18 22 16 18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_wolf',
    name: 'LUPUS',
    nameEn: 'Lupus',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><path d="M16 26L4 12L9 4L16 10L23 4L28 12L16 26Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 16L16 20L20 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
  },
  {
    key: 'av_aether',
    name: 'ESİR',
    nameEn: 'Aether',
    svg: `<svg viewBox="0 0 32 32" fill="none" class="w-full h-full"><circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M16 2V6M16 26V30M2 16H6M26 16H30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  }
];

export function renderAvatarSVG(key: string = 'av_prism', size: number = 32): string {
  const legacyMap: Record<string, string> = {
    '🎮': 'av_prism',
    '🐯': 'av_shogun',
    '🦊': 'av_fox',
    '🐼': 'av_panda',
    '🤖': 'av_aether',
    '👑': 'av_crown',
    '🦁': 'av_wolf',
    '🦉': 'av_owl',
    '🦅': 'av_astro',
    '🧙‍♀️': 'av_mage',
    '🐥': 'av_squirrel'
  };

  const resolvedKey = legacyMap[key] || key;
  const avatarObj = AVATAR_LIST.find(a => a.key === resolvedKey) || AVATAR_LIST[0];

  return `<div class="inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl text-[var(--accent-gold)]" style="width: ${size}px; height: ${size}px;">${avatarObj.svg}</div>`;
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
  shield: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
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
  check: `<svg class="w-3.5 h-3.5 inline-block text-[var(--accent-cyan)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  sun: `<svg class="w-3.5 h-3.5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg class="w-3.5 h-3.5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  volumeOn: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  volumeOff: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
};
