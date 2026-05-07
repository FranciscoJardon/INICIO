/*!
 * Amatora JS — v2.2
 * Componentes JS del sistema Amatora.
 * Por ahora incluye: Slider (carousel con drag, arrows, dots, progress).
 *
 * Defaults globales: lee window.AmatoraConfig (seteado por amatora-tokens.liquid
 * desde el panel del customizer) — dotsStyle, arrowsPos, showArrows/Dots, arrowIcon.
 * Prioridad: data-attribute > opts > AmatoraConfig > hardcoded.
 *
 * USO DEL SLIDER:
 *   <div data-amatora-slider
 *        data-visible-desktop="3"
 *        data-visible-tablet="2"
 *        data-visible-mobile="1.2">
 *     <div>Slide 1</div>
 *     <div>Slide 2</div>
 *   </div>
 *
 * Auto-inicializa al cargar la página + expone window.SliderAmatora.
 * Depende de los estilos en amatora.css (sección 28).
 */
(function (global) {
    'use strict';

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
        var defDotsStyle  = cfg.sliderDotsStyle  || 'bar';
        var defArrowsPos  = cfg.sliderArrowsPos  || 'header';

        // Opciones (data-attributes > opts > defaults)
        this.o = {
            visibleDesktop: toNum(d.visibleDesktop, opts.visibleDesktop || 3),
            visibleTablet:  toNum(d.visibleTablet,  opts.visibleTablet  || 2),
            visibleMobile:  toNum(d.visibleMobile,  opts.visibleMobile  || 1.2),
            gap:            d.gap     != null ? toInt(d.gap, 16)  : (opts.gap  != null ? opts.gap  : null),
            peek:           d.peek    != null ? toInt(d.peek, 48) : (opts.peek != null ? opts.peek : null),
            loop:           toBool(d.loop, opts.loop || false),
            autoplay:       toInt(d.autoplay, opts.autoplay || 0),
            showArrows:     toBool(d.arrows, opts.showArrows !== undefined ? opts.showArrows : defShowArrows),
            showDots:       toBool(d.dots,   opts.showDots   !== undefined ? opts.showDots   : defShowDots),
            showCounter:    toBool(d.counter, opts.showCounter || false),
            label:          d.label || opts.label || '',
            variant:        d.variant || opts.variant || 'default',
            arrowsPos:      d.arrowsPos || opts.arrowsPos || defArrowsPos,
            dotsStyle:      d.dotsStyle || opts.dotsStyle || defDotsStyle,
            dotsAlign:      d.dotsAlign || opts.dotsAlign || 'center',
            progressWidth:  d.progressWidth  || opts.progressWidth  || null,
            progressHeight: d.progressHeight || opts.progressHeight || null,
            progressRadius: d.progressRadius || opts.progressRadius || null,
            progressGap:    d.progressGap    || opts.progressGap    || null,
            progressBg:     d.progressBg     || opts.progressBg     || null,
            accentColor:    d.accent   || opts.accentColor || null
        };

        // State
        this.step = 0;
        this.offset = 0;
        this.drag = { on: false, x: 0, y: 0, off: 0, moved: false };
        this._boundHandlers = {};

        this._setCSSVars();
        this._build();
        this._bind();

        // Esperar a que el navegador calcule las variables responsive
        var self = this;
        requestAnimationFrame(function () {
            self._snap(0, false);
        });

        if (this.o.autoplay > 0) this._startAutoplay();
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
            // NOTA: --sl-arrow-color NO se sobreescribe aquí — el accent es para dots,
            // las flechas mantienen su propio estilo de contraste según el contexto.
        }

        this.el.setAttribute('data-variant',     this.o.variant);
        this.el.setAttribute('data-arrows-pos',  this.o.arrowsPos);
        this.el.setAttribute('data-dots-style',  this.o.dotsStyle);
        this.el.setAttribute('data-dots-align',  this.o.dotsAlign);

        // Variables CSS específicas del progress (opcionales)
        if (this.o.progressWidth)  this.el.style.setProperty('--sl-progress-width',  this.o.progressWidth);
        if (this.o.progressHeight) this.el.style.setProperty('--sl-progress-height', this.o.progressHeight);
        if (this.o.progressRadius) this.el.style.setProperty('--sl-progress-radius', this.o.progressRadius);
        if (this.o.progressGap)    this.el.style.setProperty('--sl-progress-gap',    this.o.progressGap);
        if (this.o.progressBg)     this.el.style.setProperty('--sl-progress-bg',     this.o.progressBg);
    };

    // ───────── BUILD DOM ─────────
    SliderAmatora.prototype._build = function () {
        // Guardar slides originales (hijos directos que no son elementos ya del slider)
        var children = Array.prototype.slice.call(this.el.children);
        var originalSlides = children.filter(function (c) {
            return !c.classList.contains('slider-amatora__header')
                && !c.classList.contains('slider-amatora__stage')
                && !c.classList.contains('slider-amatora__dots');
        });

        // Si no hay slides, salir
        if (originalSlides.length === 0) {
            console.warn('[SliderAmatora] no hay slides', this.el);
            return;
        }

        // Header
        var hasHeader = this.o.label
                     || (this.o.showArrows && this.o.arrowsPos === 'header')
                     || this.o.showCounter;

        if (hasHeader) {
            var header   = mk('div', 'slider-amatora__header');
            var controls = mk('div', 'slider-amatora__controls');

            if (this.o.label) {
                header.appendChild(mk('span', 'slider-amatora__label', this.o.label));
            }

            if (this.o.showCounter) {
                var counter = mk('span', 'slider-amatora__counter');
                counter.innerHTML = '<strong class="slider-amatora__cur">1</strong>/<span class="slider-amatora__tot">1</span>';
                controls.appendChild(counter);
            }

            if (this.o.showArrows && this.o.arrowsPos === 'header') {
                controls.appendChild(this._buildArrows());
            }

            header.appendChild(controls);
            this.el.prepend(header);
        }

        // Stage (wrapper relative para arrows laterales)
        this.stage    = mk('div', 'slider-amatora__stage');
        this.viewport = mk('div', 'slider-amatora__viewport');
        this.track    = mk('div', 'slider-amatora__track');

        // Envolver cada slide original en .slider-amatora__slide
        originalSlides.forEach(function (s) {
            var slide = mk('div', 'slider-amatora__slide');
            slide.appendChild(s);
            this.track.appendChild(slide);
        }.bind(this));

        this.viewport.appendChild(this.track);
        this.stage.appendChild(this.viewport);

        // Si arrows van a los lados, se agregan al stage (no al header)
        if (this.o.showArrows && this.o.arrowsPos === 'sides') {
            this.stage.appendChild(this._buildArrows());
        }

        this.el.appendChild(this.stage);

        // Dots
        if (this.o.showDots) {
            this.dotsEl = mk('div', 'slider-amatora__dots');

            // Si es variante progress, agregamos la barra interna
            if (this.o.dotsStyle === 'progress') {
                this.progressEl = mk('div', 'slider-amatora__progress');
                this.dotsEl.appendChild(this.progressEl);
            }

            this.el.appendChild(this.dotsEl);
        }

        // Guardar refs
        this.slides  = Array.prototype.slice.call(this.track.querySelectorAll('.slider-amatora__slide'));
        this.btnPrev = this.el.querySelector('.slider-amatora__arrow--prev');
        this.btnNext = this.el.querySelector('.slider-amatora__arrow--next');
        this.curEl   = this.el.querySelector('.slider-amatora__cur');
        this.totEl   = this.el.querySelector('.slider-amatora__tot');
    };

    SliderAmatora.prototype._buildArrows = function () {
        var wrap = mk('div', 'slider-amatora__arrows');
        var cfg = (typeof window !== 'undefined' && window.AmatoraConfig) || {};
        var customIcon = cfg.sliderArrowIcon;
        var iconPrev, iconNext;
        if (customIcon) {
            iconPrev = '<img src="' + customIcon + '" alt="" class="slider-amatora__arrow-icon slider-amatora__arrow-icon--flip">';
            iconNext = '<img src="' + customIcon + '" alt="" class="slider-amatora__arrow-icon">';
        } else {
            iconPrev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
            iconNext = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
        }
        wrap.innerHTML =
            '<button type="button" class="slider-amatora__arrow slider-amatora__arrow--prev" aria-label="Anterior">' +
              iconPrev +
            '</button>' +
            '<button type="button" class="slider-amatora__arrow slider-amatora__arrow--next" aria-label="Siguiente">' +
              iconNext +
            '</button>';
        return wrap;
    };

    // ───────── CÁLCULOS ─────────
    SliderAmatora.prototype._gap = function () {
        if (this.o.gap != null) return this.o.gap;
        var v = parseFloat(getComputedStyle(this.track).gap);
        return isNaN(v) ? 16 : v;
    };

    SliderAmatora.prototype._visible = function () {
        var v = parseFloat(getComputedStyle(this.el).getPropertyValue('--sl-visible'));
        return isNaN(v) ? this.o.visibleDesktop : v;
    };

    SliderAmatora.prototype._slideW = function () {
        if (this.o.variant === 'banner') {
            var peek = parseFloat(getComputedStyle(this.el).getPropertyValue('--sl-peek'));
            if (isNaN(peek)) peek = 48;
            return this.viewport.offsetWidth - peek;
        }
        var vis = this._visible();
        // Debe coincidir EXACTAMENTE con el width de .slider-amatora__slide en CSS:
        //   width: calc((100% - var(--sl-gap) * (var(--sl-visible) - 1)) / var(--sl-visible));
        // Antes usaba Math.floor(vis) - 1 y desfasaba el track con valores fraccionarios (1.2, 2.5, etc.).
        return (this.viewport.offsetWidth - this._gap() * (vis - 1)) / vis;
    };

    SliderAmatora.prototype._stepSize = function () {
        return this._slideW() + this._gap();
    };

    SliderAmatora.prototype._maxStep = function () {
        if (this.o.variant === 'banner') {
            return Math.max(0, this.slides.length - 1);
        }
        return Math.max(0, this.slides.length - Math.floor(this._visible()));
    };

    SliderAmatora.prototype._maxOff = function () {
        var trackW = this.slides.length * this._slideW()
                   + (this.slides.length - 1) * this._gap();
        return Math.max(0, trackW - this.viewport.offsetWidth);
    };

    // ───────── RENDER ─────────
    // opts (opcional): { duration: ms, easing: 'cubic-bezier(...)' }
    // Si se pasa, sobreescribe la transition del track inline (usado por el snap post-drag
    // para que la duración escale con la distancia y se sienta menos "duro" en touch).
    SliderAmatora.prototype._snap = function (n, anim, opts) {
        if (anim === undefined) anim = true;
        if (!opts) opts = {};
        var max = this._maxStep();

        if (this.o.loop) {
            if (n > max) n = 0;
            if (n < 0)   n = max;
        }

        this.step = Math.max(0, Math.min(n, max));
        var want  = this.step * this._stepSize();
        this.offset = Math.min(want, this._maxOff());

        this.track.classList.toggle('no-anim', !anim);

        // Override inline solo cuando viene de un drag; en el resto se limpia
        // para volver a la transition definida en CSS (--sl-transition).
        if (anim && opts.duration) {
            this.track.style.transition =
                'transform ' + opts.duration + 'ms ' +
                (opts.easing || 'cubic-bezier(0.17, 0.84, 0.34, 1)');
        } else {
            this.track.style.transition = '';
        }

        this.track.style.transform = 'translateX(' + (-this.offset) + 'px)';
        this._updateUI();

        // Evento para integraciones (analytics, etc.)
        this.el.dispatchEvent(new CustomEvent('slider-amatora:change', {
            detail: { index: this.step, total: max + 1 }
        }));
    };

    SliderAmatora.prototype._updateUI = function () {
        var total = this._maxStep() + 1;
        var self = this;

        if (this.curEl) this.curEl.textContent = this.step + 1;
        if (this.totEl) this.totEl.textContent = total;

        if (this.btnPrev) this.btnPrev.disabled = !this.o.loop && this.step === 0;
        if (this.btnNext) this.btnNext.disabled = !this.o.loop && this.step >= this._maxStep();

        if (this.dotsEl) {
            // Variante "progress": una sola barra, no hay dots individuales
            if (this.o.dotsStyle === 'progress') {
                // Recrear si nunca existió O si el resize handler lo borró del DOM (dotsEl.innerHTML = '')
                if (!this.progressEl || !this.progressEl.isConnected) {
                    this.progressEl = mk('div', 'slider-amatora__progress');
                    this.dotsEl.innerHTML = '';
                    this.dotsEl.appendChild(this.progressEl);
                }
                var pct = total <= 1 ? 100 : ((this.step + 1) / total) * 100;
                this.progressEl.style.width = pct + '%';

            // Variantes con dots individuales (bar, circle, progress-segmented)
            } else {
                // Reconstruir dots si cambió el número
                var currentCount = 0;
                for (var k = 0; k < this.dotsEl.children.length; k++) {
                    if (this.dotsEl.children[k].classList.contains('slider-amatora__dot')) currentCount++;
                }
                if (currentCount !== total) {
                    this.dotsEl.innerHTML = '';
                    for (var i = 0; i < total; i++) {
                        var dot = mk('button', 'slider-amatora__dot');
                        dot.type = 'button';
                        dot.setAttribute('aria-label', 'Ir al slide ' + (i + 1));
                        (function (idx) {
                            dot.addEventListener('click', function () { self._snap(idx); });
                        })(i);
                        this.dotsEl.appendChild(dot);
                    }
                }
                var dots = this.dotsEl.querySelectorAll('.slider-amatora__dot');
                for (var j = 0; j < dots.length; j++) {
                    dots[j].classList.toggle('is-active', j === this.step);
                }
            }
        }
    };

    // ───────── SNAP DE DRAG (combina distancia + velocidad de flick) ─────────
    // dx       = desplazamiento total del drag (positivo = swipe-left = next).
    // velocity = px/ms con la misma convención de signo (positivo = rumbo a next).
    // Un flick rápido avanza aunque el dx sea < 30% (gesto típico móvil).
    SliderAmatora.prototype._resolveDragSnap = function (dx, velocity) {
        velocity = velocity || 0;
        if (Math.abs(dx) < 5 && Math.abs(velocity) < 0.25) return this.step;

        var stepSize     = this._stepSize();
        var absoluteSlide = (this.drag.off + dx) / stepSize;
        var deltaSlides  = absoluteSlide - this.step;
        var absDelta     = Math.abs(deltaSlides);

        // Flick: ~500 px/s. Si el gesto es rápido en una dirección, gana sobre el threshold.
        var FLICK_VEL = 0.5;
        if (Math.abs(velocity) > FLICK_VEL) {
            return this.step + (velocity > 0 ? 1 : -1);
        }

        var THRESH = 0.3;
        if (absDelta < THRESH) return this.step;
        if (absDelta < 0.5)    return this.step + (deltaSlides > 0 ? 1 : -1);
        return Math.round(absoluteSlide);
    };

    // Velocidad media de los samples de los últimos ~100ms del drag (px/ms).
    // Convención: positivo = el dedo se movió a la izquierda (rumbo al siguiente slide).
    SliderAmatora.prototype._dragVelocity = function () {
        var s = this.drag && this.drag.samples;
        if (!s || s.length < 2) return 0;
        var first = s[0];
        var last  = s[s.length - 1];
        var dt = last.t - first.t;
        if (dt < 8) return 0;
        return (first.x - last.x) / dt;
    };

    // Calcula opts {duration, easing} para el _snap post-drag:
    // duración proporcional a la distancia que falta y a la velocidad de salida.
    SliderAmatora.prototype._snapOptsForDrag = function (targetStep, velocity) {
        var targetWant = targetStep * this._stepSize();
        var targetOff  = Math.min(targetWant, this._maxOff());
        var dist = Math.abs(targetOff - this.offset);
        var dur = dist * 1.2;                        // ~830 px/s base
        dur -= Math.min(120, Math.abs(velocity) * 80); // flick fuerte = se siente más responsivo
        if (dur < 180) dur = 180;
        if (dur > 500) dur = 500;
        return { duration: Math.round(dur) };
    };

    // ───────── RESISTENCIA EN BORDES ─────────
    SliderAmatora.prototype._resist = function (px) {
        if (this.o.loop) return px;
        var max = this._maxOff();
        if (px < 0)   return px * 0.18;
        if (px > max) return max + (px - max) * 0.18;
        return px;
    };

    // ───────── EVENTOS ─────────
    SliderAmatora.prototype._bind = function () {
        var self = this;

        // Arrows
        if (this.btnPrev) this.btnPrev.addEventListener('click', function () { self._snap(self.step - 1); });
        if (this.btnNext) this.btnNext.addEventListener('click', function () { self._snap(self.step + 1); });

        // Mantiene una ventana de los últimos ~100ms de samples para calcular velocidad al soltar.
        var pushSample = function (x) {
            var arr = self.drag.samples;
            var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            arr.push({ x: x, t: now });
            while (arr.length > 1 && now - arr[0].t > 100) arr.shift();
        };

        // ===== MOUSE =====
        var onMouseDown = function (e) {
            // No iniciar drag en botones o enlaces dentro del slide
            if (e.target.closest('button, a, input, select, textarea')) return;

            var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            self.drag = {
                on: true, x: e.clientX, y: e.clientY,
                off: self.offset, moved: false,
                samples: [{ x: e.clientX, t: t0 }]
            };
            self.viewport.classList.add('is-dragging');
            self.track.classList.add('no-anim');
            self._pauseAutoplay();
            e.preventDefault(); // previene selección de texto
        };

        var onMouseMove = function (e) {
            if (!self.drag.on) return;
            var dx = self.drag.x - e.clientX;
            if (Math.abs(dx) > 3) self.drag.moved = true;
            pushSample(e.clientX);
            self.track.style.transform = 'translateX(' + (-self._resist(self.drag.off + dx)) + 'px)';
        };

        var onMouseUp = function (e) {
            if (!self.drag.on) return;
            self.drag.on = false;
            self.viewport.classList.remove('is-dragging');
            var dx = self.drag.x - e.clientX;
            var v  = self._dragVelocity();
            var target = self._resolveDragSnap(dx, v);
            self._snap(target, true, self._snapOptsForDrag(target, v));
            self._resumeAutoplay();
        };

        // Prevenir clicks accidentales al soltar después de drag
        var onClickCapture = function (e) {
            if (self.drag.moved) {
                e.preventDefault();
                e.stopPropagation();
                self.drag.moved = false;
            }
        };

        this.viewport.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        this.viewport.addEventListener('click', onClickCapture, true);

        // ===== TOUCH =====
        var onTouchStart = function (e) {
            var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            self.drag = {
                on: true,
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                off: self.offset,
                moved: false,
                locked: null, // 'h' | 'v' | null
                samples: [{ x: e.touches[0].clientX, t: t0 }]
            };
            self.track.classList.add('no-anim');
            self._pauseAutoplay();
        };

        var onTouchMove = function (e) {
            if (!self.drag.on) return;
            var dx = self.drag.x - e.touches[0].clientX;
            var dy = self.drag.y - e.touches[0].clientY;

            // Determinar dirección (horizontal vs vertical) en el primer movimiento significativo
            if (self.drag.locked == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                self.drag.locked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
            }

            // Si es vertical (scroll natural de la página), no hacer nada
            if (self.drag.locked === 'v') return;

            if (Math.abs(dx) > 3) self.drag.moved = true;
            pushSample(e.touches[0].clientX);
            self.track.style.transform = 'translateX(' + (-self._resist(self.drag.off + dx)) + 'px)';
        };

        var onTouchEnd = function (e) {
            if (!self.drag.on) return;
            self.drag.on = false;

            // Si bloqueamos en vertical, no hacer snap
            if (self.drag.locked === 'v') {
                self._resumeAutoplay();
                return;
            }

            var dx = self.drag.x - e.changedTouches[0].clientX;
            var v  = self._dragVelocity();
            var target = self._resolveDragSnap(dx, v);
            self._snap(target, true, self._snapOptsForDrag(target, v));
            self._resumeAutoplay();
        };

        this.viewport.addEventListener('touchstart', onTouchStart, { passive: true });
        this.viewport.addEventListener('touchmove',  onTouchMove,  { passive: true });
        this.viewport.addEventListener('touchend',   onTouchEnd);

        // ===== RESIZE =====
        var resizeTimer;
        var onResize = function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (self.dotsEl) self.dotsEl.innerHTML = '';
                self._snap(Math.min(self.step, self._maxStep()), false);
            }, 150);
        };
        window.addEventListener('resize', onResize);

        // ===== AUTOPLAY: pausa en hover =====
        if (this.o.autoplay > 0) {
            this.el.addEventListener('mouseenter', function () { self._pauseAutoplay(); });
            this.el.addEventListener('mouseleave', function () { self._resumeAutoplay(); });
        }

        // Guardar handlers por si se llama a destroy
        this._boundHandlers = {
            mouseMove: onMouseMove,
            mouseUp: onMouseUp,
            resize: onResize
        };
    };

    // ───────── AUTOPLAY ─────────
    SliderAmatora.prototype._startAutoplay = function () {
        var self = this;
        this._pauseAutoplay();
        this._autoplayTimer = setInterval(function () {
            var next = self.step + 1;
            if (next > self._maxStep()) {
                self._snap(0);
            } else {
                self._snap(next);
            }
        }, this.o.autoplay);
    };

    SliderAmatora.prototype._pauseAutoplay = function () {
        if (this._autoplayTimer) {
            clearInterval(this._autoplayTimer);
            this._autoplayTimer = null;
        }
    };

    SliderAmatora.prototype._resumeAutoplay = function () {
        if (this.o.autoplay > 0 && !this._autoplayTimer) this._startAutoplay();
    };

    // ───────── API PÚBLICA ─────────
    SliderAmatora.prototype.next     = function () { this._snap(this.step + 1); };
    SliderAmatora.prototype.prev     = function () { this._snap(this.step - 1); };
    SliderAmatora.prototype.goTo     = function (n) { this._snap(n); };
    SliderAmatora.prototype.current  = function () { return this.step; };

    SliderAmatora.prototype.destroy = function () {
        this._pauseAutoplay();
        if (this._boundHandlers) {
            if (this._boundHandlers.mouseMove) window.removeEventListener('mousemove', this._boundHandlers.mouseMove);
            if (this._boundHandlers.mouseUp)   window.removeEventListener('mouseup',   this._boundHandlers.mouseUp);
            if (this._boundHandlers.resize)    window.removeEventListener('resize',    this._boundHandlers.resize);
        }
        this.el.dataset.amatoraSliderInit = '';
    };

    // ═══════════════════════════════════════════════════════════
    // AUTO-INICIALIZACIÓN
    // ═══════════════════════════════════════════════════════════
    function initAll(scope) {
        scope = scope || document;
        var nodes = scope.querySelectorAll('[data-amatora-slider]');
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].dataset.amatoraSliderInit !== '1') {
                new SliderAmatora(nodes[i]);
            }
        }
    }

    // Init al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
        initAll();
    }

    // Shopify Section Rendering API (re-init cuando editor agrega/edita secciones)
    document.addEventListener('shopify:section:load', function (e) {
        initAll(e.target);
    });

    // Expose
    global.SliderAmatora = SliderAmatora;
    global.SliderAmatora.initAll = initAll;

})(typeof window !== 'undefined' ? window : this);