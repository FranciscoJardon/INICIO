---
name: amatora-theme-builder
description: Usa esta skill al construir, editar o revisar CUALQUIER sección, snippet o componente de Shopify: sliders, carruseles, banners, cards y grids de producto, botones de agregar al carrito e imágenes. Es la fuente autoritativa del sistema de diseño Amatora y hace cumplir 4 mandatos: (1) todo slider usa [data-amatora-slider] de amatora.js, nunca Swiper/Slick/Glide/Splide; (2) todo el CSS usa utilities de amatora.css con sufijo -amatora y tokens --am-*, sin valores hardcodeados; (3) toda imagen pasa por image_url + image_tag con loading correcto; (4) todo agregar-al-carrito usa data-add-to-cart y abre el cart drawer del theme. Actívate ante cualquier archivo .liquid, schema de Shopify, setting del customizer, o cuando el usuario mencione slider, carrusel, banner, card de producto, carrito, Amatora, --am-*, LCP, CLS o Core Web Vitals, o pegue código Liquid para revisión.
---

# Amatora Theme Builder

Skill para construir secciones, snippets y componentes de Shopify production-grade que respetan el sistema de diseño Amatora. Genera archivos `.liquid` listos para copiar/pegar con performance, SEO y UX optimizados.

## Cuándo usar esta skill

- El usuario pide una nueva sección, snippet o block de Shopify
- El usuario pega una sección y pide optimizarla, refactorizarla o migrarla a Amatora
- El usuario pregunta por utilities, tokens o convenciones del sistema
- El usuario pide un "slider", "carrusel", "carousel" o "banner": SIEMPRE amatora.js
- El usuario pide una card de producto o cualquier botón de agregar al carrito
- El usuario pregunta por imágenes, lazy loading, LCP, CLS o Core Web Vitals en Shopify

═══════════════════════════════════════════════════════
## 🚨 LOS 4 MANDATOS — REVISA ANTES DE CADA RESPUESTA
═══════════════════════════════════════════════════════

Antes de escribir una sola línea de código, verifica que tu respuesta cumple los cuatro. Si no cumple, reescribe antes de enviar.

### ⚡ MANDATO 1 — Slider: SIEMPRE [data-amatora-slider] de amatora.js

Si el componente involucra slider, carousel, carrusel, banner con varios slides, galería con flechas, dots o autoplay → usas `[data-amatora-slider]`.

*PROHIBIDO bajo cualquier circunstancia*: Swiper, Slick, Glide, Splide, Flickity, Tiny Slider, Owl Carousel, Keen Slider, un slider JS custom, o scroll-snap solo CSS.

Si el usuario pega código con alguna de esas librerías, tu PRIMERA acción es migrarlo a `[data-amatora-slider]`. Menciona que ahorra 60kb+ y funciona igual o mejor.

```liquid
<div data-amatora-slider
     data-visible-desktop="3" data-visible-tablet="2" data-visible-mobile="1.2"
     data-gap="16"
     style="--sl-visible-lg: 3; --sl-visible-md: 2; --sl-visible-sm: 1.2; --sl-gap: 16px;">
  {%- for block in section.blocks -%}
    <div {{ block.shopify_attributes }}>…</div>
  {%- endfor -%}
</div>
```

Reglas:
- Los hijos directos del contenedor son los slides. No los envuelvas en `.slider-amatora__slide`: lo hace el JS.
- Repite las cantidades visibles como CSS vars inline (`--sl-visible-*`, `--sl-gap`, `--sl-peek`). Así el layout ANTES de que corra el JS es idéntico al final y la imagen LCP pinta sin esperar a amatora.js.
- Con 1 solo slide, o cuando todos caben en el viewport, el JS agrega `.is-static` (sin flechas ni dots). *NO escribas lógica Liquid de "single slide".*
- Estilos de dots: solo `bar` y `circle`.
- Banner hero: `data-variant="banner"`, `data-arrows-pos="sides"`, `data-loop="true"`, `data-peek="0"` y `style="--sl-peek: 0px; --sl-gap: 0px;"`.

Ver `reference/slider-api.md` para todos los atributos, la API JS y los eventos.

### 🎨 MANDATO 2 — CSS: SIEMPRE utilities de amatora.css + tokens --am-*

*🚨 CRÍTICO — NUNCA pongas tipografía ni espaciado en bloques `<style>`.*

Tipografía (font-size, font-weight, line-height, letter-spacing, text-align) y espaciado (padding, margin, gap) *DEBEN* venir de las utilities. Si el valor exacto no está en la escala, *toma la utility más cercana y acepta 1-4px de diferencia*: la consistencia del sistema vale más que el pixel-perfect.

*Regla de oro: si existe una utility, se usa la utility.* El objetivo es que cualquiera entienda y modifique una sección leyendo solo el HTML, sin buscar en el CSS. El bloque `<style>` es el último recurso y debe ser mínimo: si pasa de ~10 reglas, algo se pudo resolver con utilities.

Antes de escribir una regla en `<style>`, busca la utility. Estas SÍ existen y se usan en vez de CSS:
- Layout: `flex-amatora`, `grid-amatora`, `grid-cols-*`, `items-*`, `justify-*`, `gap-*`, `flex-col-amatora`
- Posición: `relative-amatora`, `absolute-amatora`, `inset-0-amatora`, `top-0/right-0/bottom-0/left-0-amatora`, `bottom-4-amatora` (4px), `bottom-10-amatora` (10px), `z-{0|1|10|20|30|40|50|100}-amatora`, `center-amatora`
- Tamaño: `w-full-amatora`, `h-auto-amatora`, `max-w-{100..900}-amatora`, `min-h-screen-amatora`
- Media: `object-cover-amatora`, `aspect-video-amatora`, `aspect-ratio-amatora` (1:1), `overflow-hidden-amatora`, `rounded-*-amatora`
- Efectos: `transition-amatora`, `hover:scale-105-amatora`, `hover:opacity-80-amatora`, `shadow-*-amatora`, `opacity-*-amatora`

Lo ÚNICO permitido en `<style>` con scope `#{{ sid }}`:
- Offsets en px que no están en la escala (`bottom: 48px`)
- `aspect-ratio` que no sea 1:1, 9/11 ni 16/9 (ej. `4/3`)
- Transiciones, animaciones, filtros y estados `:hover` sin utility equivalente
- `border-radius` solo si ninguna `rounded-{md|lg|xl|2xl|full}-amatora` coincide
- Valores dinámicos desde settings (`background: {{ section.settings.bg }}`)
- Overrides de variables del slider (`--sl-radius`, `--sl-peek`) o de botones (`--btn-*`)
- Selectores que no controlas desde el HTML (ej. `.slider-amatora__dots`, que genera el JS)

*Prohibido en `<style>`*:
- ❌ `font-size: 18px;` → `text-lg-amatora`
- ❌ `font-weight: 700;` → `font-bold-amatora`
- ❌ `line-height: 1.2;` → `leading-tight-amatora`
- ❌ `letter-spacing: -0.02em;` → `tracking-tight-amatora`
- ❌ `padding: 16px;` → `p-4-amatora`
- ❌ `margin-top: 24px;` → `mt-6-amatora`
- ❌ `gap: 12px;` → `gap-3-amatora`
- ❌ `text-align: center;` → `text-center-amatora`

*Escala tipográfica* (memorízala):

```
text-xs-amatora   = 12px / 16      text-3xl-amatora = 30px / 36
text-sm-amatora   = 14px / 20      text-4xl-amatora = 36px / 40
text-base-amatora = 16px / 24      text-5xl-amatora = 48px / 52
text-lg-amatora   = 18px / 28      text-6xl-amatora = 60px / 64
text-xl-amatora   = 20px / 28      text-7xl-amatora = 72px / 76
text-2xl-amatora  = 24px / 32
```

`font-thin/light/normal/medium/semibold/bold/black-amatora` · `leading-none/tight/normal/relaxed-amatora` · `tracking-tight/normal/wide/wider/widest-amatora`

*Escala de espaciado* (memorízala, y fíjate en los huecos):

```
0, 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px,
10=40px, 12=48px, 14=56px, 16=64px, 20=80px, 25=112px
```

No existen 5, 7, 9, 11, 13, 15, 18 ni 24. El 20 vale 80px, no 20px. No todas las propiedades tienen todos los pasos: `gap-{1|2|3|4|6|8|10|12}`, `py-{1|2|3|4|6|8|10|12|14|16|20}`, `px-{0|1|2|3|4|6|8}`, `mt-{0|1|2|3|4|6|8|12}`, `mb-{0|1|2|3|4|6|8}`. Consulta el catálogo antes de inventar un paso.

*Responsive*: existe UN solo prefijo, `md:` (≥768px). *NO existen `lg:` ni `xl:`.* Mobile-first: la clase sin prefijo es móvil, `md:` sobrescribe en tablet y desktop.

```html
✅ class="text-2xl-amatora md:text-4xl-amatora grid-cols-1-amatora md:grid-cols-3-amatora"
❌ class="lg:grid-cols-4-amatora"    (no existe → no hace nada)
❌ class="xl:px-8-amatora"           (no existe → no hace nada)
```

No todas las utilities tienen versión `md:`. Hay para: colores de texto, display, flex-direction, `grid-cols-{1..6|12}`, col-span, gap, padding, margin, `text-{sm..5xl}`, alineación de texto, width, max-w, height, items/justify, position, z-index, order. Ver `reference/system-overview.md` §5.

*Tokens* en lugar de valores hardcodeados:

```css
✅ color: var(--am-color-primary);      ❌ color: #004a3b;
✅ padding: var(--am-space-6);          ❌ padding: 24px;
✅ font-family: var(--am-font-heading); ❌ font-family: "Playfair";
✅ border: 1px solid var(--am-border);  ❌ border: 1px solid #ddd;
```

*CSS de componente con scope* (BEM con sufijo `-am`):

```css
✅ #{{ sid }} .banner-am__media { object-fit: cover; }
❌ .banner .media { … }          (sin scope → leak global)
❌ #banner-123 .media { … }      (sin BEM, selector frágil)
```

🚨 *Las clases custom `-am` se agregan SOLO bajo demanda.* Solo pon `.algo-am__elemento` en el HTML si vas a escribirle CSS real (position, transition, aspect-ratio, :hover, valor dinámico). Si el elemento solo necesita utilities, no lleva clase custom. Si al terminar el `<style>` no tiene reglas, bórralo entero. Toda clase `-am` del HTML debe aparecer en `<style>` con reglas.

*Colores, tipografía y forma de botones se configuran en el customizer*, panel "Configuraciones Amatora". `amatora-tokens.liquid` los inyecta como `--am-*` y `--btn-*`. Nunca hardcodees una marca en una sección: usa los tokens y respeta lo que el merchant configuró.

*PROHIBIDO*:
- ❌ Agregar utilities a amatora.css. Está congelado: compón con lo que hay.
- ❌ Editar amatora.css o amatora.js en un proyecto. La sección 2 del CSS son defaults de fábrica; el customizer manda.
- ❌ CSS inline sin un setting de Shopify (solo `style="background: {{ section.settings.bg }}"` está OK)
- ❌ Clases de Tailwind, Bootstrap o cualquier otro sistema
- ❌ Hex, px o font-family hardcodeados
- ❌ Clases `-am` huérfanas o bloques `<style>` vacíos

Ver `reference/system-overview.md` para el catálogo completo de tokens y utilities.

### 🖼️ MANDATO 3 — Imágenes: `image_url` + `image_tag`, una línea por imagen

Shopify genera `srcset`, `width`, `height` y elige el formato (WebP/AVIF) por su cuenta. No lo hagas a mano.

```liquid
{{ img | image_url: width: 2040 | image_tag: class: 'hero-am__media', sizes: '100vw', alt: alt, loading: 'lazy' }}
```

Las 5 reglas:

1. **Siempre `image_url: width: N` seguido de `image_tag`.** `width` es el MÁXIMO que se sirve; Shopify arma el srcset hasta ahí. NUNCA `format:` (`webp` no es un valor válido; Shopify negocia el formato solo). NUNCA `img.src`, `img` a secas ni `srcset` escrito a mano.
2. **Width máximo por contexto**: banner/hero full-width `2040` · sección full-width `1500` · imagen a media pantalla `1100` · card de producto o colección `800` · thumbnail/avatar `300` · icono/badge `200` (sin `sizes`).
3. **`sizes` refleja el ancho real**: full-width `'100vw'` · grid de 3 `'(min-width: 768px) 33vw, 100vw'` · grid de 4 `'(min-width: 768px) 25vw, 50vw'` · card en slider `'(min-width: 768px) 33vw, 85vw'`.
4. **`loading`**: UNA sola imagen LCP por página (la primera del primer hero/banner) lleva `loading: 'eager', fetchpriority: 'high'` y, si no tiene imagen móvil aparte, `preload: true`. En un slider, las primeras 3 slides `eager` y el resto `lazy`. Todo lo demás `loading: 'lazy'`. Nunca `fetchpriority: 'high'` en más de una imagen.
5. **Imagen móvil distinta**: UN `<picture>` con `<source media="(max-width: 767px)">` para la móvil y el `image_tag` de desktop como `<img>`. NUNCA dos `<img>` ocultos con CSS: el navegador descarga ambos.

`alt` configurable desde un setting `alt_text`, con fallback al título. Videos: `autoplay muted loop playsinline`, `poster` con `image_url: width: 1600`, `preload="metadata"` solo en el primero.

Ver `reference/images.md` para patrones completos (hero con móvil, product card, iconos, video) y `reference/performance.md` para targets de LCP/CLS/INP.

### 🛒 MANDATO 4 — Carrito: `data-add-to-cart` + el drawer del theme

Cualquier botón "Agregar al carrito" (card de producto, PDP custom, quick-add, upsell, bundle) usa el contrato del snippet `amatora-add-to-cart.liquid`. *NUNCA escribas un `fetch('/cart/add')` dentro de una sección.*

```liquid
<button type="button" class="btn-primary-amatora"
        data-add-to-cart
        data-variant-id="{{ product.selected_or_first_available_variant.id }}">
  <span class="btn-label">Agregar al carrito</span>
</button>
```

Qué garantiza el snippet: spinner real mientras dura el fetch, "Agregado" por 1.5s, error si falla, y *apertura del cart drawer del theme con el ítem nuevo* (Dawn y derivados: `<cart-drawer>` / `<cart-notification>` vía Section Rendering API). Si el theme no es Dawn, engancha su drawer al evento `amatora:cart:added` y dilo explícitamente en la respuesta.

Productos con variantes: respeta `settings.add_to_cart_with_variants`. Con `link_to_product` (default) el botón es un `<a>` al PDP con texto "Ver opciones". Con `show_variants_inline` abre un selector de variantes. Nunca digas "Agregar al carrito" en un botón que navega.

`{% render 'amatora-add-to-cart' %}` va UNA vez en `theme.liquid` antes de `</body>`. Recuérdalo al cerrar.

Ver `reference/buttons.md` para el contrato completo, el patrón de card de producto y los eventos.

═══════════════════════════════════════════════════════
## Self-check ANTES de mandar la respuesta
═══════════════════════════════════════════════════════

Pasa este checklist en cada respuesta. Si alguno falla → reescribe.

- [ ] *MANDATO 1*: si hay carrusel, ¿usa `[data-amatora-slider]`? ¿Sin Swiper/Slick/Glide/Splide? ¿Sin lógica Liquid de single-slide? ¿CSS vars inline `--sl-visible-*` que coinciden con los `data-visible-*`?
- [ ] *MANDATO 2*: ¿las clases terminan en `-amatora`? ¿Solo prefijo `md:`, nada de `lg:`/`xl:`? ¿Sin hex ni px hardcodeados? ¿Sin font-size/font-weight/padding/margin/gap en `<style>`? ¿Cada clase `-am` del HTML tiene reglas en `<style>`? ¿Sin `<style>` vacío? ¿El `<style>` solo tiene lo que NO existe como utility (≤ ~10 reglas)?
- [ ] *MANDATO 3*: ¿toda imagen es `image_url: width: N | image_tag`? ¿Sin `format:`? ¿Sin srcset ni preload a mano? ¿`sizes` real? ¿UNA sola imagen con `fetchpriority: 'high'`? ¿`lazy` en todo lo demás salvo las primeras slides de un slider? ¿`alt` configurable?
- [ ] *MANDATO 4*: ¿todo agregar-al-carrito usa `data-add-to-cart` + `data-variant-id` + `<span class="btn-label">`? ¿Sin fetch propio? ¿Respeta `settings.add_to_cart_with_variants`?
- [ ] ¿Section ID con scope vía `{% assign sid = ... %}` + `#{{ sid }}` en `<style>`?
- [ ] *Elemento root es `<div>` (NO `<section>`)* y el schema tiene `"tag": "section"`?
- [ ] *`container-amatora` lleva `px-4-amatora` o `px-6-amatora`*?
- [ ] ¿Cualquier botón usa `.btn-primary-amatora` o `.btn-secondary-amatora`? ¿Sin CSS custom de botón? ¿Overrides por `style="--btn-bg: …"` y NO por `style="background: …"`?
- [ ] ¿El schema tiene presets con `"category": "Amatora"`?
- [ ] Al cerrar, ¿recordaste los 4 tags de `theme.liquid` (amatora.css, amatora-tokens, amatora.js, amatora-add-to-cart)?

═══════════════════════════════════════════════════════
## Otras reglas
═══════════════════════════════════════════════════════

### Breakpoints
- Sin prefijo = móvil y todas las pantallas
- `md:` = ≥768px
- No hay más prefijos.

### Scoping del section ID
```liquid
{% assign sid = 'nombre-' | append: section.id %}
<div id="{{ sid }}">…</div>
<style>
  #{{ sid }} .nombre-am__elemento { … }
</style>
```

### Root `<div>`, nunca `<section>`
Shopify envuelve cada sección en `<div class="shopify-section">`. Con `"tag": "section"` en el schema, ese wrapper pasa a ser `<section>`. Si además tu root es `<section>`, terminas con `<section><section>` (semántica inválida). Root = `<div>` siempre.

### `container-amatora` no tiene padding horizontal
Solo max-width y márgenes auto. En móvil el contenido toca los bordes. Siempre `container-amatora px-4-amatora md:px-6-amatora`, salvo diseño explícitamente edge-to-edge.

═══════════════════════════════════════════════════════
## Estructura mandatoria de una sección
═══════════════════════════════════════════════════════

```liquid
{%- if section.blocks.size > 0 -%}
{%- liquid
  assign sid = 'nombre-' | append: section.id
-%}

{# Root <div>, NUNCA <section>. Sin clase -am si no tiene CSS propio #}
<div id="{{ sid }}" aria-label="…">
  <div class="container-amatora px-4-amatora md:px-6-amatora py-12-amatora md:py-16-amatora">

    {# Slider (MANDATO 1) con vars inline para el pre-init #}
    <div data-amatora-slider
         data-visible-desktop="3" data-visible-tablet="2" data-visible-mobile="1.2"
         style="--sl-visible-lg: 3; --sl-visible-md: 2; --sl-visible-sm: 1.2;">
      {%- for block in section.blocks -%}
        <div {{ block.shopify_attributes }}>
          {# Imagen (MANDATO 3) #}
          {{ block.settings.img | image_url: width: 800 | image_tag: class: 'nombre-am__media', sizes: '(min-width: 768px) 33vw, 85vw', alt: block.settings.alt_text, loading: 'lazy' }}
          {# Texto con utilities (MANDATO 2) #}
          <h3 class="text-lg-amatora md:text-xl-amatora font-semibold-amatora mt-4-amatora">{{ block.settings.heading }}</h3>
        </div>
      {%- endfor -%}
    </div>

  </div>
</div>

<style>
  #{{ sid }} .nombre-am__media { aspect-ratio: 4/3; object-fit: cover; }
</style>
{%- endif -%}

{% schema %}
{
  "name": "Nombre Amatora",
  "class": "section-nombre-amatora",
  "tag": "section",
  "settings": [ … ],
  "blocks": [
    {
      "type": "item",
      "name": "Item",
      "settings": [
        { "type": "image_picker", "id": "img",      "label": "Imagen" },
        { "type": "text",         "id": "alt_text", "label": "Texto alternativo (SEO)" }
      ]
    }
  ],
  "presets": [{ "name": "Nombre Amatora", "category": "Amatora", "blocks": [ … ] }]
}
{% endschema %}
```

Ver `reference/section-template.liquid` para el template completo.

═══════════════════════════════════════════════════════
## El workflow
═══════════════════════════════════════════════════════

### Paso 1 — Entender
Si el brief es ambiguo, pregunta (items por breakpoint, colores configurables o no, fullwidth o container, blocks fijos o libres). Si el brief es claro, no preguntes: entrega.

### Paso 2 — Estructura
Antes del código, resume en 5-7 líneas: blocks, settings, HTML, qué utilities, si usa slider, imágenes y carrito. Si el usuario pidió revisar antes de codear, para ahí y espera. Si no, sigue en la misma respuesta.

### Paso 3 — Entregar código completo
- Siempre el archivo completo, listo para copy/paste
- Nunca placeholders como "…resto del código aquí…"
- Nunca abreviar el schema

### Paso 4 — Cerrar
Máximo 3-4 bullets:
- Path del archivo (`sections/X-amatora.liquid` o `snippets/X-amatora.liquid`)
- *SIEMPRE recordar* los 4 tags de `theme.liquid`: `amatora.css`, `amatora-tokens`, `amatora.js`, `amatora-add-to-cart`
- Cómo lo usa el merchant en el customizer

═══════════════════════════════════════════════════════
## Componentes ya disponibles — NO rehacer
═══════════════════════════════════════════════════════

### Slider — `[data-amatora-slider]`
Carrusel completo con drag, touch, teclado, flechas, dots (`bar` | `circle`), autoplay inteligente (pausa en hover, fuera de viewport, pestaña oculta y reduced-motion), loop y detección automática de "todo cabe" (`.is-static`). Ver `reference/slider-api.md`.

### Botones — `primary` y `secondary`

Solo 2 clases base + 2 modificadores. Todo lo demás se configura por CSS variables. Nunca escribas CSS de botón nuevo.

| Clase | Cuándo usar |
|---|---|
| `.btn-primary-amatora`   | Acción principal: "Comprar", CTA del hero, "Agregar al carrito". |
| `.btn-secondary-amatora` | Acción alternativa: "Ver más", links de soporte. |

| Modificador | Efecto |
|---|---|
| `.btn-block-amatora`   | Ancho completo (max 450px) con esquina signature. Para CTAs de hero. |
| `.btn-outline-amatora` | Fondo transparente con borde. Combina con primary o secondary. |

Overrides, 3 niveles:

```liquid
<!-- 1. Por instancia -->
<a class="btn-primary-amatora" style="--btn-bg: {{ block.settings.btn_bg }}; --btn-radius: 8px;">CTA</a>

<!-- 2. Por sección: todos los botones de adentro heredan -->
<div id="{{ sid }}" style="--btn-bg: {{ section.settings.btn_bg }};">…</div>

<!-- 3. Global: customizer → Configuraciones Amatora → Botones -->
```

Variables: `--btn-bg`, `--btn-fg`, `--btn-border`, `--btn-radius`, `--btn-py`, `--btn-px`, `--btn-fs`, `--btn-fw`, `--btn-w`, `--btn-max`, `--btn-bg-hover`.

🚨 Prohibido: `.mi-seccion-am__cta { padding: …; }` (usa `--btn-*`) y `style="background: …;"` (usa `--btn-bg`, si no el hover se rompe).

Centrar un `.btn-block-amatora`: envuélvelo en `<div class="flex-amatora justify-center-amatora">`.

### Card base
`.card-amatora`: fondo blanco, borde, sombra sutil, radius 12px, padding 16px. Solo para la caja blanca genérica. Si tu card tiene fondo de color, elementos absolutos o ratios no estándar, escribe una clase `-am` específica.

═══════════════════════════════════════════════════════
## Estilo de comunicación
═══════════════════════════════════════════════════════

Responde en *español*, de tú. Directo, técnico, humano. Sin relleno. Si el usuario está frustrado, ve directo a debug, sin preámbulo.

Un solo bloque de código limpio por archivo. Después del código, máximo 3-4 bullets con los puntos clave.

Para ediciones pequeñas a un archivo previamente generado, devuelve el archivo completo actualizado, no solo un diff.

═══════════════════════════════════════════════════════
## Layout de archivos y carga en theme.liquid
═══════════════════════════════════════════════════════

- `assets/amatora.css` — sistema de diseño (compartido, no se edita por proyecto)
- `assets/amatora.js` — slider (compartido, congelado)
- `snippets/amatora-tokens.liquid` — puente customizer → CSS vars
- `snippets/amatora-add-to-cart.liquid` — lógica de agregar al carrito + drawer
- `sections/{nombre}-amatora.liquid` — secciones del theme
- `snippets/{nombre}-amatora.liquid` — snippets reusables

En `layout/theme.liquid`, en este orden:

```liquid
{# <head> #}
{{ 'amatora.css' | asset_url | stylesheet_tag }}
{% render 'amatora-tokens' %}
<script src="{{ 'amatora.js' | asset_url }}" defer></script>

{# antes de </body> #}
{% render 'amatora-add-to-cart' %}
```

Ver `reference/file-tree.md` para la estructura canónica del theme.
