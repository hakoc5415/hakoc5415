// POLARA — oyun motoru + uygulama durumu
// Tasarım paketindeki (design_handoff_polara) çalışan prototip motorunun üretim portu.
// Oynanış parametreleri prototipte oynanarak dengelendi — değiştirme.

import * as ON from './online.js';

export const CONFIG = {
  hizRampasi: 1,      // 0.5–2 arası; zorluk rampası
  enerjiTuketimi: 1   // 0.5–2 arası; enerji tüketim çarpanı
};

export class Polara {
  state = { phase: 'splash', score: 0, isRecord: false, maxStreak: 0, perfects: 0, showHelp: false, regName: '', regPass: '', regCountry: 'Türkiye', regError: '', authTab: 'login', achOpen: '', regAvatar: 0 };

  constructor() {
    this.props = CONFIG;
    this.restoreBackup();
    this.I18 = window.POLARA_I18N || null;
    this.lang = localStorage.getItem('aurora_lang') || 'tr';
    // büyük harf dönüşümleri (ör. İngilizce i → I) doğru dille yapılsın
    try { document.documentElement.lang = this.lang; } catch (e) {}
    this.RANKS = [
      { min: 0, name: 'Kıvılcım' },
      { min: 800, name: 'Işık Damlası' },
      { min: 2500, name: 'Gece Nehri' },
      { min: 6000, name: 'Gök Dansçısı' },
      { min: 12000, name: 'Fırtına Ruhu' },
      { min: 25000, name: 'Aurora\'nın Kendisi' },
      { min: 45000, name: 'Kutup Rüzgârı' },
      { min: 65000, name: 'Buz Hükümdarı' },
      { min: 100000, name: 'Meteor Avcısı' },
      { min: 140000, name: 'Gökkuşağı Dokumacısı' },
      { min: 200000, name: 'Şafak Elçisi' },
      { min: 280000, name: 'Yıldız Gezgini' },
      { min: 400000, name: 'Gece Hükümdarı' },
      { min: 550000, name: 'Kutup Yıldızı' },
      { min: 750000, name: 'Göklerin Efendisi' },
      { min: 1000000, name: 'Sonsuz Işık' }
    ];
    this.best = parseInt(localStorage.getItem('aurora_flow_best') || '0', 10);
    const stars = "<circle cx='15' cy='16' r='1' fill='#fff' opacity='0.7'/><circle cx='78' cy='12' r='1.2' fill='#fff' opacity='0.8'/><circle cx='55' cy='22' r='0.8' fill='#fff' opacity='0.5'/><circle cx='30' cy='8' r='0.9' fill='#fff' opacity='0.6'/><circle cx='88' cy='30' r='0.8' fill='#fff' opacity='0.5'/><circle cx='42' cy='14' r='0.7' fill='#fff' opacity='0.45'/>";
    const mtn = "<path d='M0 100 L0 76 L24 56 L42 72 L60 50 L80 68 L100 58 L100 100 Z' fill='#0a1430'/><path d='M24 56 L30 62 L24 64 L18 61 Z' fill='#dfe9ff' opacity='0.85'/><path d='M60 50 L66 57 L60 59 L54 56 Z' fill='#dfe9ff' opacity='0.85'/>";
    const pines = "<path d='M0 100 L0 86 L7 86 L11 72 L15 86 L26 86 L32 66 L38 86 L48 86 L54 70 L60 86 L72 86 L78 64 L84 86 L100 86 L100 100 Z' fill='#071022'/>";
    const ice = "<path d='M0 100 L0 82 L18 78 L34 84 L52 76 L70 83 L86 78 L100 81 L100 100 Z' fill='#0d1b3a'/><path d='M18 78 L26 81 L18 83 Z M52 76 L60 80 L52 82 Z' fill='#9fc4e8' opacity='0.5'/>";
    const grad = (id, c1, c2) => "<linearGradient id='" + id + "' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + c1 + "'/><stop offset='1' stop-color='" + c2 + "' stop-opacity='0.05'/></linearGradient>";
    const wrap = (defs, inner, ground) => "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs>" + defs + "</defs><rect width='100' height='100' fill='#060b1c'/>" + stars + inner + ground + "</svg>";
    const ART = [
      // 0 Zümrüt Perde — dalgalı yeşil perde şeritleri
      wrap(grad('g', '#b6ffdf', '#128f66'),
        "<path d='M16 6 Q26 34 14 66' stroke='url(#g)' stroke-width='9' fill='none' opacity='0.85'/><path d='M34 2 Q44 36 30 72' stroke='url(#g)' stroke-width='12' fill='none' opacity='0.9'/><path d='M56 4 Q64 34 52 68' stroke='url(#g)' stroke-width='10' fill='none' opacity='0.8'/><path d='M76 8 Q86 36 74 62' stroke='url(#g)' stroke-width='8' fill='none' opacity='0.7'/>", mtn),
      // 1 Buz Şafağı — çift buz mavisi kemer
      wrap(grad('g', '#d8f2ff', '#2f8fc9'),
        "<path d='M-6 66 Q50 8 106 66' stroke='url(#g)' stroke-width='11' fill='none' opacity='0.9'/><path d='M-6 82 Q50 30 106 82' stroke='url(#g)' stroke-width='7' fill='none' opacity='0.6'/>", ice),
      // 2 Menekşe Tacı — tepeden yayılan mor taç ışınları
      wrap(grad('g', '#e6ccff', '#7a3fd9'),
        "<g opacity='0.9'><path d='M50 8 L38 58' stroke='url(#g)' stroke-width='8'/><path d='M50 8 L58 56' stroke='url(#g)' stroke-width='9'/><path d='M50 8 L22 48' stroke='url(#g)' stroke-width='6'/><path d='M50 8 L78 46' stroke='url(#g)' stroke-width='6'/><path d='M50 8 L50 60' stroke='url(#g)' stroke-width='10'/></g><circle cx='50' cy='10' r='5' fill='#f4eaff'/>", mtn),
      // 3 Kutup Alevi — turuncu-kızıl alev dilleri
      wrap(grad('g', '#ffd9a3', '#d94f2a'),
        "<path d='M22 70 Q18 34 30 10 Q34 36 40 20 Q42 48 36 70 Z' fill='url(#g)' opacity='0.85'/><path d='M52 72 Q50 30 64 6 Q66 34 74 22 Q78 52 66 72 Z' fill='url(#g)' opacity='0.75'/>", pines),
      // 4 Gece Nehri — gök kuşağı + nehir yansıması
      wrap(grad('g', '#a8dcff', '#2f6ea8'),
        "<path d='M-4 48 Q50 14 104 48' stroke='url(#g)' stroke-width='10' fill='none' opacity='0.9'/><rect y='72' width='100' height='28' fill='#081226'/><path d='M-4 82 Q50 70 104 82' stroke='#4f9ad9' stroke-width='4' fill='none' opacity='0.5'/><path d='M10 88 Q50 80 92 88' stroke='#3f7ab0' stroke-width='2.5' fill='none' opacity='0.4'/>", ''),
      // 5 Gül Işıması — pembe bulutsu ışıma
      wrap(grad('g', '#ffd0e0', '#c94f86'),
        "<ellipse cx='36' cy='34' rx='26' ry='16' fill='url(#g)' opacity='0.7'/><ellipse cx='64' cy='22' rx='20' ry='12' fill='url(#g)' opacity='0.55'/><ellipse cx='58' cy='46' rx='30' ry='13' fill='url(#g)' opacity='0.45'/>", mtn),
      // 6 Altın Ufuk — ufukta altın şerit ve doğan ışık
      wrap(grad('g', '#fff3c4', '#d9a83f'),
        "<circle cx='50' cy='74' r='16' fill='#ffe9a3' opacity='0.9'/><circle cx='50' cy='74' r='26' fill='#ffe9a3' opacity='0.25'/><path d='M-4 40 Q50 20 104 40' stroke='url(#g)' stroke-width='8' fill='none' opacity='0.7'/>", ice),
      // 7 Turkuaz Rüzgâr — S kıvrımlı turkuaz girdap
      wrap(grad('g', '#c4fff0', '#1fa88a'),
        "<path d='M12 20 Q56 26 44 44 Q30 62 78 60' stroke='url(#g)' stroke-width='12' fill='none' opacity='0.9' stroke-linecap='round'/><path d='M20 12 Q60 16 52 32' stroke='url(#g)' stroke-width='5' fill='none' opacity='0.5' stroke-linecap='round'/>", pines),
      // 8 Mor Fırtına — mor ve yeşil çapraz şimşek şeritleri
      wrap(grad('g', '#d9b8ff', '#6f3fd9') + grad('h', '#b6ffdf', '#128f66'),
        "<path d='M10 6 L34 30 L22 40 L52 66' stroke='url(#g)' stroke-width='9' fill='none' opacity='0.9' stroke-linejoin='round'/><path d='M66 4 L82 26 L70 34 L88 56' stroke='url(#h)' stroke-width='7' fill='none' opacity='0.75' stroke-linejoin='round'/>", mtn),
      // 9 Kuzey Yıldızı — dört uçlu büyük yıldız + hale
      wrap(grad('g', '#dfe9ff', '#3f5fd9'),
        "<circle cx='50' cy='36' r='22' fill='#a5c8ff' opacity='0.18'/><circle cx='50' cy='36' r='12' fill='#a5c8ff' opacity='0.25'/><path d='M50 8 L54 32 L78 36 L54 40 L50 64 L46 40 L22 36 L46 32 Z' fill='#f2f6ff'/><path d='M-4 78 Q50 58 104 78' stroke='url(#g)' stroke-width='6' fill='none' opacity='0.5'/>", '')
    ];
    const AV_NAMES = ['Zümrüt Perde', 'Buz Şafağı', 'Menekşe Tacı', 'Kutup Alevi', 'Gece Nehri', 'Gül Işıması', 'Altın Ufuk', 'Turkuaz Rüzgâr', 'Mor Fırtına', 'Kuzey Yıldızı'];
    // tek tırnak + %27: değer HTML style özniteliğine gömüldüğü için çift tırnak kullanılamaz
    this.AVATARS = AV_NAMES.map((name, i) => ({ id: i, name, bg: "url('data:image/svg+xml," + encodeURIComponent(ART[i]).replace(/'/g, '%27') + "') center / cover no-repeat #060b1c" }));
    this.THEMES = [
      { id: 'aurora', name: 'Aurora Yeşili', hue: 148, min: 0 },
      { id: 'ice', name: 'Buz Mavisi', hue: 210, min: 0 },
      { id: 'sunset', name: 'Gün Batımı', hue: 30, min: 0 },
      { id: 'crimson', name: 'Kızıl Fırtına', hue: 335, min: 0 },
      { id: 'gold', name: 'Altın Şafak', hue: 48, min: 0 },
      { id: 'turkuaz', name: 'Turkuaz Derinlik', hue: 182, min: 0 },
      { id: 'violet', name: 'Menekşe Gecesi', hue: 275, min: 0 }
    ];
    this.theme = localStorage.getItem('aurora_theme') || 'aurora';
    this.trailStyle = localStorage.getItem('aurora_trail') || 'klasik';
    try { this.cosOwned = JSON.parse(localStorage.getItem('aurora_cos') || '{}'); } catch (e) { this.cosOwned = {}; }
    try { this.stats = JSON.parse(localStorage.getItem('aurora_stats') || '{}'); } catch (e) { this.stats = {}; }
    // kalıcı kozmetikler — ışık renkleri ve iz efektleri
    this.COS = [
      { id: 'th_aurora', type: 'theme', val: 'aurora', name: 'Aurora Yeşili', sym: '✺', hue: 148, price: 0, desc: 'Klasik zümrüt kuzey ışığı — varsayılan rengin.' },
      { id: 'th_ice', type: 'theme', val: 'ice', name: 'Buz Mavisi', sym: '❆', hue: 210, price: 300, desc: 'Işığın buz mavisi tonlarında akar — soğuk ve keskin.' },
      { id: 'th_sunset', type: 'theme', val: 'sunset', name: 'Gün Batımı', sym: '✸', hue: 30, price: 500, desc: 'Sıcak turuncu-amber bir gökyüzü ışıması.' },
      { id: 'th_crimson', type: 'theme', val: 'crimson', name: 'Kızıl Fırtına', sym: '❋', hue: 335, price: 800, desc: 'Tutkulu kızıl-pembe bir aurora — nadir görülür.' },
      { id: 'th_gold', type: 'theme', val: 'gold', name: 'Altın Şafak', sym: '✹', hue: 48, price: 1200, desc: 'Efsanevi altın ışık. Gökyüzünün en zengin rengi.' },
      { id: 'tr_klasik', type: 'trail', val: 'klasik', name: 'Klasik Kurdele', sym: '〜', hue: 148, price: 0, desc: 'Akışkan kuzey ışığı kurdelesi — varsayılan izin.' },
      { id: 'tr_yildiz', type: 'trail', val: 'yildiz', name: 'Yıldız Tozu İzi', sym: '✦', hue: 52, price: 400, desc: 'Arkanda parlayan yıldız tanecikleri bırakırsın.' },
      { id: 'tr_ikiz', type: 'trail', val: 'ikiz', name: 'İkiz Kurdele', sym: '≈', hue: 275, price: 600, desc: 'İzin ikiye ayrılır — altında ikinci, farklı renkte bir kurdele akar.' },
      { id: 'th_turkuaz', type: 'theme', val: 'turkuaz', name: 'Turkuaz Derinlik', sym: '❃', hue: 182, price: 400, desc: 'Derin okyanus turkuazı — dingin ve berrak bir ışıma.' },
      { id: 'th_violet', type: 'theme', val: 'violet', name: 'Menekşe Gecesi', sym: '✤', hue: 275, price: 650, desc: 'Gecenin en gizemli tonu — mor bir aurora perdesi.' },
      { id: 'tr_simsek', type: 'trail', val: 'simsek', name: 'Şimşek İzi', sym: 'ϟ', hue: 195, price: 900, desc: 'İzinin üzerinde çatallanan elektrik kıvılcımları gezinir.' },
      { id: 'tr_buz', type: 'trail', val: 'buz', name: 'Buz Kristali', sym: '❅', hue: 205, price: 500, desc: 'Arkanda süzülerek düşen buz kristalleri bırakırsın.' },
      { id: 'tr_alev', type: 'trail', val: 'alev', name: 'Alev İzi', sym: '✴', hue: 15, price: 700, desc: 'İzinden yukarı doğru kor tanecikleri yükselir.' },
      { id: 'tr_gokkusagi', type: 'trail', val: 'gokkusagi', name: 'Gökkuşağı Kurdele', sym: '∿', hue: 300, price: 1500, desc: 'Efsanevi iz: kurdelen tüm renk tayfında dalgalanarak akar.' }
    ];
    this.ACH = [
      { id: 'merkez10', name: 'Keskin Göz', desc: 'Tek oyunda 10 tam merkez', hue: 150, shape: 'hex', icon: "<circle cx='12' cy='12' r='7'/><circle cx='12' cy='12' r='2.5'/>" },
      { id: 'seri15', name: 'Işık Zinciri', desc: 'Tek seride 15 halka', hue: 190, shape: 'round', icon: "<circle cx='8' cy='12' r='4'/><circle cx='16' cy='12' r='4'/>" },
      { id: 'meteorTemiz', name: 'Yıldız Dansçısı', desc: 'Meteor Yağmurunu hasarsız atlat', hue: 265, shape: 'shield', icon: "<path d='M4 4 L13 13'/><path d='M7 3 L12 8'/><circle cx='16' cy='16' r='3.5'/>" },
      { id: 'puan25k', name: 'Gece Efsanesi', desc: 'Tek oyunda 25.000 puan', hue: 45, shape: 'round', icon: "<path d='M18 14 A8 8 0 1 1 10 4 A6.5 6.5 0 0 0 18 14 Z'/>" },
      { id: 'tur2', name: 'Şafağa Kadar', desc: '6 evre hayatta kal', hue: 25, shape: 'hex', icon: "<path d='M4 17 h16'/><path d='M8 17 a4 4 0 0 1 8 0'/><path d='M12 9 V6'/><path d='M6.5 12 L4.5 10'/><path d='M17.5 12 L19.5 10'/>" },
      { id: 'merkez25', name: 'Lazer Odak', desc: 'Tek oyunda 25 tam merkez vuruşu yap', hue: 0, shape: 'shield', icon: "<circle cx='12' cy='12' r='5.5'/><path d='M12 2.5 V7 M12 17 V21.5 M2.5 12 H7 M17 12 H21.5'/>" },
      { id: 'perfectSeri10', name: 'Kusursuz On', desc: 'Üst üste 10 halkayı tam merkezden geç (araya normal geçiş girmeden)', hue: 320, shape: 'diamond', icon: "<path d='M12 3.5 L19.5 10 L12 20.5 L4.5 10 Z'/><path d='M4.5 10 h15'/>" },
      { id: 'seri30', name: 'Sonsuz Zincir', desc: 'Tek seride hiç kaçırmadan 30 halkadan geç', hue: 175, shape: 'round', icon: "<path d='M7 12 c0 -2.6 3.6 -2.6 5 0 c1.4 2.6 5 2.6 5 0 c0 -2.6 -3.6 -2.6 -5 0 c-1.4 2.6 -5 2.6 -5 0 Z'/>" },
      { id: 'puan100k', name: 'Kutup Tanrısı', desc: 'Tek oyunda 100.000 puana ulaş', hue: 50, shape: 'crown', icon: "<path d='M5 17 L4 8 L9 11.5 L12 5 L15 11.5 L20 8 L19 17 Z'/><path d='M8 20.5 h8'/>" },
      { id: 'tur4', name: 'Ebedi Gece', desc: 'Tek oyunda 12 evre hayatta kal', hue: 230, shape: 'hex', icon: "<path d='M7.5 4 h9 l-4.5 8 l4.5 8 h-9 l4.5 -8 Z'/>" },
      { id: 'firtinaTemiz', name: 'Fırtına Ustası', desc: 'Güneş Fırtınası evresini hiç hasar almadan tamamla', hue: 35, shape: 'shield', icon: "<path d='M13 3 L6 13.5 h4.5 L9 21 L18 10 h-4.5 Z'/>" },
      { id: 'sisTemiz', name: 'Sis Kâhini', desc: 'Buz Sisi evresini hiç hasar almadan tamamla', hue: 205, shape: 'round', icon: "<path d='M3 12 C7.5 5.5 16.5 5.5 21 12'/><circle cx='12' cy='12' r='3'/><path d='M5 17 h5 M14 17 h5 M8 20.5 h8'/>" },
      { id: 'cosku3', name: 'Coşku Bağımlısı', desc: 'Tek oyunda 3 kez Coşku Modunu tetikle (her 10 halkalık seride bir)', hue: 15, shape: 'diamond', icon: "<path d='M12 3.5 C13.5 7.5 17.5 9.5 17.5 14 A5.5 5.5 0 0 1 6.5 14 C6.5 10.5 10.5 8 12 3.5 Z'/>" },
      { id: 'powerHepsi', name: 'Güç Koleksiyoncusu', desc: 'Tek oyunda 3 güç tipini de topla: Mıknatıs, Yavaş Zaman ve Çift Puan', hue: 285, shape: 'hex', icon: "<circle cx='12' cy='7' r='2.5'/><circle cx='7' cy='16.5' r='2.5'/><circle cx='17' cy='16.5' r='2.5'/><path d='M10.5 8.8 L8 14.2 M13.5 8.8 L16 14.2 M9.5 16.5 h5'/>" },
      { id: 'toplam250k', name: 'Işık Koleksiyoncusu', desc: 'Tüm oyunların toplamında 250.000 puana ulaş', hue: 140, shape: 'crown', icon: "<path d='M6.5 4 h11 v3.5 a5.5 5.5 0 0 1 -11 0 Z'/><path d='M12 13 v4.5 M8 20.5 h8'/><path d='M6.5 5.5 H3.5 a3.5 3.5 0 0 0 3.5 4 M17.5 5.5 h3 a3.5 3.5 0 0 1 -3.5 4'/>" },
      { id: 'kilpayi10', name: 'Kıl Payı Ustası', desc: 'Tek oyunda 10 kez tehlikelerin kıl payı yanından sıyrıl', hue: 160, shape: 'diamond', icon: "<path d='M8 4 C4.5 8 4.5 16 8 20'/><path d='M16 4 C19.5 8 19.5 16 16 20'/><circle cx='12' cy='12' r='1.8'/>" },
      { id: 'kapi1', name: 'Şafak Yolcusu', desc: 'Şafak Kapısı\'ndan bir kez geç', hue: 48, shape: 'round', icon: "<path d='M5 20 V12 A7 7 0 0 1 19 12 V20'/><path d='M9 20 V13.5 A3 3 0 0 1 15 13.5 V20'/>" },
      { id: 'kapi3', name: 'Kapı Bekçisi', desc: 'Toplamda 3 kez Şafak Kapısı\'ndan geç', hue: 40, shape: 'crown', icon: "<path d='M5 20 V11 A7 7 0 0 1 19 11 V20'/><path d='M3.5 20 h17'/><circle cx='12' cy='12' r='2'/>" },
      { id: 'puan50k', name: 'Kutup Prensi', desc: 'Tek oyunda 50.000 puana ulaş', hue: 210, shape: 'shield', icon: "<path d='M12 3 L20 6 V12 C20 17 16.5 20 12 21.5 C7.5 20 4 17 4 12 V6 Z'/><path d='M12 8 v6 M9 11 h6'/>" },
      { id: 'seri50', name: 'Işık Efsanesi', desc: 'Tek seride hiç kaçırmadan 50 halkadan geç', hue: 175, shape: 'crown', icon: "<circle cx='7' cy='12' r='3.5'/><circle cx='12' cy='12' r='3.5'/><circle cx='17' cy='12' r='3.5'/>" },
      { id: 'halka1000', name: 'Halka Hakimi', desc: 'Tüm oyunların toplamında 1.000 halkadan geç', hue: 190, shape: 'hex', icon: "<circle cx='9.5' cy='12' r='5.5'/><circle cx='14.5' cy='12' r='5.5'/>" },
      { id: 'kredi5k', name: 'Işık Bankeri', desc: 'Tüm oyunların toplamında 5.000 kredi kazan', hue: 52, shape: 'diamond', icon: "<path d='M12 4 L18.5 10 L12 20 L5.5 10 Z'/><path d='M5.5 10 h13'/>" },
      { id: 'moda', name: 'Gökyüzü Modacısı', desc: 'Mağazadan 3 kozmetik satın al', hue: 300, shape: 'round', icon: "<path d='M12 4 C12 7 9 8 6.5 8 C6.5 12 9 14 12 14 C15 14 17.5 12 17.5 8 C15 8 12 7 12 4 Z'/><path d='M12 14 v6 M8.5 20 h7'/>" }
    ];
    this.lifetimeScore = parseInt(localStorage.getItem('aurora_lifetime') || '0', 10);
    this.credits = parseInt(localStorage.getItem('aurora_credits') || '0', 10);
    try { this.inv = JSON.parse(localStorage.getItem('aurora_inv') || '{}'); } catch (e) { this.inv = {}; }
    try { this.upg = JSON.parse(localStorage.getItem('aurora_upg') || '{}'); } catch (e) { this.upg = {}; }
    // tüm itemler tek oyunluk — bir sonraki oyunda aktifleşir, oyun bitince biter
    this.SHOP = [
      { id: 'revive', name: 'Devam Feneri', sym: '🏮', hue: 35, price: 150, max: 3, desc: 'Işığın söndüğünde otomatik yeniden yanarsın — skorun ve serin korunur, enerjinin yarısıyla devam edersin. Adet başına bir hak.' },
      { id: 'startShield', name: 'Başlangıç Kalkanı', sym: '☾', hue: 210, price: 100, max: 2, desc: 'Oyuna hazır Ay Kalkanı ile başlarsın. 2 alırsan çift kalkanla başlarsın.' },
      { id: 'shardBoost', name: 'Kalkan Çağırıcı', sym: '⛨', hue: 190, price: 120, max: 3, desc: 'O oyun boyunca Ay Kalkanı parçaları adet başına %50 daha sık belirir.' },
      { id: 'powerBoost', name: 'Işık Frekansı', sym: '✧', hue: 275, price: 120, max: 3, desc: 'O oyun boyunca Mıknatıs, Zaman ve Çift Puan güçleri adet başına %40 daha sık belirir.' },
      { id: 'creditBoost', name: 'Kredi Prizması', sym: '◈', hue: 48, price: 140, max: 3, desc: 'O oyun boyunca her ışık zerresi adet başına +1 ek kredi verir.' },
      { id: 'armor', name: 'Kuzey Zırhı', sym: '❆', hue: 160, price: 160, max: 3, desc: 'O oyun boyunca bulut ve meteor hasarı adet başına %15 azalır.' },
      { id: 'scoreBoost', name: 'Yıldız Tozu', sym: '✹', hue: 52, price: 200, max: 3, desc: 'O oyun boyunca halkalardan kazandığın tüm puanlar adet başına %25 artar.' },
      { id: 'ecstasyStart', name: 'Coşku Fitili', sym: '♨', hue: 15, price: 130, max: 2, desc: 'Oyuna Coşku Modu (2x puan) ile başlarsın — adet başına 8 saniye.' },
      { id: 'magnetStart', name: 'Mıknatıs Çekirdeği', sym: '◉', hue: 195, price: 110, max: 2, desc: 'Oyuna aktif Mıknatıs gücüyle başlarsın — adet başına 8 saniye, zerreleri sana çeker.' },
      { id: 'energyBoost', name: 'Enerji İksiri', sym: '✚', hue: 140, price: 150, max: 3, desc: 'O oyun boyunca halkalardan aldığın enerji adet başına %30 artar.' }
    ];
    this.focusAch = localStorage.getItem('aurora_focus') || '';
    try { this.seenEvents = JSON.parse(localStorage.getItem('aurora_seen_events') || '{}'); } catch (e) { this.seenEvents = {}; }
    this.EVENTS = {
      meteor: { name: 'Meteor Yağmuru', icon: '☄', desc: 'Gökten meteorlar düşüyor! Onlara çarparsan enerjin azalır ve serin sıfırlanır. Aralarından süzül — evreyi hiç hasar almadan bitirirsen "Yıldız Dansçısı" madalyası senindir.' },
      storm: { name: 'Güneş Fırtınası', icon: '◉', desc: 'Altın halkalar belirdi — bu evrede her halka 2 kat puan verir! Ama fırtına rüzgarı seni savurur. Riskli ama çok kazançlı.' },
      fog: { name: 'Buz Sisi', icon: '≋', desc: 'Yoğun bir sis halkaları son ana kadar gizliyor. Reflekslerine güven, yaklaşan halkayı son saniyede yakala. Hasarsız bitirirsen "Sis Kâhini" olursun.' },
      wind: { name: 'Kutup Rüzgarı', icon: '⇣', desc: 'Sert bir rüzgar seni sürekli aşağı bastırıyor. Yükselmek için daha uzun basılı tutman gerek — parmağını ekrandan ayırma!' },
      moon: { name: 'Dolunay', icon: '●', desc: 'Dolunay geceyi aydınlatıyor: oyun hızlanır ama halkalar daha sık ve cömert gelir. Seri yapmak için en iyi evre!' },
      comet: { name: 'Kuyruklu Yıldız', icon: '✦', desc: 'Bir kuyruklu yıldız geçiyor — peşinde kıvılcım tanecikleri bırakır. Kıvılcımları toplayarak bonus puan kazan, ama hızlı olmalısın: evre kısa sürer.' },
      finale: { name: 'Şafak Kapısı', icon: '◎', desc: 'Gecenin doruğu! Gökyüzünde dev bir altın kapı beliriyor. İçinden geçmeyi başarırsan büyük bonus puan kazanır ve enerjin tamamen dolar. Kaçırırsan bir sonraki turu beklersin.' }
    };
    this.earned = {};
    try { this.earned = JSON.parse(localStorage.getItem('aurora_ach') || '{}'); } catch (e) {}
    this.history = [];
    try { this.history = JSON.parse(localStorage.getItem('aurora_history') || '[]'); } catch (e) {}
    this.user = null;
    try { this.accounts = JSON.parse(localStorage.getItem('aurora_accounts') || '{}'); } catch (e) { this.accounts = {}; }
    try {
      const u = JSON.parse(localStorage.getItem('aurora_user') || 'null');
      if (u && u.name && u.pass && !this.accounts[u.name.toLowerCase()]) {
        this.accounts[u.name.toLowerCase()] = u;
        localStorage.setItem('aurora_accounts', JSON.stringify(this.accounts));
      }
    } catch (e) {}
    if (Object.keys(this.accounts).length === 0) this.state.authTab = 'register';
    try { this.user = JSON.parse(localStorage.getItem('aurora_user') || 'null'); } catch (e) {}
    this.COUNTRIES = [['Türkiye', '🇹🇷'], ['ABD', '🇺🇸'], ['Afganistan', '🇦🇫'], ['Almanya', '🇩🇪'], ['Andorra', '🇦🇩'], ['Angola', '🇦🇴'], ['Antigua ve Barbuda', '🇦🇬'], ['Arjantin', '🇦🇷'], ['Arnavutluk', '🇦🇱'], ['Avustralya', '🇦🇺'], ['Avusturya', '🇦🇹'], ['Azerbaycan', '🇦🇿'], ['Bahamalar', '🇧🇸'], ['Bahreyn', '🇧🇭'], ['Bangladeş', '🇧🇩'], ['Barbados', '🇧🇧'], ['Belarus', '🇧🇾'], ['Belçika', '🇧🇪'], ['Belize', '🇧🇿'], ['Benin', '🇧🇯'], ['Birleşik Arap Emirlikleri', '🇦🇪'], ['Bolivya', '🇧🇴'], ['Bosna-Hersek', '🇧🇦'], ['Botsvana', '🇧🇼'], ['Brezilya', '🇧🇷'], ['Brunei', '🇧🇳'], ['Bulgaristan', '🇧🇬'], ['Burkina Faso', '🇧🇫'], ['Burundi', '🇧🇮'], ['Butan', '🇧🇹'], ['Cezayir', '🇩🇿'], ['Cibuti', '🇩🇯'], ['Çad', '🇹🇩'], ['Çekya', '🇨🇿'], ['Çin', '🇨🇳'], ['Danimarka', '🇩🇰'], ['Demokratik Kongo', '🇨🇩'], ['Doğu Timor', '🇹🇱'], ['Dominika', '🇩🇲'], ['Dominik Cumhuriyeti', '🇩🇴'], ['Ekvador', '🇪🇨'], ['Ekvator Ginesi', '🇬🇶'], ['El Salvador', '🇸🇻'], ['Endonezya', '🇮🇩'], ['Eritre', '🇪🇷'], ['Ermenistan', '🇦🇲'], ['Estonya', '🇪🇪'], ['Esvatini', '🇸🇿'], ['Etiyopya', '🇪🇹'], ['Fas', '🇲🇦'], ['Fiji', '🇫🇯'], ['Fildişi Sahili', '🇨🇮'], ['Filipinler', '🇵🇭'], ['Filistin', '🇵🇸'], ['Finlandiya', '🇫🇮'], ['Fransa', '🇫🇷'], ['Gabon', '🇬🇦'], ['Gambiya', '🇬🇲'], ['Gana', '🇬🇭'], ['Gine', '🇬🇳'], ['Gine-Bissau', '🇬🇼'], ['Grenada', '🇬🇩'], ['Guatemala', '🇬🇹'], ['Guyana', '🇬🇾'], ['Güney Afrika', '🇿🇦'], ['Güney Kore', '🇰🇷'], ['Güney Sudan', '🇸🇸'], ['Gürcistan', '🇬🇪'], ['Haiti', '🇭🇹'], ['Hırvatistan', '🇭🇷'], ['Hindistan', '🇮🇳'], ['Hollanda', '🇳🇱'], ['Honduras', '🇭🇳'], ['Irak', '🇮🇶'], ['İngiltere', '🇬🇧'], ['İran', '🇮🇷'], ['İrlanda', '🇮🇪'], ['İspanya', '🇪🇸'], ['İsrail', '🇮🇱'], ['İsveç', '🇸🇪'], ['İsviçre', '🇨🇭'], ['İtalya', '🇮🇹'], ['İzlanda', '🇮🇸'], ['Jamaika', '🇯🇲'], ['Japonya', '🇯🇵'], ['Kamboçya', '🇰🇭'], ['Kamerun', '🇨🇲'], ['Kanada', '🇨🇦'], ['Karadağ', '🇲🇪'], ['Katar', '🇶🇦'], ['Kazakistan', '🇰🇿'], ['Kenya', '🇰🇪'], ['Kıbrıs', '🇨🇾'], ['Kırgızistan', '🇰🇬'], ['Kiribati', '🇰🇮'], ['Kolombiya', '🇨🇴'], ['Komorlar', '🇰🇲'], ['Kongo Cumhuriyeti', '🇨🇬'], ['Kosova', '🇽🇰'], ['Kosta Rika', '🇨🇷'], ['Kuveyt', '🇰🇼'], ['Kuzey Kore', '🇰🇵'], ['Kuzey Makedonya', '🇲🇰'], ['Küba', '🇨🇺'], ['Laos', '🇱🇦'], ['Lesotho', '🇱🇸'], ['Letonya', '🇱🇻'], ['Liberya', '🇱🇷'], ['Libya', '🇱🇾'], ['Lihtenştayn', '🇱🇮'], ['Litvanya', '🇱🇹'], ['Lübnan', '🇱🇧'], ['Lüksemburg', '🇱🇺'], ['Macaristan', '🇭🇺'], ['Madagaskar', '🇲🇬'], ['Malavi', '🇲🇼'], ['Maldivler', '🇲🇻'], ['Malezya', '🇲🇾'], ['Mali', '🇲🇱'], ['Malta', '🇲🇹'], ['Marshall Adaları', '🇲🇭'], ['Mauritius', '🇲🇺'], ['Meksika', '🇲🇽'], ['Mısır', '🇪🇬'], ['Mikronezya', '🇫🇲'], ['Moğolistan', '🇲🇳'], ['Moldova', '🇲🇩'], ['Monako', '🇲🇨'], ['Moritanya', '🇲🇷'], ['Mozambik', '🇲🇿'], ['Myanmar', '🇲🇲'], ['Namibya', '🇳🇦'], ['Nauru', '🇳🇷'], ['Nepal', '🇳🇵'], ['Nijer', '🇳🇪'], ['Nijerya', '🇳🇬'], ['Nikaragua', '🇳🇮'], ['Norveç', '🇳🇴'], ['Orta Afrika Cumhuriyeti', '🇨🇫'], ['Özbekistan', '🇺🇿'], ['Pakistan', '🇵🇰'], ['Palau', '🇵🇼'], ['Panama', '🇵🇦'], ['Papua Yeni Gine', '🇵🇬'], ['Paraguay', '🇵🇾'], ['Peru', '🇵🇪'], ['Polonya', '🇵🇱'], ['Portekiz', '🇵🇹'], ['Romanya', '🇷🇴'], ['Ruanda', '🇷🇼'], ['Rusya', '🇷🇺'], ['Saint Kitts ve Nevis', '🇰🇳'], ['Saint Lucia', '🇱🇨'], ['Saint Vincent ve Grenadinler', '🇻🇨'], ['Samoa', '🇼🇸'], ['San Marino', '🇸🇲'], ['Sao Tome ve Principe', '🇸🇹'], ['Senegal', '🇸🇳'], ['Seyşeller', '🇸🇨'], ['Sırbistan', '🇷🇸'], ['Sierra Leone', '🇸🇱'], ['Singapur', '🇸🇬'], ['Slovakya', '🇸🇰'], ['Slovenya', '🇸🇮'], ['Solomon Adaları', '🇸🇧'], ['Somali', '🇸🇴'], ['Sri Lanka', '🇱🇰'], ['Sudan', '🇸🇩'], ['Surinam', '🇸🇷'], ['Suriye', '🇸🇾'], ['Suudi Arabistan', '🇸🇦'], ['Şili', '🇨🇱'], ['Tacikistan', '🇹🇯'], ['Tanzanya', '🇹🇿'], ['Tayland', '🇹🇭'], ['Tayvan', '🇹🇼'], ['Togo', '🇹🇬'], ['Tonga', '🇹🇴'], ['Trinidad ve Tobago', '🇹🇹'], ['Tunus', '🇹🇳'], ['Tuvalu', '🇹🇻'], ['Türkmenistan', '🇹🇲'], ['Uganda', '🇺🇬'], ['Ukrayna', '🇺🇦'], ['Umman', '🇴🇲'], ['Uruguay', '🇺🇾'], ['Ürdün', '🇯🇴'], ['Vanuatu', '🇻🇺'], ['Vatikan', '🇻🇦'], ['Venezuela', '🇻🇪'], ['Vietnam', '🇻🇳'], ['Yemen', '🇾🇪'], ['Yeni Zelanda', '🇳🇿'], ['Yeşil Burun Adaları', '🇨🇻'], ['Yunanistan', '🇬🇷'], ['Zambiya', '🇿🇲'], ['Zimbabve', '🇿🇼']];
    this.WORLD = [['NovaSky', '🇺🇸', 134200], ['Lumi', '🇫🇮', 118400], ['Yuki', '🇯🇵', 96500], ['PolarBjorn', '🇳🇴', 87200], ['AuroraKid', '🇮🇸', 74800], ['Stella', '🇩🇪', 63100], ['KaanX', '🇹🇷', 55900], ['Mira', '🇰🇷', 48200], ['Frost', '🇸🇪', 41000], ['LeoBR', '🇧🇷', 33600], ['ZoeUK', '🇬🇧', 27400], ['Nils', '🇨🇦', 19800], ['Aylin', '🇹🇷', 12500], ['Pierre', '🇫🇷', 8300], ['Eren', '🇹🇷', 4100]];
    this.overAt = 0;
    this.held = false;
    // --- çevrimiçi mod (Firebase yapılandırılmışsa) ---
    this.online = ON.isOnline();
    if (this.online) {
      // çevrimiçi modda hesaplar sunucuda: açılışta oturumu geri yükle
      ON.restoreSession().then((u) => {
        if (u) {
          this.user = u;
          localStorage.setItem('aurora_user', JSON.stringify({ name: u.name, country: u.country, avatar: u.avatar, uid: u.uid }));
          if ((u.best || 0) > this.best) {
            this.best = u.best;
            localStorage.setItem('aurora_flow_best', String(this.best));
          } else if (this.best > (u.best || 0)) {
            ON.submitScore(this.best).then((r) => { if (this.user && r && r.best) this.user.best = r.best; }).catch(() => {});
          }
        } else {
          this.user = null;
          localStorage.removeItem('aurora_user');
        }
        this.forceUpdate();
      }).catch(() => {});
    }
  }
  flagFor(countryName) { const c = this.COUNTRIES.find((x) => x[0] === countryName); return c ? c[1] : '🌍'; }
  // sıralama verilerini sunucudan çek (açık ekran görüntülenirken bir kez)
  loadBoard() {
    if (!this.online || this._boardLoading) return;
    this._boardLoading = true;
    Promise.all([ON.fetchLeaderboard(), ON.fetchCountries()]).then(([rows, cs]) => {
      this.remoteBoard = rows;
      this.remoteCountries = cs;
      this._boardLoading = false;
      this.forceUpdate();
    }).catch(() => { this._boardLoading = false; });
  }

  // ---- durum yönetimi (React yerine hafif eşdeğerler) ----
  setState(patch) { Object.assign(this.state, patch); this.requestUi(); }
  forceUpdate() { this.requestUi(); }
  requestUi() {
    if (this._uiQueued) return;
    this._uiQueued = true;
    queueMicrotask(() => { this._uiQueued = false; if (this.onRender) this.onRender(); });
  }

  // evre dizisi: uzun sakin başlangıç → özel evre → sakin ara → özel evre...
  phaseFor(n) {
    if (n === 0) return { name: 'Sakin Gece', dur: 40, kind: 'calm', hueShift: 0 };
    if (n % 2 === 0) return { name: 'Sakin Gece', dur: 24, kind: 'calm', hueShift: 0 };
    const specials = [
      { name: 'Meteor Yağmuru', dur: 16, kind: 'meteor', hueShift: -40 },
      { name: 'Güneş Fırtınası', dur: 14, kind: 'storm', hueShift: 60 },
      { name: 'Buz Sisi', dur: 16, kind: 'fog', hueShift: 30 },
      { name: 'Kutup Rüzgarı', dur: 14, kind: 'wind', hueShift: -20 },
      { name: 'Dolunay', dur: 16, kind: 'moon', hueShift: 15 },
      { name: 'Kuyruklu Yıldız', dur: 12, kind: 'comet', hueShift: 45 }
    ];
    const idx = Math.floor((n - 1) / 2) % 7;
    if (idx === 6) return { name: 'Şafak Kapısı', dur: 16, kind: 'finale', hueShift: 55 };
    return specials[idx];
  }
  // oyun yatay (landscape) oynanır — webdeki akışın aynısı
  playerX() { return this.W * 0.28; }
  viewScale() { return 1; }
  themeHue() { const t = this.THEMES.find((x) => x.id === this.theme); return t ? t.hue : 148; }
  userFlag() { const c = this.COUNTRIES.find((x) => x[0] === (this.user && this.user.country)); return c ? c[1] : '🌍'; }
  buildLeaderboard(full) {
    let rows;
    if (this.online) {
      // canlı veriler (ilk 100); oyuncu listede yoksa kendi satırı sona eklenir
      rows = (this.remoteBoard || []).map((r) => ({ name: r.name, flag: this.flagFor(r.country), s: r.s, me: !!(this.user && this.user.uid && r.uid === this.user.uid) }));
      const mine = this.user ? Math.max(this.best, this.user.best || 0) : 0;
      if (this.user && mine > 0 && !rows.some((r) => r.me)) rows.push({ name: this.user.name, flag: this.userFlag(), s: mine, me: true });
    } else {
      rows = this.WORLD.map((w) => ({ name: w[0], flag: w[1], s: w[2], me: false }));
      if (this.user) rows.push({ name: this.user.name, flag: this.userFlag(), s: this.best, me: true });
    }
    rows.sort((a, b) => b.s - a.s);
    const out = [];
    rows.forEach((r, i) => {
      if (full || i < 10 || r.me) out.push({ rank: '#' + (i + 1), name: r.name, flag: r.flag, s: r.s.toLocaleString('tr-TR'), bg: r.me ? 'rgba(111,215,168,0.15)' : 'transparent', color: r.me ? '#8ef5c8' : '#c4d2ea' });
    });
    return out;
  }
  buildCountryBoard() {
    if (this.online) {
      const myC = this.user ? this.user.country : null;
      return (this.remoteCountries || []).map((c, i) => {
        const ctry = this.COUNTRIES.find((x) => x[0] === c.country);
        const me = myC === c.country;
        return { rank: '#' + (i + 1), flag: ctry ? ctry[1] : '🌍', name: (ctry ? ctry[0] : c.country) + ' · ' + c.n + ' ' + this.t('playersWord'), s: c.top.toLocaleString('tr-TR'), bg: me ? 'rgba(111,215,168,0.15)' : 'transparent', color: me ? '#8ef5c8' : '#c4d2ea' };
      });
    }
    const by = {};
    const add = (flag, name, sc) => {
      if (!by[flag]) by[flag] = { flag, top: 0, topName: '', n: 0 };
      const c = by[flag]; c.n += 1;
      if (sc > c.top) { c.top = sc; c.topName = name; }
    };
    for (const w of this.WORLD) add(w[1], w[0], w[2]);
    const myFlag = this.user ? this.userFlag() : null;
    if (this.user) add(myFlag, this.user.name, this.best);
    return Object.values(by).sort((a, b) => b.top - a.top).map((c, i) => {
      const ctry = this.COUNTRIES.find((x) => x[1] === c.flag);
      const me = c.flag === myFlag;
      return { rank: '#' + (i + 1), flag: c.flag, name: (ctry ? ctry[0] : this.t('otherCountry')) + ' · ' + c.n + ' ' + this.t('playersWord'), s: c.top.toLocaleString('tr-TR'), bg: me ? 'rgba(111,215,168,0.15)' : 'transparent', color: me ? '#8ef5c8' : '#c4d2ea' };
    });
  }
  myWorldRank() {
    if (this.online) {
      if (!this.user) return null;
      const mine = Math.max(this.best, this.user.best || 0);
      if (!mine) return null;
      const higher = (this.remoteBoard || []).filter((r) => r.s > mine && r.uid !== this.user.uid).length;
      return higher + 1;
    }
    const rows = this.WORLD.map((w) => w[2]);
    if (this.user) rows.push(this.best); rows.sort((a, b) => b - a);
    return this.user ? rows.indexOf(this.best) + 1 : null;
  }
  vibrate(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  award(id) {
    if (this.earned[id]) return;
    this.earned[id] = 1;
    localStorage.setItem('aurora_ach', JSON.stringify(this.earned));
    const a = this.ACH.find((x) => x.id === id);
    if (a && this.g) { this.floatText(this.playerX(), (this.g.y || 200) - 100, this.t('achFloat') + this.tn('ach', id), '#ffe9a3'); this.sfxShard(); }
  }
  // ---- i18n ----
  li() { const i = ['tr', 'en', 'no', 'fr', 'es', 'it'].indexOf(this.lang); return i < 0 ? 0 : i; }
  t(k) { const a = this.I18 && this.I18.S[k]; return a ? (a[this.li()] || a[0]) : k; }
  tf(k, n) { return this.t(k).replace('{n}', n); }
  tn(sec, id) { const e = this.I18 && this.I18.D[sec] && this.I18.D[sec][id]; return e ? (e.n[this.li()] || e.n[0]) : id; }
  td(sec, id) { const e = this.I18 && this.I18.D[sec] && this.I18.D[sec][id]; return e ? (e.d[this.li()] || e.d[0]) : ''; }
  phName(kind) { const a = this.I18 && this.I18.D.phases[kind]; return a ? (a[this.li()] || a[0]) : kind; }
  rankNameAt(i) { const a = this.I18 && this.I18.D.ranks[i]; return a ? (a[this.li()] || a[0]) : (this.RANKS[i] ? this.RANKS[i].name : ''); }
  buildL() {
    if (!this.I18) { this.I18 = window.POLARA_I18N || null; if (!this.I18) return {}; }
    if (this._Llang !== this.lang) {
      const o = {}, S = this.I18.S;
      for (const k in S) o[k] = S[k][this.li()] || S[k][0];
      this._Llang = this.lang; this._L = o;
    }
    return this._L;
  }
  setLang(id) { this.lang = id; localStorage.setItem('aurora_lang', id); this._Llang = null; try { document.documentElement.lang = id; } catch (e) {} this.forceUpdate(); }
  rankFor(s) { let r = this.RANKS[0]; for (const k of this.RANKS) if (s >= k.min) r = k; return r; }
  // mobilde oyuna girerken tam ekran + yatay kilit dene (desteklenmeyen tarayıcıda sessizce geçer)
  goMobileFullscreen() {
    try {
      if (!('ontouchstart' in window)) return;
      const el = document.documentElement;
      const lock = () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} };
      if (!document.fullscreenElement && el.requestFullscreen) { const p = el.requestFullscreen({ navigationUI: 'hide' }); if (p && p.then) { p.then(lock).catch(() => {}); } else { lock(); } }
      else { lock(); }
    } catch (e) {}
  }
  nextRank(s) { for (const k of this.RANKS) if (s < k.min) return k; return null; }

  // çizim döngüsü ölürse yeniden başlatan bekçi
  ensureLoop() {
    if (this.watchdog) return;
    this.watchdog = setInterval(() => {
      const cv = document.getElementById('cv');
      if (cv && cv !== this.canvas) { this.canvas = null; this.ctx = null; this.mountTries = 0; this.unmounted = false; this.tryMountCanvas(); return; }
      if (!this.ctx) { this.mountTries = 0; this.unmounted = false; this.tryMountCanvas(); return; }
      if (performance.now() - (this.lastFrameAt || 0) > 600) {
        this.unmounted = false;
        this.last = performance.now();
        this.scheduleFrame();
      }
    }, 700);
  }

  renderVals() {
    this.ensureLoop();
    const s = this.state, best = this.best;
    const rank = this.rankFor(best), nxt = this.nextRank(best);
    const prog = nxt ? Math.min(1, (best - rank.min) / (nxt.min - rank.min)) : 1;
    return {
      L: this.buildL(),
      langOpen: !!s.langOpen,
      onToggleLang: (e) => { e.stopPropagation(); this.setState({ langOpen: !this.state.langOpen }); },
      curLangFlag: (() => { const c = (this.I18 ? this.I18.LANGS : []).find((x) => x.id === this.lang); return c ? c.flag : '🌐'; })(),
      curLangLabel: (() => { const c = (this.I18 ? this.I18.LANGS : []).find((x) => x.id === this.lang); return c ? c.label : 'Dil'; })(),
      curLangCode: (this.lang || 'tr').toUpperCase(),
      langCaretRot: s.langOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      langBtnBorder: s.langOpen ? 'rgba(142,245,200,0.55)' : 'rgba(124,141,176,0.35)',
      langBtnGlow: s.langOpen ? '0 0 26px rgba(111,215,168,0.25)' : '0 4px 18px rgba(0,0,0,0.4)',
      langList: (this.I18 ? this.I18.LANGS : []).map((lg) => ({
        flag: lg.flag, label: lg.label,
        check: this.lang === lg.id ? '✓' : '',
        flagRing: this.lang === lg.id ? 'rgba(142,245,200,0.55)' : 'rgba(124,141,176,0.25)',
        bg: this.lang === lg.id ? 'rgba(142,245,200,0.1)' : 'transparent',
        color: this.lang === lg.id ? '#8ef5c8' : '#c4d2ea',
        onPick: (e) => { e.stopPropagation(); this.setLang(lg.id); this.setState({ langOpen: false }); }
      })),
      showPlayHud: s.phase === 'playing' && !s.paused,
      showPaused: s.phase === 'playing' && !!s.paused,
      pauseScoreLabel: ((this.g && this.g.score) || 0).toLocaleString('tr-TR'),
      phaseNameLabel: this.g ? this.phName(this.phaseFor(this.g.phase).kind) + (this.g.phase >= 12 ? ' · ' + this.t('turWord') + ' ' + (Math.floor(this.g.phase / 12) + 1) : '') : '',
      onPause: () => { this.held = false; if (this.ac) { try { this.ac.suspend(); } catch (e) {} } this.setState({ paused: true }); },
      onResume: () => { if (this.ac) { try { this.ac.resume(); } catch (e) {} } this.held = false; this.last = performance.now(); this.setState({ paused: false }); },
      onQuitRun: () => { if (this.ac) { try { this.ac.resume(); } catch (e) {} } this.held = false; this.setState({ paused: false }); this.endGame(); },
      showSplash: s.phase === 'splash',
      onSplashTap: () => { this.ensureAudio(); this.setState({ phase: this.user ? 'menu' : 'register' }); },
      showRegister: s.phase === 'register',
      showProfile: s.phase === 'profile',
      regName: s.regName, regPass: s.regPass, regCountry: s.regCountry, regError: s.regError,
      hasRegError: !!s.regError,
      onRegName: (e) => { this.state.regName = e.target.value; },
      onRegPass: (e) => { this.state.regPass = e.target.value; },
      onRegCountry: (e) => { this.state.regCountry = e.target.value; },
      countriesList: this.COUNTRIES.map((c) => ({ label: c[1] + ' ' + c[0], value: c[0] })),
      authTitle: s.authTab === 'login' ? this.t('welcomeBack') : this.t('regTitle'),
      authSub: s.authTab === 'login' ? this.t('loginSub') : this.t('regSub'),
      authSubmitLabel: s.authBusy ? this.t('loadingW') : (s.authTab === 'login' ? this.t('login') : this.t('signupBtn')),
      isRegisterTab: s.authTab === 'register',
      loginTabBg: s.authTab === 'login' ? 'linear-gradient(135deg, #6fd7a8, #4fb3c9)' : 'transparent',
      loginTabColor: s.authTab === 'login' ? '#04121a' : '#9fb0d0',
      regTabBg: s.authTab === 'register' ? 'linear-gradient(135deg, #6fd7a8, #4fb3c9)' : 'transparent',
      regTabColor: s.authTab === 'register' ? '#04121a' : '#9fb0d0',
      onTabLogin: () => this.setState({ authTab: 'login', regError: '' }),
      onTabRegister: () => this.setState({ authTab: 'register', regError: '' }),
      onAuthSubmit: () => {
        const n = (this.state.regName || '').trim();
        const p = this.state.regPass || '';
        if (this.online) {
          if (this.state.authBusy) return;
          if (this.state.authTab === 'register') {
            if (n.length < 3) { this.setState({ regError: this.t('errShortName') }); return; }
            if (!ON.USERNAME_RE.test(n)) { this.setState({ regError: this.t('errUserFormat') }); return; }
            if (p.length < 6) { this.setState({ regError: this.t('errShortPass') }); return; }
          } else if (!n || !p) { this.setState({ regError: this.t('errNoUser') }); return; }
          this.setState({ authBusy: true, regError: '' });
          const done = (u) => {
            this.user = u;
            localStorage.setItem('aurora_user', JSON.stringify({ name: u.name, country: u.country, avatar: u.avatar, uid: u.uid }));
            if ((u.best || 0) > this.best) {
              this.best = u.best;
              localStorage.setItem('aurora_flow_best', String(this.best));
            } else if (this.best > (u.best || 0)) {
              ON.submitScore(this.best).then((r) => { if (this.user && r && r.best) this.user.best = r.best; }).catch(() => {});
            }
            this.saveBackup();
            this.setState({ phase: 'menu', regError: '', regPass: '', authBusy: false });
          };
          const fail = (e) => this.setState({ regError: this.t((e && e.key) || 'errNet'), authBusy: false });
          if (this.state.authTab === 'login') ON.login(n, p).then(done, fail);
          else ON.register(n, p, this.state.regCountry, this.state.regAvatar).then(done, fail);
          return;
        }
        if (this.state.authTab === 'login') {
          const acc = this.accounts[n.toLowerCase()];
          if (!acc) { this.setState({ regError: this.t('errNoUser') }); return; }
          if (acc.pass !== p) { this.setState({ regError: this.t('errBadPass') }); return; }
          this.user = { name: acc.name, pass: acc.pass, country: acc.country, avatar: acc.avatar || 0 };
        } else {
          if (n.length < 3) { this.setState({ regError: this.t('errShortName') }); return; }
          if (p.length < 4) { this.setState({ regError: this.t('errShortPass') }); return; }
          if (this.accounts[n.toLowerCase()]) { this.setState({ regError: this.t('errTaken') }); return; }
          this.user = { name: n, pass: p, country: this.state.regCountry, avatar: this.state.regAvatar };
          this.accounts[n.toLowerCase()] = this.user;
          localStorage.setItem('aurora_accounts', JSON.stringify(this.accounts));
        }
        localStorage.setItem('aurora_user', JSON.stringify(this.user));
        this.setState({ phase: 'menu', regError: '', regPass: '' });
      },
      onSkipReg: () => this.setState({ phase: 'menu', regError: '' }),
      onOpenProfile: () => { if (this.user) this.loadBoard(); this.setState({ phase: this.user ? 'profile' : 'register' }); },
      onCloseProfile: () => this.setState({ phase: 'menu' }),
      onCloseProfileDown: (e) => { e.stopPropagation(); e.preventDefault(); this.setState({ phase: 'menu' }); },
      onLogout: () => { if (this.online) ON.logout(); this.user = null; localStorage.removeItem('aurora_user'); this.setState({ phase: 'register', authTab: 'login', regName: '', regPass: '', regError: '' }); },
      showDelete: this.online && !!this.user && !!this.user.uid,
      onDeleteAccount: () => {
        if (!window.confirm(this.t('delConfirm'))) return;
        ON.deleteAccount().then(() => {
          this.user = null;
          localStorage.removeItem('aurora_user');
          this.setState({ phase: 'register', authTab: 'register', regName: '', regPass: '', regError: '' });
        }).catch(() => { window.alert(this.t('errNet')); });
      },
      hasUser: !!this.user,
      userChip: this.user ? this.userFlag() + ' ' + this.user.name : this.t('registerCta'),
      userName: this.user ? this.user.name : '',
      userAvatarBg: this.AVATARS[(this.user && this.user.avatar) || 0].bg,
      regAvatarName: this.AVATARS[s.regAvatar].name,
      avatarList: this.AVATARS.map((av) => ({
        bg: av.bg, name: av.name,
        border: s.regAvatar === av.id ? '#ffe9a3' : 'rgba(159,176,208,0.25)',
        glow: s.regAvatar === av.id ? '0 0 16px rgba(255,233,163,0.55)' : 'none',
        scale: s.regAvatar === av.id ? 1.1 : 1,
        nameColor: s.regAvatar === av.id ? '#ffe9a3' : '#5b6b8c',
        onPick: () => this.setState({ regAvatar: av.id })
      })),
      userInitial: this.user ? this.user.name.charAt(0).toUpperCase() : '',
      userFlagV: this.user ? this.userFlag() : '',
      userCountry: this.user ? this.user.country : '',
      gamesCount: String(this.history.length),
      avgScore: this.history.length ? Math.round(this.history.reduce((a, h) => a + (h.s || 0), 0) / this.history.length).toLocaleString('tr-TR') : '0',
      totalScore: this.history.reduce((a, h) => a + (h.s || 0), 0).toLocaleString('tr-TR'),
      profileHistory: this.history.map((h, i) => ({ idx: i + 1, s: (h.s || 0).toLocaleString('tr-TR'), tag: '' })),
      leaderboardList: this.buildLeaderboard(),
      showBoard: !!s.showBoard,
      showShop: !!s.showShop,
      onOpenShop: () => { this.ensureAudio(); this.setState({ showShop: true }); },
      onCloseShop: () => this.setState({ showShop: false }),
      creditsLabel: this.credits.toLocaleString('tr-TR'),
      runCreditsLabel: '+' + (s.runCredits || 0).toLocaleString('tr-TR'),
      shopList: this.SHOP.map((it) => {
        const owned = this.inv[it.id] || 0;
        const maxed = owned >= it.max;
        const price = it.price;
        const afford = this.credits >= price;
        const H = it.hue;
        return {
          name: this.tn('shop', it.id), sym: it.sym, desc: this.td('shop', it.id),
          symBg: 'radial-gradient(circle at 35% 28%, hsl(' + H + ',80%,72%), hsl(' + H + ',60%,42%) 60%, hsl(' + H + ',70%,20%))',
          symGlow: '0 0 16px hsla(' + H + ',80%,60%,0.4)',
          statusLabel: this.t('nextRun') + ': ' + owned + ' / ' + it.max,
          statusColor: owned > 0 ? 'hsl(' + H + ',75%,72%)' : '#5b6b8c',
          pips: Array.from({ length: it.max }, (_, i) => ({ bg: i < owned ? 'hsl(' + H + ',80%,62%)' : 'rgba(124,141,176,0.2)' })),
          btnLabel: maxed ? this.t('bagFull') : '✦ ' + price.toLocaleString('tr-TR'),
          btnBg: maxed ? 'rgba(124,141,176,0.12)' : afford ? 'linear-gradient(135deg, #ffe9a3, #d9a94f)' : 'rgba(255,233,163,0.08)',
          btnColor: maxed ? '#5b6b8c' : afford ? '#3a2c07' : 'rgba(255,233,163,0.4)',
          btnBorder: maxed ? '1px solid rgba(124,141,176,0.2)' : afford ? 'none' : '1px solid rgba(255,233,163,0.2)',
          btnCursor: maxed || !afford ? 'default' : 'pointer',
          onBuy: () => {
            const o = this.inv[it.id] || 0;
            if (o >= it.max || this.credits < it.price) return;
            this.credits -= it.price;
            this.inv[it.id] = o + 1;
            this.saveEconomy();
            this.sfxShard();
            this.forceUpdate();
          }
        };
      }),
      cosList: this.COS.map((c) => {
        const owned = c.price === 0 || !!this.cosOwned[c.id];
        const inUse = c.type === 'theme' ? this.theme === c.val : this.trailStyle === c.val;
        const afford = this.credits >= c.price;
        const H = c.hue;
        return {
          name: this.tn('cos', c.id), sym: c.sym, desc: this.td('cos', c.id),
          symBg: 'radial-gradient(circle at 35% 28%, hsl(' + H + ',80%,72%), hsl(' + H + ',60%,42%) 60%, hsl(' + H + ',70%,20%))',
          symGlow: '0 0 16px hsla(' + H + ',80%,60%,0.4)',
          cardBorder: inUse ? 'hsla(' + H + ',80%,70%,0.55)' : 'rgba(124,141,176,0.18)',
          statusLabel: c.type === 'theme' ? this.t('lightColor') : this.t('trailFx'),
          statusColor: inUse ? 'hsl(' + H + ',75%,72%)' : '#5b6b8c',
          btnLabel: inUse ? this.t('inUse') : owned ? this.t('useIt') : '✦ ' + c.price.toLocaleString('tr-TR'),
          btnBg: inUse ? 'rgba(142,245,200,0.12)' : owned ? 'rgba(165,200,255,0.12)' : afford ? 'linear-gradient(135deg, #ffe9a3, #d9a94f)' : 'rgba(255,233,163,0.08)',
          btnColor: inUse ? '#8ef5c8' : owned ? '#a5c8ff' : afford ? '#3a2c07' : 'rgba(255,233,163,0.4)',
          btnBorder: inUse ? '1px solid rgba(142,245,200,0.4)' : owned ? '1px solid rgba(165,200,255,0.35)' : afford ? 'none' : '1px solid rgba(255,233,163,0.2)',
          onTap: () => {
            const own = c.price === 0 || this.cosOwned[c.id];
            if (!own) {
              if (this.credits < c.price) return;
              this.credits -= c.price;
              this.cosOwned[c.id] = 1;
              localStorage.setItem('aurora_cos', JSON.stringify(this.cosOwned));
              this.saveEconomy();
              this.sfxShard(); this.vibrate(30);
              if (Object.keys(this.cosOwned).length >= 3) this.award('moda');
            }
            if (c.type === 'theme') { this.theme = c.val; localStorage.setItem('aurora_theme', c.val); }
            else { this.trailStyle = c.val; localStorage.setItem('aurora_trail', c.val); }
            this.forceUpdate();
          }
        };
      }),
      statsList: (() => {
        const st = this.stats || {};
        const F = (n) => (n || 0).toLocaleString('tr-TR');
        return [
          { label: this.t('stRings'), val: F(st.rings), color: '#4fd0e0' },
          { label: this.t('stPerfect'), val: F(st.perfects), color: '#c9a5ff' },
          { label: this.t('stStreak'), val: F(st.bestStreak), color: '#8ef5c8' },
          { label: this.t('stNear'), val: F(st.near), color: '#ffb38a' },
          { label: this.t('stCredits'), val: F(st.credits), color: '#ffe9a3' },
          { label: this.t('stPhase'), val: F(st.maxPhase), color: '#a5c8ff' },
          { label: this.t('stSky'), val: Math.round((st.time || 0) / 60) + ' ' + this.t('minShort'), color: '#f2f6ff' }
        ];
      })(),
      showChase: s.phase === 'over' && !s.isRecord && best > 0,
      chasePct: Math.min(100, Math.round(s.score / Math.max(1, best) * 100)) + '%',
      chaseRemain: this.tf('toRecord', Math.max(0, best - s.score).toLocaleString('tr-TR')),
      onOpenBoard: () => { this.loadBoard(); this.setState({ showBoard: true }); },
      boardNote: this.online ? (this.remoteBoard ? this.t('liveNote') : this.t('loadingW')) : this.t('demoNote'),
      onCloseBoard: () => this.setState({ showBoard: false }),
      onBoardTabWorld: () => this.setState({ boardTab: 'world' }),
      onBoardTabCountry: () => this.setState({ boardTab: 'country' }),
      boardTabWorldBg: s.boardTab !== 'country' ? 'linear-gradient(135deg, #6fd7a8, #4fb3c9)' : 'transparent',
      boardTabWorldColor: s.boardTab !== 'country' ? '#04121a' : '#9fb0d0',
      boardTabCountryBg: s.boardTab === 'country' ? 'linear-gradient(135deg, #6fd7a8, #4fb3c9)' : 'transparent',
      boardTabCountryColor: s.boardTab === 'country' ? '#04121a' : '#9fb0d0',
      boardList: s.showBoard ? (s.boardTab === 'country' ? this.buildCountryBoard() : this.buildLeaderboard(true)) : [],
      myRankLabel: (() => { const r = this.myWorldRank(); return r ? '#' + r : '—'; })(),
      myBoardScore: best.toLocaleString('tr-TR'),
      myBoardName: this.user ? this.user.name : this.t('guest'),
      myBoardFlag: this.user ? this.userFlag() : '🌍',
      achChips: this.ACH.map((a) => {
        const got = !!this.earned[a.id], sel = s.achOpen === a.id, H = a.hue;
        const stroke = got ? '#ffffff' : 'rgba(140,155,190,0.55)';
        const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='" + stroke + "' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>" + a.icon + "</svg>";
        const radius = { round: '50%', hex: '26%', diamond: '18%', shield: '50% 50% 50% 50% / 40% 40% 60% 60%', crown: '30% 30% 50% 50%' }[a.shape] || '50%';
        const rot = a.shape === 'diamond' ? 'rotate(45deg)' : 'none';
        return {
          name: this.tn('ach', a.id),
          iconBg: "url('data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, '%27') + "') center / contain no-repeat",
          medalRadius: radius, medalRot: rot, iconRot: rot === 'none' ? 'none' : 'rotate(-45deg)',
          border: sel ? 'hsla(' + H + ',80%,75%,0.7)' : got ? 'hsla(' + H + ',60%,65%,0.3)' : 'rgba(124,141,176,0.18)',
          bg: sel ? 'hsla(' + H + ',70%,60%,0.12)' : got ? 'hsla(' + H + ',60%,55%,0.06)' : 'rgba(10,16,34,0.45)',
          medalBg: got ? 'radial-gradient(circle at 35% 28%, hsl(' + H + ',85%,82%), hsl(' + H + ',65%,52%) 55%, hsl(' + H + ',75%,24%))' : 'rgba(124,141,176,0.08)',
          medalBorder: got ? 'hsl(' + H + ',85%,72%)' : 'rgba(124,141,176,0.3)',
          glow: got ? '0 0 14px hsla(' + H + ',85%,65%,0.5)' : 'none',
          nameColor: sel ? 'hsl(' + H + ',85%,80%)' : got ? '#d9e6f4' : '#5b6b8c',
          onTap: () => this.setState({ achOpen: this.state.achOpen === a.id ? '' : a.id })
        };
      }),
      achEarnedCount: this.ACH.filter((a) => this.earned[a.id]).length + ' / ' + this.ACH.length,
      achProgress: Math.round(this.ACH.filter((a) => this.earned[a.id]).length / this.ACH.length * 100) + '%',
      hasAchDetailNot: !s.achOpen,
      hasAchDetail: !!s.achOpen,
      showFocusBtn: !!s.achOpen && !this.earned[s.achOpen],
      isFocusedAch: !!s.achOpen && this.focusAch === s.achOpen && !this.earned[s.achOpen],
      focusBtnLabel: this.focusAch === s.achOpen ? this.t('focusOff') : this.t('focusOn'),
      focusBtnBorder: this.focusAch === s.achOpen ? 'rgba(142,245,200,0.5)' : 'rgba(255,233,163,0.45)',
      focusBtnBg: this.focusAch === s.achOpen ? 'rgba(142,245,200,0.12)' : 'rgba(255,233,163,0.1)',
      focusBtnColor: this.focusAch === s.achOpen ? '#8ef5c8' : '#ffe9a3',
      onFocusAch: () => {
        this.focusAch = this.focusAch === this.state.achOpen ? '' : this.state.achOpen;
        localStorage.setItem('aurora_focus', this.focusAch);
        this.forceUpdate();
      },
      achDetailName: s.achOpen ? this.tn('ach', s.achOpen) : '',
      achDetailDesc: s.achOpen ? this.td('ach', s.achOpen) : '',
      achDetailStatus: s.achOpen ? (this.earned[s.achOpen] ? this.t('earnedL') : this.t('notEarned')) : '',
      showMenu: s.phase === 'menu',
      showOver: s.phase === 'over',
      isRecord: s.isRecord,
      scoreLabel: s.score.toLocaleString('tr-TR'),
      bestLabel: best.toLocaleString('tr-TR'),
      maxStreakLabel: String(s.maxStreak),
      perfectLabel: String(s.perfects),
      rankName: this.rankNameAt(this.RANKS.indexOf(rank)),
      nextRankLabel: nxt ? this.rankNameAt(this.RANKS.indexOf(nxt)) + ' · ' + nxt.min.toLocaleString('tr-TR') : this.t('summit'),
      rankProgress: Math.round(prog * 100) + '%',
      rankFloorLabel: rank.min.toLocaleString('tr-TR'),
      rankRemainLabel: nxt ? this.tf('toNextRank', (nxt.min - best).toLocaleString('tr-TR')) : this.t('topRank'),
      onToggleRanks: () => this.setState({ showRanksChart: !this.state.showRanksChart }),
      ranksToggleLabel: s.showRanksChart ? this.t('hide') : this.t('allRanks'),
      showRanksChart: !!s.showRanksChart,
      rankChart: this.RANKS.map((r, i) => {
        const cur = r.min === rank.min, got = best >= r.min;
        const hue = 150 - (i / (this.RANKS.length - 1)) * 130; // yeşilden altına
        return {
          name: this.rankNameAt(i), num: String(i + 1), star: cur ? '✦' : '',
          minLabel: r.min === 0 ? '0' : (r.min >= 1000000 ? (r.min / 1000000).toLocaleString('tr-TR') + 'M' : (r.min / 1000) + 'k'),
          h: Math.round(28 + (i / (this.RANKS.length - 1)) * 118) + 'px',
          bg: cur ? 'linear-gradient(180deg, #ffe9a3, #c9a544)' : got ? 'linear-gradient(180deg, hsl(' + hue + ',65%,62%), hsl(' + hue + ',55%,30%))' : 'linear-gradient(180deg, rgba(124,141,176,0.2), rgba(124,141,176,0.06))',
          border: cur ? 'rgba(255,233,163,0.8)' : got ? 'hsla(' + hue + ',70%,70%,0.5)' : 'rgba(124,141,176,0.2)',
          glow: cur ? '0 0 20px rgba(255,233,163,0.55)' : got ? '0 0 10px hsla(' + hue + ',70%,60%,0.25)' : 'none',
          nameColor: cur ? '#ffe9a3' : got ? '#d9f4e6' : '#5b6b8c',
          minColor: cur ? '#ffe9a3' : got ? '#8ef5c8' : '#5b6b8c',
          numColor: cur ? '#5c4a10' : got ? 'rgba(255,255,255,0.75)' : 'rgba(124,141,176,0.5)'
        };
      }),
      showHelp: s.showHelp,
      showRotate: (this.W || 2) < (this.H || 1),
      ranksList: this.RANKS.map((r, i) => ({ name: this.rankNameAt(i), minLabel: r.min === 0 ? this.t('startWord') : r.min.toLocaleString('tr-TR') + this.t('ptsSuffix'), idx: i + 1, check: this.best >= r.min ? '✓' : '' })),
      hasHistory: this.history.length > 0,
      historyList: this.history.slice(0, 5).map((h) => ({ s: (h.s || 0).toLocaleString('tr-TR') })),
      achList: this.ACH.map((a) => ({ name: this.tn('ach', a.id), desc: this.td('ach', a.id), check: this.earned[a.id] ? '✓' : '○' })),
      onPlay: () => {
        this.ensureAudio(); this.goMobileFullscreen();
        if (!localStorage.getItem('aurora_tut')) { this.setState({ showHelp: false, showTut: true }); return; }
        this.setState({ showHelp: false });
        this.startGame();
      },
      showTut: !!s.showTut,
      showPrivacy: !!s.showPrivacy,
      onOpenPrivacy: () => this.setState({ showPrivacy: true }),
      onClosePrivacy: () => this.setState({ showPrivacy: false }),
      showAbout: !!s.showAbout,
      onOpenAbout: () => this.setState({ showAbout: true }),
      onCloseAbout: () => this.setState({ showAbout: false }),
      privacySections: [1, 2, 3, 4, 5, 6, 7].map((i) => ({ h: this.t('privH' + i), b: this.t('privB' + i) })),
      onTutGo: () => { localStorage.setItem('aurora_tut', '1'); this.saveBackup(); this.setState({ showTut: false }); this.startGame(); },
      onMenu: () => this.setState({ phase: 'menu' }),
      showEventPopup: !!s.eventPopup,
      eventName: s.eventPopup ? this.tn('ev', s.eventPopup) : '',
      eventIcon: s.eventPopup ? this.EVENTS[s.eventPopup].icon : '',
      eventDesc: s.eventPopup ? this.td('ev', s.eventPopup) : '',
      onCloseEvent: (e) => { e.stopPropagation(); this.last = performance.now(); this.setState({ eventPopup: '' }); },
      onHelp: () => this.setState({ showHelp: true }),
      onCloseHelp: () => this.setState({ showHelp: false })
    };
  }

  mount() {
    this.mountTries = 0;
    this.tryMountCanvas();
    this.ensureLoop();
    // çevrimdışı destek — service worker (desteklenmeyen ortamda sessizce geçer)
    try { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {}); } catch (e) {}
  }
  tryMountCanvas() {
    const cv = document.getElementById('cv');
    if (!cv) { if (this.mountTries++ < 60) setTimeout(() => this.tryMountCanvas(), 50); return; }
    this.canvas = cv;
    this.ctx = cv.getContext('2d', { alpha: false, desynchronized: true }) || cv.getContext('2d');
    if (this.ctx && !this.ctx.roundRect) {
      // eski WebView'ler için küçük roundRect yedeği
      this.ctx.roundRect = function (x, y, w, h, r) {
        const rr = Math.min(r, w / 2, h / 2);
        this.moveTo(x + rr, y);
        this.arcTo(x + w, y, x + w, y + h, rr);
        this.arcTo(x + w, y + h, x, y + h, rr);
        this.arcTo(x, y + h, x, y, rr);
        this.arcTo(x, y, x + w, y, rr);
        this.closePath();
      };
    }
    this.resize = () => {
      // mobilde 1.5x yeterli keskinlikte; 2x'e göre doldurulacak piksel ~%45 azalır
      const dprCap = ('ontouchstart' in window) ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      // dar ekranlarda kamera uzaklaşır: mantıksal dünya webdeki genişlikte kalır,
      // böylece mobilde de aynı anda birden çok halka görünür
      const zoom = Math.max(0.38, Math.min(1, window.innerWidth / 1900));
      this.zoom = zoom;
      this.W = window.innerWidth / zoom; this.H = window.innerHeight / zoom;
      cv.width = window.innerWidth * dpr; cv.height = window.innerHeight * dpr;
      this.ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
      this.forceUpdate();
    };
    this.resize();
    window.addEventListener('resize', this.resize);
    this.onKeyD = (e) => { const tg = (e.target && e.target.tagName) || ''; if (tg === 'INPUT' || tg === 'SELECT' || tg === 'TEXTAREA') return; if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); if (this.state.phase === 'playing') this.held = true; else this.handleDown({}); } };
    this.onKeyU = (e) => { if (e.key === ' ' || e.key === 'ArrowUp') this.held = false; };
    window.addEventListener('keydown', this.onKeyD);
    window.addEventListener('keyup', this.onKeyU);
    // mobil: arka plana alınınca oyunu ve sesi duraklat, dönünce devam et
    this.onVis = () => {
      if (document.hidden) { this.appHidden = true; this.held = false; if (this.ac) { try { this.ac.suspend(); } catch (e) {} } if (this.state.phase === 'playing' && !this.state.paused) this.setState({ paused: true }); }
      else { this.appHidden = false; this.last = performance.now(); if (this.ac && !this.state.paused) { try { this.ac.resume(); } catch (e) {} } }
    };
    document.addEventListener('visibilitychange', this.onVis);
    // uzun basış menüsü ve iOS pinch-zoom engeli
    this.onCtxMenu = (e) => e.preventDefault();
    window.addEventListener('contextmenu', this.onCtxMenu);
    this.onGesture = (e) => e.preventDefault();
    document.addEventListener('gesturestart', this.onGesture);
    document.addEventListener('gesturechange', this.onGesture);
    this.initSky();
    this.g = this.freshGame();
    this.last = performance.now();
    this.scheduleFrame();
  }
  scheduleFrame() {
    const fire = () => {
      cancelAnimationFrame(this.raf);
      clearTimeout(this.rafTimer);
      this.loop(performance.now());
    };
    this.raf = requestAnimationFrame(fire);
    this.rafTimer = setTimeout(fire, 40);
  }
  destroy() {
    this.unmounted = true;
    clearInterval(this.watchdog);
    this.watchdog = null;
    this.stopLowWarn();
    cancelAnimationFrame(this.raf);
    clearTimeout(this.rafTimer);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onKeyD);
    window.removeEventListener('keyup', this.onKeyU);
    document.removeEventListener('visibilitychange', this.onVis);
    window.removeEventListener('contextmenu', this.onCtxMenu);
    document.removeEventListener('gesturestart', this.onGesture);
    document.removeEventListener('gesturechange', this.onGesture);
    if (this.ac) this.ac.close();
  }

  initSky() {
    this.stars = [];
    for (let i = 0; i < 160; i++) {
      this.stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3, tw: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.4, depth: 0.15 + Math.random() * 0.5 });
    }
    // paralaks dağ katmanları
    this.mtn = [{ seed: 2.0, h: 0.10, sp: 0.25, col: '#071021' }, { seed: 5.3, h: 0.16, sp: 0.5, col: '#050b18' }, { seed: 8.1, h: 0.22, sp: 1.0, col: '#02040a' }];
  }

  freshGame() {
    return {
      t: 0, dist: 0, score: 0,
      y: (this.H || 600) * 0.5, vy: 0,
      hue: 148, hueDrift: 0, energy: 1, // energy 0..1 → kurdele boyutu ve parlaklık
      streak: 0, maxStreak: 0, perfects: 0,
      gates: [], wisps: [], clouds: [], floats: [], sparks: [], meteors: [],
      phase: 0, phaseT: 0, banner: null, shield: 0,
      power: null, ecstasy: 0, phaseHits: 0,
      trail: [], nextGateX: (this.W || 800) + 300,
      nextCloudX: (this.W || 800) * 2.2,
      speed: 220, grace: 0, credits: 0, active: {}
    };
  }
  saveEconomy() {
    localStorage.setItem('aurora_credits', String(this.credits));
    localStorage.setItem('aurora_inv', JSON.stringify(this.inv));
    this.saveBackup();
  }
  // ---- veri güvencesi: tüm ilerlemenin tek anahtarda yedeği ----
  BACKUP_KEYS = ['aurora_flow_best', 'aurora_lang', 'aurora_theme', 'aurora_trail', 'aurora_cos', 'aurora_stats', 'aurora_lifetime', 'aurora_credits', 'aurora_inv', 'aurora_upg', 'aurora_focus', 'aurora_seen_events', 'aurora_ach', 'aurora_history', 'aurora_accounts', 'aurora_user', 'aurora_tut'];
  saveBackup() {
    try {
      const o = {};
      for (const k of this.BACKUP_KEYS) { const v = localStorage.getItem(k); if (v !== null) o[k] = v; }
      localStorage.setItem('aurora_backup', JSON.stringify(o));
    } catch (e) {}
  }
  restoreBackup() {
    try {
      // ana kayıtlar kayıpsa (ör. temizlenmiş depolama) yedekten geri yükle
      if (localStorage.getItem('aurora_flow_best') !== null || localStorage.getItem('aurora_accounts') !== null) return;
      const raw = localStorage.getItem('aurora_backup');
      if (!raw) return;
      const o = JSON.parse(raw);
      for (const k in o) if (localStorage.getItem(k) === null) localStorage.setItem(k, o[k]);
    } catch (e) {}
  }
  runLv(id) { return (this.g && this.g.active && this.g.active[id]) || 0; }
  shopPrice(it) { return it.price; }

  handleDown(e) {
    this.ensureAudio();
    if (this.state.eventPopup) return;
    const now = performance.now();
    if (this.state.phase === 'splash') { this.setState({ phase: this.user ? 'menu' : 'register' }); return; }
    if (this.state.phase === 'register' || this.state.phase === 'profile') { return; }
    if (this.state.phase === 'menu') { return; }
    if (this.state.phase === 'over') { if (now - this.overAt > 600) this.startGame(); return; }
    this.held = true;
  }
  handleUp() { this.held = false; }

  startGame() {
    this.g = this.freshGame();
    // satın alınan her şey bu oyun için aktifleşir ve çantadan düşer
    const bag = this.inv || {};
    if (Object.keys(bag).some((k) => bag[k] > 0)) {
      this.g.active = { ...bag };
      this.inv = {};
      this.saveEconomy();
      const g = this.g;
      if (g.active.startShield) { g.shield = Math.min(2, g.active.startShield); this.floatText(this.playerX(), g.y - 60, g.shield === 2 ? this.t('startShield2F') : this.t('startShieldF'), '#cfe2ff'); delete g.active.startShield; }
      if (g.active.ecstasyStart) { g.ecstasy = 8 * g.active.ecstasyStart; }
      if (g.active.magnetStart) { g.power = { type: 'magnet', t: 8 * g.active.magnetStart }; }
    }
    this.held = false;
    this.setState({ phase: 'playing', score: 0, isRecord: false, maxStreak: 0, perfects: 0 });
    this.startAmbient();
  }
  endGame() {
    this.stopLowWarn();
    const g = this.g;
    if ((g.active.revive || 0) > 0) {
      g.active.revive -= 1;
      g.energy = 0.5;
      g.grace = 2.2;
      g.clouds = []; g.meteors = [];
      this.floatText(this.playerX(), g.y - 60, this.t('reviveF'), '#ffce7a');
      this.burst(this.playerX(), g.y, 40, true);
      this.sfxPhase();
      this.vibrate(60);
      return;
    }
    this.credits += g.credits;
    this.saveEconomy();
    const isRecord = g.score > this.best;
    if (isRecord) { this.best = g.score; localStorage.setItem('aurora_flow_best', String(g.score)); }
    // çevrimiçi mod: yeni kişisel rekoru sunucuya bildir (doğrulama Cloud Function'da)
    if (this.online && this.user && this.user.uid && isRecord && g.score > 0) {
      ON.submitScore(g.score).then((r) => { if (this.user && r && r.best) this.user.best = r.best; }).catch(() => {});
    }
    this.history.unshift({ s: g.score });
    this.history = this.history.slice(0, 10);
    localStorage.setItem('aurora_history', JSON.stringify(this.history));
    this.lifetimeScore += g.score;
    localStorage.setItem('aurora_lifetime', String(this.lifetimeScore));
    const st = this.stats;
    st.rings = (st.rings || 0) + (g.rings || 0);
    st.perfects = (st.perfects || 0) + g.perfects;
    st.near = (st.near || 0) + (g.nearMiss || 0);
    st.credits = (st.credits || 0) + g.credits;
    st.bestStreak = Math.max(st.bestStreak || 0, g.maxStreak);
    st.maxPhase = Math.max(st.maxPhase || 0, g.phase);
    st.time = (st.time || 0) + g.t;
    st.gates = (st.gates || 0) + (g.gatesPassed || 0);
    localStorage.setItem('aurora_stats', JSON.stringify(st));
    this.saveBackup();
    this.overAt = performance.now();
    this.sfxOver();
    this.setState({ phase: 'over', score: g.score, isRecord, maxStreak: g.maxStreak, perfects: g.perfects, runCredits: g.credits });
  }

  loop(t) {
    if (this.unmounted) return;
    this.lastFrameAt = performance.now();
    this.scheduleFrame();
    if (this.appHidden) { this.last = t; return; }
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    if (this.state.phase === 'playing' && !this.state.paused) this.update(dt);
    this.draw(t / 1000, dt);
  }

  update(dt) {
    if (this.W < this.H) return; // dikey tutulunca oyun duraklar
    if (this.state.eventPopup) return; // olay tanıtımı açıkken duraklat
    const g = this.g, H = this.H, W = this.W;
    const ramp = this.props.hizRampasi ?? 1;
    g.t += dt;
    g.grace = Math.max(0, g.grace - dt);
    // gece evreleri
    g.phaseT += dt;
    const PH = this.phaseFor(g.phase);
    if (g.phaseT > PH.dur) {
      if (PH.kind === 'meteor' && g.phaseHits === 0) this.award('meteorTemiz');
      if (PH.kind === 'storm' && g.phaseHits === 0) this.award('firtinaTemiz');
      if (PH.kind === 'fog' && g.phaseHits === 0) this.award('sisTemiz');
      g.phase += 1; g.phaseT = 0; g.phaseHits = 0; g.finaleSpawned = false;
      const NP = this.phaseFor(g.phase);
      g.banner = { txt: this.phName(NP.kind), t: 0 };
      this.forceUpdate();
      if (NP.kind === 'calm') this.sfxPhase(); else this.sfxEvent(NP.kind);
      if (NP.kind !== 'calm' && !this.seenEvents[NP.kind]) {
        this.seenEvents[NP.kind] = 1;
        localStorage.setItem('aurora_seen_events', JSON.stringify(this.seenEvents));
        this.setState({ eventPopup: NP.kind });
      }
    }
    const storm = PH.kind === 'storm', meteorNight = PH.kind === 'meteor', fogNight = PH.kind === 'fog';
    const wind = PH.kind === 'wind', moonNight = PH.kind === 'moon', cometNight = PH.kind === 'comet';
    const dmod = -1;
    const cycle = Math.floor(g.phase / 12);
    if (PH.kind === 'finale' && !g.finaleSpawned) {
      g.finaleSpawned = true;
      g.gates.push({ x: g.dist + W * 1.7, y: H * 0.5, r: Math.min(H * 0.3, 280), hit: false, missed: false, ph: 0, giant: true });
    }
    // hız asla durmaz: ilk 90 saniyede hızlı tırmanır, sonrasında sonsuza dek yavaşça artar
    g.speed = (220 + Math.min(1, g.t / (90 / ramp)) * 260 + Math.max(0, g.t - 90 / ramp) * 1.5 * ramp) * (moonNight ? 1.15 : 1) * (dmod === 2 ? 1.25 : 1);
    const slowK = g.power && g.power.type === 'slow' ? 0.55 : 1;
    const px = this.playerX(); // oyuncunun ekran x'i
    // fizik: bas = yüksel, bırak = süzül; ikisi de yumuşak
    const lift = this.held ? -820 : 620;
    g.vy += lift * dt;
    if (wind) g.vy += (Math.sin(g.t * 1.6) * 320 + 120) * dt;
    g.vy = Math.max(-420, Math.min(460, g.vy));
    g.y += g.vy * dt;
    // yumuşak tavan/taban yastıkları (öldürmez — bu oyunda yalnız enerji öldürür)
    if (g.y < 40) { g.y = 40; g.vy = Math.max(0, g.vy); }
    const floorY = H * 0.9;
    if (g.y > floorY) { g.y = floorY; g.vy = Math.min(0, g.vy); }
    g.dist += g.speed * dt * slowK;
    g.score += Math.round(g.speed * dt * 0.05 * (1 + g.streak * 0.1));
    if (g.score >= 25000) this.award('puan25k');
    if (g.score >= 50000) this.award('puan50k');
    if (g.score >= 100000) this.award('puan100k');
    if (g.phase >= 6) this.award('tur2');
    if (g.phase >= 12) this.award('tur4');
    if (this.lifetimeScore + g.score >= 250000) this.award('toplam250k');
    if ((this.stats.credits || 0) + g.credits >= 5000) this.award('kredi5k');
    if ((this.stats.rings || 0) + (g.rings || 0) >= 1000) this.award('halka1000');
    if ((g.nearMiss || 0) >= 10) this.award('kilpayi10');
    if (this.layer) this.layer.gain.value = Math.min(0.045, g.streak * 0.0035);
    // renk tonu aurora tayfında yavaşça gezinir
    g.hue = this.themeHue() + Math.sin(g.t * 0.11) * 90 + g.hueDrift + PH.hueShift;
    // enerji yavaşça azalır — halkalar yaşam kaynağı
    g.energy -= dt * (0.022 + Math.min(1, g.t / 120) * 0.02) * (this.props.enerjiTuketimi ?? 1) * (storm ? 1.4 : 1);
    if (g.energy <= 0) { g.energy = 0; this.endGame(); return; }
    // düşük enerji alarmı: ışık sönerken geriye sayım tıkırtısı, enerji dolunca susar
    if (g.energy < 0.25) this.startLowWarn(); else this.stopLowWarn();
    if (this.lowWarn) this.lowWarn.lfo.frequency.value = 2 + (0.25 - Math.min(0.25, g.energy)) * 14;
    // iz
    g.trail.unshift({ y: g.y, hue: g.hue });
    if (g.trail.length > 90) g.trail.pop();

    // halka doğumu
    if (g.nextGateX - g.dist < W + 200) {
      const vs = this.viewScale();
      const gapMin = (480 - Math.min(200, g.t * 3)) * (storm ? 0.65 : 1) * (moonNight ? 0.6 : 1) * vs;
      const gy = H * (0.18 + Math.random() * 0.62);
      const r = 74 - Math.min(26, g.t * 0.5) + Math.random() * 14;
      g.gates.push({ x: g.nextGateX, y: gy, r, hit: false, missed: false, ph: Math.random() * 6.28 });
      g.nextGateX += gapMin + Math.random() * 320 * vs;
    }
    // karanlık bulutlar (engeller) 12. saniyeden sonra
    if (g.t > 12 && !storm && !cometNight && g.nextCloudX - g.dist < W + 200) {
      const cy = H * (0.15 + Math.random() * 0.65);
      g.clouds.push({ x: g.nextCloudX, y: cy, r: 46 + Math.random() * 40, ph: Math.random() * 6.28 });
      g.nextCloudX += (900 + Math.random() * 900 - Math.min(500, g.t * 6)) * this.viewScale();
    }
    // zerreler (küçük puanlık ortam ışıltıları)
    if (Math.random() < dt * (storm ? 3.2 : 1.4)) {
      g.wisps.push({ x: g.dist + W + 60, y: H * (0.12 + Math.random() * 0.7), ph: Math.random() * 6.28, got: false });
    }
    if (g.shield < 2 && Math.random() < dt * 0.05 * (1 + 0.5 * this.runLv('shardBoost'))) {
      g.wisps.push({ x: g.dist + W + 60, y: H * (0.15 + Math.random() * 0.6), ph: Math.random() * 6.28, got: false, shard: true });
    }
    if (!g.power && g.t > 20 && Math.random() < dt * 0.05 * (1 + 0.4 * this.runLv('powerBoost'))) {
      const types = ['magnet', 'slow', 'double'];
      g.wisps.push({ x: g.dist + W + 60, y: H * (0.15 + Math.random() * 0.6), ph: Math.random() * 6.28, got: false, power: types[Math.floor(Math.random() * 3)] });
    }
    if (cometNight && Math.random() < dt * 7) {
      const wxo = g.dist + W + 40;
      g.wisps.push({ x: wxo, y: H * (0.45 + 0.3 * Math.sin(wxo / 260)), ph: Math.random() * 6.28, got: false });
    }

    // güç-yükseltmesi süresi + mıknatıs + coşku
    if (g.power) { g.power.t -= dt; if (g.power.t <= 0) g.power = null; }
    if (g.power && g.power.type === 'magnet') {
      for (const w of g.wisps) {
        const dxp = g.dist - w.x, dyp = g.y - w.y, ddm = Math.hypot(dxp, dyp);
        if (ddm < 300 && ddm > 1) { w.x += dxp / ddm * 420 * dt; w.y += dyp / ddm * 420 * dt; }
      }
    }
    g.ecstasy = Math.max(0, g.ecstasy - dt);
    if (g.active.ecstasyStart && g.ecstasy <= 0) delete g.active.ecstasyStart;
    if (g.active.magnetStart && (!g.power || g.power.type !== 'magnet')) delete g.active.magnetStart;
    // halka çarpışmaları
    for (const gate of g.gates) {
      const gx = gate.x - g.dist + px;
      if (!gate.hit && !gate.missed && gx < px + 6 && gx > px - 30) {
        const dy = Math.abs(g.y - gate.y);
        if (dy < gate.r) {
          gate.hit = true;
          g.rings = (g.rings || 0) + 1;
          g.comboPulse = 1;
          if (gate.giant) {
            const bonus = 2500 * (cycle + 1);
            g.score += bonus; g.energy = 1; g.shake = 1.2;
            this.burst(px, gate.y - 80, 48, true); this.burst(px, gate.y + 80, 48, true);
            this.floatText(px, gate.y - gate.r - 24, this.t('dawnGateF') + bonus.toLocaleString('tr-TR'), '#ffe9a3');
            this.sfxFinale(); this.vibrate(120);
            this.award('kapi1');
            g.gatesPassed = (g.gatesPassed || 0) + 1;
            if ((this.stats.gates || 0) + g.gatesPassed >= 3) this.award('kapi3');
          }
          g.streak += 1;
          g.maxStreak = Math.max(g.maxStreak, g.streak);
          if (g.streak >= 15) this.award('seri15');
          if (g.streak >= 30) this.award('seri30');
          if (g.streak >= 50) this.award('seri50');
          if (g.streak > 0 && g.streak % 10 === 0) { g.ecstasy = 6; g.ecstasyCount = (g.ecstasyCount || 0) + 1; if (g.ecstasyCount >= 3) this.award('cosku3'); this.floatText(px, g.y - 70, this.t('ecstasyF'), '#ffe9a3'); this.vibrate(40); }
          const centered = 1 - dy / gate.r; // 1 = tam merkez
          const perfect = centered > 0.7;
          let pts = Math.round((100 + centered * 200) * (1 + g.streak * 0.15)) * (storm ? 2 : 1);
          if (perfect) { pts += 150; g.perfects += 1; if (g.perfects >= 10) this.award('merkez10'); if (g.perfects >= 25) this.award('merkez25'); g.perfStreak = (g.perfStreak || 0) + 1; if (g.perfStreak >= 10) this.award('perfectSeri10'); } else { g.perfStreak = 0; }
          if (g.power && g.power.type === 'double') pts *= 2;
          if (g.ecstasy > 0) pts *= 2;
          if (dmod === 2) pts = Math.round(pts * 1.5);
          if (g.active.scoreBoost) pts = Math.round(pts * (1 + 0.25 * g.active.scoreBoost));
          g.score += pts;
          g.energy = Math.min(1, g.energy + (perfect ? 0.3 : 0.16) * (1 + 0.3 * (g.active.energyBoost || 0)));
          g.hueDrift += 8;
          this.burst(px, gate.y, g.hue, perfect);
          this.floatText(px + 30, gate.y - gate.r - 14, (perfect ? this.t('perfectF') : '+') + pts, perfect ? '#ffe9a3' : 'hsl(' + Math.round(g.hue) + ',90%,75%)');
          this.sfxGate(g.streak, perfect);
          this.vibrate(perfect ? 25 : 12);
        } else {
          gate.missed = true;
          if (g.streak > 1) this.floatText(px, g.y - 40, this.t('streakEndF'), '#7c8db0');
          g.streak = 0;
          g.energy = Math.max(0.05, g.energy - 0.08);
          this.sfxMiss();
        }
      }
    }
    g.gates = g.gates.filter((gt) => gt.x - g.dist > -px - 300);
    // bulut çarpışmaları
    for (const c of g.clouds) {
      const cx = c.x - g.dist + px;
      const dcl = Math.hypot(cx - px, g.y - c.y);
      if (dcl < c.r * 2.2) c.near = Math.min(c.near || 9999, dcl);
      if (!c.judged && cx < px - c.r) {
        c.judged = true;
        if (!c.touched && (c.near || 9999) < c.r * 1.4) {
          const b = (40 + g.streak * 10) * (g.ecstasy > 0 ? 2 : 1);
          g.score += b;
          g.nearMiss = (g.nearMiss || 0) + 1;
          this.floatText(px, g.y - 56, this.t('nearF') + b, '#8ef5c8');
          this.sfxNear(); this.vibrate(18);
        }
      }
      if (g.grace <= 0 && Math.abs(cx - px) < c.r * 0.8 && Math.abs(g.y - c.y) < c.r * 0.8) {
        c.touched = true;
        if (g.shield > 0) { g.shield -= 1; g.grace = 1.4; this.floatText(px, g.y - 40, g.shield > 0 ? this.t('shieldBroke1') : this.t('shieldBroke'), '#cfe2ff'); this.sfxMiss(); continue; }
        g.energy -= 0.22 * (1 - 0.15 * this.runLv('armor'));
        g.streak = 0;
        g.grace = 1.2;
        g.phaseHits += 1;
        this.vibrate(70);
        g.shake = 1;
        g.flash = 1;
        this.burst(px, g.y, 350, true);
        this.floatText(px, g.y - 40, this.t('cloudF'), '#ff8a9b');
        this.sfxHit();
        if (g.energy <= 0) { g.energy = 0; this.endGame(); return; }
      }
    }
    g.clouds = g.clouds.filter((c) => c.x - g.dist > -px - 300);
    // meteorlar
    if (meteorNight && Math.random() < dt * (0.9 + cycle * 0.3)) {
      // hedefli meteor: oyuncunun hattını oynanabilir yükseklikte kesecek şekilde nişanlanır
      const sx = W * (0.55 + Math.random() * 0.45);
      const vx = -60 - Math.random() * 80;
      const closure = g.speed - vx;
      const T = Math.max(0.4, (sx - px) / closure);
      const targetY = H * (0.2 + Math.random() * 0.6);
      const vy = Math.max(120, Math.min(520, (targetY + 30) / T));
      g.meteors.push({ x: g.dist + (sx - px), y: -30, vy, vx, t: 0 });
    }
    for (const m of g.meteors) {
      m.y += m.vy * dt; m.x += m.vx * dt; m.t += dt;
      const mx = m.x - g.dist + px;
      const dmt = Math.hypot(mx - px, g.y - m.y);
      if (dmt < 140) m.near = Math.min(m.near || 9999, dmt);
      if (!m.judged && (mx < px - 34 || m.y > this.H - 20)) {
        m.judged = true;
        if (!m.touched && (m.near || 9999) < 64) {
          const b = (40 + g.streak * 10) * (g.ecstasy > 0 ? 2 : 1);
          g.score += b;
          g.nearMiss = (g.nearMiss || 0) + 1;
          this.floatText(px, g.y - 56, this.t('nearF') + b, '#8ef5c8');
          this.sfxNear(); this.vibrate(18);
        }
      }
      if (g.grace <= 0 && Math.abs(mx - px) < 26 && Math.abs(g.y - m.y) < 26) {
        m.dead = true; m.touched = true;
        if (g.shield > 0) { g.shield -= 1; g.grace = 1.4; this.floatText(px, g.y - 40, g.shield > 0 ? this.t('shieldBroke1') : this.t('shieldBroke'), '#cfe2ff'); this.sfxMiss(); }
        else {
          g.energy -= 0.15 * (1 - 0.15 * this.runLv('armor')); g.streak = 0; g.grace = 1.0; g.shake = 1; g.phaseHits += 1; this.vibrate(70);
          g.flash = 1;
          this.burst(px, g.y, 20, true);
          this.floatText(px, g.y - 40, this.t('meteorF'), '#ffb38a');
          this.sfxHit();
          if (g.energy <= 0) { g.energy = 0; this.endGame(); return; }
        }
      }
    }
    g.meteors = g.meteors.filter((m) => !m.dead && m.y < H + 60 && m.x - g.dist > -px - 300);
    // zerre toplama
    for (const w of g.wisps) {
      const wx = w.x - g.dist + px;
      if (!w.got && Math.abs(wx - px) < 34 && Math.abs(g.y - w.y) < 34) {
        w.got = true;
        if (w.power) {
          g.power = { type: w.power, t: w.power === 'double' ? 8 : w.power === 'slow' ? 5 : 7 };
          g.powersSeen = g.powersSeen || {}; g.powersSeen[w.power] = 1;
          if (g.powersSeen.magnet && g.powersSeen.slow && g.powersSeen.double) this.award('powerHepsi');
          const pn = { magnet: this.t('magnetF'), slow: this.t('slowF'), double: this.t('doubleF') }[w.power];
          this.floatText(px, w.y - 24, pn, w.power === 'magnet' ? '#59d8ff' : w.power === 'slow' ? '#c9a5ff' : '#ffe9a3');
          this.burst(px, w.y, w.power === 'double' ? 48 : 200, true);
          this.sfxShard();
        } else if (w.shard) {
          g.shield = Math.min(2, g.shield + 1);
          g.score += 50;
          this.floatText(px, w.y - 24, g.shield === 2 ? this.t('moonShield2F') : this.t('moonShieldF'), '#cfe2ff');
          this.burst(px, w.y, 220, true);
          this.sfxShard();
        } else {
          g.score += 15;
          const cr = 1 + this.runLv('creditBoost');
          g.credits += cr;
          if (cr > 1) this.floatText(px + 20, w.y - 18, '+' + cr + ' ✦', '#ffe9a3');
          g.energy = Math.min(1, g.energy + 0.02);
          this.burst(px, w.y, 48, false);
          this.sfxWisp();
        }
      }
    }
    g.wisps = g.wisps.filter((w) => w.x - g.dist > -px - 160 && !w.got);
    // efekt sönümleri
    for (const f of g.floats) f.t += dt;
    g.floats = g.floats.filter((f) => f.t < 1.2);
    for (const s of g.sparks) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 60 * dt; }
    g.sparks = g.sparks.filter((s) => s.t < 0.9);
    if (g.banner) { g.banner.t += dt; if (g.banner.t > 2.6) g.banner = null; }
    g.shake = Math.max(0, (g.shake || 0) - dt * 3);
    g.comboPulse = Math.max(0, (g.comboPulse || 0) - dt * 3);
    g.flash = Math.max(0, (g.flash || 0) - dt * 2.2);
    if (this.trailStyle === 'yildiz' && Math.random() < dt * 26) {
      g.sparks.push({ x: px - 14 - Math.random() * 30, y: g.y + (Math.random() - 0.5) * 26, vx: -120 - Math.random() * 120, vy: (Math.random() - 0.5) * 70, hue: g.hue + 45, t: 0 });
    }
    if (this.trailStyle === 'alev' && Math.random() < dt * 30) {
      g.sparks.push({ x: px - 10 - Math.random() * 26, y: g.y + (Math.random() - 0.5) * 18, vx: -100 - Math.random() * 90, vy: -70 - Math.random() * 100, hue: 12 + Math.random() * 28, t: 0 });
    }
    if (this.trailStyle === 'buz' && Math.random() < dt * 22) {
      g.sparks.push({ x: px - 12 - Math.random() * 28, y: g.y + (Math.random() - 0.5) * 22, vx: -90 - Math.random() * 70, vy: 45 + Math.random() * 65, hue: 198 + Math.random() * 22, t: 0 });
    }
  }

  burst(x, y, hue, big) {
    const n = big ? 26 : 14;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, sp = 60 + Math.random() * (big ? 260 : 160);
      this.g.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, hue, t: 0 });
    }
  }
  floatText(x, y, txt, color) { this.g.floats.push({ x, y, txt, color, t: 0 }); }

  draw(time, dt) {
    const ctx = this.ctx, W = this.W, H = this.H, g = this.g;
    if (!ctx) return;
    const playing = this.state.phase === 'playing';
    const px = this.playerX();
    const energy = playing ? g.energy : 0.8;
    const hue = playing ? g.hue : this.themeHue() + Math.sin(time * 0.3) * 60;
    ctx.save();
    if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake * 8, (Math.random() - 0.5) * g.shake * 8);
    // gök — mevcut ton ve enerjiyle hafifçe boyanır (gradyan nesnesi ton/enerji
    // kovasına göre önbelleklenir; ton yavaş değiştiği için çoğu kare yeniden üretilmez)
    const skyKey = (Math.round(hue / 4) * 4) + ':' + Math.round(energy * 12) + ':' + Math.round(H);
    if (this._skyKey !== skyKey) {
      const sg = ctx.createLinearGradient(0, 0, 0, H);
      sg.addColorStop(0, '#03050e');
      sg.addColorStop(0.55, 'hsl(' + Math.round(hue) + ', 45%, ' + (5 + energy * 4).toFixed(1) + '%)');
      sg.addColorStop(1, '#050a18');
      this._skyGrad = sg; this._skyKey = skyKey;
    }
    const grad = this._skyGrad;
    ctx.fillStyle = grad;
    ctx.fillRect(-20, -20, W + 40, H + 40);
    // paralakslı yıldızlar
    const scroll = playing ? g.dist : time * 30;
    for (const s of this.stars) {
      const sx = ((s.x * W - scroll * s.depth * 0.15) % (W + 20) + W + 20) % (W + 20) - 10;
      const a = 0.2 + 0.55 * (0.5 + 0.5 * Math.sin(time * s.sp + s.tw));
      ctx.fillStyle = 'rgba(215,228,255,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(sx, s.y * H * 0.85, s.r, 0, 6.29); ctx.fill();
    }
    // ay
    ctx.globalCompositeOperation = 'lighter';
    const moonK = playing && this.phaseFor(g.phase).kind === 'moon' ? 2.1 : 1;
    const mg = ctx.createRadialGradient(W * 0.82, H * 0.16, 0, W * 0.82, H * 0.16, 90 * moonK);
    mg.addColorStop(0, 'rgba(230,240,255,0.5)');
    mg.addColorStop(0.25, 'rgba(230,240,255,0.12)');
    mg.addColorStop(1, 'rgba(230,240,255,0)');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(W * 0.82, H * 0.16, 90 * moonK, 0, 6.29); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#e8eeff';
    ctx.beginPath(); ctx.arc(W * 0.82, H * 0.16, 17 * moonK, 0, 6.29); ctx.fill();
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(W * 0.82 - 7 * moonK, H * 0.16 - 4 * moonK, 14 * moonK, 0, 6.29); ctx.fill();
    // paralaks dağlar
    for (const m of this.mtn) {
      ctx.fillStyle = m.col;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 10) {
        const wx = x + scroll * m.sp;
        const y = H - H * m.h * (0.55 + 0.45 * Math.abs(Math.sin(wx * 0.0021 + m.seed) * 0.7 + Math.sin(wx * 0.0057 + m.seed * 2) * 0.3));
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }

    // ekranın sol kenarına yaklaşan objeler yumuşakça solup tam kenarda kaybolur
    const edgeFade = (x) => Math.max(0, Math.min(1, (x + 20) / 160));
    if (playing) {
      ctx.globalCompositeOperation = 'lighter';
      const kindNow2 = this.phaseFor(g.phase).kind;
      if (kindNow2 === 'wind') {
        for (let i = 0; i < 10; i++) {
          const wy2 = ((i * 97 + time * 260) % (H + 40)) - 20;
          const wx2 = W - ((time * (600 + i * 60) + i * 353) % (W + 300)) + 150;
          ctx.strokeStyle = 'rgba(180,210,240,0.12)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(wx2, wy2); ctx.lineTo(wx2 - 90, wy2 + 6); ctx.stroke();
        }
      }
      if (kindNow2 === 'comet') {
        const cxx = W * 0.75 + Math.sin(time * 0.5) * W * 0.1, cyy = H * 0.18;
        const cg3 = ctx.createRadialGradient(cxx, cyy, 0, cxx, cyy, 26);
        cg3.addColorStop(0, 'rgba(255,246,214,0.95)');
        cg3.addColorStop(1, 'rgba(255,246,214,0)');
        ctx.fillStyle = cg3;
        ctx.beginPath(); ctx.arc(cxx, cyy, 26, 0, 6.29); ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,200,0.35)';
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(cxx, cyy); ctx.lineTo(cxx + 130, cyy - 44); ctx.stroke();
      }
      // zerreler
      for (const w of g.wisps) {
        const wx = w.x - g.dist + px;
        if (wx < -20 || wx > W + 20) continue;
        const a = (0.5 + 0.4 * Math.sin(time * 4 + w.ph)) * edgeFade(wx);
        const col = w.power === 'magnet' ? '89,216,255' : w.power === 'slow' ? '201,165,255' : w.power === 'double' ? '255,233,163' : w.shard ? '190,215,255' : '255,236,170';
        const rr = (w.shard || w.power) ? 24 : 16;
        const wg = ctx.createRadialGradient(wx, w.y, 0, wx, w.y, rr);
        wg.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(2) + ')');
        wg.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = wg;
        ctx.beginPath(); ctx.arc(wx, w.y, rr, 0, 6.29); ctx.fill();
        if (w.shard || w.power) { ctx.fillStyle = 'rgba(230,240,255,0.95)'; ctx.beginPath(); ctx.arc(wx, w.y, 5, 0, 6.29); ctx.fill(); }
      }
      // halkalar — parlak halkalı dikey ışık sütunları
      for (const gate of g.gates) {
        const gx = gate.x - g.dist + px;
        if (gx < -40 || gx > W + 120) continue;
        const kindNow = this.phaseFor(this.g.phase).kind;
        let gh = (gate.hit ? 0.35 : 1) * edgeFade(gx);
        if (kindNow === 'fog') gh *= Math.max(0.03, Math.min(1, (W * 0.40 - (gx - px)) / (W * 0.22)));
        const ringHue = gate.giant ? 48 : gate.hit ? hue : (kindNow === 'storm' ? 48 : 186);
        const glw = gate.giant ? 2 : 1;
        // sütun
        const pg = ctx.createLinearGradient(gx, gate.y - gate.r * 2.4, gx, gate.y + gate.r * 2.4);
        pg.addColorStop(0, 'hsla(' + ringHue + ', 85%, 65%, 0)');
        pg.addColorStop(0.5, 'hsla(' + ringHue + ', 85%, 65%, ' + (0.1 * gh).toFixed(2) + ')');
        pg.addColorStop(1, 'hsla(' + ringHue + ', 85%, 65%, 0)');
        ctx.fillStyle = pg;
        ctx.fillRect(gx - 10, gate.y - gate.r * 2.4, 20, gate.r * 4.8);
        // halka (geçiş için açılan iki yay olarak çizilir)
        const pulse = 1 + 0.05 * Math.sin(time * 3 + gate.ph);
        ctx.strokeStyle = 'hsla(' + ringHue + ', 90%, 72%, ' + (0.85 * gh).toFixed(2) + ')';
        ctx.lineWidth = 3.5 * glw;
        ctx.beginPath(); ctx.ellipse(gx, gate.y, 12, gate.r * pulse, 0, 0, 6.29); ctx.stroke();
        ctx.strokeStyle = 'hsla(' + ringHue + ', 90%, 72%, ' + (0.25 * gh).toFixed(2) + ')';
        ctx.lineWidth = 9 * glw;
        ctx.beginPath(); ctx.ellipse(gx, gate.y, 12, gate.r * pulse, 0, 0, 6.29); ctx.stroke();
        // merkez taşı
        ctx.fillStyle = 'hsla(' + ringHue + ', 95%, 80%, ' + (0.9 * gh).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(gx, gate.y, 3.5, 0, 6.29); ctx.fill();
      }
      // karanlık bulutlar — normal modda çizilir (ışığı yutarlar)
      ctx.globalCompositeOperation = 'source-over';
      for (const c of g.clouds) {
        const cx = c.x - g.dist + px;
        if (cx < -120 || cx > W + 140) continue;
        ctx.globalAlpha = edgeFade(cx + c.r);
        const wob = Math.sin(time * 1.5 + c.ph) * 5;
        for (let i = 0; i < 5; i++) {
          const a = c.ph + i * 1.26;
          const ox = Math.cos(a) * c.r * 0.45, oy = Math.sin(a) * c.r * 0.3;
          const cg2 = ctx.createRadialGradient(cx + ox, c.y + oy + wob, 0, cx + ox, c.y + oy + wob, c.r * 0.75);
          cg2.addColorStop(0, 'rgba(6,8,16,0.95)');
          cg2.addColorStop(0.7, 'rgba(10,12,24,0.75)');
          cg2.addColorStop(1, 'rgba(10,12,24,0)');
          ctx.fillStyle = cg2;
          ctx.beginPath(); ctx.arc(cx + ox, c.y + oy + wob, c.r * 0.75, 0, 6.29); ctx.fill();
        }
        // soluk kızıl şimşek çekirdeği
        ctx.fillStyle = 'rgba(255,110,130,' + (0.25 + 0.2 * Math.sin(time * 6 + c.ph)).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(cx + wob, c.y, 4, 0, 6.29); ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'lighter';
      // meteorlar
      for (const m of g.meteors) {
        const mx = m.x - g.dist + px;
        if (mx < -80 || mx > W + 160) continue;
        ctx.globalAlpha = edgeFade(mx + 40);
        ctx.strokeStyle = 'rgba(255,190,140,0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(mx, m.y); ctx.lineTo(mx - m.vx * 0.16, m.y - m.vy * 0.16); ctx.stroke();
        const mg2 = ctx.createRadialGradient(mx, m.y, 0, mx, m.y, 14);
        mg2.addColorStop(0, 'rgba(255,210,160,0.9)');
        mg2.addColorStop(1, 'rgba(255,210,160,0)');
        ctx.fillStyle = mg2;
        ctx.beginPath(); ctx.arc(mx, m.y, 14, 0, 6.29); ctx.fill();
        ctx.globalAlpha = 1;
      }
      // ===== oyuncu: akan aurora kurdele izi =====
      // ikişer örnek atlanır (yarı yarıya az gradyan); dilimler iki birim genişliğinde
      // çizildiği için görünüm değişmez
      const rw = 10 + energy * 26; // kurdele yarı-genişliği
      for (let i = g.trail.length - 1; i >= 1; i -= 2) {
        const p = g.trail[i], q = g.trail[i - 1];
        const k = 1 - i / g.trail.length; // başta 1
        const x1 = px - i * (g.speed * 0.016), x2 = px - (Math.max(0, i - 2)) * (g.speed * 0.016);
        const wob = Math.sin(time * 5 + i * 0.35) * (3 + (1 - k) * 6);
        const hw = rw * (0.25 + k * 0.75);
        const a = (0.05 + k * 0.3) * (0.4 + energy * 0.6);
        const phue = this.trailStyle === 'gokkusagi' ? (p.hue + i * 7 + time * 80) % 360 : p.hue;
        const vg = ctx.createLinearGradient(0, p.y - hw * 3 + wob, 0, p.y + hw + wob);
        vg.addColorStop(0, 'hsla(' + Math.round((phue + 45) % 360) + ', 90%, 70%, 0)');
        vg.addColorStop(0.75, 'hsla(' + Math.round(phue) + ', 92%, 66%, ' + a.toFixed(3) + ')');
        vg.addColorStop(1, 'hsla(' + Math.round(phue) + ', 92%, 60%, ' + (a * 0.4).toFixed(3) + ')');
        ctx.fillStyle = vg;
        ctx.fillRect(x2, p.y - hw * 3 + wob, Math.max(2, x1 - x2 + 1.5), hw * 4);
        if (this.trailStyle === 'ikiz') {
          const h2c = Math.round((p.hue + 80) % 360);
          const vg2 = ctx.createLinearGradient(0, p.y + hw * 0.8 + wob, 0, p.y + hw * 3.2 + wob);
          vg2.addColorStop(0, 'hsla(' + h2c + ', 90%, 68%, ' + (a * 0.8).toFixed(3) + ')');
          vg2.addColorStop(1, 'hsla(' + h2c + ', 90%, 68%, 0)');
          ctx.fillStyle = vg2;
          ctx.fillRect(x2, p.y + hw * 0.8 + wob, Math.max(2, x1 - x2 + 1.5), hw * 2.4);
        }
      }
      if (this.trailStyle === 'simsek' && g.trail.length > 10) {
        ctx.strokeStyle = 'hsla(' + Math.round((hue + 60) % 360) + ', 95%, 82%, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < g.trail.length; i += 5) {
          const lx = px - i * (g.speed * 0.016);
          const ly = g.trail[i].y + (Math.random() - 0.5) * 10;
          if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
      // baş parlaması
      const hg = ctx.createRadialGradient(px, g.y, 0, px, g.y, 40 + energy * 30);
      hg.addColorStop(0, 'hsla(' + Math.round(hue) + ', 95%, 80%, 0.9)');
      hg.addColorStop(0.35, 'hsla(' + Math.round(hue) + ', 95%, 70%, 0.35)');
      hg.addColorStop(1, 'hsla(' + Math.round(hue) + ', 95%, 60%, 0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(px, g.y, 40 + energy * 30, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(245,250,255,0.95)';
      ctx.beginPath(); ctx.arc(px, g.y, 4.5, 0, 6.29); ctx.fill();
      // kıvılcımlar
      for (const s of g.sparks) {
        const k = 1 - s.t / 0.9;
        ctx.fillStyle = 'hsla(' + Math.round(s.hue) + ', 92%, 74%, ' + (k * 0.9).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.2 * k + 0.5, 0, 6.29); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      // uçan yazılar
      for (const f of g.floats) {
        const k = f.t / 1.2;
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = f.color;
        ctx.font = '700 27px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(f.txt, f.x, Math.max(84, f.y - k * 40));
        ctx.globalAlpha = 1;
      }
      const fogK = this.phaseFor(g.phase).kind === 'fog' ? 1 : 0;
      if (fogK > 0) {
        ctx.globalAlpha = fogK;
        // yoğun buz sisi: sağ taraf neredeyse görünmez + dalgalanan sis bantları
        const fg = ctx.createLinearGradient(px + W * 0.02, 0, W * 0.85, 0);
        fg.addColorStop(0, 'rgba(165,195,228,0)');
        fg.addColorStop(0.45, 'rgba(165,195,228,0.22)');
        fg.addColorStop(1, 'rgba(178,203,232,0.5)');
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, W, this.H);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
          const fy = this.H * (0.12 + i * 0.24) + Math.sin(time * 0.5 + i * 2.1) * 30;
          const fgr = ctx.createRadialGradient(W * 0.72, fy, 0, W * 0.72, fy, W * 0.34);
          fgr.addColorStop(0, 'rgba(190,212,238,' + (0.10 + 0.05 * Math.sin(time * 0.8 + i)).toFixed(3) + ')');
          fgr.addColorStop(1, 'rgba(190,212,238,0)');
          ctx.fillStyle = fgr;
          ctx.beginPath(); ctx.arc(W * 0.72, fy, W * 0.34, 0, 6.29); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
      if (g.ecstasy > 0) {
        const ek = (0.22 + 0.08 * Math.sin(time * 6)) * Math.min(1, g.ecstasy);
        ctx.globalCompositeOperation = 'lighter';
        const eg = ctx.createRadialGradient(W / 2, this.H / 2, Math.min(W, this.H) * 0.35, W / 2, this.H / 2, Math.max(W, this.H) * 0.72);
        eg.addColorStop(0, 'hsla(' + Math.round(hue) + ', 90%, 65%, 0)');
        eg.addColorStop(1, 'hsla(' + Math.round(hue) + ', 90%, 65%, ' + ek.toFixed(3) + ')');
        ctx.fillStyle = eg;
        ctx.fillRect(0, 0, W, this.H);
        ctx.globalCompositeOperation = 'source-over';
      }
      // hasar aldığında kızıl vinyet parlaması
      if (g.flash > 0) {
        const fk2 = g.flash * 0.42;
        const vg3 = ctx.createRadialGradient(W / 2, this.H / 2, Math.min(W, this.H) * 0.28, W / 2, this.H / 2, Math.max(W, this.H) * 0.75);
        vg3.addColorStop(0, 'rgba(255,60,80,0)');
        vg3.addColorStop(1, 'rgba(255,60,80,' + fk2.toFixed(3) + ')');
        ctx.fillStyle = vg3;
        ctx.fillRect(0, 0, W, this.H);
      }
      this.drawHUD(ctx, time);
    } else {
      // menü/oyun sonu ambiyansı: gökte süzülen sakin kurdele
      ctx.globalCompositeOperation = 'lighter';
      for (let x = 0; x <= W; x += 12) {
        const y = H * 0.32 + Math.sin(x * 0.005 + time * 0.7) * 46 + Math.sin(x * 0.013 + time * 0.4) * 22;
        const h2 = 90 + 40 * Math.sin(x * 0.01 + time);
        const vg = ctx.createLinearGradient(0, y - h2, 0, y + 20);
        vg.addColorStop(0, 'hsla(' + Math.round((hue + 50) % 360) + ', 90%, 70%, 0)');
        vg.addColorStop(1, 'hsla(' + Math.round(hue) + ', 90%, 65%, 0.14)');
        ctx.fillStyle = vg;
        ctx.fillRect(x, y - h2, 10, h2 + 20);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  focusInfo() {
    const g = this.g, id = this.focusAch;
    if (!g || !id || this.earned[id]) return null;
    const a = this.ACH.find((x) => x.id === id); if (!a) return null;
    const P = (cur, tgt, unit) => ({ name: this.tn('ach', id), txt: Math.min(cur, tgt).toLocaleString('tr-TR') + ' / ' + tgt.toLocaleString('tr-TR') + ' ' + unit + (cur < tgt ? ' · ' + (tgt - cur).toLocaleString('tr-TR') + ' ' + this.t('leftW') : ''), k: Math.min(1, cur / tgt) });
    switch (id) {
      case 'merkez10': return P(g.perfects, 10, this.t('uPerfect'));
      case 'merkez25': return P(g.perfects, 25, this.t('uPerfect'));
      case 'seri15': return P(g.streak, 15, this.t('uSeries'));
      case 'seri30': return P(g.streak, 30, this.t('uSeries'));
      case 'perfectSeri10': return P(g.perfStreak || 0, 10, 'üst üste merkez');
      case 'puan25k': return P(g.score, 25000, this.t('uPoint'));
      case 'puan100k': return P(g.score, 100000, this.t('uPoint'));
      case 'tur2': return P(g.phase, 6, this.t('uPhase'));
      case 'tur4': return P(g.phase, 12, this.t('uPhase'));
      case 'cosku3': return P(g.ecstasyCount || 0, 3, this.t('uEcstasy'));
      case 'powerHepsi': return P(Object.keys(g.powersSeen || {}).length, 3, this.t('uPower'));
      case 'toplam250k': return P(this.lifetimeScore + g.score, 250000, 'toplam puan');
      default: {
        const kind = { meteorTemiz: 'meteor', firtinaTemiz: 'storm', sisTemiz: 'fog' }[id];
        const inPhase = this.phaseFor(g.phase).kind === kind;
        return { name: a.name, txt: inPhase ? (g.phaseHits === 0 ? 'evredesin — hasarsız devam et!' : 'hasar aldın — sonraki evrede tekrar') : 'evreyi bekle, hasarsız geç', k: inPhase && g.phaseHits === 0 ? 0.65 : 0.12 };
      }
    }
  }

  drawHUD(ctx, time) {
    const g = this.g, W = this.W;
    const fi = this.focusInfo();
    if (fi) {
      const fy = this.H - 118;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffe9a3';
      ctx.font = '700 23px "Space Grotesk", sans-serif';
      ctx.fillText('✦ ' + fi.name, 22, fy);
      ctx.fillStyle = 'rgba(207,217,238,0.95)';
      ctx.font = '600 20px "Space Grotesk", sans-serif';
      ctx.fillText(fi.txt, 22, fy + 30);
      ctx.fillStyle = 'rgba(10,16,34,0.8)';
      ctx.beginPath(); ctx.roundRect(22, fy + 44, 280, 12, 6); ctx.fill();
      ctx.fillStyle = '#ffe9a3';
      ctx.beginPath(); ctx.roundRect(22, fy + 44, Math.max(8, 280 * fi.k), 12, 6); ctx.fill();
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2f6ff';
    ctx.textAlign = 'right';
    ctx.font = '900 44px "Unbounded", "Space Grotesk", sans-serif';
    ctx.fillText(g.score.toLocaleString('tr-TR'), W - 26, this.H - 30);
    if (this.state.phase === 'playing') {
      ctx.fillStyle = '#ffe9a3';
      ctx.font = '900 44px "Unbounded", "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✦ ' + g.credits, 26, this.H - 30);
      // aktif itemler — kullanıldıkça listeden düşer
      let ix = 26;
      ctx.font = '700 34px "Space Grotesk", sans-serif';
      for (const sit of this.SHOP) {
        const n = (g.active && g.active[sit.id]) || 0;
        if (n <= 0) continue;
        ctx.fillStyle = 'hsla(' + sit.hue + ', 80%, 75%, 0.95)';
        const label = sit.sym + (n > 1 ? '×' + n : '');
        ctx.fillText(label, ix, this.H - 86);
        ix += ctx.measureText(label).width + 26;
      }
      ctx.textAlign = 'right';
    }
    if (g.streak >= 2) {
      const mult = (1 + g.streak * 0.15) * (g.ecstasy > 0 ? 2 : 1);
      const pk = 1 + (g.comboPulse || 0) * 0.4;
      ctx.fillStyle = 'hsla(' + Math.round(g.hue) + ', 92%, 76%, 0.98)';
      ctx.font = '900 ' + Math.round((26 + Math.min(16, g.streak)) * pk) + 'px "Unbounded", "Space Grotesk", sans-serif';
      ctx.fillText('x' + mult.toFixed(1).replace('.', ','), W - 26, this.H - 86);
      ctx.fillStyle = 'hsla(' + Math.round(g.hue) + ', 90%, 75%, 0.8)';
      ctx.font = '700 20px "Space Grotesk", sans-serif';
      ctx.fillText(this.t('streakHud') + ' ' + g.streak, W - 26, this.H - 132);
    }
    if (g.ecstasy > 0) {
      ctx.fillStyle = '#ffe9a3';
      ctx.font = '700 20px "Space Grotesk", sans-serif';
      ctx.fillText(this.t('ecstasyHud') + ' · ' + '' + Math.ceil(g.ecstasy) + 's', W - 26, g.streak >= 2 ? this.H - 160 : this.H - 82);
    }
    ctx.textAlign = 'center';
    if (g.power) {
      const pn2 = { magnet: 'Mıknatıs', slow: 'Yavaş Zaman', double: 'Çift Puan' }[g.power.type];
      const pc2 = { magnet: '#59d8ff', slow: '#c9a5ff', double: '#ffe9a3' }[g.power.type];
      ctx.textAlign = 'left';
      ctx.fillStyle = pc2;
      ctx.font = '700 19px "Space Grotesk", sans-serif';
      ctx.fillText(pn2 + ' · ' + Math.ceil(g.power.t) + 's', 72, 148);
      ctx.textAlign = 'center';
    }
    // enerji yayı — auroranın yaşamı
    const ex = 104, ey = 76, er = 32;
    ctx.strokeStyle = 'rgba(124,141,176,0.25)';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, 6.29); ctx.stroke();
    const low = g.energy < 0.25;
    ctx.strokeStyle = low ? 'rgba(255,138,155,' + (0.7 + 0.3 * Math.sin(time * 8)).toFixed(2) + ')' : 'hsla(' + Math.round(g.hue) + ', 90%, 70%, 0.95)';
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(ex, ey, er, -1.57, -1.57 + g.energy * 6.28); ctx.stroke();
    ctx.lineCap = 'butt';
    if (low) {
      ctx.fillStyle = 'rgba(255,138,155,0.95)';
      ctx.font = '700 21px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(this.t('energyLow'), 150, 84);
      ctx.textAlign = 'center';
    }
    if (g.t < 5) {
      ctx.globalAlpha = Math.min(1, 5 - g.t);
      ctx.fillStyle = '#c4d2ea';
      ctx.font = '600 19px "Space Grotesk", sans-serif';
      ctx.fillText(this.t('controlsHint'), W / 2, this.H - 44);
      ctx.globalAlpha = 1;
    }
    // kalkan halkası
    if (g.shield > 0) {
      ctx.strokeStyle = 'rgba(207,226,255,' + (0.6 + 0.3 * Math.sin(time * 4)).toFixed(2) + ')';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(this.playerX(), g.y, 24, 0, 6.29); ctx.stroke();
    }
    if (g.shield > 1) {
      ctx.strokeStyle = 'rgba(207,226,255,' + (0.45 + 0.3 * Math.sin(time * 4 + 1.6)).toFixed(2) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.playerX(), g.y, 32, 0, 6.29); ctx.stroke();
    }
    // evre duyurusu
    if (g.banner) {
      const k = g.banner.t;
      const a = k < 0.4 ? k / 0.4 : (k > 2.0 ? Math.max(0, 1 - (k - 2.0) / 0.6) : 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#f2f6ff';
      ctx.font = '900 38px "Unbounded", "Space Grotesk", sans-serif';
      ctx.shadowColor = 'hsla(' + Math.round(g.hue) + ',90%,70%,0.8)';
      ctx.shadowBlur = 24;
      ctx.fillText(g.banner.txt.toUpperCase(), W / 2, this.H * 0.34);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  // ---------- ses ----------
  ensureAudio() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    try {
      this.ac = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ac.destination);
    } catch (e) { this.ac = null; }
  }
  startAmbient() {
    if (!this.ac || this.ambient) return;
    const ac = this.ac;
    const gn = ac.createGain(); gn.gain.value = 0.045; gn.connect(this.master);
    const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 300; flt.connect(gn);
    [55, 55.7, 110.3].forEach((f) => {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const og = ac.createGain(); og.gain.value = 0.22;
      o.connect(og); og.connect(flt); o.start();
    });
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.06;
    const lg = ac.createGain(); lg.gain.value = 0.025;
    lfo.connect(lg); lg.connect(gn.gain); lfo.start();
    this.ambient = gn;
    const lg2 = ac.createGain(); lg2.gain.value = 0; lg2.connect(this.master);
    [220, 330].forEach((f) => {
      const o2 = ac.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f;
      const og2 = ac.createGain(); og2.gain.value = 0.5;
      o2.connect(og2); og2.connect(lg2); o2.start();
    });
    this.layer = lg2;
  }
  blip(freq, dur, type, vol) {
    if (!this.ac) return;
    const ac = this.ac, t = ac.currentTime;
    const o = ac.createOscillator(); o.type = type || 'sine'; o.frequency.value = freq;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(vol || 0.15, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(gn); gn.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  sfxGate(streak, perfect) {
    const scale = [392, 440, 523, 587, 659, 784, 880, 1046];
    const f = scale[Math.min(scale.length - 1, streak - 1)];
    this.blip(f, 0.35, 'sine', 0.16);
    this.blip(f * 1.5, 0.25, 'sine', 0.06);
    if (perfect) { this.blip(f * 2, 0.6, 'triangle', 0.12); }
  }
  sfxWisp() { this.blip(1318, 0.14, 'sine', 0.06); }
  sfxShard() { this.blip(880, 0.4, 'triangle', 0.1); this.blip(1174, 0.5, 'sine', 0.08); }
  sfxPhase() { this.blip(523, 0.5, 'sine', 0.1); this.blip(784, 0.7, 'sine', 0.08); this.blip(1046, 0.9, 'triangle', 0.05); }
  sfxMiss() { this.blip(196, 0.25, 'sine', 0.07); }
  sfxHit() { this.blip(98, 0.4, 'sawtooth', 0.14); this.blip(65, 0.55, 'sawtooth', 0.1); this.blip(196, 0.12, 'square', 0.05); }
  sfxOver() { this.blip(220, 0.7, 'sine', 0.12); this.blip(146, 1.0, 'sine', 0.1); }
  sfxNear() { this.blip(740, 0.1, 'sine', 0.06); this.blip(988, 0.14, 'sine', 0.05); }
  // her özel evrenin kendi giriş müziği + (bazılarında) evre boyu süren alçak uğultu
  sfxEvent(kind) {
    if (!this.ac) return;
    const seq = (steps) => steps.forEach((st) => setTimeout(() => this.blip(st[0], st[1], st[2], st[3]), st[4]));
    switch (kind) {
      case 'meteor': seq([[988, 0.18, 'sawtooth', 0.07, 0], [784, 0.18, 'sawtooth', 0.07, 120], [587, 0.22, 'sawtooth', 0.08, 240], [392, 0.5, 'sawtooth', 0.1, 380]]); this.eventDrone(52, 7, 0.05); break;
      case 'storm': seq([[523, 0.4, 'sine', 0.1, 0], [659, 0.45, 'sine', 0.1, 90], [784, 0.6, 'triangle', 0.1, 180], [988, 0.9, 'sine', 0.07, 300]]); this.eventDrone(65, 7, 0.045); break;
      case 'fog': seq([[440, 0.9, 'triangle', 0.07, 0], [415, 1.2, 'triangle', 0.06, 350], [311, 1.6, 'sine', 0.07, 700]]); break;
      case 'wind': seq([[330, 0.5, 'sine', 0.06, 0], [262, 0.6, 'sine', 0.07, 180], [196, 0.9, 'sine', 0.08, 380]]); this.eventDrone(49, 6, 0.04); break;
      case 'moon': seq([[1046, 0.8, 'triangle', 0.07, 0], [1318, 0.9, 'triangle', 0.06, 220], [1568, 1.4, 'sine', 0.05, 440]]); break;
      case 'comet': seq([[659, 0.15, 'sine', 0.07, 0], [784, 0.15, 'sine', 0.07, 110], [988, 0.15, 'sine', 0.07, 220], [1318, 0.5, 'triangle', 0.08, 330]]); break;
      case 'finale': this.sfxFinale(); this.eventDrone(65, 9, 0.05); break;
      default: this.sfxPhase();
    }
  }
  // düşük enerji geriye sayım alarmı — enerji azaldıkça tıkırtı hızlanır
  startLowWarn() {
    if (!this.ac || this.lowWarn) return;
    const ac = this.ac;
    const gn = ac.createGain(); gn.gain.value = 0.05; gn.connect(this.master);
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = 622;
    const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = 311;
    const og = ac.createGain(); og.gain.value = 0.5;
    o.connect(og); o2.connect(og); og.connect(gn);
    const lfo = ac.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 2.2;
    const lg = ac.createGain(); lg.gain.value = 0.045;
    lfo.connect(lg); lg.connect(gn.gain);
    o.start(); o2.start(); lfo.start();
    this.lowWarn = { gn, lfo, nodes: [o, o2, lfo] };
  }
  stopLowWarn() {
    if (!this.lowWarn) return;
    const lw = this.lowWarn;
    this.lowWarn = null;
    try {
      const t = this.ac.currentTime;
      lw.gn.gain.cancelScheduledValues(t);
      lw.gn.gain.setValueAtTime(Math.max(0.0001, lw.gn.gain.value), t);
      lw.gn.gain.linearRampToValueAtTime(0.0001, t + 0.3);
      lw.nodes.forEach((n) => n.stop(t + 0.35));
    } catch (e) {}
  }
  eventDrone(freq, dur, vol) {
    if (!this.ac) return;
    const ac = this.ac, t = ac.currentTime;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(vol, t + 0.8);
    gn.gain.setValueAtTime(vol, t + Math.max(1, dur - 1.2));
    gn.gain.linearRampToValueAtTime(0.0001, t + dur);
    gn.connect(this.master);
    [freq, freq * 1.007].forEach((f) => {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const og = ac.createGain(); og.gain.value = 0.5;
      o.connect(og); og.connect(gn);
      o.start(t); o.stop(t + dur + 0.1);
    });
  }
  sfxFinale() { this.blip(523, 0.5, 'sine', 0.12); this.blip(659, 0.6, 'sine', 0.1); this.blip(784, 0.8, 'triangle', 0.1); this.blip(1046, 1.0, 'sine', 0.08); }
}
