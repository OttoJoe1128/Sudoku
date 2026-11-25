# PROJE KURALLARI VE ÇALIŞMA PRENSİPLERİ (AGENTS.md)

## 1. PROJENİN AMACI VE KAPSAMI
**SudokuMap**, modern ve akıllı bir mobil & web Sudoku platformudur.
- **Disiplinler:** 5 Farklı Sudoku Modu (Klasik, Parçalı/Irregular, Hesap/Killer, Harfli/Wordoku, Samurai 5-Grid).
- **Seviye ve Harita Motoru:** 1.000 bölümlük ritim haritası (20 bölge, kilometre taşları, kapılar, muhafız bölümleri).
- **Çift Ekonomi ve Yetenekler:** Altın + Rün Kristali ekonomisi, 5 aktif/pasif yetenek (Kâhin Gözü, Mühür Kırıcı, Rün Mıknatısı, Ritim Bükücü, Kristal Kalkanı).
- **Sosyal ve Arenalar:** Canlı PvP ve YZ Bot Düelloları, Liderlik Tablosu, Rozetler, Evrensel Hesap Senkronizasyonu (Misafir + E-posta/Şifre).

## 2. KULLANILAN TEKNOLOJİLER VE MİMARİ
- **Dil ve Çalışma Zamanı:** TypeScript (Strict), HTML5, CSS3.
- **UI & Stil:** Native DOM manipülasyonu, Tailwind CSS (v4), Vite (v6).
- **Test Altyapısı:** Vitest (v5.1) + Happy DOM.
- **Veritabanı & Auth:** Firebase Auth (v13), Cloud Firestore (v13).
- **Mobil ve PWA:** Capacitor (v8) Android entegrasyonu, PWA Service Worker.

## 3. ZORUNLU ÇALIŞMA KURALLARI

### 🗣️ Dil ve İletişim
- Her zaman **Türkçe** konuşulacak ve raporlama Türkçe yapılacak.

### 📋 Planlama ve Onay (Plan-First)
- Büyük mimari değişikliklerden, yeni özellik eklemelerinden veya refactoring işlemlerinden önce **kullanıcıya onay için uygulama planı sunulacak**.
- Onay alınmadan ana kod üzerinde büyük değişiklikler başlatılmayacak.

### 🧩 Küçük, Güvenli ve Test Edilebilir Adımlar
- Kod değişiklikleri **kırılma riski olmadan, küçük ve adım adım** uygulanacak.
- Değişiklik sonrasında mevcut testlerin (247+ test) yeşil kaldığından emin olunacak.

### 🔍 Kök Neden Analizi ve Hata Raporlama
- Bir hata veya aksaklık oluştuğunda tahmin yürütülmeyecek; önce kök neden araştırılacak.
- Sorunun sebebi ve çözüm önerisi somut kanıtlarla (dosya yolu ve satır numarası) kullanıcıya raporlanacak.

### 🚀 Otomatik GitHub Pushing (Doğrulanmış Kod)
- `npm run release:check` (Typecheck + Vitest + Vite Build) aşamasından **tam başarıyla (%100 yeşil)** geçen güncellemeler otomatik olarak GitHub'a commit ve push yapılacak (`git commit`, `git push origin main`).

### 📱 Gecikmeli Android Senkronizasyonu (Sıkı Kapı)
- `npx cap sync android` veya `npx cap copy android` komutları **kesinlikle her şey kullanıcı tarafından onaylandıktan ve test edildikten sonra** çalıştırılacak.
- Onaysız otomatik Android build senkronizasyonu yapılmayacak.

### 🌐 Çift Dilli Bütünlük Garantisi
- `translations.ts` dosyasındaki `tr` ve `en` anahtarları %100 birebir eşit tutulacak, yeni eklenen her metin iki dilde de eksiksiz tanımlanacak.

### 🔓 Sıfır Duvar Kuralı (Google Play / Apple Uyumlu)
- Oyuncu ilk açılışta e-posta ile kaydolmaya zorlanmayacak; misafir modu kesintisiz ve tek tıkla çalışacak. E-posta seçeneği isteğe bağlı kalacak.

### 📐 Mobil Ergonomi ve Dokunma Standartları
- Ekrana eklenen veya güncellenen tüm UI bileşenlerinde `env(safe-area-inset-top/bottom)` alanları ve minimum ~44px dokunma hedefleri korunacak. Numpad ve buton düzenleri tek elle kullanıma tam uygun olacak.

### 🛡️ Test Ortamı Sahte Ağ Koruması
- Vitest unit testleri çalışırken canlı Firebase sunucularına sahte istek atılmayacak (`isTestRuntime()` mantığı korunacak).
