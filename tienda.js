/* =====================================================================
   MOTOR DE TIENDA — tienda.js
   ---------------------------------------------------------------------
   Carrito, vista rápida, pago en 3 pasos y animaciones compartidas.
   No hace falta tocar este archivo: los productos y datos del negocio
   se editan en catalogo.js.

   IMPORTANTE SOBRE EL PAGO: el pago con tarjeta es una DEMOSTRACIÓN.
   Ningún dato de tarjeta sale de la página ni se guarda. Para cobrar
   de verdad se conecta una pasarela (Recurrente, NeoNet, Visanet,
   PayPal, etc.) en la función procesarPago().
   ===================================================================== */
(function(){
'use strict';

/* ---------------- Utilidades ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const FINE = matchMedia('(hover: hover) and (pointer: fine)');
const MOBILE = matchMedia('(max-width: 760px)');
const EO  = 'cubic-bezier(0.23,1,0.32,1)';   // entradas y salidas
const EIO = 'cubic-bezier(0.77,0,0.175,1)';  // movimiento en pantalla
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const money = n => 'Q ' + Number(n || 0).toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const pad = n => String(n).padStart(2, '0');
const isoDate = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

const ICON = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  wa: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.8 2 6.8L3.2 29l6.8-2.1c1.9 1.1 4 1.6 6.1 1.6 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4 1.2 1.3-3.9-.3-.4a10.4 10.4 0 0 1-1.7-5.6C5.5 9.9 10.2 5.3 16 5.3s10.5 4.6 10.5 10.3S21.8 26.1 16 26.1zm5.8-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>',
  bag: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 20h36l-3 34a4 4 0 0 1-4 3.6H21a4 4 0 0 1-4-3.6z"/><path d="M24 20v-3a8 8 0 0 1 16 0v3"/><path d="M26 34c2 3 10 3 12 0" opacity=".6"/></svg>'
};

/* ---------------- Configuración ---------------- */
const DEF = {
  prefijo: 'tienda',
  prefijoPedido: 'PED',
  grid: '#t-grid', chips: '#t-chips', search: '#t-search', ancla: '#tienda',
  categorias: {todos: 'Todo'},
  extraFiltro: null,
  dibujar: null,
  confetti: ['#f2a65a', '#e85d75', '#7cc6a8', '#6c8ef5', '#f7d046'],
  entrega: {
    domicilio: {activo: true, costo: 25, gratisDesde: 0, etiqueta: 'Envío a domicilio', detalle: 'Ciudad de Guatemala'},
    recoger: {activo: true, etiqueta: 'Recoger en tienda', detalle: 'Sin costo'},
    zonas: null, anticipacionHoras: 24, diasCerrado: [],
    franjas: ['9:00 a 12:00', '12:00 a 15:00', '15:00 a 18:00'],
    aviso: ''
  },
  pagos: {tarjeta: true, transferencia: true, alRecibir: true},
  banco: {banco: 'Banco Industrial', tipo: 'Monetaria', cuenta: '000-000000-0', nombre: ''},
  textos: {
    agregar: 'Agregar', agregado: 'Listo', elegir: 'Elegir opciones',
    agregadoToast: 'Agregado al carrito', sinResultados: 'No encontramos productos con ese filtro.',
    vacio: 'Tu carrito está vacío', vacioSub: 'Agrega algo rico y aparece aquí.',
    notaPlaceholder: 'Instrucciones especiales, dedicatoria, etc.'
  }
};
let C = null;
let cart = [];
let fCat = 'todos', fExtra = 'todos', fText = '';
const ui = {};
const co = {step: 1, entrega: 'domicilio', pago: 'tarjeta', datos: {}, snapshot: null};

function merge(a, b){
  const o = Object.assign({}, a);
  Object.keys(b || {}).forEach(k => {
    const v = b[k];
    o[k] = (v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) && typeof v !== 'function') ? merge(a[k], v) : v;
  });
  return o;
}

/* ---------------- Carrito (se guarda en el navegador) ---------------- */
const KEY = () => C.prefijo + '_carrito';
const findP = id => C.productos.find(p => p.id === id);
const count = () => cart.reduce((a, l) => a + l.qty, 0);
const subtotal = (list = cart) => list.reduce((a, l) => a + l.qty * l.precio, 0);
const precioDe = p => (p.opciones && p.opciones.valores && p.opciones.valores.length) ? Math.min(...p.opciones.valores.map(v => v.precio)) : p.precio;

function loadCart(){
  try { cart = JSON.parse(localStorage.getItem(KEY()) || '[]'); } catch(e){ cart = []; }
  if(!Array.isArray(cart)) cart = [];
  cart = cart.filter(l => l && l.key && l.qty > 0 && isFinite(l.precio) && (l.svg || l.foto || findP(l.id)));
}
function saveCart(){ try { localStorage.setItem(KEY(), JSON.stringify(cart)); } catch(e){} }

function art(p){
  if(p.foto) return '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy" decoding="async">';
  return C.dibujar ? C.dibujar(p) : '';
}
function lineArt(l){
  if(l.svg) return l.svg;
  if(l.foto) return '<img src="' + esc(l.foto) + '" alt="">';
  const p = findP(l.id);
  return p ? art(p) : '';
}

/* ---------------- Animaciones compartidas ---------------- */

/* Reordenar una cuadrícula con FLIP: lo que se queda se desliza a su nuevo lugar,
   lo que sale suelta su espacio de inmediato y se desvanece donde estaba,
   lo nuevo aparece. Todo al mismo tiempo. */
function flip(container, mutate){
  if(RM.matches || !container){ mutate(); return; }
  $$(':scope > .t-ghost', container).forEach(g => g.remove());
  const cr = container.getBoundingClientRect();
  const before = new Map();
  [...container.children].forEach(el => { if(el.dataset.key) before.set(el.dataset.key, {el, r: el.getBoundingClientRect()}); });
  mutate();
  const after = [...container.children].filter(el => el.dataset.key);
  const keys = new Set(after.map(el => el.dataset.key));
  before.forEach(({el, r}, k) => {
    if(keys.has(k)) return;
    el.classList.add('t-ghost');
    Object.assign(el.style, {position: 'absolute', left: (r.left - cr.left) + 'px', top: (r.top - cr.top) + 'px', width: r.width + 'px', height: r.height + 'px', margin: '0', pointerEvents: 'none', zIndex: '0'});
    container.appendChild(el);
    el.animate([{opacity: 1, transform: 'scale(1)'}, {opacity: 0, transform: 'scale(.94)'}], {duration: 200, easing: EO, fill: 'forwards'}).onfinish = () => el.remove();
  });
  let n = 0;
  after.forEach(el => {
    const b = before.get(el.dataset.key);
    if(b){
      const r = el.getBoundingClientRect();
      const dx = b.r.left - r.left, dy = b.r.top - r.top;
      if(Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{transform: 'translate(' + dx + 'px,' + dy + 'px)'}, {transform: 'none'}], {duration: 440, easing: EIO});
    } else {
      const delay = 60 + [0, 30, 55, 75, 90, 100, 108][Math.min(n++, 6)];
      el.animate([{opacity: 0, transform: 'scale(.95)'}, {opacity: 1, transform: 'none'}], {duration: 320, delay, easing: EO, fill: 'backwards'});
    }
  });
}

/* Número que rueda hacia arriba al subir y hacia abajo al bajar */
function roll(out, val, dir){
  const s = out.querySelector('span') || out;
  s.textContent = val;
  if(RM.matches || !dir) return;
  s.animate([{transform: 'translateY(' + (dir > 0 ? 70 : -70) + '%)', opacity: 0}, {transform: 'none', opacity: 1}], {duration: 220, easing: EO});
}

function pulse(el, s = 1.14){
  if(!el || RM.matches || !el.animate) return;
  el.animate([{transform: 'scale(1)'}, {transform: 'scale(' + s + ')', offset: .35}, {transform: 'scale(1)'}], {duration: 360, easing: EO});
}

/* El producto vuela en arco hasta el carrito; el carrito "lo recibe" al llegar */
function fly(fromEl){
  const target = $$('[data-cart-open]').find(b => { const r = b.getBoundingClientRect(); return r.width && r.bottom > 0 && r.top < innerHeight; });
  if(!fromEl || !target || RM.matches) return Promise.resolve(target);
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  if(!a.width) return Promise.resolve(target);
  const size = Math.min(a.width, a.height, 150);
  const wrap = document.createElement('div');
  const clone = fromEl.cloneNode(true);
  Object.assign(wrap.style, {position: 'fixed', left: (a.left + a.width / 2 - size / 2) + 'px', top: (a.top + a.height / 2 - size / 2) + 'px', width: size + 'px', height: size + 'px', zIndex: '260', pointerEvents: 'none'});
  ['position', 'left', 'top', 'width', 'height', 'opacity', 'pointerEvents', 'transform', 'transition'].forEach(k => { clone.style[k] = ''; });
  clone.removeAttribute('id');
  Object.assign(clone.style, {width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', display: 'block'});
  wrap.appendChild(clone);
  document.body.appendChild(wrap);
  const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
  const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
  const D = 720;
  wrap.animate([{transform: 'translateX(0)'}, {transform: 'translateX(' + dx + 'px)'}], {duration: D, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards'});
  const inner = clone.animate([{transform: 'translateY(0) scale(1)', opacity: 1}, {transform: 'translateY(' + dy + 'px) scale(.14)', opacity: .5}], {duration: D, easing: 'cubic-bezier(0.55,-0.55,0.8,1)', fill: 'forwards'});
  return inner.finished.then(() => { wrap.remove(); return target; }, () => { wrap.remove(); return target; });
}

/* Arrastrar hacia abajo para cerrar una hoja (solo en el cel) */
function dragToClose(panel, handleSel, onClose){
  let y0 = 0, t0 = 0, dy = 0, drag = false, id = null;
  panel.addEventListener('pointerdown', e => {
    if(!MOBILE.matches || drag || !e.target.closest(handleSel) || e.target.closest('button,a,input,select,textarea,summary')) return;
    drag = true; id = e.pointerId; y0 = e.clientY; t0 = performance.now(); dy = 0;
    try { panel.setPointerCapture(id); } catch(_){}
    panel.style.transition = 'none';
  });
  panel.addEventListener('pointermove', e => {
    if(!drag || e.pointerId !== id) return;
    const raw = e.clientY - y0;
    dy = raw > 0 ? raw : -Math.pow(-raw, 0.65); // hacia arriba cuesta más: resistencia, no pared
    panel.style.transform = 'translateY(' + dy + 'px)';
  });
  const end = e => {
    if(!drag || e.pointerId !== id) return;
    drag = false;
    try { panel.releasePointerCapture(id); } catch(_){}
    const v = dy / Math.max(1, performance.now() - t0);
    panel.style.transition = '';
    panel.style.transform = '';
    if(dy > 120 || (v > 0.11 && dy > 24)) onClose();
  };
  panel.addEventListener('pointerup', end);
  panel.addEventListener('pointercancel', end);
}

function confetti(origin){
  if(RM.matches || !origin) return;
  const r = origin.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for(let i = 0; i < 48; i++){
    const p = document.createElement('i');
    p.className = 't-confetti';
    p.style.background = C.confetti[i % C.confetti.length];
    p.style.left = (cx - 4) + 'px'; p.style.top = (cy - 6) + 'px';
    if(i % 3 === 0){ p.style.width = p.style.height = '8px'; p.style.borderRadius = '50%'; }
    document.body.appendChild(p);
    const ang = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.1;
    const v = 140 + Math.random() * 240;
    const dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
    const rot = Math.random() * 900 - 450;
    p.animate([
      {transform: 'translate(0,0) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(0.15,0.7,0.35,1)'},
      {transform: 'translate(' + dx * .75 + 'px,' + dy + 'px) rotate(' + rot * .5 + 'deg)', opacity: 1, offset: .38, easing: 'cubic-bezier(0.5,0,0.9,0.7)'},
      {transform: 'translate(' + dx + 'px,' + (dy + 460) + 'px) rotate(' + rot + 'deg)', opacity: 0}
    ], {duration: 1500 + Math.random() * 700}).onfinish = () => p.remove();
  }
}

function toast(msg){
  if(!ui.toasts) return;
  const t = document.createElement('div');
  t.className = 't-toast'; t.textContent = msg;
  ui.toasts.appendChild(t);
  while(ui.toasts.children.length > 3) ui.toasts.firstChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, 2300);
}

/* ---------------- Capas (carrito, hojas) ---------------- */
const stack = [];
function openLayer(el, trigger){
  if(stack.some(s => s.el === el)) return;
  stack.push({el, trigger: trigger || document.activeElement});
  el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
  ui.backdrop.classList.add('open');
  document.documentElement.classList.add('t-lock');
  setTimeout(() => { const f = el.querySelector('[data-autofocus]') || el.querySelector('.t-x'); f && f.focus({preventScroll: true}); }, 60);
}
function closeLayer(el, restore = true){
  const i = stack.findIndex(s => s.el === el);
  if(i < 0) return;
  const trigger = stack[i].trigger;
  stack.splice(i, 1);
  el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
  if(!stack.length){ ui.backdrop.classList.remove('open'); document.documentElement.classList.remove('t-lock'); }
  if(restore && trigger && trigger.focus && document.contains(trigger)) trigger.focus({preventScroll: true});
  el.dispatchEvent(new CustomEvent('t-close'));
}
const topLayer = () => stack.length ? stack[stack.length - 1].el : null;

/* ---------------- Interfaz inyectada ---------------- */
function injectUI(){
  const w = document.createElement('div');
  w.className = 't-ui';
  w.innerHTML =
    '<div class="t-backdrop"></div>' +
    '<aside class="t-drawer" id="t-cart" role="dialog" aria-modal="true" aria-labelledby="t-cart-title" aria-hidden="true">' +
      '<header class="t-drawer-head"><h3 id="t-cart-title">Tu carrito <span class="t-count"></span></h3><button type="button" class="t-x" data-close aria-label="Cerrar carrito">×</button></header>' +
      '<div class="t-ship" hidden><span class="t-ship-txt"></span><div class="t-bar"><i></i></div></div>' +
      '<div class="t-lines"></div>' +
      '<footer class="t-drawer-foot"><div class="t-row total"><span>Subtotal</span><b class="t-sub"></b></div><span class="t-note">El envío y la forma de pago se eligen en el siguiente paso.</span><button type="button" class="t-cta" data-checkout>Continuar al pago</button></footer>' +
    '</aside>' +
    '<div class="t-sheet" id="t-quick" role="dialog" aria-modal="true" aria-labelledby="t-quick-title" aria-hidden="true"><div class="t-panel"><div class="t-handle" aria-hidden="true"></div><button type="button" class="t-x" data-close aria-label="Cerrar">×</button><div class="t-quick"></div></div></div>' +
    '<div class="t-sheet" id="t-checkout" role="dialog" aria-modal="true" aria-labelledby="t-co-title" aria-hidden="true">' + checkoutHTML() + '</div>' +
    '<div class="t-toasts" role="status" aria-live="polite"></div>';
  document.body.appendChild(w);
  Object.assign(ui, {
    backdrop: $('.t-backdrop', w), drawer: $('#t-cart', w), lines: $('.t-lines', w), sub: $('.t-sub', w), count: $('.t-count', w),
    ship: $('.t-ship', w), shipTxt: $('.t-ship-txt', w), shipBar: $('.t-ship .t-bar i', w), coBtn: $('[data-checkout]', w),
    quick: $('#t-quick', w), quickBody: $('#t-quick .t-quick', w), sheet: $('#t-checkout', w), toasts: $('.t-toasts', w)
  });
  ui.coPanel = $('.t-panel', ui.sheet);
  dragToClose($('.t-panel', ui.quick), '.t-handle', () => closeLayer(ui.quick));
  dragToClose(ui.coPanel, '.t-handle,.t-co-head', () => closeLayer(ui.sheet));
}

/* ---------------- Catálogo ---------------- */
function mountCatalog(){
  ui.grid = $(C.grid);
  if(!ui.grid) return;
  ui.grid.classList.add('t-grid');
  ui.chips = $(C.chips);
  ui.extra = C.extraFiltro ? $(C.extraFiltro.el) : null;
  ui.search = $(C.search);
  renderChips();
  renderGrid(false);
  ui.chips && ui.chips.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if(!b || b.dataset.cat === fCat) return;
    fCat = b.dataset.cat; renderChips(); renderGrid(true);
  });
  ui.extra && ui.extra.addEventListener('click', e => {
    const b = e.target.closest('[data-extra]'); if(!b || b.dataset.extra === fExtra) return;
    fExtra = b.dataset.extra; renderChips(); renderGrid(true);
  });
  if(ui.search){
    /* Al escribir no se anima: se escribe muchas veces y el movimiento estorbaría */
    ui.search.addEventListener('input', () => { fText = ui.search.value; renderGrid(false); });
    ui.search.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); ui.search.blur(); } });
  }
}
function chipHTML(k, v, on, attr){
  return '<button type="button" class="t-chip' + (on ? ' on' : '') + '" ' + attr + '="' + esc(k) + '" aria-pressed="' + on + '">' + esc(v) + '</button>';
}
function renderChips(){
  if(ui.chips) ui.chips.innerHTML = Object.entries(C.categorias).map(([k, v]) => chipHTML(k, v, fCat === k, 'data-cat')).join('');
  if(ui.extra) ui.extra.innerHTML = Object.entries(C.extraFiltro.valores).map(([k, v]) => chipHTML(k, v, fExtra === k, 'data-extra')).join('');
}
function filtered(){
  const t = norm(fText);
  const xf = C.extraFiltro;
  return C.productos.filter(p =>
    (fCat === 'todos' || p.categoria === fCat) &&
    (!xf || fExtra === 'todos' || p[xf.campo] === fExtra || p[xf.campo] === (xf.comodin || 'todos')) &&
    (!t || norm([p.nombre, p.desc, C.categorias[p.categoria], (p.tags || []).join(' ')].join(' ')).includes(t))
  );
}
function cardHTML(p){
  const opts = p.opciones && p.opciones.valores && p.opciones.valores.length > 1;
  return '<article class="t-card" data-key="' + esc(p.id) + '">' +
    '<div class="t-card-img" data-quick="' + esc(p.id) + '" role="button" tabindex="0" aria-label="Ver detalles de ' + esc(p.nombre) + '">' + art(p) + (p.etiqueta ? '<span class="t-tag">' + esc(p.etiqueta) + '</span>' : '') + '</div>' +
    '<div class="t-card-body"><span class="t-card-cat">' + esc(C.categorias[p.categoria] || '') + '</span><h3>' + esc(p.nombre) + '</h3><p class="t-card-desc">' + esc(p.desc || '') + '</p>' +
    '<div class="t-card-foot"><span class="t-price">' + (opts ? '<small>Desde</small>' : '') + money(precioDe(p)) + '</span>' +
    (opts
      ? '<button type="button" class="t-add" data-quick="' + esc(p.id) + '"><span class="t-lbl">' + esc(C.textos.elegir) + '</span></button>'
      : '<button type="button" class="t-add" data-add="' + esc(p.id) + '" aria-label="Agregar ' + esc(p.nombre) + ' al carrito"><span class="t-lbl">' + ICON.plus + esc(C.textos.agregar) + '</span><span class="t-ok" aria-hidden="true">' + ICON.check + esc(C.textos.agregado) + '</span></button>') +
    '</div></div></article>';
}
function renderGrid(anim){
  if(!ui.grid) return;
  const list = filtered();
  const html = list.length ? list.map(cardHTML).join('') : '<p class="t-empty">' + esc(C.textos.sinResultados) + '</p>';
  if(anim) flip(ui.grid, () => { ui.grid.innerHTML = html; });
  else ui.grid.innerHTML = html;
}

/* ---------------- Vista rápida ---------------- */
function openQuick(id, trigger){
  const p = findP(id); if(!p) return;
  const vals = (p.opciones && p.opciones.valores && p.opciones.valores.length) ? p.opciones.valores : null;
  let sel = 0, qty = 1;
  const price = () => vals ? vals[sel].precio : p.precio;
  ui.quickBody.innerHTML =
    '<div class="t-quick-img">' + art(p) + '</div>' +
    '<div class="t-quick-info"><span class="t-label">' + esc(C.categorias[p.categoria] || '') + '</span>' +
    '<h3 id="t-quick-title">' + esc(p.nombre) + '</h3><p>' + esc(p.desc || '') + '</p>' + (p.detalle ? '<p>' + esc(p.detalle) + '</p>' : '') +
    (vals ? '<div><div class="t-label" style="margin-bottom:8px">' + esc(p.opciones.nombre || 'Opción') + '</div><div class="t-opts">' +
      vals.map((v, i) => '<label class="t-radio"><input type="radio" name="t-opt" value="' + i + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(v.label) + '<small>' + money(v.precio) + '</small></span></label>').join('') + '</div></div>' : '') +
    '<div class="t-row total"><span>Total</span><b class="t-qtotal">' + money(price()) + '</b></div>' +
    '<div class="t-quick-buy"><div class="t-qty"><button type="button" data-q="-1" aria-label="Menos">−</button><output aria-live="polite"><span>1</span></output><button type="button" data-q="1" aria-label="Más">+</button></div>' +
    '<button type="button" class="t-cta t-qadd" data-autofocus>' + ICON.cart + ' Agregar al carrito</button></div></div>';
  const tot = $('.t-qtotal', ui.quickBody);
  const upd = () => { tot.textContent = money(price() * qty); };
  ui.quickBody.onchange = e => { if(e.target.name === 't-opt'){ sel = +e.target.value; upd(); } };
  ui.quickBody.onclick = e => {
    const q = e.target.closest('[data-q]');
    if(q){ const d = +q.dataset.q; if(qty + d < 1 || qty + d > 50) return; qty += d; roll($('output', ui.quickBody), qty, d); upd(); return; }
    if(e.target.closest('.t-qadd')){
      const img = $('.t-quick-img > *', ui.quickBody);
      const src = img ? img.cloneNode(true) : null;
      const rect = img ? img.getBoundingClientRect() : null;
      closeLayer(ui.quick, false);
      add({id: p.id, nombre: p.nombre, opcion: vals ? vals[sel].label : '', precio: price(), qty}, src && rect ? {el: src, rect} : null);
    }
  };
  ui.quickBody.parentElement.scrollTop = 0;
  openLayer(ui.quick, trigger);
}

/* ---------------- Agregar al carrito ---------------- */
function add(item, from){
  const key = item.key || (item.id + '|' + (item.opcion || '') + '|' + (item.detalle || ''));
  const qty = Math.max(1, item.qty || 1);
  const ex = cart.find(l => l.key === key);
  if(ex) ex.qty += qty;
  else cart.push({key, id: item.id, nombre: item.nombre, opcion: item.opcion || '', detalle: item.detalle || '', precio: +item.precio, qty, svg: item.svg || null, foto: item.foto || null});
  saveCart(); renderCart();
  /* El contador cambia cuando el producto llega al carrito, no antes */
  let src = null;
  if(from && from.el && from.rect){
    src = from.el;
    Object.assign(src.style, {position: 'fixed', left: from.rect.left + 'px', top: from.rect.top + 'px', width: from.rect.width + 'px', height: from.rect.height + 'px', opacity: 0, pointerEvents: 'none'});
    document.body.appendChild(src);
  } else if(from && from.nodeType === 1) src = from;
  fly(src).then(target => {
    if(src && from && from.el) src.remove();
    badges(); pulse(target, 1.12);
  });
  toast((qty > 1 ? qty + ' × ' : '') + item.nombre + ' · ' + C.textos.agregadoToast);
}

function badges(){
  const n = count();
  $$('[data-cart-count]').forEach(b => { b.textContent = n; b.dataset.n = n; });
}

/* ---------------- Cajón del carrito ---------------- */
function lineHTML(l){
  return '<div class="t-line" data-key="' + esc(l.key) + '"><div class="t-thumb">' + lineArt(l) + '</div>' +
    '<div><h4>' + esc(l.nombre) + '</h4>' + (l.opcion ? '<small>' + esc(l.opcion) + '</small>' : '') + (l.detalle ? '<small>' + esc(l.detalle) + '</small>' : '') + '<small>' + money(l.precio) + ' c/u</small></div>' +
    '<div class="t-line-r"><b>' + money(l.precio * l.qty) + '</b><div class="t-qty"><button type="button" data-dq="-1" aria-label="Quitar uno">−</button><output><span>' + l.qty + '</span></output><button type="button" data-dq="1" aria-label="Agregar uno">+</button></div><button type="button" class="t-del" data-del>Quitar</button></div></div>';
}
function renderCart(){
  ui.lines.innerHTML = cart.length ? cart.map(lineHTML).join('')
    : '<div class="t-cart-empty">' + ICON.bag + '<b>' + esc(C.textos.vacio) + '</b><p>' + esc(C.textos.vacioSub) + '</p><button type="button" class="t-cta" data-goshop>Ver productos</button></div>';
  totals();
}
function totals(){
  const n = count(), s = subtotal();
  ui.count.textContent = n ? '(' + n + ')' : '';
  ui.sub.textContent = money(s);
  ui.coBtn.disabled = !n;
  const d = C.entrega.domicilio;
  if(d && d.activo && d.minimo && n && s < d.minimo){
    ui.ship.hidden = false;
    ui.shipTxt.innerHTML = 'Compra mínima para envío a domicilio: <b>' + money(d.minimo) + '</b>. Te faltan <b>' + money(d.minimo - s) + '</b>';
    ui.shipBar.style.transform = 'scaleX(' + (s / d.minimo) + ')';
  } else if(d && d.activo && d.minimo && n && !d.gratisDesde && !d.costo){
    ui.ship.hidden = false;
    ui.shipTxt.innerHTML = '¡Tu pedido tiene <b>envío gratis</b> a domicilio!';
    ui.shipBar.style.transform = 'scaleX(1)';
  } else if(d && d.activo && d.gratisDesde && n){
    ui.ship.hidden = false;
    const falta = d.gratisDesde - s;
    ui.shipTxt.innerHTML = falta > 0 ? 'Te faltan <b>' + money(falta) + '</b> para el envío gratis' : '¡Tu pedido tiene <b>envío gratis</b>!';
    ui.shipBar.style.transform = 'scaleX(' + Math.min(1, s / d.gratisDesde) + ')';
  } else ui.ship.hidden = true;
}
function removeLine(el, l){
  cart = cart.filter(x => x !== l); saveCart(); totals(); badges();
  if(RM.matches || !el.animate){ renderCart(); return; }
  const cs = getComputedStyle(el);
  el.style.overflow = 'hidden';
  el.animate([
    {height: el.offsetHeight + 'px', opacity: 1, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom},
    {height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px'}
  ], {duration: 260, easing: EO, fill: 'forwards'}).onfinish = () => { el.remove(); if(!cart.length) renderCart(); };
}
function openCart(trigger){ renderCart(); openLayer(ui.drawer, trigger); }

/* ---------------- Pago ---------------- */
function checkoutHTML(){
  const E = C.entrega, P = C.pagos, T = C.tienda || {};
  const sedes = T.sedes || [];
  const radio = (name, val, icon, title, sub, checked) => '<label class="t-radio"><input type="radio" name="' + name + '" value="' + val + '"' + (checked ? ' checked' : '') + '><span><i aria-hidden="true">' + icon + '</i><em><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></em></span></label>';
  const dom = E.domicilio && E.domicilio.activo, rec = E.recoger && E.recoger.activo && sedes.length;
  co.entrega = dom ? 'domicilio' : 'recoger';
  const metodos = [P.tarjeta && ['tarjeta', '💳', 'Tarjeta'], P.transferencia && ['transferencia', '🏦', 'Transferencia'], P.alRecibir && ['alRecibir', '💵', 'Al recibir']].filter(Boolean);
  co.pago = metodos.length ? metodos[0][0] : 'alRecibir';
  const field = (label, html, full) => '<label class="t-field' + (full ? ' full' : '') + '">' + label + html + '<span class="t-err"></span></label>';
  return '<div class="t-panel t-co">' +
    '<div class="t-handle" aria-hidden="true"></div>' +
    '<header class="t-co-head"><h3 id="t-co-title">Finalizar compra</h3><button type="button" class="t-x" data-close aria-label="Cerrar">×</button>' +
      '<ol class="t-steps"><li class="on"><b>1</b><span>Entrega</span></li><li><b>2</b><span>Pago</span></li><li><b>3</b><span>Confirmación</span></li></ol><div class="t-stepbar"><i></i></div></header>' +
    '<div class="t-co-grid"><div class="t-co-main"><div class="t-stage">' +
      /* Paso 1 */
      '<form class="t-step" data-step="1" novalidate>' +
        '<h4>¿Quién recibe el pedido?</h4><div class="t-fields">' +
          field('Nombre completo', '<input name="nombre" autocomplete="name" autocapitalize="words" enterkeyhint="next" required>') +
          field('Teléfono / WhatsApp', '<input name="telefono" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="next" placeholder="5555 5555" required>') +
          field('Correo (opcional)', '<input name="correo" type="email" autocomplete="email" autocapitalize="none" spellcheck="false" enterkeyhint="next">', true) +
        '</div>' +
        '<h4>¿Cómo lo recibes?</h4><div class="t-choices">' +
          (dom ? radio('entrega', 'domicilio', '🛵', E.domicilio.etiqueta, (E.domicilio.costo ? money(E.domicilio.costo) : 'Gratis') + (E.domicilio.gratisDesde ? ' · gratis desde ' + money(E.domicilio.gratisDesde) : '') + (E.domicilio.minimo ? ' · compra mínima ' + money(E.domicilio.minimo) : ''), true) : '') +
          (rec ? radio('entrega', 'recoger', '🏪', E.recoger.etiqueta, E.recoger.detalle, !dom) : '') +
        '</div>' +
        (dom ? '<div class="t-fields" data-when="domicilio">' +
          field('Dirección de entrega', '<input name="direccion" autocomplete="street-address" enterkeyhint="next" placeholder="Calle, avenida, número, casa o apartamento" required>', true) +
          (E.zonas ? field('Zona o municipio', '<select name="zona" required><option value="">Elige…</option>' + E.zonas.map(z => '<option>' + esc(z) + '</option>').join('') + '</select>')
                   : field('Zona o municipio', '<input name="zona" autocomplete="address-level2" required>')) +
          field('Referencia (opcional)', '<input name="referencia" enterkeyhint="next" placeholder="Portón negro, frente al parque…">') +
        '</div>' : '') +
        (rec ? '<div class="t-fields" data-when="recoger"' + (dom ? ' hidden' : '') + '>' +
          field('Sucursal', '<select name="sede">' + sedes.map(s => '<option>' + esc(s.nombre + ' — ' + s.direccion) + '</option>').join('') + '</select>', true) +
        '</div>' : '') +
        '<div class="t-fields">' +
          field('Fecha', '<input name="fecha" type="date" required>') +
          field('Horario', '<select name="hora">' + E.franjas.map(f => '<option>' + esc(f) + '</option>').join('') + '</select>') +
          field('Notas (opcional)', '<textarea name="nota" placeholder="' + esc(C.textos.notaPlaceholder) + '"></textarea>', true) +
        '</div>' +
        (E.aviso ? '<p class="t-hint">' + esc(E.aviso) + '</p>' : '') +
        '<div class="t-actions"><button type="submit" class="t-cta">Continuar al pago →</button></div>' +
      '</form>' +
      /* Paso 2 */
      '<form class="t-step" data-step="2" novalidate hidden autocomplete="off">' +
        '<h4>¿Cómo quieres pagar?</h4>' +
        '<div class="t-paytabs">' + metodos.map((m, i) => '<label class="t-radio"><input type="radio" name="pago" value="' + m[0] + '"' + (i === 0 ? ' checked' : '') + '><span><i aria-hidden="true">' + m[1] + '</i>' + m[2] + '</span></label>').join('') + '</div>' +
        (P.tarjeta ? '<div class="t-pay-panel" data-pay="tarjeta">' +
          '<div class="t-card3d" aria-hidden="true"><div class="t-card3d-in"><div class="t-face front"><div class="t-face-top"><div class="t-chipcard"></div><span class="t-brand"></span></div><div class="t-cnum">•••• •••• •••• ••••</div><div class="t-cbottom"><div><span>Titular</span><b class="t-cname">NOMBRE APELLIDO</b></div><div><span>Vence</span><b class="t-cexp">MM/AA</b></div></div></div><div class="t-face back"><div class="strip"></div><div class="cvv">•••</div></div></div></div>' +
          '<div class="t-fields">' +
            field('Número de tarjeta', '<input name="demo-num" inputmode="numeric" autocomplete="off" placeholder="1234 1234 1234 1234" maxlength="23" enterkeyhint="next">', true) +
            field('Nombre en la tarjeta', '<input name="demo-name" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="next">', true) +
            field('Vence', '<input name="demo-exp" inputmode="numeric" autocomplete="off" placeholder="MM/AA" maxlength="5" enterkeyhint="next">') +
            field('CVV', '<input name="demo-cvv" inputmode="numeric" autocomplete="off" placeholder="123" maxlength="4" enterkeyhint="done">') +
          '</div>' +
          '<p class="t-hint">Modo de prueba: usa <code>4242 4242 4242 4242</code>, cualquier fecha futura y cualquier CVV. Con <code>4000 0000 0000 0002</code> puedes ver un pago rechazado.</p>' +
        '</div>' : '') +
        (P.transferencia ? '<div class="t-pay-panel" data-pay="transferencia" hidden><div class="t-bank">Banco: <b>' + esc(C.banco.banco) + '</b><br>Cuenta ' + esc(C.banco.tipo) + ': <b>' + esc(C.banco.cuenta) + '</b><br>A nombre de: <b>' + esc(C.banco.nombre || T.nombre || '') + '</b></div><p class="t-hint">Al confirmar te mostramos tu número de pedido. Envíanos la foto del comprobante y lo preparamos.</p></div>' : '') +
        (P.alRecibir ? '<div class="t-pay-panel" data-pay="alRecibir" hidden><p class="t-hint">Pagas en efectivo o con tarjeta (POS) cuando recibes o recoges tu pedido.</p></div>' : '') +
        '<div class="t-actions"><button type="button" class="t-cta ghost" data-back>← Atrás</button><button type="submit" class="t-cta t-pay"><span class="t-spinner" aria-hidden="true"></span><span class="t-pay-lbl">Pagar</span></button></div>' +
      '</form>' +
      /* Paso 3 */
      '<div class="t-step t-success" data-step="3" hidden tabindex="-1">' +
        '<svg class="t-check" viewBox="0 0 92 92" aria-hidden="true"><circle cx="46" cy="46" r="40"/><path d="M28 47l12 12 24-26"/></svg>' +
        '<h4>¡Pedido confirmado!</h4><span class="t-order"></span><p class="t-success-msg"></p>' +
        '<div class="t-actions"><a class="t-cta wa t-wa-order" target="_blank" rel="noopener">' + ICON.wa + ' Enviar pedido por WhatsApp</a><button type="button" class="t-cta ghost" data-close>Seguir viendo</button></div>' +
      '</div>' +
    '</div></div>' +
    '<details class="t-co-sum" open><summary><span>Resumen <span class="t-sum-n"></span></span><b class="t-sum-total"></b></summary><div class="t-sum-lines"></div><div class="t-sum-tot"></div></details>' +
    '</div>' +
    '<p class="t-demo">🔒 Pago de demostración: no se realiza ningún cobro y los datos de tarjeta no salen de esta página.</p>' +
  '</div>';
}

function envio(){
  if(co.entrega !== 'domicilio') return 0;
  const d = C.entrega.domicilio;
  return d.gratisDesde && subtotal() >= d.gratisDesde ? 0 : (d.costo || 0);
}
function renderSummary(){
  const snap = co.snapshot;
  const items = snap ? snap.items : cart;
  const sub = subtotal(items), env = snap ? snap.envio : envio(), tot = sub + env;
  const n = items.reduce((a, l) => a + l.qty, 0);
  $('.t-sum-n', ui.sheet).textContent = '(' + n + ')';
  $('.t-sum-total', ui.sheet).textContent = money(tot);
  $('.t-sum-lines', ui.sheet).innerHTML = items.map(l => '<div class="t-sum-line"><div class="t-thumb">' + lineArt(l) + '<em>' + l.qty + '</em></div><div>' + esc(l.nombre) + (l.opcion ? '<small>' + esc(l.opcion) + '</small>' : '') + (l.detalle ? '<small>' + esc(l.detalle) + '</small>' : '') + '</div><b>' + money(l.precio * l.qty) + '</b></div>').join('');
  $('.t-sum-tot', ui.sheet).innerHTML =
    '<div class="t-row"><span>Subtotal</span><b>' + money(sub) + '</b></div>' +
    '<div class="t-row"><span>Envío</span><b>' + ((snap ? snap.entrega === 'domicilio' : co.entrega === 'domicilio') ? (env ? money(env) : 'Gratis') : 'Recoges en tienda') + '</b></div>' +
    '<div class="t-row total"><span>Total</span><b>' + money(tot) + '</b></div>';
  const lbl = $('.t-pay-lbl', ui.sheet);
  if(lbl) lbl.textContent = co.pago === 'tarjeta' ? 'Pagar ' + money(tot) : 'Confirmar pedido · ' + money(tot);
}

/* Primer día posible: respeta la anticipación, los días sin entregas y la hora de cierre */
function minFecha(){
  const d = new Date(Date.now() + (C.entrega.anticipacionHoras || 0) * 3600e3);
  const H = C.tienda && C.tienda.horario, closed = C.entrega.diasCerrado || [];
  for(let i = 0; i < 14; i++){
    const hr = H ? H[d.getDay()] : [0, 24];
    if(!closed.includes(d.getDay()) && hr && (i > 0 || d.getHours() + d.getMinutes() / 60 < hr[1])) break;
    d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0);
  }
  return isoDate(d);
}

function setErr(input, msg){
  const f = input.closest('.t-field');
  if(!f) return;
  const had = f.classList.contains('bad');
  f.classList.toggle('bad', !!msg);
  f.querySelector('.t-err').textContent = msg || '';
  if(msg && had){ f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; }
}
function validate(form, rules){
  let first = null;
  rules.forEach(([name, test]) => {
    const el = form.elements[name];
    if(!el || el.closest('[hidden]')) return;
    const msg = test(el.value.trim(), el);
    setErr(el, msg);
    if(msg && !first) first = el;
  });
  if(first) first.focus();
  return !first;
}

const digits = v => v.replace(/\D/g, '');
function luhn(n){
  let s = 0, alt = false;
  for(let i = n.length - 1; i >= 0; i--){ let d = +n[i]; if(alt){ d *= 2; if(d > 9) d -= 9; } s += d; alt = !alt; }
  return n.length >= 13 && s % 10 === 0;
}
const brandOf = n => /^4/.test(n) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(n) ? 'Mastercard' : /^3[47]/.test(n) ? 'AMEX' : '';

function goStep(n, instant){
  const stage = $('.t-stage', ui.sheet);
  const cur = $('.t-step:not([hidden])', stage), next = $('.t-step[data-step="' + n + '"]', stage);
  const dir = n > co.step ? 1 : -1;
  co.step = n;
  $$('.t-steps li', ui.sheet).forEach((li, i) => li.classList.toggle('on', i < n));
  $('.t-stepbar i', ui.sheet).style.setProperty('--p', n / 3);
  if(!cur || cur === next){ next.hidden = false; return; }
  if(instant || RM.matches){ cur.hidden = true; next.hidden = false; return; }
  /* Adelante: lo nuevo entra desde la derecha. Atrás: desde la izquierda. */
  const h0 = stage.offsetHeight;
  cur.style.position = 'absolute'; cur.style.top = '0'; cur.style.left = '0'; cur.style.right = '0';
  next.hidden = false;
  const h1 = next.offsetHeight;
  stage.style.overflow = 'hidden';
  stage.animate([{height: h0 + 'px'}, {height: h1 + 'px'}], {duration: 380, easing: EO}).onfinish = () => { stage.style.overflow = ''; };
  cur.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'translateX(' + (-28 * dir) + 'px)'}], {duration: 200, easing: EO, fill: 'forwards'}).onfinish = a => {
    cur.hidden = true; cur.style.position = cur.style.top = cur.style.left = cur.style.right = ''; a.target && a.target.cancel && a.target.cancel();
  };
  next.animate([{opacity: 0, transform: 'translateX(' + (36 * dir) + 'px)'}, {opacity: 1, transform: 'none'}], {duration: 400, easing: EO});
  ui.coPanel.scrollTo({top: 0, behavior: 'smooth'});
}

function openCheckout(trigger){
  if(!cart.length){ toast('Tu carrito está vacío'); return; }
  if(co.step === 3) resetCheckout();
  const f1 = $('[data-step="1"]', ui.sheet);
  const fecha = f1.elements.fecha;
  fecha.min = minFecha();
  if(!fecha.value || fecha.value < fecha.min) fecha.value = fecha.min;
  $('.t-co-sum', ui.sheet).open = !MOBILE.matches;
  renderSummary();
  if(ui.drawer.classList.contains('open')) closeLayer(ui.drawer, false);
  openLayer(ui.sheet, trigger);
}
function resetCheckout(){
  co.snapshot = null;
  goStep(1, true);
  const f2 = $('[data-step="2"]', ui.sheet);
  f2.reset(); syncCard(); f2.dispatchEvent(new Event('change'));
  $('.t-success', ui.sheet).classList.remove('play');
}

function syncCard(){
  const f2 = $('[data-step="2"]', ui.sheet);
  if(!f2.elements['demo-num']) return;
  const d = digits(f2.elements['demo-num'].value);
  const brand = brandOf(d);
  const mask = (d + '•'.repeat(Math.max(0, 16 - d.length))).slice(0, Math.max(16, d.length)).replace(/(.{4})(?=.)/g, '$1 ');
  $('.t-cnum', ui.sheet).textContent = mask;
  $('.t-cname', ui.sheet).textContent = (f2.elements['demo-name'].value || 'NOMBRE APELLIDO').toUpperCase().slice(0, 24);
  $('.t-cexp', ui.sheet).textContent = f2.elements['demo-exp'].value || 'MM/AA';
  $('.t-face.back .cvv', ui.sheet).textContent = f2.elements['demo-cvv'].value.replace(/./g, '•') || '•••';
  $('.t-brand', ui.sheet).textContent = brand;
}

function bindCheckout(){
  const sheet = ui.sheet;
  const f1 = $('[data-step="1"]', sheet), f2 = $('[data-step="2"]', sheet);

  f1.addEventListener('change', e => {
    if(e.target.name === 'entrega'){
      co.entrega = e.target.value;
      $$('[data-when]', f1).forEach(b => { b.hidden = b.dataset.when !== co.entrega; });
      renderSummary();
    }
  });
  [f1, f2].forEach(f => f.addEventListener('input', e => { if(e.target.closest('.t-field.bad')) setErr(e.target, ''); }));

  f1.addEventListener('submit', e => {
    e.preventDefault();
    const closed = C.entrega.diasCerrado || [];
    const dm = C.entrega.domicilio;
    if(co.entrega === 'domicilio' && dm && dm.minimo && subtotal() < dm.minimo){
      toast('La compra mínima a domicilio es ' + money(dm.minimo) + '. Agrega ' + money(dm.minimo - subtotal()) + ' más o recoge en sucursal.');
      const r = f1.querySelector('input[value="domicilio"]'); r && r.closest('.t-radio').animate && !RM.matches && r.closest('.t-radio').animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}], {duration: 320, easing: EO});
      return;
    }
    const ok = validate(f1, [
      ['nombre', v => v.length < 3 ? 'Escribe tu nombre completo' : ''],
      ['telefono', v => digits(v).length < 8 ? 'Revisa el número (8 dígitos)' : ''],
      ['correo', v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Revisa el correo' : ''],
      ['direccion', v => v.length < 6 ? 'Escribe la dirección completa' : ''],
      ['zona', v => !v ? 'Indica la zona o municipio' : ''],
      ['fecha', (v, el) => !v ? 'Elige una fecha' : v < el.min ? 'La fecha más próxima es el ' + el.min.split('-').reverse().join('/') : closed.includes(new Date(v + 'T12:00').getDay()) ? 'Ese día no hacemos entregas' : '']
    ]);
    if(!ok) return;
    co.datos = Object.fromEntries(new FormData(f1));
    renderSummary();
    goStep(2);
  });

  f2.addEventListener('change', e => {
    if(e.target.name !== 'pago') return;
    co.pago = e.target.value;
    $$('.t-pay-panel', f2).forEach(p => {
      const show = p.dataset.pay === co.pago;
      if(show && p.hidden && !RM.matches){ p.hidden = false; p.animate([{opacity: 0, transform: 'translateY(6px)'}, {opacity: 1, transform: 'none'}], {duration: 240, easing: EO}); }
      else p.hidden = !show;
    });
    renderSummary();
  });
  if(f2.elements['demo-num']){
    const num = f2.elements['demo-num'], exp = f2.elements['demo-exp'], cvv = f2.elements['demo-cvv'], card = $('.t-card3d', f2);
    num.addEventListener('input', () => {
      const d = digits(num.value).slice(0, 19);
      num.value = brandOf(d) === 'AMEX' ? [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ') : d.replace(/(\d{4})(?=\d)/g, '$1 ');
      syncCard();
    });
    exp.addEventListener('input', e => {
      let d = digits(exp.value).slice(0, 4);
      if(d.length === 1 && +d > 1) d = '0' + d;
      exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : (d.length === 2 && e.inputType !== 'deleteContentBackward' ? d + '/' : d);
      syncCard();
    });
    cvv.addEventListener('input', () => { cvv.value = digits(cvv.value).slice(0, 4); syncCard(); });
    f2.elements['demo-name'].addEventListener('input', syncCard);
    /* La tarjeta gira para mostrar el reverso mientras escribes el CVV */
    cvv.addEventListener('focus', () => card.classList.add('flip'));
    cvv.addEventListener('blur', () => card.classList.remove('flip'));
  }

  $('[data-back]', f2).addEventListener('click', () => goStep(1));

  f2.addEventListener('submit', e => {
    e.preventDefault();
    if(co.pago === 'tarjeta'){
      const now = new Date();
      const ok = validate(f2, [
        ['demo-num', v => !luhn(digits(v)) ? 'Revisa el número de tarjeta' : ''],
        ['demo-name', v => v.length < 3 ? 'Como aparece en la tarjeta' : ''],
        ['demo-exp', v => { const m = /^(\d{2})\/(\d{2})$/.exec(v); if(!m || +m[1] < 1 || +m[1] > 12) return 'Usa el formato MM/AA'; const end = new Date(2000 + +m[2], +m[1], 1); return end <= now ? 'La tarjeta está vencida' : ''; }],
        ['demo-cvv', v => v.length < (brandOf(digits(f2.elements['demo-num'].value)) === 'AMEX' ? 4 : 3) ? 'CVV incompleto' : '']
      ]);
      if(!ok) return;
    }
    const btn = $('.t-pay', f2);
    btn.classList.add('loading');
    const lbl = $('.t-pay-lbl', f2), prev = lbl.textContent;
    lbl.textContent = co.pago === 'tarjeta' ? 'Procesando pago…' : 'Confirmando…';
    procesarPago(co.pago, f2).then(() => {
      btn.classList.remove('loading'); lbl.textContent = prev;
      finish();
    }, err => {
      btn.classList.remove('loading'); lbl.textContent = prev;
      setErr(f2.elements['demo-num'], err.message || 'El pago no se pudo procesar');
      f2.elements['demo-num'].focus();
    });
  });
}

/* Aquí se conectaría la pasarela de pago real. En la demostración
   solo espera un momento y aprueba (o rechaza la tarjeta de prueba). */
function procesarPago(metodo, form){
  return new Promise((ok, fail) => {
    setTimeout(() => {
      if(metodo === 'tarjeta' && digits(form.elements['demo-num'].value) === '4000000000000002') fail(new Error('El banco rechazó la tarjeta (tarjeta de prueba de rechazo)'));
      else ok();
    }, metodo === 'tarjeta' ? 1700 : 700);
  });
}

function finish(){
  const items = cart.map(l => Object.assign({}, l));
  const env = envio(), sub = subtotal(items);
  const order = {
    id: C.prefijoPedido + '-' + Date.now().toString(36).slice(-5).toUpperCase(),
    items, envio: env, total: sub + env, entrega: co.entrega, pago: co.pago, datos: co.datos
  };
  co.snapshot = order;
  cart = []; saveCart(); renderCart(); badges();
  const f2 = $('[data-step="2"]', ui.sheet);
  ['demo-num', 'demo-name', 'demo-exp', 'demo-cvv'].forEach(n => { if(f2.elements[n]) f2.elements[n].value = ''; });
  syncCard();

  const msgs = {
    tarjeta: 'Pago aprobado (demostración). Te escribiremos para coordinar ' + (order.entrega === 'domicilio' ? 'la entrega.' : 'la recogida.'),
    transferencia: 'Tu pedido quedó reservado. Envíanos el comprobante de la transferencia para prepararlo.',
    alRecibir: 'Pagas al ' + (order.entrega === 'domicilio' ? 'recibir' : 'recoger') + '. Te contactaremos para confirmar.'
  };
  const succ = $('.t-success', ui.sheet);
  $('.t-order', succ).textContent = 'Pedido ' + order.id;
  $('.t-success-msg', succ).textContent = msgs[order.pago];
  const waBtn = $('.t-wa-order', succ);
  const wa = C.tienda && C.tienda.whatsapp;
  waBtn.hidden = !wa;
  if(wa) waBtn.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(orderMessage(order));
  renderSummary();
  goStep(3);
  succ.classList.remove('play'); void succ.offsetWidth; succ.classList.add('play');
  setTimeout(() => succ.focus({preventScroll: true}), 420);
  /* El confeti sale justo cuando la palomita termina de dibujarse */
  setTimeout(() => confetti($('.t-check', succ)), 820);
}

function orderMessage(o){
  const T = C.tienda || {}, d = o.datos || {};
  const pagos = {tarjeta: 'Tarjeta (pagado)', transferencia: 'Transferencia (envío comprobante)', alRecibir: 'Al ' + (o.entrega === 'domicilio' ? 'recibir' : 'recoger')};
  return '¡Hola ' + (T.nombre || '') + '! 👋 Acabo de hacer un pedido en su página.\n' +
    '*Pedido ' + o.id + '*\n' +
    o.items.map(l => '• ' + l.qty + ' × ' + l.nombre + (l.opcion ? ' (' + l.opcion + ')' : '') + (l.detalle ? ' — ' + l.detalle : '') + ' = ' + money(l.qty * l.precio)).join('\n') +
    '\nEnvío: ' + (o.entrega === 'domicilio' ? (o.envio ? money(o.envio) : 'Gratis') : 'Recojo en tienda') +
    '\n*Total: ' + money(o.total) + '*' +
    '\nPago: ' + pagos[o.pago] +
    '\nEntrega: ' + (o.entrega === 'domicilio' ? 'A domicilio — ' + (d.direccion || '') + ', ' + (d.zona || '') + (d.referencia ? ' (' + d.referencia + ')' : '') : 'Recojo en ' + (d.sede || 'tienda')) +
    '\nFecha: ' + (d.fecha ? new Date(d.fecha + 'T12:00').toLocaleDateString('es-GT', {weekday: 'long', day: 'numeric', month: 'long'}) : '') + ', ' + (d.hora || '') +
    '\nNombre: ' + (d.nombre || '') + ' · Tel: ' + (d.telefono || '') +
    (d.nota ? '\nNota: ' + d.nota : '');
}

/* ---------------- Eventos globales ---------------- */
function bindGlobal(){
  document.addEventListener('click', e => {
    const t = e.target;
    const add1 = t.closest('[data-add]');
    if(add1){
      const p = findP(add1.dataset.add); if(!p) return;
      add1.classList.add('added'); clearTimeout(add1._t); add1._t = setTimeout(() => add1.classList.remove('added'), 1500);
      const card = add1.closest('.t-card');
      add({id: p.id, nombre: p.nombre, precio: p.precio}, card ? $('.t-card-img > svg, .t-card-img > img', card) : null);
      return;
    }
    const q = t.closest('[data-quick]');
    if(q){ openQuick(q.dataset.quick, q); return; }
    if(t.closest('[data-cart-open]')){ openCart(t.closest('[data-cart-open]')); return; }
    if(t.closest('[data-checkout]')){ openCheckout(t.closest('[data-checkout]')); return; }
    if(t.closest('[data-goshop]')){
      closeLayer(ui.drawer, false);
      const a = $(C.ancla); a && a.scrollIntoView({behavior: RM.matches ? 'auto' : 'smooth'});
      return;
    }
    const cl = t.closest('[data-close]');
    if(cl){ const layer = cl.closest('.t-drawer,.t-sheet'); layer && closeLayer(layer); return; }
    if(t === ui.backdrop){ const top = topLayer(); top && closeLayer(top); }
  });
  document.addEventListener('keydown', e => {
    const top = topLayer();
    if(e.key === 'Escape' && top){ closeLayer(top); return; }
    if(e.key === 'Tab' && top){
      const f = $$('a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])', top).filter(x => x.offsetParent !== null && !x.closest('[hidden]'));
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
    }
    if((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.t-card-img[data-quick]')){ e.preventDefault(); openQuick(e.target.dataset.quick, e.target); }
  });
  ui.lines.addEventListener('click', e => {
    const line = e.target.closest('.t-line'); if(!line) return;
    const l = cart.find(x => x.key === line.dataset.key); if(!l) return;
    const dq = e.target.closest('[data-dq]');
    if(dq){
      const d = +dq.dataset.dq;
      if(l.qty + d <= 0){ removeLine(line, l); return; }
      if(l.qty + d > 99) return;
      l.qty += d; saveCart();
      roll($('output', line), l.qty, d);
      $('.t-line-r > b', line).textContent = money(l.qty * l.precio);
      totals(); badges();
      return;
    }
    if(e.target.closest('[data-del]')) removeLine(line, l);
  });
  ui.sheet.addEventListener('t-close', () => { if(co.step === 3) setTimeout(resetCheckout, 500); });
  MOBILE.addEventListener && MOBILE.addEventListener('change', () => { const s = $('.t-co-sum', ui.sheet); if(s) s.open = !MOBILE.matches; });
}

/* ---------------- Movimiento general de la página ---------------- */
function initMotion(){
  const html = document.documentElement;
  /* Aparecer al hacer scroll (una sola vez) */
  const els = $$('[data-reveal],[data-reveal-group]');
  if(!('IntersectionObserver' in window) || RM.matches){ html.classList.remove('t-js'); els.forEach(e => e.classList.add('in')); }
  else {
    $$('[data-reveal-group]').forEach(g => {
      let d = 0, gap = +g.dataset.revealGroup || 90;
      [...g.children].forEach(c => { c.style.setProperty('--rd', Math.round(d) + 'ms'); d += gap; gap = Math.max(28, gap * .8); });
    });
    const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -10% 0px'});
    els.forEach(e => io.observe(e));
  }

  /* Titular palabra por palabra */
  $$('[data-split]').forEach(el => {
    let i = 0, d = 0, gap = 70;
    const walk = node => [...node.childNodes].forEach(n => {
      if(n.nodeType === 3){
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.append(part); return; }
          const w = document.createElement('span'); w.className = 't-w';
          const wi = document.createElement('span'); wi.className = 't-wi'; wi.textContent = part;
          wi.style.setProperty('--wd', Math.round(d) + 'ms'); d += gap; gap = Math.max(26, gap * .88); i++;
          w.append(wi); frag.append(w);
        });
        n.replaceWith(frag);
      } else if(n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
    el.style.setProperty('--d0', (+el.dataset.split || 120) + 'ms');
    el.classList.add('t-split');
  });

  /* Números que cuentan */
  $$('[data-count]').forEach(el => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    const fmt = v => v.toLocaleString('es-GT', {minimumFractionDigits: dec, maximumFractionDigits: dec});
    if(RM.matches || !('IntersectionObserver' in window)){ el.textContent = fmt(to); return; }
    el.textContent = fmt(0);
    const io = new IntersectionObserver(es => {
      if(!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), D = +(el.dataset.dur || 1400);
      const tick = now => { const k = Math.min(1, (now - t0) / D); el.textContent = fmt(to * (1 - Math.pow(1 - k, 4))); if(k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, {threshold: .6});
    io.observe(el);
  });

  /* Cintas infinitas */
  $$('.t-marquee-track').forEach(tr => {
    const kids = [...tr.children];
    kids.forEach(k => { const c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.appendChild(c); });
  });

  /* Header con sombra al bajar */
  const hdr = $('[data-header]');
  if(hdr){
    let tick = false;
    const f = () => { hdr.classList.toggle('is-scrolled', scrollY > 12); tick = false; };
    addEventListener('scroll', () => { if(!tick){ tick = true; requestAnimationFrame(f); } }, {passive: true});
    f();
  }

  /* Barra de progreso (respaldo si el navegador no tiene scroll-timeline) */
  const prog = $('.t-progress');
  if(prog && !(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'))){
    let tick = false;
    const f = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; tick = false; };
    addEventListener('scroll', () => { if(!tick){ tick = true; requestAnimationFrame(f); } }, {passive: true});
    f();
  }

  /* Inclinación 3D suave con el mouse (solo mouse, nunca en touch) */
  if(FINE.matches && !RM.matches){
    $$('[data-tilt]').forEach(el => {
      const max = +el.dataset.tilt || 7;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const loop = () => {
        cx += (tx - cx) * .1; cy += (ty - cy) * .1;
        el.style.transform = 'perspective(900px) rotateX(' + cy.toFixed(2) + 'deg) rotateY(' + cx.toFixed(2) + 'deg)';
        raf = (Math.abs(tx - cx) > .01 || Math.abs(ty - cy) > .01) ? requestAnimationFrame(loop) : 0;
      };
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * 2 * max;
        ty = -((e.clientY - r.top) / r.height - .5) * 2 * max;
        if(!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener('pointerleave', () => { tx = ty = 0; if(!raf) raf = requestAnimationFrame(loop); });
    });
  }

  /* Menú del cel */
  const mb = $('[data-menu-toggle]'), menu = $('[data-menu]');
  if(mb && menu){
    const set = o => { menu.classList.toggle('open', o); mb.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); };
    mb.addEventListener('click', () => set(!menu.classList.contains('open')));
    menu.addEventListener('click', e => { if(e.target.closest('a')) set(false); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') set(false); });
  }

  $$('[data-year]').forEach(y => { y.textContent = new Date().getFullYear(); });

  /* iPhone solo aplica :active (respuesta al presionar) si hay un listener de toque */
  document.addEventListener('touchstart', () => {}, {passive: true});
}

/* ---------------- Arranque ---------------- */
function init(cfg){
  C = merge(DEF, cfg);
  C.productos = (C.productos || []).map((p, i) => Object.assign({id: 'p' + i}, p));
  loadCart();
  injectUI();
  mountCatalog();
  renderCart();
  bindGlobal();
  bindCheckout();
  badges();
}

window.Tienda = {init, add, openCart, openCheckout, toast, money, esc, flip, roll, pulse, fly, dragToClose, openLayer, closeLayer, confetti, reduced: RM, fine: FINE, mobile: MOBILE, icon: ICON};

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMotion);
else initMotion();
})();
