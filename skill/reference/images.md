# Imágenes en Shopify — Referencia completa

Las 5 reglas core están en `SKILL.md` (Mandato 3). Acá vive el detalle: 11 reglas específicas, tablas de anchos por contexto, patterns de loading completos, casos edge.

## Regla 1 — `<picture>` para arte responsive (NO dos `<img>` con CSS toggle)

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

## Regla 2 — `srcset` + `sizes` SIEMPRE (no width fijo)

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

## Regla 3 — `width` y `height` SIEMPRE presentes (CLS = 0)

```liquid
✅ width="{{ img.width }}" height="{{ img.height }}"
❌ (faltante → cumulative layout shift al cargar)
```

Si la imagen es decorativa (background CSS), úsala como `background-image` con `aspect-ratio` en CSS, **no** como `<img>` sin width/height.

## Regla 4 — Tamaño correcto por contexto (NO sobre-pedir)

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

## Regla 5 — `format: 'webp'` explícito

Aunque `image_url` por default sirve webp en navegadores compatibles, **siempre** declara `format: 'webp'` explícito. Es defensa en profundidad y deja la intención clara en el código:

```liquid
✅ {{ img | image_url: width: 1100, format: 'webp' }}
❌ {{ img | image_url: width: 1100 }}   {# depende de heurística del navegador #}
```

## Regla 6 — Estrategia de loading: `eager` por default, `lazy` solo en zonas seguras

🚨 **En Shopify, `loading="lazy"` falla seguido y causa pop-in / imágenes que no cargan.** Las causas conocidas:

1. **Carruseles con `transform: translateX`**: los slides off-screen están técnicamente "in viewport" para el IntersectionObserver pero visualmente ocultos por `overflow:hidden`. Lazy no se comporta confiable — o carga todo de golpe (rompe el propósito) o no carga nunca hasta que dragueas (flash al paginar).
2. **Preview del customizer**: el iframe no siempre dispara los eventos de intersección. Las imágenes lazy aparecen en blanco mientras el merchant edita.
3. **Sections AJAX-recargadas** (Section Rendering API): lazy puede no disparar tras un reload parcial.
4. **Iconos pequeños**: pop-in visible al hacer scroll porque el observer dispara tarde.

**Política — DEFAULT a `eager`:**

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

**Si dudas → `eager`.** Cuesta unos bytes extra de ancho de banda, pero evita 100% el pop-in, los slides en blanco y los bugs del customizer.

**Alternativa moderna a `lazy` que NO falla**: si querés deprioritizar una imagen sin riesgo de que no cargue, usa `fetchpriority="low"` en lugar de `loading="lazy"`. El navegador la baja al final de la cola pero la pide igual junto con el resto del HTML — sin IntersectionObserver, sin riesgo de no disparar.

```liquid
{# Imagen below-the-fold cuando lazy falló: #}
loading="eager" fetchpriority="low" decoding="async"
```

🚨 **NUNCA pongas `eager` con `fetchpriority="high"` en más de UNA imagen por página.** Eso es solo para el LCP. Si pones high en 5 imágenes, el navegador no sabe cuál es la real LCP y todas pierden prioridad.

**Resumen rápido:**
- **LCP** (UNA imagen, primer banner/hero): `eager` + `fetchpriority="high"` + preload.
- **Todo lo demás above-fold + carruseles + iconos + drawers**: `eager` (sin fetchpriority).
- **Solo footer y zonas profundas sin carrusel**: `lazy` (con cuidado) o `fetchpriority="low"` (más seguro).
- **TODO lleva `decoding="async"`.**

## Regla 7 — `<link rel="preload">` con `imagesrcset` (no URL fija)

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

## Regla 8 — Alt text configurable y semántico

```liquid
✅ alt="{{ block.settings.alt_text | default: block.settings.heading | default: 'Producto' | escape }}"
❌ alt=""              {# salvo decorativa pura — y entonces es pintura, no <img> #}
❌ alt="image"
❌ alt="Banner"        {# mismo para todos = no informa #}
```

Siempre expón un setting `alt_text` por bloque en el schema.

## Regla 9 — Productos en grid: 400–600, NUNCA 800+

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

(Si el grid de productos está dentro de un slider — caso típico de "best sellers" — `eager`. Si está en una sección plana below-the-fold sin carrusel, podés intentar `lazy` con cuidado. Ver Regla 6.)

## Regla 10 — Iconos (icon-bar, shipping, badges, value-props)

Dos cosas distintas que mucha gente olvida:

1. **NO `srcset`**: los iconos pequeños cargan UN solo tamaño (cercano al render real × 2 para retina, tope ~200w).
2. **`loading="eager"`, no `lazy`**: lazy en iconos crea efecto pop-in (el icono aparece "de la nada" al hacer scroll). Como cada icono pesa ~5–20kb, el byte ahorrado por lazy no compensa la mala UX. Eager los carga junto con el HTML y nunca se ve el flash.

```liquid
{# Render real: 48px → pide 96 (2x) o 200 si querés holgura #}
<img src="{{ icon | image_url: width: 200, format: 'webp' }}"
     width="48" height="48"
     loading="eager" decoding="async"
     alt="{{ alt | default: 'Icono' | escape }}">
```

**Aplica a**: icon-bar, shipping icons, badges, iconos de value-props, iconos de "cómo funciona", logos pequeños del footer. **NO aplica a**: imágenes de producto, fotos de testimoniales, banners — esas siguen las reglas generales de la Regla 6.

## Regla 11 — Videos

- `autoplay muted loop playsinline` — los 4 obligatorios para autoplay en iOS
- `poster="{{ poster | image_url: width: 1600, format: 'webp' }}"` siempre
- `preload="metadata"` solo en el primer video; resto `preload="none"`

## Auto-checklist por cada `<img>` que escribas

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
