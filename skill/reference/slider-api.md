# Slider Amatora — API completa

Componente carousel/slider del sistema Amatora. Auto-inicializa sobre cualquier elemento con `[data-amatora-slider]`. Drag (mouse), swipe (touch), teclado, flechas, dots (`bar` | `circle`), autoplay inteligente, loop, peek y color de acento.

**Archivos:**
- CSS: `assets/amatora.css` sección 28
- JS: `assets/amatora.js` (v3.1), clase `SliderAmatora`, expone `window.SliderAmatora`

**Mandato 1:** cualquier carousel/banner/slider del theme usa este componente. **NUNCA** Swiper/Slick/Glide/Splide.

---

## HTML mínimo

```html
<div data-amatora-slider
     data-visible-desktop="3"
     data-visible-tablet="2"
     data-visible-mobile="1.2"
     style="--sl-visible-lg: 3; --sl-visible-md: 2; --sl-visible-sm: 1.2;">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</div>
```

El JS:
1. Agrega `.slider-amatora` al elemento.
2. Envuelve cada hijo directo en `.slider-amatora__slide`.
3. Construye header (label + flechas), stage > viewport > track, y dots.
4. Aplica drag, touch, teclado, resize y autoplay.

### Por qué las CSS vars inline

Antes de que corra el JS, `amatora.css` ya pinta el contenedor como un track (flex + overflow hidden) usando `--sl-visible-sm/md/lg`, `--sl-gap` y `--sl-peek`. Si pasas los mismos valores inline que en los `data-*`, el layout pre-init es idéntico al final: **no hay salto y la imagen LCP de un banner pinta apenas llega, sin esperar a amatora.js.** Si no los pasas, el pre-init usa 1.2 / 2 / 3 y gap 16px.

---

## Tabla de atributos `data-*`

| Atributo | Valores | Default | Descripción |
|---|---|---|---|
| `data-visible-desktop` | número decimal | `3` | Slides visibles en ≥1024px (escribe `--sl-visible-lg`) |
| `data-visible-tablet`  | número decimal | `2` | Slides visibles en ≥768px (escribe `--sl-visible-md`) |
| `data-visible-mobile`  | número decimal | `1.2` | Slides visibles en <768px (escribe `--sl-visible-sm`). El `.2` muestra el peek |
| `data-gap`            | px (entero)    | `16` | Espacio entre slides (escribe `--sl-gap`) |
| `data-peek`           | px (entero)    | `48` (móvil 24) | Solo `variant="banner"`: cuánto asoma el siguiente |
| `data-variant`        | `default` \| `banner` | `default` | `banner` = 1 slide a la vez con peek |
| `data-arrows-pos`     | `header` \| `sides` | panel | `sides` = flechas flotantes sobre el viewport |
| `data-dots-style`     | `bar` \| `circle` | panel | Estilo de la paginación |
| `data-arrows`         | `true` \| `false` | panel | Mostrar flechas |
| `data-dots`           | `true` \| `false` | panel | Mostrar dots |
| `data-label`          | texto              | `''`   | Título a la izquierda del header |
| `data-loop`           | `true` \| `false` | `false` | Del último vuelve al primero (y viceversa) |
| `data-autoplay`       | ms (entero)        | `0` (off) | Avance automático cada N ms |
| `data-accent`         | color CSS          | `--am-color-primary` | Color del dot activo |

Un valor inválido en `data-variant`, `data-arrows-pos` o `data-dots-style` cae al default (no rompe nada).

### Defaults globales: `window.AmatoraConfig`

`amatora-tokens.liquid` publica los defaults del panel "Configuraciones Amatora" → Sliders. Prioridad: **data-attribute > opts (API JS) > AmatoraConfig > hardcoded.**

| Key | Setting del panel |
|---|---|
| `sliderDotsStyle`  | Estilo de los puntos |
| `sliderArrowsPos`  | Posición de las flechas |
| `sliderShowArrows` | Mostrar flechas por defecto |
| `sliderShowDots`   | Mostrar dots por defecto |
| `sliderArrowIcon`  | Icono personalizado de las flechas (URL 64px; la flecha "Anterior" se voltea con `scaleX(-1)`) |

Los settings `slider_gap`, `slider_arrow_size` y `slider_transition_speed` no pasan por JS: el snippet los inyecta como `--sl-gap`, `--sl-arrow-size` y `--sl-transition` en `:root`.

---

## Variantes

### `variant="default"` — carousel multi-slide
Muestra N slides simultáneos según breakpoint. Step = 1 slide.

### `variant="banner"` — 1 slide con peek
`--sl-visible` se fija a `1`. Cada slide ocupa `100% - peek`. Para hero/banners.

```html
<div data-amatora-slider data-variant="banner" data-peek="0" style="--sl-peek: 0px; --sl-gap: 0px;">…</div>
```

---

## Estilos de dots

| `dots-style` | Aspecto |
|---|---|
| `bar` (default) | Pill horizontal, el activo se ensancha 24→36px |
| `circle`        | Círculos 8px, activo 10px |

---

## Estático: cuando todo cabe (`.is-static`)

Si hay 1 solo slide, o todos caben en el viewport en el breakpoint actual (3 de 3 en desktop), el JS agrega `.is-static`: **sin flechas, sin dots, sin drag, sin autoplay.** Se recalcula en cada resize. No escribas lógica Liquid de "single slide": la sección siempre pone `data-amatora-slider` y ya.

---

## Autoplay inteligente

Con `data-autoplay="5000"` el slider avanza cada 5s, pero se pausa automáticamente:
- en `mouseenter` (resume en `mouseleave`)
- durante el drag / swipe
- cuando la pestaña está oculta (`visibilitychange`)
- cuando el slider sale del viewport (IntersectionObserver, umbral 25%)
- siempre, si el usuario tiene `prefers-reduced-motion: reduce`

Tras una interacción manual (flecha, dot, teclado) el intervalo se reinicia, así el siguiente avance automático no llega encima del gesto.

---

## Accesibilidad y teclado

- El viewport es enfocable (`tabindex="0"`, `aria-roledescription="carousel"`): con foco, ← y → cambian de slide.
- Flechas con `aria-label` "Anterior" / "Siguiente"; dots con `aria-label` "Ir al slide N" y `aria-current`.
- `@media (prefers-reduced-motion: reduce)` desactiva la transición del track.
- El click que sigue a un drag se cancela (no navega por accidente); el drag con mouse funciona aunque el slide sea un `<a>`.

---

## API JS programática

```js
// Crear manualmente (raro: los data-* cubren casi todo)
var s = new SliderAmatora('#mi-slider', { visibleDesktop: 4, autoplay: 5000 });

// Re-inicializar sliders nuevos dentro de un scope (default: document)
SliderAmatora.initAll(scope);

// Obtener la instancia de un elemento ya inicializado
var s = SliderAmatora.get(document.querySelector('#mi-slider'));

// Métodos
s.next();      // siguiente
s.prev();      // anterior
s.goTo(3);     // ir al índice
s.current();   // índice actual (0-based)
s.refresh();   // re-medir y re-posicionar (si cambiaste el contenido o el ancho por JS)
s.destroy();   // quita listeners, IO y el flag de init

// Evento DOM en cada cambio
el.addEventListener('slider-amatora:change', function (e) {
  console.log(e.detail.index, e.detail.total);
});
```

**Doble-init guard:** el JS marca `data-amatora-slider-init="1"`. No se vuelve a procesar.

---

## Customizer de Shopify

- `shopify:section:load` → re-inicializa los sliders de la sección recargada.
- `shopify:block:select` → al hacer clic en un block del panel, el slider muestra ese slide.

---

## CSS — variables del componente (sección 28.1)

```css
.slider-amatora {
  --sl-gap:          var(--am-space-4);          /* 16px */
  --sl-visible:      var(--sl-visible-sm, 1.2);  /* mobile-first; md/lg vía media queries */
  --sl-radius:       12px;                       /* radius del viewport */
  --sl-accent:       var(--am-color-primary);
  --sl-arrow-bg:     var(--am-color-white);
  --sl-arrow-color:  var(--am-color-primary);
  --sl-arrow-size:   44px;                       /* 38px en móvil */
  --sl-dot-inactive: var(--am-border);
  --sl-dot-active:   var(--am-color-primary);
  --sl-transition:   0.65s cubic-bezier(0.22, 1, 0.36, 1);
  --sl-peek:         48px;                       /* 24px en móvil */
}
```

Para sobrescribir en una sección: `#{{ sid }} [data-amatora-slider] { --sl-radius: 0; }` (el selector por atributo aplica antes y después del init).

Selectores generados por el JS que sí puedes estilar desde `<style>` de la sección: `.slider-amatora__header`, `__label`, `__arrows`, `__arrow`, `__viewport`, `__track`, `__slide`, `__dots`, `__dot`.

---

## Ejemplos típicos

### Banner full-width con autoplay

```liquid
<div data-amatora-slider
     data-variant="banner"
     data-peek="0" data-gap="0"
     data-autoplay="5000"
     data-loop="true"
     data-arrows-pos="sides"
     style="--sl-peek: 0px; --sl-gap: 0px;">
  {%- for block in section.blocks -%}
    <div class="relative-amatora w-full-amatora" {{ block.shopify_attributes }}>…</div>
  {%- endfor -%}
</div>
```

### Carousel de productos (4 desktop, 2 tablet, 1.2 móvil)

```liquid
<div data-amatora-slider
     data-visible-desktop="4" data-visible-tablet="2" data-visible-mobile="1.2"
     data-gap="20"
     data-label="Bestsellers"
     data-arrows-pos="header"
     style="--sl-visible-lg: 4; --sl-visible-md: 2; --sl-visible-sm: 1.2; --sl-gap: 20px;">
  {%- for product in collection.products limit: 12 -%}
    <div>{% render 'product-card-amatora', product: product %}</div>
  {%- endfor -%}
</div>
```

### Testimonios sin dots (solo flechas)

```liquid
<div data-amatora-slider
     data-visible-desktop="2" data-visible-tablet="2" data-visible-mobile="1"
     data-label="Lo que dicen"
     data-dots="false"
     style="--sl-visible-lg: 2; --sl-visible-md: 2; --sl-visible-sm: 1;">
  …
</div>
```

---

## Notas técnicas

- **Medidas cacheadas:** el JS lee el layout (`offsetWidth`, `getComputedStyle`) solo en init, resize y al empezar un drag. Durante el drag no hay lecturas de layout por frame.
- **Listeners de mouse** se agregan a `window` solo mientras dura el drag y se quitan al soltar.
- **Touch:** el primer movimiento decide si es horizontal (slider) o vertical (scroll). El viewport tiene `touch-action: pan-y`, así el browser conserva el scroll vertical nativo.
- **Resistencia en bordes:** sin `loop`, al arrastrar más allá del primer/último slide hay 18% de resistencia.
- **Flick:** un swipe rápido (>0.5 px/ms) avanza aunque la distancia sea corta; la duración del snap escala con la distancia (180-500ms).
- **Resize:** ResizeObserver sobre el viewport con debounce de 150ms. Cubre el resize de ventana y el paso de `display:none` a visible (tabs, drawers, acordeones): no hace falta llamar `refresh()` en esos casos. Reconstruye dots si cambió el total.
- **Drag nativo cancelado:** `dragstart` se previene en el viewport; arrastrar sobre un `<a>` o `<img>` mueve el slider, no crea el "ghost" del navegador.
- **Loop** es "vuelve al inicio", no infinito con clones: mantiene el JS liviano.
