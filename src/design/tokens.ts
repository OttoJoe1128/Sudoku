export interface ThemeDefinition {
  id: string;
  name: string;
  nameEn: string;
  bgApp: string;
  bgElevated: string;
  bgCard: string;
  bgCardHover: string;
  borderSubtle: string;
  borderStrong: string;
  accentGold: string;
  accentGoldBright: string;
  accentCyan: string;
  textPrimary: string;
  textSecondary: string;
  textOnGold: string;
  heroBg: string;
  glowColor: string;
}

export const THEMES: Record<string, ThemeDefinition> = {
  'theme-obsidian': {
    id: 'theme-obsidian',
    name: 'Obsidyen & Altın',
    nameEn: 'Obsidian & Gold',
    bgApp: '#070D19',
    bgElevated: '#0E1729',
    bgCard: '#111C31',
    bgCardHover: '#172540',
    borderSubtle: 'rgba(200, 155, 60, 0.22)',
    borderStrong: 'rgba(200, 155, 60, 0.58)',
    accentGold: '#C89B3C',
    accentGoldBright: '#E6C77E',
    accentCyan: '#0AC8B9',
    textPrimary: '#F0E6D2',
    textSecondary: '#94A3B8',
    textOnGold: '#070D19',
    heroBg: 'linear-gradient(135deg, #162238 0%, #0E1729 55%, #09101F 100%)',
    glowColor: 'rgba(200, 155, 60, 0.25)',
  },
  'theme-ivory': {
    id: 'theme-ivory',
    name: 'Fildişi & Mermer',
    nameEn: 'Ivory & Marble',
    bgApp: '#F7F3EA',
    bgElevated: '#FFFFFF',
    bgCard: '#FFFFFF',
    bgCardHover: '#EFE9DC',
    borderSubtle: 'rgba(166, 124, 46, 0.25)',
    borderStrong: 'rgba(166, 124, 46, 0.65)',
    accentGold: '#A67C2E',
    accentGoldBright: '#C49843',
    accentCyan: '#099286',
    textPrimary: '#142038',
    textSecondary: '#52607B',
    textOnGold: '#FFFFFF',
    heroBg: 'linear-gradient(135deg, #FFFFFF 0%, #F1E6D2 100%)',
    glowColor: 'rgba(166, 124, 46, 0.20)',
  },
  'theme-shogun': {
    id: 'theme-shogun',
    name: 'Kızıl Shogun',
    nameEn: 'Crimson Shogun',
    bgApp: '#0F090C',
    bgElevated: '#180D13',
    bgCard: '#1B1015',
    bgCardHover: '#291720',
    borderSubtle: 'rgba(212, 168, 83, 0.28)',
    borderStrong: 'rgba(225, 29, 72, 0.65)',
    accentGold: '#D4A853',
    accentGoldBright: '#F0C978',
    accentCyan: '#E11D48',
    textPrimary: '#FCE7F3',
    textSecondary: '#9E7084',
    textOnGold: '#0F090C',
    heroBg: 'linear-gradient(135deg, #2B131E 0%, #190B12 60%, #11070C 100%)',
    glowColor: 'rgba(225, 29, 72, 0.30)',
  },
  'theme-cyber': {
    id: 'theme-cyber',
    name: 'Siber Akşam',
    nameEn: 'Cyber Dusk',
    bgApp: '#0B0718',
    bgElevated: '#120C24',
    bgCard: '#150F2B',
    bgCardHover: '#211842',
    borderSubtle: 'rgba(34, 211, 238, 0.28)',
    borderStrong: 'rgba(232, 121, 249, 0.60)',
    accentGold: '#22D3EE',
    accentGoldBright: '#67E8F9',
    accentCyan: '#E879F9',
    textPrimary: '#F5D0FE',
    textSecondary: '#8B7AA3',
    textOnGold: '#0B0718',
    heroBg: 'linear-gradient(135deg, #221445 0%, #140D2E 60%, #0D081F 100%)',
    glowColor: 'rgba(34, 211, 238, 0.30)',
  },
  'theme-jade': {
    id: 'theme-jade',
    name: 'Antik Yeşim',
    nameEn: 'Ancient Jade',
    bgApp: '#051613',
    bgElevated: '#08201C',
    bgCard: '#0B241F',
    bgCardHover: '#123831',
    borderSubtle: 'rgba(212, 180, 117, 0.28)',
    borderStrong: 'rgba(16, 185, 129, 0.60)',
    accentGold: '#D4B475',
    accentGoldBright: '#F0D498',
    accentCyan: '#10B981',
    textPrimary: '#ECFDF5',
    textSecondary: '#6B9B8E',
    textOnGold: '#051613',
    heroBg: 'linear-gradient(135deg, #0E332B 0%, #08221D 60%, #051613 100%)',
    glowColor: 'rgba(16, 185, 129, 0.30)',
  }
};
