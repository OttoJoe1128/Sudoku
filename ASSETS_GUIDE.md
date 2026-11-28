# 🎨 SudokuMap - Ana Menü Özel PNG Görsel Rehberi (Asset Specifications)

Bu rehber, SudokuMap ana menüsünde yer alan kart ve butonlara özel görsel (PNG) üretip eklemek istediğinizde kullanacağınız dosya isimlerini, piksel çözünürlüklerini ve tasarım önerilerini içerir.

## 📂 Dosya Konumu
Tüm özel PNG görsellerinizi projedeki şu klasöre eklemeniz gerekmektedir:
`public/assets/menu/` (veya sunucuda `/assets/menu/`)

Sistem, yüklediğiniz PNG dosyalarını otomatik olarak algılar ve kartların arka planında 3 katmanlı sinematik cam efektiyle gösterir. Dosya bulunmadığında sistem otomatik vektörel SVG yedeğini (fallback) kullanır.

---

## 📐 PNG Görsel Çözünürlük Çizelgesi

| Kart / Buton Adı | Dosya Yolu (PNG) | Önerilen Piksel Çözünürlüğü | Oran | Tema Estetiği Önerisi |
|---|---|---|---|---|
| **Yolculuğa Devam Et / Başla** | `public/assets/menu/bg_hero.png` | **800 x 320 px** (@2x) | 2.5 : 1 | Büyülü portal, antik parşömen veya yıldızlı uzay atmosferi |
| **Arena Kartı** | `public/assets/menu/bg_arena.png` | **400 x 300 px** (@2x) | 1.33 : 1 | Çapraz kılıçlar, ateş/kıvılcım veya PvP arena illüstrasyonu |
| **+ Yeni Oyun Kartı** | `public/assets/menu/bg_new_game.png` | **400 x 300 px** (@2x) | 1.33 : 1 | Sihirli rün çarkı, parlayan kristal matrisi veya zeka küpü |
| **Klan Zindanı Kartı** | `public/assets/menu/bg_clan.png` | **800 x 240 px** (@2x) | 3.33 : 1 | Şogun boss illüstrasyonu, zindan kapısı veya ejderha stili |
| **Macera Haritası Kartı** | `public/assets/menu/bg_map.png` | **800 x 240 px** (@2x) | 3.33 : 1 | Antik harita topografyası, pusula veya altın yol illüstrasyonu |
| **Açılır Çekmece Menü** | `public/assets/menu/bg_drawer.png` | **500 x 800 px** (@2x) | 1 : 1.6 | Dikey tematik rün desenli/ejderha arka planı |

---

## 🛠️ Teknik Notlar & Format
- **Format:** Şeffaflık (transparency) destekli veya koyu tonlarda `.png` formatı önerilir.
- **Renk Paleti:** Koyu tonlar (lacivert/siyah) ve altın/sarı/turkuaz vurgulu görseller en yüksek estetik sonucu verir.
- **Otomatik Ölçekleme:** Görseller CSS `object-cover` ile kart çerçevesine taşmadan tam oturur.
