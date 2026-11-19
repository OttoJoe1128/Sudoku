export interface BotCharacter {
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: number;
  difficulty: 'basit' | 'orta' | 'zor';
  speedMs: number;
  desc: string;
  descEn: string;
}

export const BotCharacters: BotCharacter[] = [
  // 🟢 BASİT DÜELLO BOTS (Seviye 1 - 300)
  { id: 'bot_10', name: 'Minik', title: 'Acemi Bulmacacı', avatar: 'av_fox', level: 10, difficulty: 'basit', speedMs: 4800, desc: 'Sudokuya yeni başladı, oldukça yavaş ve insaflı çözer.', descEn: 'Just started Sudoku, plays slowly and calmly.' },
  { id: 'bot_60', name: 'Efe', title: 'Meraklı Çırak', avatar: 'av_owl', level: 60, difficulty: 'basit', speedMs: 4000, desc: 'Temel kuralları biliyor, sakin bir tempoda ilerler.', descEn: 'Knows the basics, keeps a steady pace.' },
  { id: 'bot_99', name: 'Zeynep', title: 'Dengeli Çözücü', avatar: 'av_lotus', level: 99, difficulty: 'basit', speedMs: 3400, desc: 'Dikkati yüksek, ritmini koruyarak ilerler.', descEn: 'Sharp focus, solves with a consistent rhythm.' },
  { id: 'bot_200', name: 'Kaan', title: 'Mantıkçı', avatar: 'av_shogun', level: 200, difficulty: 'basit', speedMs: 2800, desc: 'Hızlı gözlemler yapar, tempolu çözer.', descEn: 'Makes swift observations, solves briskly.' },
  { id: 'bot_300', name: 'Selim Usta', title: 'Basit Seviye Şampiyonu', avatar: 'av_aether', level: 300, difficulty: 'basit', speedMs: 2200, desc: 'Basit bulmacalarda uzmandır, oldukça seri hareket eder.', descEn: 'Expert at easy puzzles, moves very fast.' },

  // 🟡 ORTA DÜELLO BOTS (Seviye 301 - 700)
  { id: 'bot_310', name: 'Can', title: 'Aday Takipçisi', avatar: 'av_prism', level: 310, difficulty: 'orta', speedMs: 2600, desc: 'Aday notları tutarak hızlı eler.', descEn: 'Tracks candidates, eliminates numbers rapidly.' },
  { id: 'bot_430', name: 'Elif', title: 'Matris Büyücüsü', avatar: 'av_lotus', level: 430, difficulty: 'orta', speedMs: 2100, desc: 'Orta seviye bulmacaları çok akıcı çözer.', descEn: 'Solves medium puzzles with effortless flow.' },
  { id: 'bot_590', name: 'Mert', title: 'Stratejist', avatar: 'av_wolf', level: 590, difficulty: 'orta', speedMs: 1750, desc: 'Çapraz kontrol yeteneği son derece güçlüdür.', descEn: 'Master of cross-checking rows and columns.' },
  { id: 'bot_650', name: 'Vektör', title: 'Siber Çözücü', avatar: 'av_aether', level: 650, difficulty: 'orta', speedMs: 1450, desc: 'Refleksleri ışık hızındadır.', descEn: 'Lightning-fast reflexes and pattern recognition.' },
  { id: 'bot_700', name: 'Leyla', title: 'Orta Seviye Şampiyonu', avatar: 'av_crown', level: 700, difficulty: 'orta', speedMs: 1200, desc: 'Orta seviyenin en güçlü şampiyonu.', descEn: 'Undefeated champion of medium difficulty.' },

  // 🔴 ZOR DÜELLO BOTS (Seviye 701 - 1000)
  { id: 'bot_750', name: 'Hakan', title: 'Zorluk Fatihi', avatar: 'av_wolf', level: 750, difficulty: 'zor', speedMs: 1500, desc: 'Zor bulmacalarda keskin gözleme sahiptir.', descEn: 'Sharp eye for complex grid configurations.' },
  { id: 'bot_800', name: 'Arya', title: 'Kombinasyon Ustası', avatar: 'av_shogun', level: 800, difficulty: 'zor', speedMs: 1250, desc: 'Derin zincirleme elemeler yapar.', descEn: 'Performs deep chained logical eliminations.' },
  { id: 'bot_870', name: 'Prof. Tarık', title: 'Derin Zekâ', avatar: 'av_owl', level: 870, difficulty: 'zor', speedMs: 1050, desc: 'Akademik düzeyde Sudoku çözer.', descEn: 'Solves Sudoku at an academic expert level.' },
  { id: 'bot_940', name: 'Chrono', title: 'Zaman Bükücü', avatar: 'av_aether', level: 940, difficulty: 'zor', speedMs: 900, desc: 'Saniyeler içinde boşlukları doldurur.', descEn: 'Fills grid cells in a matter of seconds.' },
  { id: 'bot_1000', name: 'Helios', title: 'Yüce Sudoku Titanı', avatar: 'av_crown', level: 1000, difficulty: 'zor', speedMs: 750, desc: 'Yenilmesi imkânsıza yakın efsanevi Titan!', descEn: 'Legendary Titan, nearly impossible to beat!' }
];
