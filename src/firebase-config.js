// Firebase web uygulaması yapılandırması.
// Firebase Console → Proje Ayarları → Genel → "Web uygulaması" bölümündeki
// firebaseConfig nesnesini buraya yapıştırın. (Bu anahtarlar gizli değildir;
// erişim güvenliği Firestore kuralları ve Cloud Functions ile sağlanır.)
//
// null bırakılırsa oyun ÇEVRİMDIŞI modda çalışır: hesaplar cihazda tutulur,
// sıralama ekranı örnek verileri gösterir.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCXU28apdUilQFGNJdFJGdmv0neu53CRMk',
  authDomain: 'polara-b2258.firebaseapp.com',
  projectId: 'polara-b2258',
  storageBucket: 'polara-b2258.firebasestorage.app',
  messagingSenderId: '869217683600',
  appId: '1:869217683600:web:07d45c210be66a74d3f015'
};

// Emülatör testi için (geliştirme): FIREBASE_EMULATOR true ise Auth/Firestore/Functions
// yerel emülatöre bağlanır (firebase emulators:start).
export const FIREBASE_EMULATOR = false;
