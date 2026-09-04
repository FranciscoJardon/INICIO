// Test funcional de amatora.js + amatora.css + amatora-add-to-cart.liquid en Chromium headless.
//
// Uso (desde la raíz del repo):
//   npm i --no-save playwright          # una vez; si falta el browser: npx playwright install chromium
//   node tests/test-amatora.js
//
// Qué verifica:
//   - Layout pre-init (antes de que corra amatora.js) idéntico al post-init: sin salto, sin visibility:hidden
//   - Dots, flechas, teclado, drag con mouse sobre un <a>, click normal sobre un <a>
//   - .is-static con 1 slide o cuando todo cabe; valores data-* inválidos caen al default
//   - Autoplay: avanza, se pausa con la pestaña oculta
//   - Resize a móvil: re-mide y reconstruye dots
//   - Add-to-cart: POST a /cart/add con sections, renderContents() del <cart-drawer>, estados success/error/idle, eventos
//   - destroy()

const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const REPO = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(REPO, 'system/amatora.css'), 'utf8');
const js  = fs.readFileSync(path.join(REPO, 'system/amatora.js'), 'utf8');
const atcLiquid = fs.readFileSync(path.join(REPO, 'system/amatora-add-to-cart.liquid'), 'utf8');
const atcJs = atcLiquid.match(/<script>([\s\S]*?)<\/script>/)[1];

const slides = (n) => Array.from({ length: n }, (_, i) => `<div class="slide"><a href="#s${i + 1}">Slide ${i + 1}</a></div>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>${css}</style>
<style>body{margin:0} .wrap{width:min(1200px,100%);margin:0 auto} .slide{height:120px;background:#ddd}</style>
</head><body>
<div class="wrap">
  <div id="a" data-amatora-slider data-visible-desktop="3" data-visible-tablet="2" data-visible-mobile="1.2" data-gap="16" data-arrows-pos="header" data-label="Test"
       style="--sl-visible-lg:3;--sl-visible-md:2;--sl-visible-sm:1.2;--sl-gap:16px;">${slides(6)}</div>
  <div id="b" data-amatora-slider data-variant="banner" data-peek="0" data-gap="0" data-arrows-pos="sides" style="--sl-peek:0px;--sl-gap:0px;">${slides(1)}</div>
  <div id="c" data-amatora-slider data-variant="banner" data-peek="0" data-gap="0" data-arrows-pos="sides" data-autoplay="200" data-loop="true" data-dots-style="progress-segmented" style="--sl-peek:0px;--sl-gap:0px;">${slides(3)}</div>
  <div id="d" data-amatora-slider data-visible-desktop="3" data-visible-tablet="2" data-visible-mobile="1.2" style="--sl-visible-lg:3;--sl-visible-md:2;--sl-visible-sm:1.2;">${slides(3)}</div>
  <cart-drawer id="drawer"></cart-drawer>
  <button id="atc" class="btn-primary-amatora" data-add-to-cart data-variant-id="123"><span class="btn-label">Agregar</span></button>
  <button id="atc-err" class="btn-primary-amatora" data-add-to-cart data-variant-id="999"><span class="btn-label">Agregar</span></button>
</div>
<script>
  class CartDrawer extends HTMLElement {
    getSectionsToRender(){ return [{id:'cart-drawer'},{id:'cart-icon-bubble'}]; }
    renderContents(json){ window.__rendered = json; this.setAttribute('data-open','1'); }
    setActiveElement(el){ window.__active = !!el; }
  }
  customElements.define('cart-drawer', CartDrawer);
  window.__fetchCalls = [];
  window.fetch = async (url, opts) => {
    const body = {}; for (const [k,v] of opts.body.entries()) body[k]=v;
    window.__fetchCalls.push({ url, headers: opts.headers, body });
    if (body.id === '999') return { ok: false, status: 422, json: async () => ({ status: 422, message: 'Cart Error', description: 'Sin stock' }) };
    return { ok: true, status: 200, json: async () => ({ id: 123, key: '123:abc', sections: { 'cart-drawer': '<div></div>' } }) };
  };
  window.__events = [];
  document.addEventListener('amatora:cart:added', e => window.__events.push(['added', !!e.detail.cart]));
  document.addEventListener('amatora:cart:error', e => window.__events.push(['error', String(e.detail.error.message)]));
</script>
</body></html>`;

let failures = 0;
const check = (name, cond, info) => {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (!cond && info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!cond) failures++;
};
const near = (a, b, tol = 1.5) => Math.abs(a - b) <= tol;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => {
    if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('[amatora-add-to-cart] Error: Sin stock')) errors.push(m.type() + ': ' + m.text());
  });

  // Página real por file:// para que la navegación por hash funcione (en about:blank no)
  const htmlPath = path.join(os.tmpdir(), 'amatora-test-page.html');
  fs.writeFileSync(htmlPath, html);
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));

  // ---------- PRE-INIT (sin amatora.js) ----------
  const pre = await page.evaluate(() => {
    const a = document.querySelector('#a'), b = document.querySelector('#b');
    return {
      aW: a.getBoundingClientRect().width,
      aFirst: a.children[0].getBoundingClientRect().width,
      aVisible: getComputedStyle(a).visibility,
      aDisplay: getComputedStyle(a).display,
      bFirst: b.children[0].getBoundingClientRect().width,
      bW: b.getBoundingClientRect().width,
      aOpacity: getComputedStyle(a).opacity
    };
  });
  check('pre-init: slider visible (sin visibility hidden ni opacity 0)', pre.aVisible === 'visible' && pre.aOpacity === '1', pre);
  check('pre-init: contenedor es flex', pre.aDisplay === 'flex');
  check('pre-init: slide = (W - 2*gap)/3', near(pre.aFirst, (pre.aW - 32) / 3), pre);
  check('pre-init: banner slide = 100% (peek 0)', near(pre.bFirst, pre.bW), pre);

  // ---------- INIT ----------
  await page.addScriptTag({ content: js });
  await page.waitForSelector('#a.slider-amatora');
  await page.waitForTimeout(250);

  const post = await page.evaluate(() => {
    const a = document.querySelector('#a');
    const inst = SliderAmatora.get(a);
    return {
      slideW: a.querySelector('.slider-amatora__slide').getBoundingClientRect().width,
      dots: a.querySelectorAll('.slider-amatora__dot').length,
      current: inst.current(),
      prevDisabled: a.querySelector('.slider-amatora__arrow--prev').disabled,
      nextDisabled: a.querySelector('.slider-amatora__arrow--next').disabled,
      hasHeader: !!a.querySelector('.slider-amatora__header'),
      label: (a.querySelector('.slider-amatora__label') || {}).textContent,
      role: a.querySelector('.slider-amatora__viewport').getAttribute('role'),
      isStatic: a.classList.contains('is-static')
    };
  });
  check('post-init: mismo ancho de slide que pre-init (sin salto)', near(post.slideW, pre.aFirst), { pre: pre.aFirst, post: post.slideW });
  check('post-init: 6 slides / 3 visibles → 4 dots', post.dots === 4, post.dots);
  check('post-init: prev deshabilitado en 0, next habilitado', post.prevDisabled && !post.nextDisabled);
  check('post-init: header con label', post.hasHeader && post.label === 'Test');
  check('post-init: viewport role=region', post.role === 'region');
  check('post-init: #a no es static', !post.isStatic);

  // ---------- NAVEGACIÓN ----------
  const current = () => page.evaluate(() => SliderAmatora.get(document.querySelector('#a')).current());
  await page.click('#a .slider-amatora__arrow--next');
  await page.waitForTimeout(50);
  check('next → índice 1', (await current()) === 1);
  await page.focus('#a .slider-amatora__viewport');
  await page.keyboard.press('ArrowRight');
  check('teclado ArrowRight → índice 2', (await current()) === 2);
  await page.click('#a .slider-amatora__dot:first-child');
  check('click dot 1 → índice 0', (await current()) === 0);
  await page.waitForTimeout(750); // esperar la transición del track antes de medir posiciones
  const ariaCurrent = await page.evaluate(() => document.querySelector('#a .slider-amatora__dot').getAttribute('aria-current'));
  check('dot activo aria-current=true', ariaCurrent === 'true');

  // ---------- DRAG CON MOUSE SOBRE UN LINK ----------
  const link = await page.locator('#a .slider-amatora__slide a').first().boundingBox();
  const hashBefore = await page.evaluate(() => location.hash);
  await page.mouse.move(link.x + 20, link.y + 8);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(link.x + 20 - i * 45, link.y + 8); await page.waitForTimeout(10); }
  await page.mouse.up();
  await page.waitForTimeout(600);
  const afterDrag = await page.evaluate(() => {
    const inst = SliderAmatora.get(document.querySelector('#a'));
    return { cur: inst.current(), hash: location.hash, dragOn: inst.drag.on, moved: inst.drag.moved, dragging: inst.viewport.classList.contains('is-dragging') };
  });
  check('drag sobre <a> avanza el slider', afterDrag.cur >= 1, afterDrag);
  check('drag sobre <a> NO navega', afterDrag.hash === hashBefore, afterDrag);
  check('drag terminó limpio (drag.on=false, moved=false, sin is-dragging)', afterDrag.dragOn === false && afterDrag.moved === false && !afterDrag.dragging, afterDrag);

  // click legítimo después del drag sí navega
  await page.evaluate(() => SliderAmatora.get(document.querySelector('#a')).goTo(0));
  await page.waitForTimeout(750);
  await page.locator('#a .slider-amatora__slide a').first().click();
  await page.waitForTimeout(100);
  const hashAfterClick = await page.evaluate(() => location.hash);
  check('click normal sobre <a> SÍ navega', hashAfterClick === '#s1', hashAfterClick);

  // ---------- STATIC ----------
  const st = await page.evaluate(() => {
    const b = document.querySelector('#b'), d = document.querySelector('#d');
    const hid = el => !el || getComputedStyle(el).display === 'none';
    return {
      bStatic: b.classList.contains('is-static'),
      bArrowsHidden: hid(b.querySelector('.slider-amatora__arrows')),
      bDotsHidden: hid(b.querySelector('.slider-amatora__dots')),
      dStatic: d.classList.contains('is-static')
    };
  });
  check('banner con 1 slide → is-static, flechas y dots ocultos', st.bStatic && st.bArrowsHidden && st.bDotsHidden, st);
  check('3 slides / 3 visibles en desktop → is-static', st.dStatic, st);

  // ---------- VALOR INVÁLIDO + AUTOPLAY + LOOP ----------
  const c0 = await page.evaluate(() => ({
    dotsStyle: document.querySelector('#c').getAttribute('data-dots-style'),
    dots: document.querySelectorAll('#c .slider-amatora__dot').length,
    cur: SliderAmatora.get(document.querySelector('#c')).current()
  }));
  check('data-dots-style inválido cae a bar', c0.dotsStyle === 'bar', c0);
  check('banner 3 slides → 3 dots', c0.dots === 3, c0);
  await page.waitForTimeout(750);
  const c1 = await page.evaluate(() => SliderAmatora.get(document.querySelector('#c')).current());
  check('autoplay avanzó (200ms)', c1 !== c0.cur, { antes: c0.cur, despues: c1 });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const cH0 = await page.evaluate(() => SliderAmatora.get(document.querySelector('#c')).current());
  await page.waitForTimeout(600);
  const cH1 = await page.evaluate(() => SliderAmatora.get(document.querySelector('#c')).current());
  check('autoplay pausa con pestaña oculta', cH0 === cH1, { cH0, cH1 });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  // ---------- RESIZE → móvil ----------
  await page.setViewportSize({ width: 500, height: 800 });
  await page.waitForTimeout(500);
  const mob = await page.evaluate(() => {
    const d = document.querySelector('#d'), a = document.querySelector('#a');
    const vw = a.querySelector('.slider-amatora__viewport').getBoundingClientRect().width;
    const sw = a.querySelector('.slider-amatora__slide').getBoundingClientRect().width;
    return { dStatic: d.classList.contains('is-static'), dDots: d.querySelectorAll('.slider-amatora__dot').length, vw, sw, esperado: (vw - 16 * 0.2) / 1.2 };
  });
  check('móvil: #d deja de ser static y muestra 3 dots', !mob.dStatic && mob.dDots === 3, mob);
  check('móvil: slide = (W - gap*0.2)/1.2', near(mob.sw, mob.esperado), mob);

  // ---------- ADD TO CART ----------
  await page.addScriptTag({ content: atcJs });
  await page.click('#atc');
  await page.waitForTimeout(100);
  const atc = await page.evaluate(() => ({
    calls: window.__fetchCalls, state: document.querySelector('#atc').dataset.state,
    drawerOpen: document.querySelector('#drawer').getAttribute('data-open'), rendered: !!window.__rendered, events: window.__events
  }));
  const call = atc.calls[0] || {};
  check('add-to-cart: POST a /cart/add', atc.calls.length === 1 && call.url === '/cart/add', call.url);
  check('add-to-cart: body con id, quantity, sections, sections_url', call.body && call.body.id === '123' && call.body.quantity === '1' && call.body.sections === 'cart-drawer,cart-icon-bubble' && typeof call.body.sections_url === 'string', call.body);
  check('add-to-cart: headers Accept javascript + XHR', call.headers && call.headers['Accept'] === 'application/javascript' && call.headers['X-Requested-With'] === 'XMLHttpRequest', call.headers);
  check('add-to-cart: estado success', atc.state === 'success', atc.state);
  check('add-to-cart: drawer.renderContents llamado y abierto', atc.drawerOpen === '1' && atc.rendered, atc);
  check('add-to-cart: evento amatora:cart:added con detail.cart', atc.events.some(e => e[0] === 'added' && e[1] === true), atc.events);
  await page.waitForTimeout(1600);
  const idle = await page.evaluate(() => document.querySelector('#atc').dataset.state);
  check('add-to-cart: vuelve a idle tras 1.5s', idle === 'idle', idle);
  await page.click('#atc-err');
  await page.waitForTimeout(100);
  const err = await page.evaluate(() => ({ state: document.querySelector('#atc-err').dataset.state, events: window.__events }));
  check('add-to-cart: 422 → estado error + evento', err.state === 'error' && err.events.some(e => e[0] === 'error' && e[1].includes('Sin stock')), err);

  // ---------- DESTROY ----------
  const destroyed = await page.evaluate(() => {
    const a = document.querySelector('#a');
    SliderAmatora.get(a).destroy();
    return { flag: a.dataset.amatoraSliderInit, get: SliderAmatora.get(a) === null };
  });
  check('destroy: quita flag y la instancia del registro', destroyed.flag === '' && destroyed.get, destroyed);

  check('sin errores de consola ni pageerror', errors.length === 0, errors);

  await browser.close();
  console.log(failures === 0 ? '\nTODO OK' : `\n${failures} FALLO(S)`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('EXCEPCIÓN', e); process.exit(1); });
