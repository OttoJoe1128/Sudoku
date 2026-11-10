# SudokuMap Geliştirme Yol Haritası 🚀

## 📋 TODO Listesi

### 1. Aşama: Altyapı ve Profesyonelleşme
- [x] TypeScript kurulumu ve yapılandırması (`tsconfig.json`)
- [x] Proje yapısını modülerleştirme (`src/` klasör yapısı)
- [x] `SudokuGen` motorunu modülerleştirme
- [x] Firebase API katmanını modülerleştirme
- [x] State management için merkezi bir `Store` yapısı kurma
- [x] Vite yapılandırması
- [x] Giriş dosyası (`src/main.ts`) oluşturma
- [x] `index.html` içerisindeki monolitik kodun temizlenip `src/` altındaki modüllere dağıtılması
- [x] UI bileşenlerinin (View'lar) modülerleştirilmesi ve Router yapısının kurulması
- [x] Günlük ödül sistemi (Daily Rewards)
- [x] Navigasyon ve Modal bağlantılarının kurulması
- [x] Sıralama (Leaderboard) sisteminin Firebase verileriyle doldurulması
- [x] Başarımlar (Achievements) rozet sistemi mantığının kurulması
- [x] Tema Mağazası (Shop/Themes) mantığının kurulması

### 2. Aşama: Mobil Oyun Deneyimi
- [ ] Tam offline-first desteği (Service Worker güncellemesi)
- [ ] Uygulamanın başarıyla derlenmesi ve ayağa kaldırılması (Vite/Build optimize)

### 3. Aşama: Gelir Modeli
- [ ] AdMob entegrasyonu (Rewarded Ads)
- [ ] Uygulama İçi Satın Alma (In-App Purchase)
- [ ] Banner reklam alanı optimizasyonu

### 4. Aşama: Yayınlama ve ASO
- [ ] Google Play Store ASO optimizasyonu (Keyword, Screenshot, Icon)
- [ ] Gizlilik Politikası sayfası
- [ ] Firebase Crashlytics entegrasyonu
- [ ] TWA (Trusted Web Activity) paketleme
