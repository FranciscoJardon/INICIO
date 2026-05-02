---
name: amatora-theme-builder
description: Usa este skill al construir, editar o revisar CUALQUIER sección, snippet o componente de Shopify — especialmente los que involucren sliders, carruseles, banners, grids de producto o imágenes. Este skill es la fuente autoritativa del sistema de diseño Amatora y DEBE usarse para hacer cumplir tres mandatos: (1) TODOS los sliders/carruseles usan [data-amatora-slider] de amatora.js — NUNCA Swiper/Slick/Glide/Splide; (2) TODO el CSS usa clases de utilidad de amatora.css con sufijo -amatora y tokens --am-* — nunca valores hardcodeados; (3) TODAS las imágenes están optimizadas para Shopify con filtro image_url, sizes responsivos, width/height explícitos, estrategia correcta de loading, y preload de LCP. Dispárate ante cualquier archivo .liquid, schema de Shopify, setting del customizer, o cuando el usuario mencione "slider", "carousel", "carrusel", "banner", "Amatora", "--am-*", "data-amatora-slider", "image optimization", "LCP", "CLS", "Core Web Vitals", o pegue código Liquid/Shopify para revisión.
---

# Amatora Theme Builder

Skill para construir secciones, snippets y componentes de Shopify production-grade que respetan las convenciones del sistema de diseño Amatora. Genera archivos `.liquid` listos para copiar/pegar con performance, SEO y UX optimizados.

## Cuándo usar este skill

- El usuario pide una nueva sección, snippet o block de Shopify
- El usuario pega una sección de Shopify y pide optimizarla, refactorizarla o migrarla a Amatora
- El usuario pregunta sobre clases de utilidad, tokens o convenciones del sistema Amatora
- El usuario menciona que está construyendo/editando un theme o migrando desde Swiper/Slick/Glide/Splide
- El usuario pega código Liquid para revisión
- El usuario pregunta sobre optimización de imágenes, lazy loading, LCP, CLS o Core Web Vitals en Shopify
- El usuario pide un "slider", "carrusel", "carousel", "banner" — SIEMPRE usa amatora.js

═══════════════════════════════════════════════════════
## 🚨 LOS 3 MANDATOS — REVISA ANTES DE CADA RESPUESTA
═══════════════════════════════════════════════════════

Antes de escribir una sola línea de código, verifica que tu respuesta cumple estos tres mandatos. Si no cumple, reescribe antes de enviar.

### ⚡ MANDATO 1 — Slider: SIEMPRE usar [data-amatora-slider] de amatora.js

Si el componente solicitado involucra CUALQUIERA de esto:
- slider, carousel, carrusel
- banner con varios slides
- carrusel de productos, carrusel de testimoniales, galería de imágenes con navegación
- "slides que rotan automáticamente", "banner con autoplay"
- cualquier cosa con flechas izquierda/derecha para paginar
- cualquier cosa con dots para navegación

→ DEBES usar [data-amatora-slider] de amatora.js.

*PROHIBIDO bajo cualquier circunstancia*:
- ❌ Swiper (swiper.min.js, new Swiper())
- ❌ Slick (.slick(), slick-carousel)
- ❌ Glide (new Glide())
- ❌ Splide (new Splide())
- ❌ Flickity, Tiny Slider, Owl Carousel, Keen Slider
- ❌ Escribir un slider JS custom desde cero
- ❌ Scroll-snap solo CSS (no da el mismo control sobre dots/arrows/loop/autoplay)

Si el usuario pega código que usa cualquiera de los anteriores, tu PRIMERA acción es migrarlo a [data-amatora-slider]. Menciona que ahorra 60kb+ y funciona idéntico o mejor.

Ver `reference/slider-api.md` para todos los atributos data-* (visible por breakpoint, gap, peek, variant, arrows-pos, dots-style, autoplay, loop, accent, etc).

### 🎨 MANDATO 2 — CSS: SIEMPRE usar clases de utilidad de amatora.css + tokens --am-*

*🚨 CRÍTICO — NUNCA pongas valores de tipografía o espaciado en bloques `<style>`.*

Tipografía (font-size, font-weight, line-height, letter-spacing, text-align) y espaciado (padding, margin, gap) *DEBEN* venir de las clases de utilidad de amatora.css. Sin excepciones. Aunque el valor exacto no esté en la escala, *toma la utility más cercana y acepta la diferencia de 1-4px* — la consistencia del sistema vale más que la precisión pixel-perfect.

Lo ÚNICO permitido en bloques `<style>` con scope:
- Posicionamiento que no tiene utility equivalente (position, top/right/bottom/left con valores específicos en px)
- min-height / max-width con valores px específicos que no están en la escala
- object-fit, overflow
- transition, transform, animaciones :hover, filter
- aspect-ratio
- border-radius solo si ninguna utility coincide (pero intenta `rounded-{lg|xl|2xl|full}-amatora` primero)
- Valores dinámicos desde settings de Shopify (`background: {{ settings.bg }}`)

*Prohibido en bloques `<style>`:*
- ❌ `font-size: 18px;` → usa `text-lg-amatora`
- ❌ `font-weight: 700;` → usa `font-bold-amatora`
- ❌ `line-height: 1.2;` → usa `leading-tight-amatora`
- ❌ `letter-spacing: -0.02em;` → usa `tracking-tight-amatora`
- ❌ `padding: 16px;` → usa `p-4-amatora`
- ❌ `margin-top: 24px;` → usa `mt-6-amatora`
- ❌ `gap: 12px;` → usa `gap-3-amatora`
- ❌ `text-align: center;` → usa `text-center-amatora`

*Escala de tipografía disponible* (memoriza estos):

```
text-xs-amatora   = 12px  / 16
text-sm-amatora   = 14px  / 20
text-base-amatora = 16px  / 24
text-lg-amatora   = 18px  / 28
text-xl-amatora   = 20px  / 28
text-2xl-amatora  = 24px  / 32
text-3xl-amatora  = 30px  / 36
text-4xl-amatora  = 36px  / 40
text-5xl-amatora  = 48px  / 52
text-6xl-amatora  = 60px  / 64
```

`font-thin/light/normal/medium/semibold/bold/black-amatora` (100-900)
`leading-none/tight/normal/relaxed-amatora`
`tracking-tight/normal/wide/wider/widest-amatora`


*Escala de espaciado disponible* (memoriza estos — NO hay 20 ni 28):

```
0, 1(4px), 2(8px), 3(12px), 4(16px), 6(24px),
8(32px), 10(40px), 12(48px), 14(56px), 16(64px), 20(80px), 25(112px)
```

*Tipografía responsive*: usa `md:text-*-amatora` para overrides en desktop. Ejemplo: `class="text-xs-amatora md:text-base-amatora"`.

---

Cada sección usa:

*Clases de utilidad* (sufijo `-amatora`) para layout/spacing/color/tipografía:
```html
✅ <div class="flex-amatora items-center-amatora gap-4-amatora py-12-amatora md:grid-cols-3-amatora">
❌ <div style="display:flex; align-items:center; gap:16px; padding:48px 0;">
❌ <div class="container mx-auto px-4 grid grid-cols-3">  (Tailwind — sistema equivocado)
❌ <div class="d-flex align-items-center">  (Bootstrap — sistema equivocado)
```

*Tokens* (`--am-*`) en lugar de valores hardcodeados:
```css
✅ color: var(--am-color-primary);
✅ padding: var(--am-space-6);
✅ font-family: var(--am-font-heading);
✅ border: 1px solid var(--am-border);

❌ color: #004a3b;          (hardcoded)
❌ padding: 24px;           (hardcoded)
❌ font-family: "Playfair"; (hardcoded)
❌ border: 1px solid #ddd;  (hardcoded)
```

*CSS de componente con scope* dentro de bloques `<style>` (BEM con sufijo `-am`):
```css
✅ #{{ sid }} .banner-am__media { width: 100%; }
✅ #{{ sid }} .producto-am__titulo--featured { color: var(--am-color-primary); }

❌ .banner .media { ... }              (sin scope → leak global)
❌ #banner-123 .media { ... }          (sin BEM, selector frágil)
```

🚨 *Las clases custom `-am` se agregan SOLO bajo demanda, no preventivamente.* Solo agrega una clase `.algo-am__elemento` si tienes CSS REAL que escribirle (positioning, transition, aspect-ratio, hover, valor dinámico de un setting, etc.). Las clases vacías "por si acaso" inflan el HTML, confunden al lector, y delatan que no sabes qué CSS vas a escribir.

Reglas:
- Si el elemento solo necesita utilities (`flex-amatora`, `gap-4-amatora`, `text-lg-amatora`...) → *NO le pongas clase custom `-am`.* Las utilities son suficientes.
- Si necesitas posicionamiento, transición, aspect-ratio, :hover, filter, o cualquier CSS que no es utility → *SÍ agrégale clase `-am`* Y escribe su CSS en el bloque `<style>`.
- Si después de escribir el HTML el bloque `<style>` no tiene reglas → *bórralo entero.* No lo dejes vacío con `/* nada por ahora */`.
- Si escribes una clase en el HTML, DEBE aparecer al menos una vez en `<style>` con reglas. Si no, quítala del HTML.

Esto evita: HTML inflado con clases muertas, bloques `<style>` con reglas vacías, confusión futura sobre qué CSS existe vs no.

*PROHIBIDO*:
- ❌ Agregar nuevas clases de utilidad a amatora.css — está congelado. Compón con lo que hay.
- ❌ CSS inline sin un setting de Shopify (solo `style="background: {{ section.settings.bg }}"` está OK)
- ❌ Clases de otros sistemas de diseño (Tailwind, Bootstrap, Bulma, etc.)
- ❌ Hardcodear hex colors, valores px o strings de font-family
- ❌ Clases custom `-am` en el HTML que NO tienen reglas CSS correspondientes
- ❌ Bloques `<style>` vacíos o reglas que solo contienen comentarios

Ver `reference/system-overview.md` para el catálogo completo de tokens + utilities.

### 🖼️ MANDATO 3 — Imágenes: SIEMPRE optimizadas para Shopify

Las imágenes mal manejadas son la causa #1 de LCP lento en Shopify. Cada `<img>` que escribas DEBE cumplir TODAS las reglas de abajo. Si una falla, reescribe.

#### Regla 1 — `<picture>` para arte responsive (NO dos `<img>` con CSS toggle)

🚨 **PROHIBIDO**: dos `<img>` desktop/móvil ocultos con `display:none`. El navegador moderno **descarga ambas** antes de evaluar el CSS — duplicas el peso de la página y matas el LCP móvil.

✅ **Patrón correcto**: UN solo `<picture>` con `<source media>` para art-direction. Solo uno se descarga.

```liquid
{%- liquid
  assign img_d = block.settings.img
  assign img_m = block.settings.img2 | default: img_d
  assign alt   = block.settings.alt_text | default: 'Banner' | escape
-%}

{%- if img_d != blank -%}
  <picture class="banner-am__media">
    {# Móvil: aspect ratio vertical, srcset granular #}
    <source media="(max-width: 767px)"
            srcset="{{ img_m | image_url: width: 375,  format: 'webp' }} 375w,
                    {{ img_m | image_url: width: 750,  format: 'webp' }} 750w,
                    {{ img_m | image_url: width: 1100, format: 'webp' }} 1100w"
            sizes="100vw"
            width="{{ img_m.width }}" height="{{ img_m.height }}">

    {# Desktop fallback #}
    <img src="{{ img_d | image_url: width: 1500, format: 'webp' }}"
         srcset="{{ img_d | image_url: width: 750,  format: 'webp' }} 750w,
                 {{ img_d | image_url: width: 1100, format: 'webp' }} 1100w,
                 {{ img_d | image_url: width: 1500, format: 'webp' }} 1500w,
                 {{ img_d | image_url: width: 1920, format: 'webp' }} 1920w"
         sizes="100vw"
         width="{{ img_d.width }}" height="{{ img_d.height }}"
         alt="{{ alt }}"
         {% if forloop.first %}loading="eager" fetchpriority="high"{% else %}loading="eager"{% endif %}
         decoding="async">
  </picture>
{%- endif -%}
```

(Nota: en un banner con varios slides en carrusel, los slides 2+ van `eager` también porque están dentro de un track con `transform` — `lazy` falla ahí. Ver Regla 6.)

#### Regla 2 — `srcset` + `sizes` SIEMPRE (no width fijo)

Cargar `image_url: width: 1920` sin `srcset` obliga al móvil a descargar 1920px aunque su pantalla mida 375px. **Cada `<img>` que ocupe ancho variable necesita `srcset` + `sizes`.**

**Anchos recomendados por contexto:**

| Contexto | `srcset` widths | `sizes` |
|---|---|---|
| Banner hero full-width | `375, 750, 1100, 1500, 1920` | `100vw` |
| Sección full-width | `375, 750, 1100, 1500` | `100vw` |
| Product card en grid 4 cols | `200, 400, 600` | `(min-width: 768px) 25vw, 50vw` |
| Product card en grid 3 cols (slider) | `300, 500, 700` | `(min-width: 768px) 33vw, 90vw` |
| Card 2x2 (collection card) | `300, 500, 700` | `(min-width: 768px) 25vw, 50vw` |
| Icono / badge / shipping icon | `width: 80` (1x fijo, sin srcset) | — |
| Avatar / thumbnail | `100, 200` | fijo |
| Logo en banner | `width: 300` (fijo) | — |

#### Regla 3 — `width` y `height` SIEMPRE presentes (CLS = 0)

```liquid
✅ width="{{ img.width }}" height="{{ img.height }}"
❌ (faltante → cumulative layout shift al cargar)
```

Si la imagen es decorativa (background CSS), úsala como `background-image` con `aspect-ratio` en CSS, **no** como `<img>` sin width/height.

#### Regla 4 — Tamaño correcto por contexto (NO sobre-pedir)

🚨 **NO pedir 1920 / 3840 cuando el contenedor real es menor.** Pedir 3840 para un banner full-width es overkill — duplica bytes vs. 1920 sin diferencia visible salvo en pantallas 4K (<3% del tráfico).

| Elemento | Width máximo razonable |
|---|---|
| Icono SVG/PNG (icon-bar, badge) | **80–200** |
| Logo header | **300–400** |
| Product card image | **400–600** (no 800) |
| Card de colección 2-col | **600–800** |
| Hero móvil | **750–1100** |
| Banner full-width desktop | **1500–1920** |
| Background full-bleed 4K | **2560** (jamás 3840) |
| Poster de video | **1600** |

**Prohibido**: `image_url: width: 3840` para uso normal, o `image_url` sin `width` (devuelve la nativa = puede ser 5000px+).

#### Regla 5 — `format: 'webp'` explícito

Aunque `image_url` por default sirve webp en navegadores compatibles, **siempre** declara `format: 'webp'` explícito. Es defensa en profundidad y deja la intención clara en el código:

```liquid
✅ {{ img | image_url: width: 1100, format: 'webp' }}
❌ {{ img | image_url: width: 1100 }}   {# depende de heurística del navegador #}
```

#### Regla 6 — Estrategia de loading: `eager` por default, `lazy` solo en zonas seguras

🚨 **En Shopify, `loading="lazy"` falla seguido y causa pop-in / imágenes que no cargan.** Las causas conocidas:

1. **Carruseles con `transform: translateX`**: los slides off-screen están técnicamente "in viewport" para el IntersectionObserver pero visualmente ocultos por `overflow:hidden`. Lazy no se comporta confiable — o carga todo de golpe (rompe el propósito) o no carga nunca hasta que dragueas (flash al paginar).
2. **Preview del customizer**: el iframe no siempre dispara los eventos de intersección. Las imágenes lazy aparecen en blanco mientras el merchant edita.
3. **Sections AJAX-recargadas** (Section Rendering API): lazy puede no disparar tras un reload parcial.
4. **Iconos pequeños**: pop-in visible al hacer scroll porque el observer dispara tarde.

**Política nueva — DEFAULT a `eager`:**

| Caso | loading | fetchpriority |
|---|---|---|
| LCP (primera imagen above-the-fold del primer banner/hero) | `eager` | `high` + preload |
| Cualquier imagen above-the-fold no-LCP | `eager` | (omitir = auto) |
| Iconos pequeños (≤200w, icon-bar, badges) | `eager` | (omitir) |
| Imágenes dentro de cualquier carrusel/slider | `eager` | (omitir) — NUNCA lazy |
| Imágenes dentro de drawers, popups, accordions cerrados | `eager` | (omitir) |
| Imágenes claramente below-the-fold + NO en carrusel + NO en customizer preview crítico (ej. footer Instagram, footer testimoniales) | `lazy` | (omitir) |

**Decoding**: SIEMPRE `decoding="async"` en todas las imágenes. Es seguro y ayuda al main thread.

```liquid
{# LCP — primera slide del hero/banner #}
{% if forloop.first and section.index == 1 %}
  loading="eager" fetchpriority="high"
{% else %}
  loading="eager"
{% endif %}
decoding="async"
```

**Si dudas → `eager`.** Cuesta unos bytes extra de ancho de banda, pero evita 100% el pop-in, los slides en blanco y los bugs del customizer. La pérdida de performance por servir más imágenes es menor que la pérdida de UX por un slider con flash.

**Alternativa moderna a `lazy` que NO falla**: si quieres deprioritizar una imagen sin riesgo de que no cargue, usa `fetchpriority="low"` en lugar de `loading="lazy"`. El navegador la baja al final de la cola pero la pide igual junto con el resto del HTML — sin IntersectionObserver, sin riesgo de no disparar.

```liquid
{# Imagen below-the-fold cuando lazy te ha fallado: #}
loading="eager" fetchpriority="low" decoding="async"
```

🚨 **NUNCA pongas `eager` con `fetchpriority="high"` en más de UNA imagen por página.** Eso es solo para el LCP. Si pones high en 5 imágenes, el navegador no sabe cuál es la real LCP y todas pierden prioridad.

Resumen rápido:
- **LCP** (UNA imagen, primer banner/hero): `eager` + `fetchpriority="high"` + preload.
- **Todo lo demás above-fold + carruseles + iconos + drawers**: `eager` (sin fetchpriority).
- **Solo footer y zonas profundas sin carrusel**: `lazy` (con cuidado) o `fetchpriority="low"` (más seguro).
- **TODO lleva `decoding="async"`.**

#### Regla 7 — `<link rel="preload">` con `imagesrcset` (no URL fija)

Para LCP, el preload va con **el mismo srcset/sizes** que el `<img>` real, no una URL hardcoded a 1920. Si no, móvil descarga 1920 vía preload + 750 vía `<img>` = doble fetch.

```liquid
{# ANTES de <div id="..."> #}
{%- if first.settings.img != blank -%}
  <link rel="preload"
        as="image"
        fetchpriority="high"
        imagesrcset="{{ first.settings.img | image_url: width: 750,  format: 'webp' }} 750w,
                     {{ first.settings.img | image_url: width: 1100, format: 'webp' }} 1100w,
                     {{ first.settings.img | image_url: width: 1500, format: 'webp' }} 1500w,
                     {{ first.settings.img | image_url: width: 1920, format: 'webp' }} 1920w"
        imagesizes="100vw">
{%- endif -%}
```

Una sola sección por página debe preloadear — la primera. Preload en sección #4 = waste.

#### Regla 8 — Alt text configurable y semántico

```liquid
✅ alt="{{ block.settings.alt_text | default: block.settings.heading | default: 'Producto' | escape }}"
❌ alt=""              {# salvo decorativa pura — y entonces es pintura, no <img> #}
❌ alt="image"
❌ alt="Banner"        {# mismo para todos = no informa #}
```

Siempre expón un setting `alt_text` por bloque en el schema.

#### Regla 9 — Productos en grid: 400–600, NUNCA 800+

Para product cards en un slider/grid de 3–4 columnas el contenedor real mide ~280–360px. Pedir 800 = 2x desperdicio. **Usa `srcset` 200/400/600 con `sizes` correcto** y deja que el navegador elija.

```liquid
<img src="{{ product.featured_image | image_url: width: 600, format: 'webp' }}"
     srcset="{{ product.featured_image | image_url: width: 300, format: 'webp' }} 300w,
             {{ product.featured_image | image_url: width: 500, format: 'webp' }} 500w,
             {{ product.featured_image | image_url: width: 700, format: 'webp' }} 700w"
     sizes="(min-width: 768px) 33vw, 90vw"
     width="{{ product.featured_image.width }}"
     height="{{ product.featured_image.height }}"
     loading="eager" decoding="async"
     alt="{{ product.featured_image.alt | default: product.title | escape }}">
```

(Si el grid de productos está dentro de un slider — caso típico de "best sellers" — `eager`. Si está en una sección plana below-the-fold sin carrusel, puedes intentar `lazy` con cuidado. Ver Regla 6.)

#### Regla 10 — Iconos (icon-bar, shipping, badges, value-props)

Dos cosas distintas que mucha gente olvida:

1. **NO `srcset`**: los iconos pequeños cargan UN solo tamaño (cercano al render real × 2 para retina, tope ~200w).
2. **`loading="eager"`, no `lazy`**: lazy en iconos crea efecto pop-in (el icono aparece "de la nada" al hacer scroll). Como cada icono pesa ~5–20kb, el byte ahorrado por lazy no compensa la mala UX. Eager los carga junto con el HTML y nunca se ve el flash.

```liquid
{# Render real: 48px → pide 96 (2x) o 200 si quieres holgura #}
<img src="{{ icon | image_url: width: 200, format: 'webp' }}"
     width="48" height="48"
     loading="eager" decoding="async"
     alt="{{ alt | default: 'Icono' | escape }}">
```

**Aplica a**: icon-bar, shipping icons, badges, iconos de value-props, iconos de "cómo funciona", logos pequeños del footer. **NO aplica a**: imágenes de producto, fotos de testimoniales, banners — esas siguen las reglas generales de la Regla 6 (default `eager`, `lazy` solo si están claramente below-the-fold y fuera de cualquier carrusel).

#### Regla 11 — Videos

- `autoplay muted loop playsinline` — los 4 obligatorios para autoplay en iOS
- `poster="{{ poster | image_url: width: 1600, format: 'webp' }}"` siempre
- `preload="metadata"` solo en el primer video; resto `preload="none"`

#### Auto-checklist por cada `<img>` que escribas

- [ ] ¿Pasa por `image_url` con `width:` y `format: 'webp'` explícitos?
- [ ] ¿Tiene `width` y `height` HTML attrs (CLS)?
- [ ] Si ocupa ancho variable: ¿tiene `srcset` + `sizes`?
- [ ] Si hay versión desktop/móvil distinta: ¿usa `<picture>` con `<source media>` (NO dos `<img>` con CSS)?
- [ ] ¿`fetchpriority="high"` SOLO en UNA imagen (la LCP)?
- [ ] ¿`loading="eager"` por default? ¿`lazy` solo en footer/zonas profundas y NUNCA dentro de carruseles/drawers/popups? (Ver Regla 6.)
- [ ] Si es LCP: ¿hay `<link rel="preload">` con `imagesrcset` + `imagesizes`?
- [ ] ¿`alt` configurable y descriptivo?
- [ ] ¿El width pedido es razonable para el contenedor (no 3840 para un card de 300px)?

Ver `reference/performance.md` para targets completos de LCP/CLS/INP.

═══════════════════════════════════════════════════════
## Self-check ANTES de mandar respuesta
═══════════════════════════════════════════════════════

Pasa este checklist mentalmente en cada respuesta. Si alguno falla → reescribe.

- [ ] *MANDATO 1*: si hay carrusel/slider, ¿usa [data-amatora-slider]? ¿Sin Swiper/Slick/Glide/Splide?
- [ ] *MANDATO 2*: ¿las clases de layout terminan en `-amatora`? ¿colores/espaciado/fonts usan tokens `--am-*`? ¿Sin hex ni px hardcoded? **¿Sin font-size/font-weight/padding/margin/gap en bloques `<style>` — TODA la tipografía + espaciado viene de `text-*-amatora`, `font-*-amatora`, `p-*-amatora`, `mt-*-amatora`, `gap-*-amatora`?** **¿Cada clase custom `-am` del HTML tiene reglas CSS correspondientes en `<style>`? ¿Sin clases huérfanas, sin bloques `<style>` vacíos?**
- [ ] *MANDATO 3*: ¿todos los `<img>` tienen `image_url: width: X` con tamaño correcto? ¿`width`/`height` attrs explícitos? ¿`loading`/`fetchpriority` correctos? ¿Preload de LCP para hero? ¿Alt text configurable? ¿Pickers desktop/móvil separados?
- [ ] ¿Single-slide detection con `{% unless is_single %}` si es slider?
- [ ] ¿Section ID con scope vía `{% assign sid = ... %}` + `#{{ sid }}` en `<style>`?
- [ ] *Elemento root es `<div>` (NO `<section>`)* — ¿y el schema tiene `"tag": "section"` para que Shopify lo envuelva en `<section>` automáticamente?
- [ ] *`container-amatora` tiene padding horizontal (`px-4-amatora` o `px-6-amatora`)* — ¿si no, el contenido toca los bordes en mobile?
- [ ] *¿Cualquier botón usa `.btn-primary-amatora` o `.btn-secondary-amatora`* (con `.btn-block-amatora` / `.btn-outline-amatora` como modificadores si hace falta)? ¿Ningún CSS custom de botón? ¿Los overrides de color/radius/tamaño van por `style="--btn-bg: ...; --btn-radius: ...;"` y NO por `style="background: ...;"`?
- [ ] ¿El schema tiene presets con `"category": "Amatora"`?
- [ ] Al final, ¿mencionaste explícitamente que `amatora.css` y `amatora.js` deben cargarse en `theme.liquid`?

═══════════════════════════════════════════════════════
## Otras reglas
═══════════════════════════════════════════════════════

### Mobile-first + breakpoints Amatora
- Sin prefijo = todas las pantallas
- `md:` = ≥768px
- `lg:` = ≥1024px
- `xl:` = ≥1280px

### Scoping del Section ID
Cada sección comienza con:
```liquid
{% assign sid = 'nombre-' | append: section.id %}
<div id="{{ sid }}">...</div>
<style>
  #{{ sid }} .nombre-am__elemento { ... }
</style>
```

### Detección de single-slide para sliders
Cuando una sección de slider tiene solo 1 block, el slider NO debe inicializarse:
```liquid
{% assign is_single = false %}
{% if section.blocks.size == 1 %}{% assign is_single = true %}{% endif %}

<div class="..."
  {%- unless is_single -%}
     data-amatora-slider
     data-variant="banner"
     ...
  {%- endunless -%}>
```

Sin esto, un banner con un solo slide muestra flechas/dots huérfanos, lo cual se ve roto.

═══════════════════════════════════════════════════════
## Estructura mandatoria de una sección
═══════════════════════════════════════════════════════

🚨 *La utility `.container-amatora` NO tiene padding horizontal* — solo setea max-width + auto margins. En mobile (< 640px) el contenido toca los bordes sin él. *Siempre agrega `px-4-amatora` (o `px-6-amatora` para un look más respirado) directo en el elemento `container-amatora`* — salvo que el diseño sea explícitamente edge-to-edge.

```liquid
✅ <div class="container-amatora px-4-amatora md:px-6-amatora">
❌ <div class="container-amatora">   {# el contenido toca los bordes en mobile #}
```

🚨 *NUNCA uses `<section>` como tag root de un archivo de sección de Shopify.* Shopify ya envuelve cada sección en un `<div class="shopify-section">` automáticamente. Si además pones `"tag": "section"` en el schema, Shopify la envuelve en `<section class="shopify-section ...">`. Por lo tanto el root del template Liquid DEBE ser `<div>`, si no acabas con `<section><section>...</section></section>` (doble tag semántico — accesibilidad rota y semántica HTML inválida).

*Patrón correcto:*
- Root del template Liquid = `<div>`
- El schema tiene `"tag": "section"` → el wrapper externo de Shopify se vuelve `<section>` (semántico)
- El schema tiene `"class": "section-nombre-amatora"` → Shopify le agrega esa clase al wrapper
- `aria-label` en el `<div>` interno está bien

```liquid
{%- if section.blocks.size > 0 -%}
{%- liquid
  assign sid = 'nombre-' | append: section.id
  assign first = section.blocks.first
-%}

{# MANDATO 3: Preload del asset LCP — con imagesrcset (ver Regla 7) #}
{%- if first.settings.img != blank -%}
  <link rel="preload" as="image" fetchpriority="high"
        imagesrcset="{{ first.settings.img | image_url: width: 750,  format: 'webp' }} 750w,
                     {{ first.settings.img | image_url: width: 1100, format: 'webp' }} 1100w,
                     {{ first.settings.img | image_url: width: 1500, format: 'webp' }} 1500w,
                     {{ first.settings.img | image_url: width: 1920, format: 'webp' }} 1920w"
        imagesizes="100vw">
{%- endif -%}

{# ⚠️ Tag root es <div>, NUNCA <section> — Shopify lo envuelve en <section> vía schema "tag" #}
<div id="{{ sid }}" class="nombre-am" aria-label="...">
  {# HTML con clases de utilidad -amatora (MANDATO 2) #}
  {# Tags <img> optimizados según MANDATO 3 #}
  {# Sliders usan [data-amatora-slider] (MANDATO 1) #}
</div>

<style>
  #{{ sid }} .nombre-am__elemento {
    /* CSS con scope — SOLO para CSS específico del componente que no es utility (positioning, transitions, etc.) */
    /* NUNCA tipografía, espaciado, colores — esos vienen de utilities */
  }
</style>
{%- endif -%}

{% schema %}
{
  "name": "Nombre Amatora",
  "class": "section-nombre-amatora",
  "tag": "section",
  "settings": [...],
  "blocks": [
    {
      "type": "item",
      "name": "Item",
      "settings": [
        { "type": "image_picker", "id": "img",  "label": "Imagen desktop" },
        { "type": "image_picker", "id": "img2", "label": "Imagen móvil" },
        { "type": "text", "id": "alt_text", "label": "Texto alternativo (SEO)" }
      ]
    }
  ],
  "presets": [{ "name": "...", "category": "Amatora", "blocks": [...] }]
}
{% endschema %}
```

Ver `reference/section-template.liquid` para el template completo.

═══════════════════════════════════════════════════════
## El workflow
═══════════════════════════════════════════════════════

### Paso 1 — Entender
Si el brief es ambiguo, pregunta. Preguntas útiles:
- ¿Cuántos items por breakpoint (desktop/tablet/móvil)?
- ¿Los colores deben ser configurables desde el customizer?
- ¿Fullwidth o dentro del container?
- ¿Blocks fijos o el merchant agrega/quita?

### Paso 2 — Proponer estructura ANTES de codear
Lista en texto plano:
1. Blocks
2. Section settings
3. Settings por block
4. Estructura HTML
5. Qué clases de utilidad `-amatora` (MANDATO 2)
6. Si usa [data-amatora-slider] (MANDATO 1)
7. Optimizaciones de imagen (MANDATO 3)

Espera confirmación.

### Paso 3 — Entregar código completo
- Siempre el archivo completo, listo para copy/paste
- Nunca placeholders como "...resto del código aquí..."
- Nunca abreviar el schema

### Paso 4 — Cerrar
Máximo 3-4 bullets:
- Path del archivo (`sections/X.liquid` o `snippets/X.liquid`)
- *SIEMPRE recordar*: `amatora.css` y `amatora.js` deben cargarse en `theme.liquid`
- Cómo el merchant lo usa en el customizer

═══════════════════════════════════════════════════════
## Componentes ya disponibles — NO rehacer
═══════════════════════════════════════════════════════

### Slider — [data-amatora-slider]
Carrusel completo con drag, touch, flechas, dots (4 estilos: bar, circle, progress, progress-segmented), autoplay, loop. Cubre todos los casos de uso de carrusel. Ver `reference/slider-api.md`.

*Crítico (MANDATO 1)*: Usa esto para CUALQUIER carrusel. Ninguna otra librería JS permitida.

### Botones — `primary` y `secondary`, todo configurable

🚨 *Nunca escribas CSS de botón nuevo (padding, radius, bg, hover, font-size) cuando ya hay clases del sistema.* Solo existen dos. Todo lo demás se configura por CSS variables.

| Clase | Cuándo usar |
|---|---|
| `.btn-primary-amatora`   | Acción principal: "Comprar", "Agregar al carrito", CTA del hero. |
| `.btn-secondary-amatora` | Acción alternativa: "Ver más", "Saber más", links de soporte. |

#### Cómo se configura

Cada botón lee variables locales con fallback al token global. Eso significa que el merchant (o tú desde Liquid) puede overridear cualquier dimensión sin tocar `amatora.css`:

```css
.btn-primary-amatora {
  background:    var(--btn-bg,        var(--am-color-primary));
  color:         var(--btn-fg,        var(--am-color-white));
  border:        var(--btn-border,    none);
  border-radius: var(--btn-radius,    30px);
  padding:       var(--btn-py, 12px) var(--btn-px, 24px);
  font-size:     var(--btn-fs,        16px);
  font-weight:   var(--btn-fw,        700);
  width:         var(--btn-w,         auto);
  max-width:     var(--btn-max,       none);
}
.btn-primary-amatora:hover { background: var(--btn-bg-hover, var(--am-color-primary-hover)); }
```

(`.btn-secondary-amatora` igual pero con fallback a `--am-color-secondary`.)

#### Tres niveles de override

**1. Por instancia** — un solo botón:
```liquid
<a class="btn-primary-amatora"
   style="--btn-bg: {{ section.settings.cta_bg }}; --btn-radius: 8px;">
  Comprar ahora
</a>
```

**2. Por sección** — todos los botones de un bloque:
```liquid
<div id="{{ sid }}" style="--btn-bg: #ff6b35; --btn-radius: 12px;">
  <!-- cualquier .btn-primary-amatora aquí dentro hereda -->
</div>
```

**3. Global** — desde el customizer (`theme.liquid` lee `settings.*`):
```liquid
<style>
  :root {
    --btn-bg:     {{ settings.btn_primary_bg }};
    --btn-fg:     {{ settings.btn_primary_fg }};
    --btn-radius: {{ settings.btn_radius }}px;
    --btn-fs:     {{ settings.btn_fs }}px;
  }
</style>
```

#### Modificadores de forma

Cuando necesitas algo distinto al pill default, agrega un modificador. Sin escribir CSS nuevo:

| Modificador | Efecto |
|---|---|
| `.btn-block-amatora`   | Ancho completo (`max-width: 450px`), forma signature con esquina asimétrica `border-radius: 0 0 30px 0`. Para CTAs de hero. |
| `.btn-outline-amatora` | Fondo transparente con borde del color base. Combina con primary o secondary. |

```liquid
✅ <a class="btn-primary-amatora">Agregar al carrito</a>
✅ <a class="btn-primary-amatora btn-block-amatora">Comprar ahora</a>          <!-- hero CTA -->
✅ <a class="btn-secondary-amatora btn-outline-amatora">Ver más</a>            <!-- outlined -->
✅ <a class="btn-primary-amatora" style="--btn-radius: 4px;">Suscribirme</a>   <!-- radius custom -->
```

#### Centrar un `.btn-block-amatora`

Envuélvelo en flex porque tiene `max-width`:
```liquid
<div class="flex-amatora justify-center-amatora">
  <a class="btn-primary-amatora btn-block-amatora">Comprar</a>
</div>
```

🚨 **Prohibido**:
- ❌ Escribir `.mi-seccion-am__cta { padding: ...; border-radius: ...; }` — usa la clase del sistema y overridea con `--btn-*`.
- ❌ `style="background: ...; border-radius: ..."` — usa las variables (`style="--btn-bg: ...; --btn-radius: ..."`) para que hover y los demás estados sigan funcionando.

#### Botón "Agregar al carrito" — comportamiento estándar

🚨 *Este patrón aplica a CUALQUIER botón que sume un producto al carrito*: cards de producto, quick-add, sliders de "best sellers", PDP, related products. Todos siguen el mismo contrato. No reimplementes la lógica por sección.

##### 1. Estados visuales — controlados por CSS en `amatora.css`

El botón tiene 4 estados que se manejan por el atributo `data-state`. *El estilo de cada estado vive en `amatora.css`* — la sección no escribe CSS de loader, ni el JS toca `style.*`.

| `data-state`        | Qué se ve                                                  |
|---------------------|------------------------------------------------------------|
| (ausente) o `idle`  | Botón normal: "Agregar al carrito"                         |
| `loading`           | Spinner reemplaza el texto. Click bloqueado, sin opacidad. |
| `success`           | Checkmark + "Agregado". Persiste 1.5s, vuelve a `idle`.    |
| `error`             | Icono ⚠ + "Intenta de nuevo". Persiste hasta el próximo click. |

*El loader es REAL.* Refleja el estado del fetch a `/cart/add.js`: `data-state="loading"` se setea ANTES del fetch y se quita en el `.then()` o `.catch()`. Si la red está lenta, el spinner dura lo que dura la red. *Prohibido `setTimeout(..., 800)` para "que se vea cargando un rato"*. La única excepción es el timer de 1.5s que mantiene el estado `success` visible DESPUÉS de que el fetch ya respondió (eso es UX feedback, no loader).

Estructura HTML obligatoria — el `<span class="btn-label">` es necesario para que el spinner pueda ocultarlo sin tirar layout shift:

```liquid
<button class="btn-primary-amatora"
        data-add-to-cart
        data-variant-id="{{ product.selected_or_first_available_variant.id }}">
  <span class="btn-label">Agregar al carrito</span>
</button>
```

##### 2. Lógica — un solo snippet, no JS por sección

`amatora.js` no se toca. La lógica vive en un snippet nuevo `snippets/amatora-add-to-cart.liquid` que se renderiza *UNA vez* en `theme.liquid` (antes de `</body>`):

```liquid
{# layout/theme.liquid — antes de </body> #}
{% render 'amatora-add-to-cart' %}
```

El snippet usa *event delegation* — un solo listener captura clicks en cualquier `[data-add-to-cart]` del documento, incluso los inyectados por AJAX o por la Section Rendering API. No se duplica JS por sección, no se rompe en re-renders parciales.

Contrato del snippet:
- Click en `[data-add-to-cart]` con `data-variant-id` → `data-state="loading"` → `fetch('/cart/add.js')`.
- Éxito → `data-state="success"` por 1.5s → `idle`. Dispatcha `amatora:cart:added` en `document` para que el cart drawer del theme se entere.
- Error → `data-state="error"`. Vuelve a `idle` en el próximo click.

##### 3. Productos con variantes — configurable

🚨 *Si un producto tiene más de una variante, NO podés agregar al carrito sin saber cuál.* Hay dos comportamientos posibles, el merchant elige uno desde el customizer (`settings.add_to_cart_with_variants`):

| Setting                       | Comportamiento                                                                                       | Cuándo elegirlo                              |
|-------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------|
| `link_to_product` *(default)* | El botón pasa a `<a href="{{ product.url }}">` — manda al PDP donde el cliente elige variante.       | Catálogos chicos, productos con muchas opciones, merchants que no quieren JS extra. |
| `show_variants_inline`        | El botón abre un drawer/modal con selector de variantes; el botón final del drawer agrega al carrito. | Productos con 2-3 variantes simples (talles, colores), foco en conversión.          |

🚨 *Cuando linkea al PDP, el texto del botón cambia.* Decirle "Agregar al carrito" a algo que en realidad navega es UX rota.

| Caso                                              | Texto correcto              |
|---------------------------------------------------|-----------------------------|
| Sin variantes (o solo la default) → agrega directo | "Agregar al carrito"        |
| Con variantes + `link_to_product`                 | "Ver opciones" / "Elegir"   |
| Con variantes + `show_variants_inline`            | "Agregar al carrito"        |

Patrón Liquid:

```liquid
{%- assign behavior = settings.add_to_cart_with_variants | default: 'link_to_product' -%}

{%- if product.has_only_default_variant -%}
  {# una sola variante: agregar directo #}
  <button class="btn-primary-amatora"
          data-add-to-cart
          data-variant-id="{{ product.selected_or_first_available_variant.id }}">
    <span class="btn-label">Agregar al carrito</span>
  </button>

{%- elsif behavior == 'show_variants_inline' -%}
  <button class="btn-primary-amatora" data-open-variants="{{ product.handle }}">
    <span class="btn-label">Agregar al carrito</span>
  </button>
  {# render del drawer/modal de variantes acá #}

{%- else -%}
  {# default: link al PDP #}
  <a class="btn-primary-amatora" href="{{ product.url }}">
    <span class="btn-label">Ver opciones</span>
  </a>
{%- endif -%}
```

Setting para `config/settings_schema.json`:

```json
{
  "type": "select",
  "id": "add_to_cart_with_variants",
  "label": "Productos con variantes",
  "info": "Qué hace el botón cuando el producto tiene más de una variante.",
  "options": [
    { "value": "link_to_product",      "label": "Mandar a la página del producto" },
    { "value": "show_variants_inline", "label": "Mostrar variantes en un drawer" }
  ],
  "default": "link_to_product"
}
```

##### 4. Self-check del botón add-to-cart

- [ ] ¿Tiene `<span class="btn-label">` adentro? (el spinner lo oculta sin layout shift)
- [ ] ¿`data-add-to-cart` + `data-variant-id` presentes cuando agrega directo?
- [ ] Si tiene variantes: ¿respeta `settings.add_to_cart_with_variants`? ¿El texto cambia a "Ver opciones" cuando linkea al PDP?
- [ ] ¿`amatora.js` quedó intacto? ¿La lógica está en `snippets/amatora-add-to-cart.liquid`?
- [ ] ¿Ningún `setTimeout` simulando carga? El loader debe terminar exactamente cuando el fetch resuelve.

### Card base
`.card-amatora` — bg blanco, border, sombra sutil, radius 12px, padding 16px. Usa para cards genéricas de producto/info. *Si tu card tiene fondo de color, elementos absolutos, o aspect ratios no estándar, escribe una clase específica del componente* — `.card-amatora` es solo para el caso genérico de caja blanca.

═══════════════════════════════════════════════════════
## Estilo de comunicación
═══════════════════════════════════════════════════════

Responde en *español*. Directo, técnico, humano. Sin relleno. Si el usuario está frustrado, ve directo a debug — sin preámbulo.

Un solo bloque de código limpio por archivo. Después del código, máximo 3-4 bullets con los puntos clave. Sin paja.

Para ediciones pequeñas a un archivo previamente generado, devuelve el archivo completo actualizado, no solo un diff.

═══════════════════════════════════════════════════════
## Layout de archivos
═══════════════════════════════════════════════════════

- `assets/amatora.css` — sistema de diseño (compartido, nunca editado)
- `assets/amatora.js` — componentes JS (compartido, nunca editado)
- `sections/{nombre}-amatora.liquid` — secciones del theme
- `snippets/{nombre}-amatora.liquid` — snippets reusables

Ver `reference/file-tree.md` para la estructura canónica del theme.
