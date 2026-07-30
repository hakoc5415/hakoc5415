# POLARA — Ride the Northern Lights

Tek parmakla oynanan hipnotik bir "flow" oyunu: bir kuzey ışığı şeridini yönetirsin
(**bas = yüksel, bırak = süzül**), halkalardan geçerek skor toplar, karanlık bulutlardan
ve meteorlardan kaçarsın. 8 gece evresi, ekonomi (kredi + mağaza + kalıcı kozmetikler +
tek oyunluk destekler), 23 başarım, 16 rütbe, istatistikler, sıralama ve 6 dil desteği.

Hedef platformlar: **iOS + Android (Capacitor)** + web (PWA).

## Geliştirme

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # üretim çıktısı → dist/
npm run preview
```

## Mobil (Capacitor)

```bash
npm run cap:sync     # build + android/ ve ios/ projelerine kopyala
npm run cap:android  # Android Studio'da aç
npm run cap:ios      # Xcode'da aç (macOS gerekir)
```

## Yapı

| Yol | İçerik |
| --- | --- |
| `src/game.js` | Oyun motoru + uygulama durumu (canvas döngüsü, fizik, spawn, Web Audio, ekonomi, başarımlar) |
| `src/ui.js` | 14 ekran/katmanın DOM şablonları (tasarıma birebir) |
| `src/main.js` | Başlatma ve olay delegasyonu |
| `public/i18n.js` | 6 dilli sözlük (tr, en, no, fr, es, it) |
| `public/privacy.html` | Bağımsız gizlilik politikası sayfası (store başvurusu için herkese açık URL'de yayınlanacak) |
| `public/sw.js`, `public/manifest.webmanifest` | PWA / çevrimdışı |
| `android/`, `ios/` | Capacitor native projeleri (yatay kilit, ikon ve splash işlendi) |
| `docs/YOL-HARITASI.md` | Google Play + App Store yayın adımları |

## Notlar

- Oynanış parametreleri prototipte oynanarak dengelendi — `src/game.js` başındaki
  `CONFIG` dışında değer değiştirme.
- Hesaplar ve skorlar şimdilik cihazda (localStorage); çevrimiçi sıralama backend'i
  yol haritasında.
