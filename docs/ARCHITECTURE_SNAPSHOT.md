# Sudoku Architecture Snapshot (Mimari Özet)

Bu belge, `src/` klasörü altındaki modüler yapıyı, motor mantığını, kontrolcüleri ve servisleri özetlemektedir.

## 📁 Dizin Yapısı ve Modüller

### 1. `src/engine/` (Oyun Motoru & Mantık)
Sudoku kuralları, tahta üretimi, özel yetenekler, başarımlar ve yapay zeka/maç motoru gibi çekirdek oyun mantığını barındırır.
- **sudoku.ts / gameEngine.ts / gameLogic.ts**: Tahta üretimi, validasyon, hamle kontrolü, zorluk seviyeleri ve temel oyun akışı.
- **abilities.ts / academyData.ts / achievements.ts**: Özel yetenekler, akademi eğitim modülleri ve başarımlar.
- **boardMechanics.ts / hintSolver.ts / placementEngine.ts**: Tahta mekanikleri, ipucu çözücü ve hücre yerleşim motoru.
- **matchEngine.ts / botData.ts / leaderboard.ts**: Karşılaşma/düello motoru, bot verileri ve sıralama listesi.
- **shop.ts / rewards.ts / soundManager.ts / seededRandom.ts**: Mağaza, günlük/bölüm ödülleri, ses efektleri ve deterministik rastgele sayı üretici.
- **saveValidator.ts / levelModifiers.ts / mapGates.ts / rhythmConfig.ts**: Kayıt doğrulama, seviye değiştiriciler, harita geçitleri ve ritim yapılandırması.

### 2. `src/controllers/` (Kontrolcüler ve UI Bağlantıları)
Kullanıcı etkileşimlerini, oyun döngülerini ve ekran durumlarını yöneten kontrolcülerdir.
- **gameController.ts / mapController.ts / arenaController.ts**: Oyun döngüsü, harita ilerlemesi ve arena/düello süreçleri.
- **authController.ts / saveController.ts**: Kimlik doğrulama, oturum yönetimi ve oyun kayıt işlemleri.
- **modalsController.ts / onboardingController.ts / appTourController.ts**: Modal pencereler, ilk açılış rehberi ve uygulama turu.
- **abilitiesController.ts / academyController.ts / levelPrepController.ts**: Yetenek, akademi ve seviye hazırlık ekranları.

### 3. `src/services/` (Servisler & Dış Bağlantılar)
- **adService.ts**: Reklam entegrasyonları (AdMob vb.).
- **authService.ts**: Kimlik doğrulama servisleri.

### 4. `src/api/` & `src/store/` (API & Durum Yönetimi)
- **src/api/firebase.ts**: Firebase Firestore ve Authentication entegrasyonu.
- **src/store/gameState.ts / userState.ts**: Merkezi oyun ve kullanıcı durum (state) yönetimi.

### 5. `src/design/` & `src/i18n/` (Görsel Tasarım & Çoklu Dil)
- **tokens.css / icons.css / backgrounds.ts**: Tasarım tokenleri, ikon setleri ve arka planlar.
- **translations.ts**: Çoklu dil (i18n) metinleri.

---
*Bu doküman otomatik olarak `ui_developer` tarafından oluşturulmuştur.*
