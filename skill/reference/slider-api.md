# Slider Amatora — API completa

Componente carousel/slider del sistema Amatora. Auto-inicializa al cargar la página sobre cualquier elemento con `[data-amatora-slider]`. Soporta drag, touch, arrows, dots (2 estilos: bar y circle), autoplay, loop, peek, accent color.

**Archivos:**
- CSS: `assets/amatora.css` — sección 28
- JS:  `assets/amatora.js` — clase `SliderAmatora`, expone `window.SliderAmatora`

**Reglas:** mandato 1 — para cualquier carousel/banner/slider del theme se usa este componente. **NUNCA** Swiper/Slick/Glide/Splide.

---

## HTML mínimo

```html
<div data-amatora-slider
     data-visible-desktop="3"
     data-visible-tablet="2"
     data-visible-mobile="1.2">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</div>
```

El JS:
1. Añade `.slider-amatora` al elemento.
2. Envuelve cada hijo directo en `.slider-amatora__slide`.
3. Construye header (label + arrows), stage > viewport > track, y dots.
4. Aplica drag (mouse), touch, resize y autoplay si están habilitados.

---

## Tabla de atributos `data-*`

| Atributo | Valores | Default | Descripción |
|---|---|---|---|
| `data-visible-desktop` | número decimal | `3` | Slides visibles en ≥1024px (escribe `--sl-visible-lg`) |
| `data-visible-tablet`  | número decimal | `2` | Slides visibles en ≥768px (escribe `--sl-visible-md`) |
| `data-visible-mobile`  | número decimal | `1.2` | Slides visibles en <768px (escribe `--sl-visible-sm`). El `.2` es para mostrar peek |
| `data-gap`            | px (entero)    | `16` | Espacio entre slides — sobrescribe `--sl-gap` |
| `data-peek`           | px (entero)    | `48` (móvil 24) | Solo `variant="banner"`: cuánto asoma el siguiente |
| `data-variant`        | `default` \| `banner` | `default` | `banner` = 1 slide a la vez con peek |
| `data-arrows-pos`     | `header` \| `sides` | `header` | `sides` = arrows flotantes sobre el viewport |
| `data-dots-style`     | `bar` \| `circle` | `bar` | Estilo visual de la paginación |
| `data-arrows`         | `true` \| `false` | `true` | Mostrar flechas |
| `data-dots`           | `true` \| `false` | `true` | Mostrar dots |
| `data-label`          | texto              | `''`   | Título a la izquierda del header |
| `data-loop`           | `true` \| `false` | `false` | Vuelve al inicio al pasar del último |
| `data-autoplay`       | ms (entero)        | `0` (off) | Avance automático cada N ms; pausa en hover |
| `data-accent`         | hex                | `--am-color-primary` | Color del active de dots y hover de arrows |

---

## Variantes

### `variant="default"` — carousel multi-slide

Muestra N slides simultáneos según breakpoint. Step = 1 slide. Drag/swipe disponible.

### `variant="banner"` — 1 slide con peek

`--sl-visible` se fija a `1`. Cada slide ocupa `100% - peek`. Ideal para hero/banners donde el siguiente slide asoma como pista visual.

```html
<div data-amatora-slider data-variant="banner" data-peek="48">…</div>
```

---

## Estilos de dots

| `dots-style` | Aspecto | Cuándo usar |
|---|---|---|
| `bar` (default) | Pill horizontal, activo se ensancha de 24→36px | Default elegante |
| `circle`        | Circulitos 8px, activo 10px + scale | Más discreto |

---

## Detección de un solo slide (single-slide)

🚨 **Si la sección tiene 1 solo block/slide, NO inicialices el slider** — quedan flechas y dots huérfanos viendo "1/1". Patrón obligatorio en Liquid:

```liquid
{% assign is_single = false %}
{% if section.blocks.size == 1 %}{% assign is_single = true %}{% endif %}

<div class="banner-am__wrap"
  {%- unless is_single -%}
    data-amatora-slider
    data-variant="banner"
    data-visible-desktop="1"
    data-visible-mobile="1"
    data-peek="48"
  {%- endunless -%}>
  {% for block in section.blocks %}
    <div>…contenido del slide…</div>
  {% endfor %}
</div>
```

Sin `data-amatora-slider`, el JS ignora el contenedor y se renderiza como un `<div>` normal.

---

## API JS programática

```js
// Crear manualmente
var s = new SliderAmatora('#mi-slider', { visibleDesktop: 4, autoplay: 5000 });

// Re-inicializar todos los nuevos
window.SliderAmatora.initAll(scope); // scope = document por defecto

// Métodos
s.next();      // siguiente slide
s.prev();      // anterior
s.goTo(3);     // ir al índice
s.current();   // índice actual (0-based)
s.destroy();   // remueve listeners y resetea el flag de init

// Evento DOM
mySliderEl.addEventListener('slider-amatora:change', function (e) {
  console.log(e.detail.index, e.detail.total);
});
```

**Doble-init guard:** el JS marca `data-amatora-slider-init="1"` después de inicializar. No se vuelve a procesar si ya estaba marcado.

**Shopify section reload:** escucha `shopify:section:load` y re-inicializa los sliders dentro del scope recién cargado (importante para el customizer).

---

## CSS — variables del componente (definidas en sección 28.1)

```css
.slider-amatora {
  --sl-gap:          var(--am-space-4);     /* 16px */
  --sl-visible:      var(--sl-visible-sm, 1.2);  /* mobile-first */
  --sl-radius:       12px;                  /* radius del viewport */
  --sl-accent:       var(--am-color-primary);
  --sl-arrow-bg:     var(--am-color-white);
  --sl-arrow-color:  var(--am-color-primary);
  --sl-arrow-size:   44px;                  /* 38px en móvil */
  --sl-dot-inactive: var(--am-border);
  --sl-dot-active:   var(--am-color-primary);
  --sl-transition:   0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --sl-peek:         48px;                  /* 24px en móvil */
}
```

Para overridear en una sección concreta, sobrescribe estas vars en el scope `#{{ sid }} .slider-amatora { … }`.

---

## Ejemplos típicos

### Banner full-width con autoplay

```html
<div data-amatora-slider
     data-variant="banner"
     data-visible-desktop="1"
     data-visible-mobile="1"
     data-peek="0"
     data-autoplay="5000"
     data-loop="true"
     data-arrows-pos="sides">
  <div><img …></div>
  <div><img …></div>
</div>
```

### Carousel de productos (3 desktop, 2 tablet, 1.2 móvil)

```html
<div data-amatora-slider
     data-visible-desktop="4"
     data-visible-tablet="2"
     data-visible-mobile="1.2"
     data-gap="20"
     data-label="Bestsellers"
     data-arrows-pos="header"
     data-dots-style="bar">
  {% for product in collection.products %}
    <div>{% render 'product-card', product: product %}</div>
  {% endfor %}
</div>
```

### Galería de testimonios sin dots (solo arrows)

```html
<div data-amatora-slider
     data-visible-desktop="2"
     data-visible-mobile="1"
     data-label="Lo que dicen"
     data-dots="false">
  …
</div>
```

---

## Notas técnicas

- **Drag inteligente en touch:** el primer movimiento decide si es horizontal (swipe slider) o vertical (scroll natural de la página). Si es vertical, el slider no intercepta.
- **Resistencia en bordes:** sin `loop`, al arrastrar más allá del primer/último slide hay 18% de resistencia visual.
- **Click vs drag:** si moviste >5px, el `click` posterior se cancela (evita activar links accidentalmente).
- **Autoplay pausa:** automáticamente en `mouseenter`, durante el drag/touch, y resume en `mouseleave`/`touchend`.
- **Resize debounce:** 150ms. Reconstruye dots si cambió el `total` por el nuevo `visible`.
