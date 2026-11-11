# SudokuMap Geliştirme Yol Haritası 🚀

## 📋 TODO Listesi

### 1. Aşama: Altyapı ve Profesyonelleşme
- [x] TypeScript kurulumu ve yapılandırması (`tsconfig.json`)
- [x] Proje yapısını modülerleştirme (`src/` klasör yapısı)
- [x] `SudokuGen` motorunu modülerleştirme
- [x] Firebase API katmanını modülerleştirme ve canlı veritabanı eşleştirmesi
- [x] State management için merkezi bir `Store` yapısı kurma
- [x] Vite yapılandırması ve port optimizasyonu
- [x] Giriş dosyası (`src/main.ts`) oluşturma
- [x] `index.html` içerisindeki monolitik kodun temizlenip `src/` altındaki modüllere dağıtılması
- [x] UI bileşenlerinin (View'lar) modülerleştirilmesi ve Router yapısının kurulması
- [x] Günlük ödül sistemi (Daily Rewards - 24 saat takvim kilitli)
- [x] Navigasyon ve Modal bağlantılarının kurulması
- [x] Sıralama (Leaderboard) sisteminin Firebase verileriyle doldurulması (Canlı Firestore)
- [x] Başarımlar (Achievements) rozet sistemi mantığının kurulması
- [x] Tema Mağazası (Shop/Themes) mantığının kurulması

### 2. Aşama: Oyun Dinamikleri & Hata / Can Sistemi (Tamamlananlar)
- [x] **Görsel Ayrıştırma:** Başlangıç şablonu sayıları (`siyah/koyu gri`) ile kullanıcının sonradan girdiği sayıların (`parlak indigo/mavi`) net renk kontrastıyla ayrıştırılması.
- [x] **Seçili Sayı Eşleşmesi:** Bir sayı seçildiğinde tahtadaki aynı sayıların arka planda hafif parlaması (okunabilirlik artışı).
- [x] **Canlı Hata Göstergesi:** Oyun esnasında üst çubukta canlı kalp ve hata sayacı (`❤️ Hata: X/5`).
- [x] **5 Hata Toleransı & Can Kurtarma Karar Modalı:**
  - [x] 5 hata yapıldığında oyunu hemen sonlandırmadan oyuncuya karar penceresi açılması.
  - [x] **Seçenek A:** 50 🪙 Altın harcayarak mevcut tahtayı, girilen sayıları ve süreyi kaybetmeden +3 can (hata sayısını 2'ye çekerek) ile devam etme.
  - [x] **Seçenek B:** 0 altınla (ücretsiz) mevcut seviyeyi baştan başlatma (tahtayı ilk şablon haline döndürme, hataları 0/5 yapma).
  - [x] Yetersiz altın durumunda bilgilendirme ve yönlendirme.
- [x] **Kalıcı Zafer Koruması:** Bölüm tamamlandığında oyunun hafızadan kesin silinmesi ve şık oyun içi konfetili zafer penceresi.

### 3. Aşama: Mobil Oyun Deneyimi & İleri Özellikler (Tamamlananlar)
- [x] **Not Alma (Pencil/Notes) Modu:** Hücrelere aday küçük sayılar (3x3 mini matris) yazabilme/çıkarabilme, hücreye asıl sayı girildiğinde ilgili satır, sütun ve 3x3 kutudaki aday sayıların otomatik ayıklanması (auto-prune), oyun kayıtlarında notların güvenle saklanması.
- [x] **Numara Tamamlama Sayacı:** Sayı pad'inde 1'den 9'a kadar her rakam için tahtada kalan adet göstergesi ("X kaldı") ve 9 adedin tamamı yerleştiğinde yeşil rozetle ("✓ Bitti") görsel olarak tamamlanma durumu.
- [x] **Tam Offline-First & PWA Entegrasyonu:** `vite-plugin-pwa` ile tam çevrimdışı çalışma, Service Worker otomatik önbellekleme (HTML, CSS/Tailwind, scriptler, ikonlar), Web Manifest, 192x192 ve 512x512 ikonlar, iOS Safari uyumluluğu ve oyun içi "Uygulamayı Cihazına Yükle (PWA)" butonu.

### 4. Aşama: Gelir Modeli
- [ ] AdMob entegrasyonu (Ödüllü Reklam ile ücretsiz can kazanma: "Reklam İzle & Devam Et").
- [ ] Uygulama İçi Satın Alma (In-App Purchase).
- [ ] Altın paketi mağaza entegrasyonu.

### 5. Aşama: Yayınlama ve ASO
- [ ] Google Play Store ASO optimizasyonu (Keyword, Screenshot, Icon).
- [ ] Gizlilik Politikası sayfası.
- [ ] Firebase Crashlytics entegrasyonu.
- [ ] TWA (Trusted Web Activity) paketleme.
