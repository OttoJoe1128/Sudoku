export interface BotCharacter {
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: number;
  difficulty: 'basit' | 'orta' | 'zor';
  speedMs: number;
  desc: string;
}

export const BotCharacters: BotCharacter[] = [
  // 🟢 BASİT DÜELLO BOTS (Seviye 1 - 300)
  { id: 'bot_10', name: 'Minik', title: 'Acemi Bulmacacı', avatar: '🐥', level: 10, difficulty: 'basit', speedMs: 4800, desc: 'Sudokuya yeni başladı, oldukça yavaş ve insaflı çözer.' },
  { id: 'bot_60', name: 'Efe', title: 'Meraklı Çırak', avatar: '🦊', level: 60, difficulty: 'basit', speedMs: 4000, desc: 'Temel kuralları biliyor, sakin bir tempoda ilerler.' },
  { id: 'bot_99', name: 'Zeynep', title: 'Dengeli Çözücü', avatar: '🐼', level: 99, difficulty: 'basit', speedMs: 3400, desc: 'Dikkati yüksek, ritmini koruyarak ilerler.' },
  { id: 'bot_200', name: 'Kaan', title: 'Mantıkçı', avatar: '🐯', level: 200, difficulty: 'basit', speedMs: 2800, desc: 'Hızlı gözlemler yapar, tempolu çözer.' },
  { id: 'bot_300', name: 'Selim Usta', title: 'Basit Seviye Şampiyonu', avatar: '🤖', level: 300, difficulty: 'basit', speedMs: 2200, desc: 'Basit bulmacalarda uzmandır, oldukça seri hareket eder.' },

  // 🟡 ORTA DÜELLO BOTS (Seviye 301 - 700)
  { id: 'bot_310', name: 'Can', title: 'Aday Takipçisi', avatar: '🎯', level: 310, difficulty: 'orta', speedMs: 2600, desc: 'Aday notları tutarak hızlı eler.' },
  { id: 'bot_430', name: 'Elif', title: 'Matris Büyücüsü', avatar: '🧙‍♀️', level: 430, difficulty: 'orta', speedMs: 2100, desc: 'Orta seviye bulmacaları çok akıcı çözer.' },
  { id: 'bot_590', name: 'Mert', title: 'Stratejist', avatar: '🦁', level: 590, difficulty: 'orta', speedMs: 1750, desc: 'Çapraz kontrol yeteneği son derece güçlüdür.' },
  { id: 'bot_650', name: 'Vektör', title: 'Siber Çözücü', avatar: '⚡', level: 650, difficulty: 'orta', speedMs: 1450, desc: 'Refleksleri ışık hızındadır.' },
  { id: 'bot_700', name: 'Leyla', title: 'Orta Seviye Şampiyonu', avatar: '👑', level: 700, difficulty: 'orta', speedMs: 1200, desc: 'Orta seviyenin en güçlü şampiyonu.' },

  // 🔴 ZOR DÜELLO BOTS (Seviye 701 - 1000)
  { id: 'bot_750', name: 'Hakan', title: 'Zorluk Fatihi', avatar: '🦅', level: 750, difficulty: 'zor', speedMs: 1500, desc: 'Zor bulmacalarda keskin gözleme sahiptir.' },
  { id: 'bot_800', name: 'Arya', title: 'Kombinasyon Ustası', avatar: '🐉', level: 800, difficulty: 'zor', speedMs: 1250, desc: 'Derin zincirleme elemeler yapar.' },
  { id: 'bot_870', name: 'Prof. Tarık', title: 'Derin Zekâ', avatar: '🧠', level: 870, difficulty: 'zor', speedMs: 1050, desc: 'Akademik düzeyde Sudoku çözer.' },
  { id: 'bot_940', name: 'Chrono', title: 'Zaman Bükücü', avatar: '⏳', level: 940, difficulty: 'zor', speedMs: 900, desc: 'Saniyeler içinde boşlukları doldurur.' },
  { id: 'bot_1000', name: 'Helios', title: 'Yüce Sudoku Titanı', avatar: '🏛️', level: 1000, difficulty: 'zor', speedMs: 750, desc: 'Yenilmesi imkânsıza yakın efsanevi Titan!' }
];
