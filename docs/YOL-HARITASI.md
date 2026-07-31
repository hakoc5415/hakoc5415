# POLARA — Store Yayın Yol Haritası

Hedef: Oyunu **Google Play** ve **Apple App Store**'da yayınlamak.
Durum işaretleri: ✅ tamam · 🔶 kısmen · ⬜ yapılacak

## 1. Oyun (web uygulaması)

- ✅ Oyun motoru üretim koduna taşındı (`src/game.js`) — canvas döngüsü, fizik, spawn, Web Audio ses sentezi, titreşim, ekonomi, 23 başarım, 16 rütbe, 8 gece evresi
- ✅ 14 ekranlık UI katmanı tasarıma birebir yeniden yazıldı (`src/ui.js`)
- ✅ 6 dil desteği (`public/i18n.js` — tr, en, no, fr, es, it)
- ✅ PWA: manifest, service worker (çevrimdışı), yerel fontlar
- ✅ Kayıt/ilerleme yedekleme (`aurora_backup`)
- ✅ Splash'taki Norient logosu — markanın gerçek logosu (çift şerit + noktalar + gradyan yazı) SVG olarak birebir işlendi

## 2. Backend — Firebase (kod hazır, proje bağlantısı bekleniyor)

Çevrimiçi skorbord altyapısı **yazıldı ve emülatörde 14/14 testle doğrulandı**:

- ✅ Kimlik: Firebase Auth (kullanıcı adı + şifre; şifreler Firebase'de güvenle saklanır, TLS otomatik)
- ✅ Skorbord: oyuncular (ilk 100) + ülke sıralaması — `src/online.js`
- ✅ Skor doğrulama Cloud Function'da (`functions/index.js`): tek yönlü artış, üst sınır, hız limiti — istemciden skor yazılamaz (`firestore.rules`)
- ✅ Hesap silme: profildeki "Hesabımı Sil" düğmesi hesabı + verileri kalıcı siler
- ✅ Yapılandırma boşken oyun çevrimdışı modda çalışır (örnek sıralama + cihazda hesap)

**Devreye almak için kalanlar:**

1. ⬜ Firebase Console'da proje aç (`polara`), **Authentication → E-posta/Şifre**'yi etkinleştir, **Firestore** oluştur (bölge: `europe-west1`), projeye **Blaze** faturalandırmasını bağla
2. ⬜ Web uygulaması ekle → `firebaseConfig`'i `src/firebase-config.js`'e yapıştır
3. ⬜ Mac'te bir kez: `npm install -g firebase-tools && firebase login` sonra proje klasöründe
   `firebase deploy --only functions,firestore:rules --project <PROJE-ID>`
4. ⬜ Config işlenince gizlilik politikası metnini güncelle (veriler artık cihazda değil, Firebase'de) + store veri beyanlarını buna göre doldur

## 3. Capacitor paketleme

- ✅ `capacitor.config.json` (appId: `com.norient.polara`)
- ✅ `android/` projesi — yatay kilit (`sensorLandscape`), ikonlar, splash
- ✅ `ios/` projesi — yatay kilit (Info.plist), ikon, splash
- ⬜ **Android imzalama:** `keytool` ile upload key üret → `android/keystore.properties` (repoya koyma!) → `./gradlew bundleRelease` ile `.aab`
- ⬜ **iOS:** Xcode'da aç (`npm run cap:ios`, macOS gerekir) → Signing & Capabilities'te Team seç → Archive → App Store Connect'e yükle
- Not: her web değişikliğinden sonra `npm run cap:sync`

## 4. Hesaplar ve ücretler

- ⬜ Google Play Console geliştirici hesabı (25$ bir kez) — https://play.google.com/console
- ⬜ Apple Developer Program (99$/yıl) — https://developer.apple.com (iOS derlemek için macOS + Xcode şart)

## 5. Store zorunlulukları

- ⬜ **Gizlilik politikası herkese açık URL** — `public/privacy.html` hazır (6 dil).
  En kolayı: GitHub Pages'i aç → `https://<kullanıcı>.github.io/<repo>/privacy.html`
- ✅ Destek adresi güncellendi: `norientinndev@gmail.com` (i18n `privB7` — 6 dilde de)
- ⬜ Play Console "Veri güvenliği" formu + Apple "App Privacy" beyanı (veri: cihazda; backend gelince güncelle)
- ⬜ Yaş derecelendirme anketleri (oyun şiddet içermiyor → PEGI 3 / 4+ beklenir)
- ⬜ Google Play: kapalı test gereksinimleri (yeni kişisel hesaplarda 12+ testçi / 14 gün kuralını kontrol et)

## 6. Store metadata

- ⬜ Ekran görüntüleri: telefon (yatay) + 7"/10" tablet (Play), 6.7" + 6.5" + iPad (App Store)
- ⬜ Uygulama açıklamaları 6 dilde (i18n metinlerinden türetilebilir)
- ⬜ Play: 512×512 ikon (✅ `public/icons/icon-512.png`) + 1024×500 feature graphic ⬜
- ⬜ App Store: 1024×1024 ikon (✅ `public/icons/icon-1024.png`)
- ⬜ Kategori: Oyunlar › Gündelik/Arcade
- ⬜ Tanıtım videosu (opsiyonel)

## 7. Yayın sırası (öneri)

1. GitHub Pages ile gizlilik politikasını yayınla (5 dk)
2. Destek e-postasını i18n'de güncelle
3. Google Play: `.aab` yükle → kapalı test → üretim
4. TestFlight: iOS build → dahili test → App Store incelemesi
5. Yayın sonrası: backend + gerçek skorbord → güncelleme sürümü

## Komutlar

```bash
npm install          # bağımlılıklar
npm run dev          # geliştirme sunucusu
npm run build        # dist/ üretimi
npm run preview      # build önizleme
npm run cap:sync     # build + native projelere kopyala
npm run cap:android  # Android Studio'da aç
npm run cap:ios      # Xcode'da aç (macOS)
```
