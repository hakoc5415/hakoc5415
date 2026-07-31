// Firebase web uygulaması yapılandırması.
// Firebase Console → Proje Ayarları → Genel → "Web uygulaması" bölümündeki
// firebaseConfig nesnesini buraya yapıştırın. (Bu anahtarlar gizli değildir;
// erişim güvenliği Firestore kuralları ve Cloud Functions ile sağlanır.)
//
// null bırakılırsa oyun ÇEVRİMDIŞI modda çalışır: hesaplar cihazda tutulur,
// sıralama ekranı örnek verileri gösterir.
export const FIREBASE_CONFIG = null;
// Örnek:
// export const FIREBASE_CONFIG = {
//   apiKey: '...',
//   authDomain: 'polara-xxxxx.firebaseapp.com',
//   projectId: 'polara-xxxxx',
//   storageBucket: 'polara-xxxxx.appspot.com',
//   messagingSenderId: '...',
//   appId: '...'
// };

// Emülatör testi için (geliştirme): FIREBASE_EMULATOR true ise Auth/Firestore/Functions
// yerel emülatöre bağlanır (firebase emulators:start).
export const FIREBASE_EMULATOR = false;
