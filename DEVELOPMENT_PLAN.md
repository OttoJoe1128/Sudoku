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
- [x] **Adım 1.2 — İleri Seviye Mantık Algoritmalarının Eklenmesi:**
  - **Naked / Hidden Pairs & Triples** (Çift ve Üçlü Aday Eleme): `findNakedPair` ve `findHiddenPair` algoritmaları O(1) bitmask motoruyla kodlandı.
  - **X-Wing** (2 satır/2 sütun kafes elemesi): Yatay ve dikey çift hat taraması `findXWing` fonksiyonuyla eklendi.
  - **Swordfish** (3x3 ızgara eleme zinciri): 3 satır / 3 sütun matris elemesi `findSwordfish` ile uygulandı.
  - **XY-Wing & Renkli Kesişimler** (Bivalue cell zincirleri): Pivot-kanat (X-Y, X-Z, Y-Z) bivalue ilişki motoru `findXYWing` ile tamamlandı.
  - `src/tests/advanced-techniques.test.ts` (6 yeni unit test) eklendi ve tüm 283 test %100 yeşil tamamlandı.
- [x] **Adım 1.3 — İnteraktif Adım Adım Açıklamalı Çözücü (Interactive Step-by-Step Solver UI):**
  - Tahtadaki kilit noktalarda eleme mantığını görselleştiren, etkilenen satır/sütunları ve adayları animasyonla gösteren görsel çözücü katmanı tamamlandı.
  - `#smart-hint-step-badge` (adım sayacı) ve `#btn-step-smart-hint` (adımı incele / ileri adım butonu) eklendi.
  - Tahta üzerinde deseni oluşturan birincil hücreler altın sarısı parıltıyla (`data-hint-pattern`), hedef hücreler zümrüt yeşili halkayla (`data-hint-target`), eleme hücreleri kırmızı vurguyla (`data-hint-elimination`) işaretlendi.
  - `src/tests/smart-hint.test.ts` içine interaktif adım adımlı çözücü testi eklendi ve tüm 284 test %100 yeşil tamamlandı.
- [x] **Adım 1.4 — Sudoku Akademisi Genişletmesi (İleri Düzey Master Müfredat):**
  - X-Wing, Y-Wing, Swordfish, Naked/Hidden Pairs gibi ileri düzey derslere interaktif adım simülasyonu (`#btn-academy-simulate-step`) eklendi.
  - Eleme aşaması ile orijinal desen arasında anlık animasyonlu geçiş sağlandı.
  - `src/tests/academy.test.ts` içine simülatör doğrulama testi eklendi.
- [x] **Adım 1.5 — Faz 1 Doğrulama & Kontrol Noktası:**
  - İleri seviye çözücü unit testleri (`bitmask-engine.test.ts`, `advanced-techniques.test.ts`, `smart-hint.test.ts`, `academy.test.ts`) yazıldı.
  - 27 test dosyasının 27'si (%100) ve 285 testin 285'i (%100) tam yeşil geçti.
  - `npm run release:check` (Typecheck + Vitest + Vite Build) sıfır hatayla doğrulandı.

---

## 📌 FAZ 2: ROGUELIKE OYUN DÖNGÜSÜ, KALINTILAR (RELICS) VE ANLAMSAL TERMİNOLOJİ

- [x] **Adım 2.1 — Pasif Kalıntı (Relic) Veri Mimarisi ve Envanter Sistemi:**
  - `src/engine/relics.ts` modülü oluşturuldu; "Altın Pusula", "Zaman Kum Saati", "Ayna Kafes", "Kadim Rün Taşı" ve "Gözcü Dürbünü" tanımlandı.
  - `UserManager` envanterine `getUnlockedRelics`, `getEquippedRelic` ve `equipRelic` metotları entegre edildi.
  - `levelPrepModal` üzerinde 1 yuvalık pasif kalıntı donanım satırı (`#prep-relics-row`) eklendi.
  - Çalışma zamanı avantajları bağlandı: Altın Pusula (5 rakamında +2 altın), Zaman Kum Saati (Kıvılcım süresi +5s), Kadim Rün Taşı (Zaferde +1 kristal).
  - `src/tests/relics.test.ts` (7 yeni unit test) eklendi ve tüm 292 test %100 yeşil tamamlandı.
- [x] **Adım 2.2 — Dallanan Yol Ayrımı ve Dinamik Biyom Kararları:**
  - `isBranchingLevel` (4 ve 7 ile biten seviyeler) ile 1.000 bölümlük haritaya stratejik yol ayrımları entegre edildi.
  - "Mühürlü Patika" (Risk: +1 Kristal, ekstra mühür) ve "Kıvılcım Vadisi" (Hız: +Kıvılcım, 180s Depar bonusu) rotaları kodlandı.
  - `levelPrepModal` üzerinde `#prep-branch-container` ile interaktif rota seçimi eklendi.
  - Harita düğümlerinde dallanan seviyeler `data-branching="true"` özniteliğiyle işaretlendi.
  - `src/tests/branching-path.test.ts` (6 yeni unit test) eklendi ve tüm 298 test %100 yeşil tamamlandı.
- [x] **Adım 2.3 — Kıvılcım Akışı (Spark Flow) Dinamik Kombo Sistemi:**
  - Hızlı ve hatasız hamlelerde kombo çarpanı (`sparkCombo`) ve kademeli altın bonusu artışı kodlandı.
  - Hata yapıldığında kombo kırılması (`comboBroken`), haptik titreşim ve `spark_combo_broken` uyarısı bağlandı.
  - `#game-momentum-pill` üzerinde canlı kombo ve süre animasyonu sağlandı.
  - `src/tests/spark-combo.test.ts` (4 yeni unit test) eklendi.
- [x] **Adım 2.4 — Anlamsal Terminoloji İyileştirmesi (Realia / Irrealia Çift Dilli Bütünlük):**
  - Tüm 20 teknik ve 10 bölüm enerjisi kurgusal ve zengin bir terminolojiyle `translations.ts` içinde TR/EN olarak eşitlendi.
  - Yasaklı İngilizce kelime sızıntıları ve çift dilli karakter uyumsuzlukları giderildi.
- [x] **Adım 2.5 — Faz 2 Doğrulama & Kontrol Noktası:**
  - 30 test dosyasının 30'u (%100) ve 302 testin 302'si (%100) tam yeşil geçti.
  - `npm run release:check` (Typecheck + Vitest + Vite Build) sıfır hatayla doğrulandı.

---

## 📌 FAZ 3: CANLI OPERASYONLAR (LIVE-OPS), TEMATİK PUL KOLEKSİYONU & DDA

- [x] **Adım 3.1 — 14 Günlük Sezonluk Canlı Operasyon Motoru (Seasonal Events Engine):**
  - `src/engine/seasonalEvents.ts` modülü oluşturuldu; 14 günlük rotasyonlu 4 tematik sezon (Antik Mısır, Siber Metropol, Zümrüt Korusu, Göksel Tapınak) tanımlandı.
  - `getCurrentSeason` ve `getRemainingSeasonDays` ile deterministik küresel döngü kuruldu.
- [x] **Adım 3.2 — Tematik Pul ve Kartpostal Koleksiyonu (Postal Stamp & Postcard Meta):**
  - Her sezona özel 9 parçalı pul birleştirme albümü (`SeasonalEventManager`) kodlandı.
  - 9 pul tamamlandığında +150 Altın, +20 Kristal ödülü ve özel tematik tahta derisi (`ShopManager.unlockTheme`) açılması sağlandı.
- [x] **Adım 3.3 — Dinamik Zorluk Ayarlaması (Dynamic Difficulty Adjustment - DDA):**
  - `src/engine/adaptiveDifficulty.ts` motoru kuruldu.
  - 2 ardışık hatada `scoutSupportActive`, 5 hızlı hatasız hamlede `masterFlowActive` (+%25 skor bonusu) ve 45s hamlesizlikte `hesitationDetected` algoritmaları tamamlandı.
- [x] **Adım 3.4 — Faz 3 Doğrulama & Kontrol Noktası:**
  - `src/tests/seasonal-events-dda.test.ts` (6 yeni unit test) eklendi.
  - 31 test dosyasının 31'i (%100) ve 308 testin 308'i (%100) tam yeşil geçti.
  - `npm run release:check` (Typecheck + Vitest + Vite Build) sıfır hatayla doğrulandı.

- [x] **Adım 3.5 — Görsel ve Kullanıcı Arayüzü (UI/UX) Entegrasyonu:**
  - **Görev Grubu 1 (Faz 1 Görsel/Mantık Entegrasyonu):** `findSmartHint` içine `findAdvancedTechnique` (Naked/Hidden Pairs, X-Wing, Swordfish, XY-Wing) bağlandı. Tahtada desen hücreleri altın sarısı halkayla (`bg-amber-500/25`), eleme hücreleri kırmızı halkayla (`bg-rose-500/15`) parlatıldı.
  - **Görev Grubu 2 (Faz 2 Roguelike/Harita Entegrasyonu):** Oyun içi mekanik çubuğuna `#game-relic-pill` rozeti eklendi. Harita düğümlerinde 4 ve 7 ile biten seviyelerde dallanan yol `⚡` rozeti çizildi. Kıvılcım kombosunda x3 ve x5 seviyelerine özel kademeli alev efektleri entegre edildi.
  - **Görev Grubu 3 (Faz 3 Canlı Operasyon & Kartpostal Albümü):** Sezonluk kartpostal albüm modalı (`postcardModalTemplate`, `#postcard-modal`), 3x3 interaktif pul vitrini, ana menüde ekran ergonomisini bozmayan kompakt çift hap sezon butonu (`#btn-open-postcards`), zafer ekranında pul düşüşü (`awardRandomStamp`) ve oyun içinde adaptif zorluk (DDA) usta akışı bağlandı.
  - `src/tests/postcard-integration.test.ts` (2 yeni unit test) eklendi.
  - 32 test dosyasının 32'si (%100) ve 310 testin 310'u (%100) tam yeşil tamamlandı.

---

## 📌 FAZ 4: SOSYAL EKOSİSTEM, ASENKRON HAYALET DÜELLOLARI & KLAN RÜN KAPILARI

- [x] **Adım 4.1 — Asenkron Hayalet Koşusu (Ghost Run) Sistemi:**
  - `src/engine/ghostRun.ts` motoru kuruldu; `GhostRunRecord`, `GhostRunStep` veri yapıları ve `interpolateGhostProgress` lineer zaman interpolatörü kodlandı.
  - Eşit seviyedeki oyuncuların kaydedilmiş zaman serileri veya organik üretilen eşdeğer MMR hayaletleri ile bekleme süresiz anlık düello eşleşmesi sağlandı (`MatchEngine.startGhostRunner`).
  - `src/tests/ghost-run.test.ts` (3 yeni unit test) eklendi.
- [x] **Adım 4.2 — Küresel Sezonluk Ligler ve Rütbe Hiyerarşisi:**
  - `src/engine/leagueSystem.ts` oluşturuldu; Bronz, Gümüş, Altın, Platin, Elmas ve Büyük Usta olmak üzere 6 lig kademesi ve baremleri tanımlandı.
  - `getLeagueProgress` ile sonraki lige olan MMR mesafesi ve ilerleme yüzdesi hesaplandı.
  - `LeagueManager.claimLeagueSeasonReward` ile sezon sonu kademe sandıkları (+50..+1000 Altın, +5..+100 Kristal) entegre edildi.
  - `src/tests/league-system.test.ts` (4 yeni unit test) eklendi.
- [x] **Adım 4.3 — Klan / Lonca Rün Kapıları ve Haftalık Samurai Zindanı:**
  - `src/engine/clanSystem.ts` klan mimarisi inşa edildi (`ClanDef`, `ClanMember`, `DEFAULT_CLANS`).
  - `ClanManager`: Klan oluşturma (`createClan`), katılma (`joinClan`), ayrılma (`leaveClan`), rün tozu bağışlama (`donateRuneDust`: 1 Kristal = 10 Rün Tozu) ve 500 rün tozuna ulaşıldığında Haftalık Samuray Zindanını açma (`isDungeonUnlocked`) mekanikleri kodlandı.
  - Zindan boss'una klan üyelerinin ortaklaşa hasar vermesi (`damageSamuraiBoss`) bağlandı.
  - `src/tests/clan-system.test.ts` (4 yeni unit test) eklendi.
- [x] **Adım 4.4 — Faz 4 Doğrulama & Kontrol Noktası:**
  - 35 test dosyasının 35'i (%100) ve 321 testin 321'i (%100) tam yeşil geçti.
  - `npm run release:check` (Typecheck + Vitest + Vite Build) sıfır hatayla doğrulandı.

---

## 🎨 YENİ MASTER ARAYÜZ (UI/UX) & OYUN HİSSİ (GAME FEEL / JUICE) DÖNÜŞÜMÜ

### 📌 FAZ I (UI): GÖRSEL DİL, TASARIM SİSTEMİ & ANLAMSAL TERMİNOLOJİ
- [ ] **Adım I.1 — WCAG AAA Renk Paleti ve Kontrast Mimarisi:**
  - Obsidyen Gece (`#0B0F19`) ve Kadim Parşömen (`#F8F6F0`).
  - Seçili Hücre Safir Mavisi (`#2563EB`) neon odak aurası.
  - Aynı Rakam Vurgusu Buzul Mavisi / Amber İnce Dolgu (`#38BDF8/20`).
  - Hata & Çakışma Kızıl Alarm (`#EF4444`) mikro sarsıntı.
  - Pivot / İleri Teknik Altın Nabız (`#F59E0B`), Elenen Adaylar duman kırmızısı (`#F43F5E/30`).
- [ ] **Adım I.2 — Tipografi Hiyerarşisi:**
  - Rakamlar: Monospaced geometrik yüksek okunurluklu glifler.
  - Arayüz: Modern, keskin Plus Jakarta Sans / Inter.
- [ ] **Adım I.3 — Anlamsal Terminoloji Standardizasyonu (Realia & Irrealia Dengesi):**
  - Standart kurallar şeffaf (Hücre, Satır, Sütun, Blok, Aday Notu).
  - Evren mekanikleri tematik (Rün Taşı, Mühür, Kıvılcım Kombosu, Kâhin Gözü).

---

### 📌 FAZ II (UI): ÇEKİRDEK TAHTA KATMANI, DOKUNSAL REAKSİYONLAR & "JUICE"
- [x] **Adım II.1 — Responsive Sudoku Izgarası ve Derinlikli Katmanlama:**
  - 3x3 ana blokları ayıran kalın çizgiler kabartmalı diegetik çerçeveye dönüştürüldü.
  - Hücrelere dokunulduğunda 0.96x yaylanan (spring physics) mikro reaksiyon uygulandı.
- [x] **Adım II.2 — Model 1 Ergonomik Numpad Dönüşümü (5+4 Dinamik Matris):**
  - Tahtada 9 adedi tükenen rakamlar otomatik karartılır, üzerine zarif tamamlanma rünü (`✓`) yerleştirilir ve dokunulmaz kılınır.
  - Numpad butonlarının alt köşelerine tahtada henüz girilmemiş kaç adet kaldığını gösteren dinamik mikro sayaç rozetleri eklendi.
- [x] **Adım II.3 — Kıvılcım Kombosu ve Dinamik Auralar:**
  - Kombo x1'den x5'e çıktıkça tahta kenar çizgileri soğuk beyaz ➔ elektrik mavisi ➔ altın sarısı ➔ alev kırmızısına bürünür.
  - Hata yapıldığında ekran camı gibi hafifçe çatlayan kırmızı sarsıntı uyarısı (`triggerBoardShakeAndCrack`) ve kombo kırılma reaksiyonu bağlandı.
- [x] **Adım II.4 — Çoklu Dokunsal Entegrasyon (Audio-Haptic Matrix):**
  - Doğru rakamda rezonant taş tıklaması ve hafif haptik.
  - Blok/Satır/Sütun tamamlandığında ksilofon akoru (`playBlockComplete`) ve orta düzey haptik titreşim uygulandı.
  - `src/tests/board-hud-overhaul.test.ts` (4 unit test) ile doğrulandı.

---

### 📌 FAZ III (UI): TAKTİKSEL KATMAN, İLERİ ÇÖZÜCÜ & CANLI DÜELLO HUD'I
- [x] **Adım III.1 — Vektörel Çözücü Işınları Katmanı (Raycasting Visualizer):**
  - `#smart-hint-banner` bir tekniği (X-Wing, Swordfish vb.) açıkladığında, `#hint-raycast-overlay` SVG katmanı üzerinde ilgili satır ve sütunları birbirine bağlayan şeffaf neon altın sarısı vektörler (`#F59E0B animate-pulse`) çizilir.
- [ ] **Adım III.2 — Canlı Düello & Asenkron Hayalet HUD'ı (Split Dynamics):**
  - Rakip hayalet oyuncunun hamleleri tahta üzerinde yarı saydam mor lazer hayalet imleci olarak takip edilir.
  - Karşılaştırma çubuğunda rakibin son hamle hızı, serisi ve dalgalanan yarış göstergesi sunulur.
- [ ] **Adım III.3 — Aktif Yetenek Hızlı Erişim Çarkı / Barı:**
  - Tahta üstü yetenek butonlarında dairesel SVG dolgu cooldown animasyonu ve hazır olduğunda enerji akış aurası.

---

### 📌 FAZ IV (UI): META SİSTEMLER, SEZONLUK CANLI OPERASYONLAR & HARİTA
- [x] **Adım IV.1 — 1.000 Seviyelik Topoğrafik Harita Deneyimi:**
  - Biyom zemin geçişleri (1-300: Zümrüt/Bambu, 301-700: Hextech/Çöl, 701-1000: Kızıl/Buzul) ve 2 adım ötesini gizleyen sis perdesi (Fog of War).
  - Çatallanan rotalarda (Branching Nodes) fiziksel iki kola ayrılan yol ve "Mühürlü Patika (Risk) / Kıvılcım Yolu (Hız)" levhaları.
  - 50. bölümlerdeki kadim kapıların heybetli kemerli rün kapısı (`⛩️ X. Kadim Rün Kapısı`) olarak yükseltilmesi.
  - `src/tests/map-topography.test.ts` (4 unit test) ile doğrulandı.
- [x] **Adım IV.2 — Kartpostal Albümü ve Zafer Akışı (Victory Flow):**
  - Zafer anında kazanılan tematik pul tahtanın ortasında 3D bir dönüşle belirir (`animateStampDropAndFly`), parıldayarak sağ üstteki albüm simgesine doğru uçar ve koleksiyona yerleşir.
- [x] **Adım IV.3 — Lig ve Rütbe Ekosistemi (League Rank Crest):**
  - Ana menüde oyuncunun avatarında lig arması (Bronz ➔ Büyük Usta), tıklandığında açılan lig özeti modalında kalan sezon süresi, MMR baremleri ve sezon sonu lig sandığı ödülü entegre edildi.
  - `src/tests/victory-flow-liveops.test.ts` (2 unit test) ile doğrulandı.

---

### 📌 FAZ V (UI): RITE KULLANILABİLİRLİK DOĞRULAMASI & PERFORMANS CİLASI
- [ ] **Adım V.1 — RITE (Rapid Iterative Testing and Evaluation) Protokolü:**
  - Sesli düşünme oturumları ve anlık arayüz kural revizyonları.
- [ ] **Adım V.2 — Donanım ve Render Performansı (Zero-Lag UI):**
  - 60/120 FPS sabit GPU transform (translate3d, will-change), minimum DOM re-render.

---

## 📌 FAZ VI: ÇAPRAZ PLATFORM GENİŞLEMESİ (STEAM PC + MOBİL) & KÜRESEL ÇIKIŞ

- [ ] **Adım VI.1 — Masaüstü / PC Arayüz Adaptasyonu:**
  - Klavye kısayolları (Numpad, yön tuşları, Space), fare tekeri ve tam gamepad/Steam Deck kontrolcü haritalaması.
- [ ] **Adım VI.2 — Çift Ekonomi Dengelemesi (Premium PC vs F2P Mobil):**
  - PC sürümünde reklamsız tek seferlik satın alma dengesi; mobil tarafta ödüllü reklam/IAP dengesi.
- [ ] **Adım VI.3 — WebAssembly Çekirdek Köprüsü & Performans Zirvesi:**
  - Samurai ve Killer çözücülerinin WebAssembly derlemesiyle 60/120 FPS sıfır gecikme garantisi.
- [ ] **Adım VI.4 — Faz VI Doğrulama & Nihai Yayın Kontrolü:**
  - Çoklu platform derlemeleri, Steam uyumluluk testleri ve nihai sürüm doğrulaması.
