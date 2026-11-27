# 🗺️ SUDOKUMAP HİBRİT MİMARİ VE KÜRESEL DÖNÜŞÜM İŞ PLANI (ROADMAP)

Bu belge, SudokuMap projesini geleneksel bir bulmaca oyunundan küresel çapta lider bir "Bulmaca-Roguelike & Hibrit Mimari" başyapıtına dönüştürmek için hazırlanan aşamalı yol haritasıdır. Her adım tamamlandığında test edilip doğrulanarak işaretlenir.

---

## 📌 FAZ 1: İLERİ SEVİYE MANTIK MOTORU, ADIM ADIM ETKİLEŞİMLİ ÇÖZÜCÜ VE VERİ DÜZENİ (DOD)

- [x] **Adım 1.1 — Bitmask Tabanlı Veri Odaklı Aday Hesaplayıcı (DOD Bitmask Candidate Engine):**
  - `number[]` array ve `Set<number>` yerine 9 bitlik integer bitmask (`1 << (digit - 1)`) yapısına geçilmesi.
  - Bitwise AND/OR/NOT işlemleriyle satır, sütun ve bölge adaylarının tek işlemde (O(1)) hesaplanması.
  - Sıfır nesne tahsisi (zero allocation) ve sıfır GC duraklaması ile mikrosaniye düzeyinde kural denetimi.
  - `SudokuBitmaskBoard` ve `getCandidatesBitmask` motoru `hintSolver` ve `boardMechanics` içine entegre edildi.
  - `src/tests/bitmask-engine.test.ts` (6 yeni unit test) eklendi; 10.000 sorgulama 4ms'de tamamlandı. Tüm 277 test %100 yeşil.
- [ ] **Adım 1.2 — İleri Seviye Mantık Algoritmalarının Eklenmesi:**
  - **Naked / Hidden Pairs & Triples** (Çift ve Üçlü Aday Eleme).
  - **X-Wing** (2 satır/2 sütun kafes elemesi).
  - **Swordfish** (3x3 ızgara eleme zinciri).
  - **XY-Wing & Renkli Kesişimler** (Bivalue cell zincirleri).
- [ ] **Adım 1.3 — İnteraktif Adım Adım Açıklamalı Çözücü (Interactive Step-by-Step Solver UI):**
  - Tahtadaki kilit noktalarda eleme mantığını görselleştiren, etkilenen satır/sütunları ve adayları animasyonla gösteren görsel çözücü katmanı.
- [ ] **Adım 1.4 — Sudoku Akademisi Genişletmesi (İleri Düzey Master Müfredat):**
  - Mevcut 20 temel dersin üzerine X-Wing, Swordfish ve XY-Wing için animasyonlu interaktif laboratuvar derslerinin eklenmesi.
- [ ] **Adım 1.5 — Faz 1 Doğrulama & Kontrol Noktası:**
  - İleri seviye çözücü unit testlerinin yazılması, 271+ testin yeşil kalması ve `release:check` onayı.

---

## 📌 FAZ 2: ROGUELIKE OYUN DÖNGÜSÜ, KALINTILAR (RELICS) VE ANLAMSAL TERMİNOLOJİ

- [ ] **Adım 2.1 — Pasif Kalıntı (Relic) Veri Mimarisi ve Envanter Sistemi:**
  - "Altın Pusula", "Ayna Kafes", "Rün Taşı" vb. kalıntıların tanımlanması.
  - Bölüm öncesi kalıntı donatma (loadout) arayüzü.
- [ ] **Adım 2.2 — Dallanan Yol Ayrımı ve Dinamik Biyom Kararları:**
  - Harita düğümlerinde risk-ödül seçenekleri ("Mühürlü Patika" vs. "Kıvılcım Vadisi").
- [ ] **Adım 2.3 — Kıvılcım Akışı (Spark Flow) Dinamik Kombo Sistemi:**
  - Hızlı ve hatasız hamlelerde çarpanı katlayan organik kombo barı.
- [ ] **Adım 2.4 — Anlamsal Terminoloji İyileştirmesi (Realia / Irrealia Çift Dilli Bütünlük):**
  - Kuru matematiksel terimlerin yerine kurgusal ve anlaşılır Türkçe/İngilizce terimlerin standartlaştırılması (`translations.ts`).
- [ ] **Adım 2.5 — Faz 2 Doğrulama & Kontrol Noktası:**
  - Roguelike döngü mekanik testleri, denge analizleri ve `release:check` doğrulaması.

---

## 📌 FAZ 3: CANLI OPERASYONLAR (LIVE-OPS), TEMATİK PUL KOLEKSİYONU & DDA

- [ ] **Adım 3.1 — 14 Günlük Sezonluk Canlı Operasyon Motoru (Seasonal Events Engine):**
  - Sezonluk takvim yöneticisi (Antik Mısır, Siber Şehir, Zümrüt Ormanı vb. temalar).
- [ ] **Adım 3.2 — Tematik Pul ve Kartpostal Koleksiyonu (Postal Stamp & Postcard Meta):**
  - Bölüm sonlarında kazanılan 9 parçalı pul birleştirme albümü.
  - Tamamlanan kartpostallarla açılan özel tahta temaları ve çerçeve ödülleri.
- [ ] **Adım 3.3 — Dinamik Zorluk Ayarlaması (Dynamic Difficulty Adjustment - DDA):**
  - Oyuncunun hata oranı ve çözüm hızına göre adil yardım veya ek zorluk katan akıllı adaptasyon motoru.
- [ ] **Adım 3.4 — Faz 3 Doğrulama & Kontrol Noktası:**
  - Koleksiyon kaydetme/yükleme, sezon geçiş testleri ve `release:check` onayı.

---

## 📌 FAZ 4: SOSYAL EKOSİSTEM, ASENKRON HAYALET DÜELLOLARI & KLAN RÜN KAPILARI

- [ ] **Adım 4.1 — Asenkron Hayalet Koşusu (Ghost Run) Sistemi:**
  - Eşit seviyedeki gerçek oyuncuların kaydedilmiş hamle zamanlamalarıyla bekleme süresiz düello eşleşmesi.
- [ ] **Adım 4.2 — Küresel Sezonluk Ligler ve Rütbe Hiyerarşisi:**
  - Bronz, Gümüş, Altın, Usta, Büyük Usta lig kademeleri ve aylık rütbe ödülleri.
- [ ] **Adım 4.3 — Klan / Lonca Rün Kapıları ve Haftalık Samurai Zindanı:**
  - Oyuncuların rün tozu bağışlayarak açtığı devasa ortak Samurai 5-Grid kooperatif zindanı.
- [ ] **Adım 4.4 — Faz 4 Doğrulama & Kontrol Noktası:**
  - Firestore optimizasyonları, hayalet verisi senkronizasyon testleri ve `release:check`.

---

## 📌 FAZ 5: ÇAPRAZ PLATFORM GENİŞLEMESİ (STEAM PC + MOBİL) & KÜRESEL ÇIKIŞ

- [ ] **Adım 5.1 — Masaüstü / PC Arayüz Adaptasyonu:**
  - Klavye kısayolları (Numpad, yön tuşları, Space), fare tekeri ve tam gamepad/Steam Deck kontrolcü haritalaması.
- [ ] **Adım 5.2 — Çift Ekonomi Dengelemesi (Premium PC vs F2P Mobil):**
  - PC sürümünde reklamsız tek seferlik satın alma dengesi; mobil tarafta ödüllü reklam/IAP dengesi.
- [ ] **Adım 5.3 — WebAssembly Çekirdek Köprüsü & Performans Zirvesi:**
  - Samurai ve Killer çözücülerinin WebAssembly derlemesiyle 60/120 FPS sıfır gecikme garantisi.
- [ ] **Adım 5.4 — Faz 5 Doğrulama & Nihai Yayın Kontrolü:**
  - Çoklu platform derlemeleri, Steam uyumluluk testleri ve nihai sürüm doğrulaması.
