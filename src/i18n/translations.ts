export type AppLang = 'tr' | 'en';

export const TRANSLATIONS: Record<AppLang, Record<string, string>> = {
  tr: {
    // Ana Menü
    menu_active_games_tag: 'Devam Et',
    menu_active_games_title: 'Aktif Oyunlarım',
    menu_active_games_count: 'Seviye {level} • {count} Aktif Oyun',
    menu_competition: 'REKABET',
    menu_duel_arena: 'Düello Arenası',
    menu_custom_mode_tag: 'SERBEST MOD',
    menu_custom_mode_title: 'Klasik & Disiplinler',
    menu_variants_short: 'Disiplinler',
    menu_map_banner: 'Yolculuk Haritası • 1000 Bölüm',
    menu_leaderboard: 'Sıralama',
    menu_badges: 'Rozetler',
    menu_shop: 'Mağaza',
    menu_daily: 'Günlük',
    menu_guest: 'Misafir',
    menu_install_pwa: 'Uygulamayı Cihazına Yükle (PWA)',
    menu_install_btn: 'YÜKLE',

    // Disiplinler & Kurallar
    var_classic: 'Klasik',
    var_irregular: 'Parçalı',
    var_killer: 'Hesap',
    var_wordoku: 'Harfli',
    var_samurai: 'Samurai',
    var_classic_full: 'Klasik Sudoku',
    var_irregular_full: 'Parçalı Sudoku',
    var_killer_full: 'Hesap Sudoku',
    var_wordoku_full: 'Harfli Sudoku',
    var_samurai_full: 'Samurai Sudoku',
    pts_multiplier: '{mult} Puan',
    rule_classic: 'Her satır, sütun ve 3x3 karede 1-9 rakamları birer kez yer almalıdır.',
    rule_irregular: 'Standart 3x3 kareler yerine kalın çizgilerle ayrılmış düzensiz şekilli bölgelerde 1-9 rakamları birer kez yer almalıdır.',
    rule_killer: 'Kesikli çizgili kafeslerin içindeki rakamların toplamı, köşedeki küçük sayıya eşit olmalıdır.',
    rule_wordoku: 'Rakamlar yerine A\'dan I\'ya kadar olan 9 harfi satır, sütun ve kutularda tekrar etmeyecek şekilde yerleştir.',
    rule_samurai: 'Köşelerinden birbirine bağlı 5 adet Sudoku tablosunu ortak bölgelere dikkat ederek çöz.',

    // Harita & Serbest Mod
    btn_menu: 'Menü',
    biome_emerald: 'ZÜMRÜT VADİ',
    biome_hextech: 'HEXTECH KALESİ',
    biome_crimson: 'KIZIL ZİRVE',
    target_hud: 'GÜNCEL SİHİRDAR HEDEFİ',
    btn_play: 'OYNA',
    btn_start_now: 'Hemen Oyna',
    select_discipline: 'Oyun Disiplini Seç',
    select_time_mode: 'Süre Modu Seç',
    diff_level_label: 'Zorluk Seviyesi',
    time_unlimited: 'Süresiz',
    time_3m: '3 Dk',
    time_7m: '7 Dk',
    time_3m_bonus: '3 Dk (+%50)',
    time_3m_short: '3 Dakika (Blitz)',
    time_7m_short: '7 Dakika (Standart)',
    diff_basit: 'Basit',
    diff_orta: 'Orta',
    diff_zor: 'Zor',
    diff_basit_desc: 'Yeni başlayanlar için rahat ve dinlendirici bir bulmaca.',
    diff_orta_desc: 'Biraz dikkat ve mantık yürütme gerektiren dengeli bir zorluk.',
    diff_zor_desc: 'Sudoku ustaları için derin eleme ve kombinasyon mücadelesi.',
    placement_exam_title: 'Seviye Atlama Sınavı',
    placement_exam_desc: 'Üst bölümlerin kilidini doğrudan aç',
    placement_exam_modal_desc: 'Hedef zorluğunu seç, tek bir sınav bulmacasını çözerek üst seviyeleri doğrudan aç!',
    placement_kriter_basit: 'Kriter: Max 3 hatayla bitir',
    placement_kriter_orta: 'Kriter: Max 3 hata & 7 dk altı süre',
    placement_kriter_zor: 'Kriter: Max 3 hata & 10 dk altı süre',
    btn_skip_exam: 'Sınavı Atla (Seviye 1\'den Başla)',
    exam_success_title: 'Sınav Başarılı!',
    exam_success_sub: 'Hedeflenen Seviye {level} başarıyla açıldı!',

    // Oyun Ekranı & Samurai Radar & Genel Etiketler
    game_errors: 'Hata: {count}/3',
    btn_hint: 'İpucu (10)',
    btn_notes_off: 'Not: Kapalı',
    btn_notes_on: 'Not: Açık',
    btn_erase: 'Sil',
    radar_top_left: 'Sol-Üst',
    radar_top_right: 'Sağ-Üst',
    radar_center: 'Merkez',
    radar_bottom_left: 'Sol-Alt',
    radar_bottom_right: 'Sağ-Alt',
    radar_empty_count: '{count} Boş',
    cell_locked_toast: 'Bu hücre tamamlanmıştır, değiştirilemez.',
    cell_locked_erase_toast: 'Bu hücre tamamlanmıştır, silinemez.',
    notes_active_toast: 'Kalem / Not modu aktif!',
    samurai_board_done_toast: 'Bu tahta tamamlandı! Kalan tahtalara geçebilirsiniz.',
    time_expired_custom_toast: 'Süre Doldu! Serbest Mod oyunu sonlandırıldı.',
    label_time: 'Süre',
    label_errors: 'Hata',
    label_reward: 'Ödül',
    label_ready: 'Hazır',
    label_level: 'Seviye',
    label_gold: 'Altın',
    label_pts: 'Puan',
    label_all: 'Tümü',
    btn_continue: 'Devam Et',
    btn_play_now: 'Oyna',
    label_locked: 'Kilitli',
    label_claimed: 'Alındı ✓',
    label_you: 'Siz',
    label_rival: 'Rakip',

    // Modallar & Dinamik Listeler
    profile_title: 'Oyuncu Profili',
    profile_stat_completed: 'Tamamlanan',
    profile_stat_puzzles: 'Bulmaca',
    profile_stat_duel_card: 'Düello Karnesi',
    profile_badges_showcase: 'Rozet Vitrini',
    btn_view_all_badges: 'Tüm Rozetleri Gör ➔',
    profile_avatar_select: 'Avatar Seç',
    profile_live_alerts: 'Canlı Düello Bildirimleri',
    profile_live_alerts_desc: 'Anlık meydan okuma istekleri al',
    btn_challenge_player: 'Bu Oyuncuya Düello İsteği Gönder',
    arena_modal_title: 'Düello Arenası',
    arena_modal_desc: 'Canlı oyuncularla yarış veya Seviyeli YZ Karakterlere meydan oku!',
    tab_player_lobby: 'Oyuncu Lobisi',
    tab_ai_rivals: 'YZ Rakipler',
    btn_quick_online: 'Rastgele Çevrimiçi Rakip Ara',
    status_available: 'Müsait',
    status_in_game: 'Oyunda',
    status_in_duel: 'Düelloda',
    btn_send_duel: 'Düello Gönder',
    btn_send_invite: 'Davet Gönder',
    btn_in_match: 'Maçta',
    tag_map: 'Harita',
    tag_custom: 'Serbest',
    btn_active: 'Aktif ✓',
    btn_use: 'Kullan',
    shop_modal_title: 'Mağaza & Temalar',
    shop_owned: 'Satın Alındı',
    shop_item: 'Mağaza Ürünü',
    saved_games_modal_title: 'Aktif Oyunlarım',
    achievements_modal_title: 'Başarımlar & Rozetler',
    no_active_games: 'Kayıtlı aktif oyununuz yok.',
    no_active_games_desc: 'Yeni bir oyuna başladığınızda yarım kalan ilerlemeniz otomatik buraya kaydedilir.',
    btn_got_it: 'Anladım ➔',
    rules_scoring_title_arena: 'Düello Arenası Kuralları & Puanlama',
    rules_scoring_title_custom: 'Serbest Mod Kuralları & Puanlama',
    gold_rewards: 'Altın Ödülleri',
    mmr_rank_pts: 'MMR & Rütbe Puanları',
    discipline_mults: 'Disiplin Çarpanları',
    forfeit_rule_title: 'Terk & Ceza Kuralı',
    custom_mode_purpose: 'Serbest Mod Amacı',
    custom_mode_purpose_desc: 'Harita seviyesini ve Düello MMR puanını riske atmadan 5 disiplinde antrenman yapma ve süre rekoru kırma modudur.',
    gold_and_blitz: 'Altın Kazanımı & Blitz Bonusu',
    mastery_and_rp: 'Ustalık & Rütbe Puanı',
    leaderboard_title: 'Sıralama',
    leaderboard_sub: 'Küresel Oyuncu Sıralaması',
    tab_general_rank: 'Genel Sıralama',
    tab_fastest_time: 'En Hızlılar',
    lb_tab_level: 'Seviye',
    lb_tab_gold: 'Altın',
    lb_tab_pvp: 'PvP',
    lb_tab_bot: 'YZ',
    lb_tab_discipline: 'Disiplin',
    inbox_title: 'Düello Gelen Kutusu',
    inbox_empty: 'Gelen davet bulunmuyor.',
    inbox_empty_desc: 'Diğer oyuncular size düello isteği gönderdiğinde burada görünecektir.',
    btn_accept_play: 'Kabul Et & Oyna',
    btn_decline: 'Reddet',
    welcome_title: 'SudokuMap\'e Hoş Geldin!',
    welcome_desc: 'Oyuncu profilini oluştur veya eski kullanıcı adını girerek tüm ilerlemeni anında geri getir.',
    ph_enter_username: 'Kullanıcı adını yaz...',
    btn_save_start: 'Kaydet ve Maceraya Başla ➔',
    duel_exit_title: 'Düellodan Çekiliyor Musunuz?',
    duel_exit_desc: 'Maç henüz bitmedi. Çekilmeniz durumunda kasanızdan ceza olarak 50 Altın düşülecektir.',
    btn_forfeit_confirm: 'Çekil (-50)',
    btn_return_match: 'Maça Dön',
    match_result_win: 'DÜELLO ZAFERİ!',
    match_result_sub: 'Rakibinizi geride bırakarak maçı kazandınız!',
    btn_back_main_menu: 'Ana Menüye Dön ➔'
  },
  en: {
    // Main Menu
    menu_active_games_tag: 'Continue',
    menu_active_games_title: 'Active Games',
    menu_active_games_count: 'Level {level} • {count} Active Games',
    menu_competition: 'COMPETITION',
    menu_duel_arena: 'Duel Arena',
    menu_custom_mode_tag: 'FREE MODE',
    menu_custom_mode_title: 'Classic & Variants',
    menu_variants_short: 'Variants',
    menu_map_banner: 'Journey Map • 1000 Levels',
    menu_leaderboard: 'Leaderboard',
    menu_badges: 'Badges',
    menu_shop: 'Shop',
    menu_daily: 'Daily',
    menu_guest: 'Guest',
    menu_install_pwa: 'Install App to Device (PWA)',
    menu_install_btn: 'INSTALL',

    // Variants & Rules
    var_classic: 'Classic',
    var_irregular: 'Irregular',
    var_killer: 'Killer',
    var_wordoku: 'Wordoku',
    var_samurai: 'Samurai',
    var_classic_full: 'Classic Sudoku',
    var_irregular_full: 'Irregular Sudoku',
    var_killer_full: 'Killer Sudoku',
    var_wordoku_full: 'Wordoku Sudoku',
    var_samurai_full: 'Samurai Sudoku',
    pts_multiplier: '{mult} Pts',
    rule_classic: 'Each row, column, and 3x3 box must contain numbers 1-9 once.',
    rule_irregular: 'Instead of 3x3 boxes, non-standard regions bounded by thick lines must contain numbers 1-9 once.',
    rule_killer: 'The sum of numbers inside dashed cages must equal the small number in the corner.',
    rule_wordoku: 'Place letters A through I in rows, columns, and boxes without duplicates.',
    rule_samurai: 'Solve 5 interconnected 9x9 Sudoku grids sharing 3x3 corner regions.',

    // Map & Custom Mode
    btn_menu: 'Menu',
    biome_emerald: 'EMERALD VALLEY',
    biome_hextech: 'HEXTECH CITADEL',
    biome_crimson: 'CRIMSON PEAK',
    target_hud: 'CURRENT SUMMONER TARGET',
    btn_play: 'PLAY',
    btn_start_now: 'Play Now',
    select_discipline: 'Select Game Discipline',
    select_time_mode: 'Select Time Mode',
    diff_level_label: 'Difficulty Level',
    time_unlimited: 'Unlimited',
    time_3m: '3 Min',
    time_7m: '7 Min',
    time_3m_bonus: '3 Min (+50%)',
    time_3m_short: '3 Minutes (Blitz)',
    time_7m_short: '7 Minutes (Standard)',
    diff_basit: 'Easy',
    diff_orta: 'Medium',
    diff_zor: 'Hard',
    diff_basit_desc: 'A relaxing and cozy puzzle for beginners.',
    diff_orta_desc: 'A balanced challenge requiring focus and logical deduction.',
    diff_zor_desc: 'Deep elimination and combination challenge for Sudoku masters.',
    placement_exam_title: 'Placement Exam',
    placement_exam_desc: 'Directly unlock higher level tiers',
    placement_exam_modal_desc: 'Select your target difficulty and solve a single exam puzzle to skip ahead!',
    placement_kriter_basit: 'Criteria: Max 3 errors',
    placement_kriter_orta: 'Criteria: Max 3 errors & under 7 mins',
    placement_kriter_zor: 'Criteria: Max 3 errors & under 10 mins',
    btn_skip_exam: 'Skip Exam (Start from Level 1)',
    exam_success_title: 'Exam Passed!',
    exam_success_sub: 'Target Level {level} successfully unlocked!',

    // Game View & Samurai Radar & General Labels
    game_errors: 'Errors: {count}/3',
    btn_hint: 'Hint (10)',
    btn_notes_off: 'Notes: Off',
    btn_notes_on: 'Notes: On',
    btn_erase: 'Erase',
    radar_top_left: 'Top-Left',
    radar_top_right: 'Top-Right',
    radar_center: 'Center',
    radar_bottom_left: 'Bottom-Left',
    radar_bottom_right: 'Bottom-Right',
    radar_empty_count: '{count} Left',
    cell_locked_toast: 'This cell is completed and locked.',
    cell_locked_erase_toast: 'This cell is completed and cannot be erased.',
    notes_active_toast: 'Pencil / Notes mode active!',
    samurai_board_done_toast: 'This grid is completed! You can switch to remaining grids.',
    time_expired_custom_toast: 'Time Expired! Free Mode game ended.',
    label_time: 'Time',
    label_errors: 'Errors',
    label_reward: 'Reward',
    label_ready: 'Ready',
    label_level: 'Level',
    label_gold: 'Gold',
    label_pts: 'Pts',
    label_all: 'All',
    btn_continue: 'Resume',
    btn_play_now: 'Play',
    label_locked: 'Locked',
    label_claimed: 'Claimed ✓',
    label_you: 'You',
    label_rival: 'Rival',

    // Modals & Dynamic Lists
    profile_title: 'Player Profile',
    profile_stat_completed: 'Completed',
    profile_stat_puzzles: 'Puzzles',
    profile_stat_duel_card: 'Duel Record',
    profile_badges_showcase: 'Badge Showcase',
    btn_view_all_badges: 'View All Badges ➔',
    profile_avatar_select: 'Choose Avatar',
    profile_live_alerts: 'Live Duel Alerts',
    profile_live_alerts_desc: 'Receive instant duel challenge requests',
    btn_challenge_player: 'Send Duel Request to Player',
    arena_modal_title: 'Duel Arena',
    arena_modal_desc: 'Compete against live players or challenge AI Rivals!',
    tab_player_lobby: 'Player Lobby',
    tab_ai_rivals: 'AI Rivals',
    btn_quick_online: 'Find Random Online Match',
    status_available: 'Available',
    status_in_game: 'In Game',
    status_in_duel: 'In Duel',
    btn_send_duel: 'Send Duel',
    btn_send_invite: 'Invite',
    btn_in_match: 'In Match',
    tag_map: 'Map',
    tag_custom: 'Free',
    btn_active: 'Active ✓',
    btn_use: 'Use',
    shop_modal_title: 'Shop & Themes',
    shop_owned: 'Owned',
    shop_item: 'Shop Item',
    saved_games_modal_title: 'Active Games',
    achievements_modal_title: 'Achievements & Badges',
    no_active_games: 'No active games saved.',
    no_active_games_desc: 'Your unfinished game progress will automatically save here.',
    btn_got_it: 'Got it ➔',
    rules_scoring_title_arena: 'Duel Arena Rules & Scoring',
    rules_scoring_title_custom: 'Free Mode Rules & Scoring',
    gold_rewards: 'Gold Rewards',
    mmr_rank_pts: 'MMR & Rank Points',
    discipline_mults: 'Discipline Multipliers',
    forfeit_rule_title: 'Forfeit Penalty Rule',
    custom_mode_purpose: 'Free Mode Purpose',
    custom_mode_purpose_desc: 'Practice 5 disciplines and break speed records without risking your map level or duel MMR.',
    gold_and_blitz: 'Gold Earnings & Blitz Bonus',
    mastery_and_rp: 'Mastery & Rank Points',
    leaderboard_title: 'Leaderboard',
    leaderboard_sub: 'Global Player Standings',
    tab_general_rank: 'Global Standings',
    tab_fastest_time: 'Fastest Times',
    lb_tab_level: 'Level',
    lb_tab_gold: 'Gold',
    lb_tab_pvp: 'PvP',
    lb_tab_bot: 'AI',
    lb_tab_discipline: 'Discipline',
    inbox_title: 'Duel Inbox',
    inbox_empty: 'No pending challenges.',
    inbox_empty_desc: 'Incoming duel requests from other players will appear here.',
    btn_accept_play: 'Accept & Play',
    btn_decline: 'Decline',
    welcome_title: 'Welcome to SudokuMap!',
    welcome_desc: 'Create your player profile or enter your existing username to restore all progress.',
    ph_enter_username: 'Enter username...',
    btn_save_start: 'Save & Begin Adventure ➔',
    duel_exit_title: 'Surrender Duel?',
    duel_exit_desc: 'Match is in progress. Surrendering will deduct 50 Gold as penalty.',
    btn_forfeit_confirm: 'Surrender (-50)',
    btn_return_match: 'Return to Match',
    match_result_win: 'DUEL VICTORY!',
    match_result_sub: 'You outpaced your rival and won!',
    btn_back_main_menu: 'Back to Main Menu ➔'
  }
};

let currentAppLang: AppLang = 'tr';

export function getLang(): AppLang {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('sudoku_lang') : null;
    if (raw === 'en' || raw === 'tr') {
      currentAppLang = raw;
    }
  } catch {
    // ignore
  }
  return currentAppLang;
}

export function setLang(lang: AppLang): void {
  currentAppLang = lang;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sudoku_lang', lang);
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = lang;
    }
  } catch {
    // ignore
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const currentLang = getLang();
  let str = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.tr?.[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return str;
}

export function translateRankName(title: string = ''): string {
  const cleanTitle = title.replace(/^[^\p{L}]+/u, '').trim();
  const currentLang = getLang();

  if (currentLang === 'en') {
    const rankMap: Record<string, string> = {
      'Çırak': 'Apprentice',
      'Kaşif': 'Explorer',
      'Zihin Ustası': 'Mind Master',
      'Üstat': 'Master',
      'Büyükusta': 'Grandmaster'
    };
    return rankMap[cleanTitle] || cleanTitle;
  }

  return cleanTitle;
}

export function applyStaticTranslations(root: ParentNode = document): void {
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const translated = t(key);
      if (translated) {
        el.textContent = translated;
      }
    }
  });

  const phElements = root.querySelectorAll('[data-i18n-ph]');
  phElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    if (key && el instanceof HTMLInputElement) {
      el.placeholder = t(key);
    }
  });
}
