/*!
 * Amatora JS — v3.1
 * Slider carousel para Shopify themes — drag, arrows, dots, autoplay, loop.
 *
 * USO MÍNIMO:
 *   <div data-amatora-slider
 *        data-visible-desktop="3"
 *        data-visible-tablet="2"
 *        data-visible-mobile="1.2">
 *     <div>Slide 1</div>
 *     <div>Slide 2</div>
 *   </div>
 *
 * Data attributes soportados:
 *   data-visible-{desktop,tablet,mobile}  número de slides visibles por breakpoint
 *   data-gap                              px entre slides (default 16)
 *   data-peek                             px del asomo en banner variant (default 48)
 *   data-variant                          "default" | "banner"
 *   data-arrows                           "true" | "false"  (default true)
 *   data-arrows-pos                       "header" | "sides"
 *   data-dots                             "true" | "false"  (default true)
 *   data-dots-style                       "bar" | "circle"
 *   data-loop                             "true" | "false"
 *   data-autoplay                         ms (0 = off)
 *   data-label                            texto del header
 *   data-accent                           hex color override del color de dots
 *
 * Comportamiento automático (sin Liquid extra):
 *   - Si todos los slides caben en el viewport (1 solo slide, o 3 de 3 en
 *     desktop), el slider se marca .is-static: sin flechas, sin dots, sin drag.
 *   - Autoplay se pausa en hover, durante el drag, con la pestaña oculta,
 *     cuando el slider sale del viewport y si el usuario pidió reduced-motion.
 *   - En el customizer, al seleccionar un block se muestra su slide.
 *
 * Defaults globales: lee window.AmatoraConfig (seteado por amatora-tokens.liquid
 * desde el panel "Configuraciones Amatora" del customizer). Prioridad:
 *   data-attribute > opts > AmatoraConfig > hardcoded.
 *
 * Auto-inicializa al cargar y expone window.SliderAmatora.
 * Depende de los estilos en amatora.css (sección 28).
 */
(function (global) {
    'use strict';

    var VARIANTS    = ['default', 'banner'];
    var ARROWS_POS  = ['header', 'sides'];
    var DOTS_STYLES = ['bar', 'circle'];

    var REDUCED_MOTION = typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════
    function mk(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls)  e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    function toBool(v, def) {
        if (v === undefined || v === null || v === '') return def;
        return v === 'true' || v === '1';
    }

    function toNum(v, def) {
        if (v === undefined || v === null || v === '') return def;
        var n = parseFloat(v);
        return isNaN(n) ? def : n;
    }

    function toInt(v, def) {
        if (v === undefined || v === null || v === '') return def;
        var n = parseInt(v, 10);
        return isNaN(n) ? def : n;
    }

    // Valor válido de una lista, o el default (evita data-dots-style="loquesea")
    function pick(v, list, def) {
        return list.indexOf(v) >= 0 ? v : def;
    }

    function now() {
        return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    }

    // ═══════════════════════════════════════════════════════════
    // CLASE PRINCIPAL
    // ═══════════════════════════════════════════════════════════
    function SliderAmatora(el, opts) {
        this.el = typeof el === 'string' ? document.querySelector(el) : el;
        if (!this.el) {
            console.warn('[SliderAmatora] elemento no encontrado');
            return;
        }
        if (this.el.dataset.amatoraSliderInit === '1') return;
        this.el.dataset.amatoraSliderInit = '1';

        opts = opts || {};
        var d = this.el.dataset;

        // Defaults globales del panel Amatora (settings → tokens → window.AmatoraConfig).
        // Prioridad: data-attribute > opts > AmatoraConfig > hardcoded.
        var cfg = (typeof window !== 'undefined' && window.AmatoraConfig) || {};
        var defShowArrows = cfg.sliderShowArrows !== undefined ? !!cfg.sliderShowArrows : true;
        var defShowDots   = cfg.sliderShowDots   !== undefined ? !!cfg.sliderShowDots   : true;
        var defDotsStyle  = pick(cfg.sliderDotsStyle, DOTS_STYLES, 'bar');
        var defArrowsPos  = pick(cfg.sliderArrowsPos, ARROWS_POS, 'header');

        this.o = {
            visibleDesktop: toNum(d.visibleDesktop, opts.visibleDesktop || 3),
            visibleTablet:  toNum(d.visibleTablet,  opts.visibleTablet  || 2),
            visibleMobile:  toNum(d.visibleMobile,  opts.visibleMobile  || 1.2),
            gap:            d.gap  != null ? toInt(d.gap, 16)  : (opts.gap  != null ? opts.gap  : null),
            peek:           d.peek != null ? toInt(d.peek, 48) : (opts.peek != null ? opts.peek : null),
            loop:           toBool(d.loop, opts.loop || false),
            autoplay:       REDUCED_MOTION ? 0 : toInt(d.autoplay, opts.autoplay || 0),
            showArrows:     toBool(d.arrows, opts.showArrows !== undefined ? opts.showArrows : defShowArrows),
            showDots:       toBool(d.dots,   opts.showDots   !== undefined ? opts.showDots   : defShowDots),
            label:          d.label || opts.label || '',
            variant:        pick(d.variant   || opts.variant,   VARIANTS,   'default'),
            arrowsPos:      pick(d.arrowsPos || opts.arrowsPos, ARROWS_POS, defArrowsPos),
            dotsStyle:      pick(d.dotsStyle || opts.dotsStyle, DOTS_STYLES, defDotsStyle),
            accentColor:    d.accent || opts.accentColor || null
        };

        // State
        this.step   = 0;
        this.offset = 0;
        this.m      = null;   // medidas cacheadas (ver _measure)
        this.drag   = { on: false };
        this._hover = false;
        this._inView = true;

        this._setCSSVars();
        this._build();
        if (!this.slides || !this.slides.length) return;
        this._bind();

        // Esperar a que el navegador resuelva las variables responsive
        var self = this;
        requestAnimationFrame(function () {
            self._measure();
            self._snap(0, false);
            if (self.o.autoplay > 0) self._startAutoplay();
        });
    }

    // ───────── CSS VARS ─────────
    SliderAmatora.prototype._setCSSVars = function () {
        this.el.classList.add('slider-amatora');
        // NO setear --sl-visible directo — inline ganaría a las media queries.
        // Solo los 3 breakpoints; el CSS decide cuál usar según el viewport.
        this.el.style.setProperty('--sl-visible-lg', this.o.visibleDesktop);
        this.el.style.setProperty('--sl-visible-md', this.o.visibleTablet);
        this.el.style.setProperty('--sl-visible-sm', this.o.visibleMobile);

        if (this.o.gap  != null) this.el.style.setProperty('--sl-gap',  this.o.gap + 'px');
        if (this.o.peek != null) this.el.style.setProperty('--sl-peek', this.o.peek + 'px');

        if (this.o.accentColor) {
            this.el.style.setProperty('--sl-accent',     this.o.accentColor);
            this.el.style.setProperty('--sl-dot-active', this.o.accentColor);
            // --sl-arrow-color NO se toca: las flechas mantienen su contraste propio.
        }

        this.el.setAttribute('data-variant',     this.o.variant);
        this.el.setAttribute('data-arrows-pos',  this.o.arrowsPos);
        this.el.setAttribute('data-dots-style',  this.o.dotsStyle);
    };

    // ───────── BUILD DOM ─────────
    SliderAmatora.prototype._build = function () {
        var children = Array.prototype.slice.call(this.el.children);
        var originalSlides = children.filter(function (c) {
            return !c.classList.contains('slider-amatora__header')
                && !c.classList.contains('slider-amatora__stage')
                && !c.classList.contains('slider-amatora__dots');
        });

        if (originalSlides.length === 0) {
            console.warn('[SliderAmatora] no hay slides', this.el);
            this.slides = [];
            return;
        }

        // Header (label + arrows en header)
        var hasHeader = this.o.label || (this.o.showArrows && this.o.arrowsPos === 'header');
        if (hasHeader) {
            var header   = mk('div', 'slider-amatora__header');
            var controls = mk('div', 'slider-amatora__controls');
            if (this.o.label) header.appendChild(mk('span', 'slider-amatora__label', this.o.label));
            if (this.o.showArrows && this.o.arrowsPos === 'header') controls.appendChild(this._buildArrows());
            header.appendChild(controls);
            this.el.prepend(header);
        }

        // Stage > Viewport > Track > Slides
        this.stage    = mk('div', 'slider-amatora__stage');
        this.viewport = mk('div', 'slider-amatora__viewport');
        this.track    = mk('div', 'slider-amatora__track');

        this.viewport.setAttribute('tabindex', '0');
        this.viewport.setAttribute('aria-roledescription', 'carousel');

        var track = this.track;
        originalSlides.forEach(function (s) {
            var slide = mk('div', 'slider-amatora__slide');
            slide.appendChild(s);
            track.appendChild(slide);
        });

        this.viewport.appendChild(this.track);
        this.stage.appendChild(this.viewport);

        if (this.o.showArrows && this.o.arrowsPos === 'sides') {
            this.stage.appendChild(this._buildArrows());
        }

        this.el.appendChild(this.stage);

        if (this.o.showDots) {
            this.dotsEl = mk('div', 'slider-amatora__dots');
            this.el.appendChild(this.dotsEl);
        }

        this.slides  = Array.prototype.slice.call(this.track.children);
        this.btnPrev = this.el.querySelector('.slider-amatora__arrow--prev');
        this.btnNext = this.el.querySelector('.slider-amatora__arrow--next');
    };

    SliderAmatora.prototype._buildArrows = function () {
        var wrap = mk('div', 'slider-amatora__arrows');
        var cfg = (typeof window !== 'undefined' && window.AmatoraConfig) || {};
        var customIcon = cfg.sliderArrowIcon;
        var iconPrev, iconNext;
        if (customIcon) {
            iconPrev = '<img src="' + customIcon + '" alt="" width="18" height="18" class="slider-amatora__arrow-icon slider-amatora__arrow-icon--flip">';
            iconNext = '<img src="' + customIcon + '" alt="" width="18" height="18" class="slider-amatora__arrow-icon">';
        } else {
            iconPrev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
            iconNext = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';
        }
        wrap.innerHTML =
            '<button type="button" class="slider-amatora__arrow slider-amatora__arrow--prev" aria-label="Anterior">' + iconPrev + '</button>' +
            '<button type="button" class="slider-amatora__arrow slider-amatora__arrow--next" aria-label="Siguiente">' + iconNext + '</button>';
        return wrap;
    };

    // ───────── MEDIDAS (una sola lectura de layout, cacheada) ─────────
    // Se recalcula en init, resize y al comenzar un drag. Durante el drag y
    // en cada snap se usa el cache: cero getComputedStyle/offsetWidth por frame.
    SliderAmatora.prototype._measure = function () {
        var cs = getComputedStyle(this.el);
        var vw = this.viewport.offsetWidth;
        var n  = this.slides.length;

        var gap = this.o.gap != null ? this.o.gap : parseFloat(getComputedStyle(this.track).gap);
        if (isNaN(gap)) gap = 16;

        var vis, slideW, maxStep;
        if (this.o.variant === 'banner') {
            var peek = parseFloat(cs.getPropertyValue('--sl-peek'));
            if (isNaN(peek)) peek = 48;
            vis     = 1;
            slideW  = vw - peek;
            maxStep = Math.max(0, n - 1);
        } else {
            vis = parseFloat(cs.getPropertyValue('--sl-visible'));
            if (isNaN(vis) || vis <= 0) vis = this.o.visibleDesktop;
            // Debe coincidir EXACTAMENTE con el width de .slider-amatora__slide en CSS:
            //   calc((100% - var(--sl-gap) * (var(--sl-visible) - 1)) / var(--sl-visible))
            slideW  = (vw - gap * (vis - 1)) / vis;
            maxStep = Math.max(0, n - Math.floor(vis));
        }

        var trackW = n * slideW + (n - 1) * gap;
        this.m = {
            gap:     gap,
            slideW:  slideW,
            step:    slideW + gap,
            maxOff:  Math.max(0, trackW - vw),
            maxStep: maxStep
        };
        return this.m;
    };

    SliderAmatora.prototype._isStatic = function () {
        return (this.m || this._measure()).maxStep === 0;
    };

    // ───────── RENDER ─────────
    // opts (opcional): { duration: ms, easing: 'cubic-bezier(...)' }
    // Solo el snap post-drag lo usa, para que la duración escale con la distancia.
    SliderAmatora.prototype._snap = function (n, anim, opts) {
        if (anim === undefined) anim = true;
        if (!opts) opts = {};
        var m   = this.m || this._measure();
        var max = m.maxStep;

        if (this.o.loop) {
            if (n > max) n = 0;
            if (n < 0)   n = max;
        }

        this.step   = Math.max(0, Math.min(n, max));
        this.offset = Math.min(this.step * m.step, m.maxOff);

        this.track.classList.toggle('no-anim', !anim);

        // Override inline solo cuando viene de un drag; en el resto se limpia
        // para volver a la transition definida en CSS (--sl-transition).
        if (anim && opts.duration) {
            this.track.style.transition = 'transform ' + opts.duration + 'ms ' + (opts.easing || 'cubic-bezier(0.17, 0.84, 0.34, 1)');
        } else {
            this.track.style.transition = '';
        }

        this.track.style.transform = 'translateX(' + (-this.offset) + 'px)';
        this._updateUI();

        this.el.dispatchEvent(new CustomEvent('slider-amatora:change', {
            detail: { index: this.step, total: max + 1 }
        }));
    };

    SliderAmatora.prototype._updateUI = function () {
        var m     = this.m || this._measure();
        var total = m.maxStep + 1;
        var self  = this;

        // Todo cabe en el viewport → sin controles ni drag
        this.el.classList.toggle('is-static', total === 1);

        if (this.btnPrev) this.btnPrev.disabled = !this.o.loop && this.step === 0;
        if (this.btnNext) this.btnNext.disabled = !this.o.loop && this.step >= m.maxStep;

        if (this.dotsEl) {
            if (this.dotsEl.children.length !== total) {
                this.dotsEl.innerHTML = '';
                for (var i = 0; i < total; i++) {
                    var dot = mk('button', 'slider-amatora__dot');
                    dot.type = 'button';
                    dot.setAttribute('aria-label', 'Ir al slide ' + (i + 1));
                    (function (idx) {
                        dot.addEventListener('click', function () { self._snap(idx); self._restartAutoplay(); });
                    })(i);
                    this.dotsEl.appendChild(dot);
                }
            }
            var dots = this.dotsEl.children;
            for (var j = 0; j < dots.length; j++) {
                dots[j].classList.toggle('is-active', j === this.step);
                dots[j].setAttribute('aria-current', j === this.step ? 'true' : 'false');
            }
        }
    };

    // ───────── SNAP DE DRAG (distancia + velocidad de flick) ─────────
    // dx       = desplazamiento total del drag (positivo = swipe-left = next).
    // velocity = px/ms con la misma convención de signo.
    SliderAmatora.prototype._resolveDragSnap = function (dx, velocity) {
        velocity = velocity || 0;
        if (Math.abs(dx) < 5 && Math.abs(velocity) < 0.25) return this.step;

        var absoluteSlide = (this.drag.off + dx) / this.m.step;
        var deltaSlides   = absoluteSlide - this.step;
        var absDelta      = Math.abs(deltaSlides);

        // Flick rápido (~500 px/s) avanza aunque la distancia sea corta
        if (Math.abs(velocity) > 0.5) return this.step + (velocity > 0 ? 1 : -1);

        if (absDelta < 0.3) return this.step;
        if (absDelta < 0.5) return this.step + (deltaSlides > 0 ? 1 : -1);
        return Math.round(absoluteSlide);
    };

    // Velocidad media de los últimos ~100ms del drag (px/ms).
    SliderAmatora.prototype._dragVelocity = function () {
        var s = this.drag.samples;
        if (!s || s.length < 2) return 0;
        var first = s[0], last = s[s.length - 1];
        var dt = last.t - first.t;
        if (dt < 8) return 0;
        return (first.x - last.x) / dt;
    };

    // Duración del snap post-drag proporcional a la distancia restante.
    SliderAmatora.prototype._snapOptsForDrag = function (targetStep, velocity) {
        var targetOff = Math.min(targetStep * this.m.step, this.m.maxOff);
        var dur = Math.abs(targetOff - this.offset) * 1.2;   // ~830 px/s base
        dur -= Math.min(120, Math.abs(velocity) * 80);
        return { duration: Math.round(Math.max(180, Math.min(500, dur))) };
    };

    // Resistencia en bordes (sin loop)
    SliderAmatora.prototype._resist = function (px) {
        if (this.o.loop) return px;
        var max = this.m.maxOff;
        if (px < 0)   return px * 0.18;
        if (px > max) return max + (px - max) * 0.18;
        return px;
    };

    // ───────── EVENTOS ─────────
    SliderAmatora.prototype._bind = function () {
        var self = this;

        // Arrows
        if (this.btnPrev) this.btnPrev.addEventListener('click', function () { self._snap(self.step - 1); self._restartAutoplay(); });
        if (this.btnNext) this.btnNext.addEventListener('click', function () { self._snap(self.step + 1); self._restartAutoplay(); });

        // Teclado (viewport enfocable)
        this.viewport.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft')  { e.preventDefault(); self._snap(self.step - 1); self._restartAutoplay(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); self._snap(self.step + 1); self._restartAutoplay(); }
        });

        var pushSample = function (x) {
            var arr = self.drag.samples;
            var t = now();
            arr.push({ x: x, t: t });
            while (arr.length > 1 && t - arr[0].t > 100) arr.shift();
        };

        var beginDrag = function (x, y) {
            self._measure();
            if (self.m.maxStep === 0) return false;
            self.drag = { on: true, x: x, y: y, off: self.offset, moved: false, locked: null, samples: [{ x: x, t: now() }] };
            self.track.classList.add('no-anim');
            self._pauseAutoplay();
            return true;
        };

        var moveDrag = function (x) {
            var dx = self.drag.x - x;
            if (Math.abs(dx) > 3) self.drag.moved = true;
            pushSample(x);
            self.track.style.transform = 'translateX(' + (-self._resist(self.drag.off + dx)) + 'px)';
        };

        var endDrag = function (x) {
            self.drag.on = false;
            var dx = self.drag.x - x;
            var v  = self._dragVelocity();
            var target = self._resolveDragSnap(dx, v);
            self._snap(target, true, self._snapOptsForDrag(target, v));
            self._resumeAutoplay();
        };

        // ===== MOUSE (listeners globales solo mientras dura el drag) =====
        var onMouseMove = function (e) {
            if (!self.drag.on) return;
            moveDrag(e.clientX);
        };
        var onMouseUp = function (e) {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup',   onMouseUp);
            if (!self.drag.on) return;
            self.viewport.classList.remove('is-dragging');
            endDrag(e.clientX);
        };
        var onMouseDown = function (e) {
            if (e.button !== 0) return;
            // Controles de formulario y botones no inician drag; los links SÍ
            // (el click se cancela después si hubo movimiento).
            if (e.target.closest('button, input, select, textarea')) return;
            if (!beginDrag(e.clientX, e.clientY)) return;
            self.viewport.classList.add('is-dragging');
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup',   onMouseUp);
            e.preventDefault(); // evita selección de texto y drag nativo de imágenes/links
        };

        // Cancelar el click que sigue a un drag (evita navegar por accidente)
        var onClickCapture = function (e) {
            if (self.drag.moved) {
                e.preventDefault();
                e.stopPropagation();
                self.drag.moved = false;
            }
        };

        this.viewport.addEventListener('mousedown', onMouseDown);
        this.viewport.addEventListener('click', onClickCapture, true);

        // ===== TOUCH (passive; el CSS pone touch-action: pan-y en el viewport) =====
        var onTouchStart = function (e) {
            beginDrag(e.touches[0].clientX, e.touches[0].clientY);
        };
        var onTouchMove = function (e) {
            if (!self.drag.on) return;
            var x  = e.touches[0].clientX;
            var dx = self.drag.x - x;
            var dy = self.drag.y - e.touches[0].clientY;
            // Primer movimiento significativo decide: horizontal (slider) o vertical (scroll)
            if (self.drag.locked == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                self.drag.locked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
            }
            if (self.drag.locked === 'v') return;
            moveDrag(x);
        };
        var onTouchEnd = function (e) {
            if (!self.drag.on) return;
            if (self.drag.locked === 'v') {
                self.drag.on = false;
                self.track.classList.remove('no-anim');
                self._resumeAutoplay();
                return;
            }
            endDrag(e.changedTouches[0].clientX);
        };

        this.viewport.addEventListener('touchstart',  onTouchStart, { passive: true });
        this.viewport.addEventListener('touchmove',   onTouchMove,  { passive: true });
        this.viewport.addEventListener('touchend',    onTouchEnd);
        this.viewport.addEventListener('touchcancel', onTouchEnd);

        // ===== RESIZE (debounce) =====
        var resizeTimer;
        var onResize = function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                self._measure();
                self._snap(Math.min(self.step, self.m.maxStep), false);
            }, 150);
        };
        window.addEventListener('resize', onResize);

        // ===== AUTOPLAY: pausa en hover, pestaña oculta y fuera de viewport =====
        var onVisibility = null;
        if (this.o.autoplay > 0) {
            this.el.addEventListener('mouseenter', function () { self._hover = true;  self._pauseAutoplay(); });
            this.el.addEventListener('mouseleave', function () { self._hover = false; self._resumeAutoplay(); });

            onVisibility = function () {
                if (document.hidden) self._pauseAutoplay(); else self._resumeAutoplay();
            };
            document.addEventListener('visibilitychange', onVisibility);

            if ('IntersectionObserver' in window) {
                this._io = new IntersectionObserver(function (entries) {
                    self._inView = entries[0].isIntersecting;
                    if (self._inView) self._resumeAutoplay(); else self._pauseAutoplay();
                }, { threshold: 0.25 });
                this._io.observe(this.el);
            }
        }

        this._boundHandlers = { mouseMove: onMouseMove, mouseUp: onMouseUp, resize: onResize, visibility: onVisibility };
    };

    // ───────── AUTOPLAY ─────────
    SliderAmatora.prototype._canAutoplay = function () {
        return this.o.autoplay > 0
            && !this._hover
            && this._inView
            && !(typeof document !== 'undefined' && document.hidden)
            && !this._isStatic();
    };

    SliderAmatora.prototype._startAutoplay = function () {
        var self = this;
        this._pauseAutoplay();
        if (!this._canAutoplay()) return;
        this._autoplayTimer = setInterval(function () {
            var next = self.step + 1;
            self._snap(next > self.m.maxStep ? 0 : next);
        }, this.o.autoplay);
    };

    SliderAmatora.prototype._pauseAutoplay = function () {
        if (this._autoplayTimer) {
            clearInterval(this._autoplayTimer);
            this._autoplayTimer = null;
        }
    };

    SliderAmatora.prototype._resumeAutoplay = function () {
        if (!this._autoplayTimer) this._startAutoplay();
    };

    // Tras una interacción manual, reinicia el intervalo para que el
    // siguiente avance automático no llegue "encima" del gesto del usuario.
    SliderAmatora.prototype._restartAutoplay = function () {
        if (this.o.autoplay > 0) this._startAutoplay();
    };

    // ───────── API PÚBLICA ─────────
    SliderAmatora.prototype.next    = function () { this._snap(this.step + 1); };
    SliderAmatora.prototype.prev    = function () { this._snap(this.step - 1); };
    SliderAmatora.prototype.goTo    = function (n) { this._snap(n); };
    SliderAmatora.prototype.current = function () { return this.step; };
    SliderAmatora.prototype.refresh = function () { this._measure(); this._snap(this.step, false); };

    SliderAmatora.prototype.destroy = function () {
        this._pauseAutoplay();
        if (this._io) { this._io.disconnect(); this._io = null; }
        var h = this._boundHandlers;
        if (h) {
            if (h.mouseMove)  window.removeEventListener('mousemove', h.mouseMove);
            if (h.mouseUp)    window.removeEventListener('mouseup',   h.mouseUp);
            if (h.resize)     window.removeEventListener('resize',    h.resize);
            if (h.visibility) document.removeEventListener('visibilitychange', h.visibility);
        }
        this.el.dataset.amatoraSliderInit = '';
    };

    // ═══════════════════════════════════════════════════════════
    // AUTO-INICIALIZACIÓN
    // ═══════════════════════════════════════════════════════════
    var instances = [];

    function initAll(scope) {
        scope = scope || document;
        var nodes = scope.querySelectorAll('[data-amatora-slider]');
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].dataset.amatoraSliderInit !== '1') {
                instances.push(new SliderAmatora(nodes[i]));
            }
        }
    }

    function instanceFor(el) {
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].el === el) return instances[i];
        }
        return null;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }

    // Customizer de Shopify: re-init al recargar una sección
    document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });

    // Customizer de Shopify: al seleccionar un block, mostrar su slide
    document.addEventListener('shopify:block:select', function (e) {
        var slide = e.target && e.target.closest && e.target.closest('.slider-amatora__slide');
        if (!slide) return;
        var sliderEl = slide.closest('.slider-amatora');
        var inst = sliderEl && instanceFor(sliderEl);
        if (!inst) return;
        var idx = inst.slides.indexOf(slide);
        if (idx >= 0) inst.goTo(idx);
    });

    // Expose
    global.SliderAmatora = SliderAmatora;
    global.SliderAmatora.initAll = initAll;
    global.SliderAmatora.get     = instanceFor;

})(typeof window !== 'undefined' ? window : this);
