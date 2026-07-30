// POLARA — başlatma ve olay bağlama
import { Polara } from './game.js';
import { renderUI } from './ui.js';

const app = new Polara();
const stage = document.getElementById('stage');
const ui = document.getElementById('ui');

// her render'da sıfırlanan işleyici kaydı — şablonlar data-click/data-input/data-pd id'leri üretir
let handlers = new Map();
let hid = 0;
app.regHandler = (fn) => { const id = 'h' + (++hid); handlers.set(id, fn); return id; };

app.onRender = () => {
  handlers = new Map();
  hid = 0;
  ui.innerHTML = renderUI(app);
};

// delege edilen olaylar — en içteki data-click kazanır (prototipteki stopPropagation eşdeğeri)
ui.addEventListener('click', (e) => {
  const el = e.target.closest('[data-click]');
  if (!el) return;
  const f = handlers.get(el.getAttribute('data-click'));
  if (f) f(e);
});
for (const type of ['input', 'change']) {
  ui.addEventListener(type, (e) => {
    const el = e.target.closest('[data-input]');
    if (!el) return;
    const f = handlers.get(el.getAttribute('data-input'));
    if (f) f(e);
  });
}

// oyun girdisi: tüm ekran dokunma alanı; data-stop işaretli katmanlar oyuna düşmez
stage.addEventListener('pointerdown', (e) => {
  const pd = e.target.closest('[data-pd]');
  if (pd) { const f = handlers.get(pd.getAttribute('data-pd')); if (f) f(e); return; }
  if (e.target.closest('[data-stop]')) return;
  // açık modal katmanlar (mağaza/sıralama/gizlilik) oyun girdisi saymaz —
  // oyun sonu ekranında mağaza açıkken dokunuş oyunu yeniden başlatmasın
  if (app.state.showShop || app.state.showBoard || app.state.showPrivacy) return;
  app.handleDown(e);
});
stage.addEventListener('pointerup', (e) => app.handleUp(e));
stage.addEventListener('pointercancel', (e) => app.handleUp(e));

app.mount();
app.onRender();
