# Imágenes en Shopify — Referencia completa

Las 5 reglas core están en `SKILL.md` (Mandato 3). Aquí va el detalle: por qué `image_tag`, tablas por contexto, patrones completos y la política de loading.

## Por qué `image_url` + `image_tag`

`image_tag` es el filtro oficial de Shopify para renderizar `<img>`. A partir de la URL que le pasas genera solo:

- `srcset` con un set inteligente de anchos hasta el `width` máximo que pediste
- `width` y `height` reales de la imagen (CLS = 0)
- `alt` desde el media si no pasas uno
- `<link rel="preload">` correcto (con `imagesrcset` + `imagesizes` idénticos al `<img>`) si pasas `preload: true`

Y Shopify elige el formato (WebP / AVIF / JPEG) según lo que soporte el navegador. Por eso:

- ❌ `format: 'webp'` NO existe. `image_url` solo acepta `format: 'jpg'` y `'pjpg'`. Quítalo de todos lados.
- ❌ `srcset` escrito a mano con cinco `image_url` distintos: más Liquid, mismo resultado, más fácil equivocarse.
- ❌ `<link rel="preload">` escrito a mano: si no coincide exactamente con el `srcset`/`sizes` del `<img>`, el navegador descarga la imagen dos veces.
- ❌ `{{ img }}` o `{{ img.src }}` a secas: entrega la imagen original (puede ser un PNG de 8MB).

## Regla 1 — La línea base

```liquid
{{ img | image_url: width: 2040 | image_tag: class: 'hero-am__media', sizes: '100vw', alt: alt, loading: 'lazy' }}
```

Parámetros de `image_tag` que usamos:

| Parámetro | Qué hace |
|---|---|
| `class` | Clases del `<img>` (utilities `-amatora` y/o tu clase `-am`) |
| `sizes` | Ancho real que ocupa la imagen, para que el navegador elija del srcset |
| `alt` | Texto alternativo. Si lo omites, usa el alt del media en Shopify |
| `loading` | `'lazy'` (default nuestro) o `'eager'` (solo LCP y primeras slides) |
| `fetchpriority` | `'high'` SOLO en la imagen LCP |
| `preload` | `true` SOLO en la imagen LCP sin versión móvil aparte |
| `widths` | Opcional. Lista custom de anchos (`'400, 800, 1200'`) si el set automático no te sirve |

## Regla 2 — `width` máximo por contexto

`width` en `image_url` es el tope del srcset. Pedir más de lo que el contenedor puede mostrar es desperdicio puro.

| Contexto | `width` | Por qué |
|---|---|---|
| Banner / hero full-width | `2040` | Cubre pantallas 2x hasta ~1020px CSS y desktop 1x hasta 2040 |
| Sección full-width secundaria | `1500` | |
| Imagen a media pantalla (split, about) | `1100` | |
| Card de producto / colección (grid o slider) | `800` | El contenedor real mide 280-500px; 800 cubre retina |
| Imagen dentro de un post / texto | `1200` | |
| Poster de video | `1600` | |
| Thumbnail / avatar | `300` | |
| Icono / badge / logo chico | `200` | Sin `sizes`, sin srcset (ver Regla 7) |
| Logo header | `400` | |

Prohibido: `width: 3840`, `width: 5760`, o `image_url` sin `width` (error de Liquid).

## Regla 3 — `sizes` correcto

`sizes` le dice al navegador cuánto ancho CSS ocupa la imagen en cada breakpoint. Si mientes, elige mal.

| Layout | `sizes` |
|---|---|
| Full-width | `'100vw'` |
| Container (max 1500px) | `'(min-width: 1500px) 1500px, 100vw'` |
| Grid de 2 columnas | `'(min-width: 768px) 50vw, 100vw'` |
| Grid de 3 columnas | `'(min-width: 768px) 33vw, 100vw'` |
| Grid de 4 columnas | `'(min-width: 768px) 25vw, 50vw'` |
| Card en slider (3 desktop / 1.2 móvil) | `'(min-width: 768px) 33vw, 85vw'` |
| Card en slider (4 desktop / 2 móvil) | `'(min-width: 768px) 25vw, 50vw'` |
| Imagen a media pantalla | `'(min-width: 768px) 50vw, 100vw'` |

## Regla 4 — `loading` y `fetchpriority`

**Política: `lazy` por default. `eager` solo donde el usuario lo ve al llegar.**

| Caso | `loading` | `fetchpriority` | `preload` |
|---|---|---|---|
| Imagen LCP (primera del primer hero/banner) | `'eager'` | `'high'` | `true` si no hay imagen móvil aparte |
| Primeras 3 slides de cualquier slider | `'eager'` | omitir | no |
| Slides 4+ de un slider | `'lazy'` | omitir | no |
| Logo del header | `'eager'` | omitir | no |
| Todo lo demás (grids, secciones, footer, drawers, popups) | `'lazy'` | omitir | no |

Por qué NO `eager` en todo: cada imagen `eager` compite por ancho de banda con la imagen LCP. Un home con 40 imágenes eager tarda más en pintar el hero que uno con 3 eager y 37 lazy. El navegador pide las lazy solas cuando se acercan al viewport (con 1-2 pantallas de margen), incluso dentro de un slider con `overflow: hidden`.

Si alguna vez viste slides "en blanco" o imágenes que no aparecían hasta arrastrar, la causa no era `lazy`: hasta v0.7.x `amatora.css` ocultaba todo slider con `visibility: hidden` hasta que corría el JS. Desde v0.8.0 no se oculta nada.

🚨 `fetchpriority: 'high'` en más de una imagen anula el efecto: el navegador ya no sabe cuál es la importante.

Patrón en un slider:

```liquid
{%- for block in section.blocks -%}
  {%- liquid
    assign img_loading = 'lazy'
    if forloop.index <= 3
      assign img_loading = 'eager'
    endif
  -%}
  <div {{ block.shopify_attributes }}>
    {{ block.settings.img | image_url: width: 800 | image_tag: class: 'cards-am__media', sizes: '(min-width: 768px) 33vw, 85vw', alt: block.settings.alt_text, loading: img_loading }}
  </div>
{%- endfor -%}
```

## Regla 5 — Imagen móvil distinta: `<picture>`

Cuando el merchant sube una imagen vertical para móvil y una horizontal para desktop, va UN `<picture>` con un `<source>` para móvil. El `<img>` de desktop es el `image_tag`.

```liquid
{%- liquid
  assign img   = block.settings.img
  assign img_m = block.settings.img2
  assign alt   = block.settings.alt_text | default: shop.name
-%}
<picture>
  {%- if img_m != blank -%}
    <source media="(max-width: 767px)"
            srcset="{{ img_m | image_url: width: 750 }} 750w,
                    {{ img_m | image_url: width: 1080 }} 1080w"
            sizes="100vw"
            width="{{ img_m.width }}" height="{{ img_m.height }}">
  {%- endif -%}
  {%- if forloop.first and img_m == blank -%}
    {{ img | image_url: width: 2040 | image_tag: class: 'hero-am__media', sizes: '100vw', alt: alt, loading: 'eager', fetchpriority: 'high', preload: true }}
  {%- elsif forloop.first -%}
    {{ img | image_url: width: 2040 | image_tag: class: 'hero-am__media', sizes: '100vw', alt: alt, loading: 'eager', fetchpriority: 'high' }}
  {%- else -%}
    {{ img | image_url: width: 2040 | image_tag: class: 'hero-am__media', sizes: '100vw', alt: alt, loading: 'lazy' }}
  {%- endif -%}
</picture>
```

Por qué `preload: true` solo cuando NO hay imagen móvil: el preload apunta al srcset del `<img>` (desktop). En móvil el `<picture>` elige el `<source>` (otra imagen), así que el preload bajaría la de desktop de gusto. Con `eager` + `fetchpriority: 'high'` alcanza: el hero es de lo primero en el HTML.

🚨 PROHIBIDO: dos `<img>` (móvil y desktop) con `display: none` por breakpoint. El navegador descarga ambos antes de evaluar el CSS.

## Regla 6 — Cards de producto

```liquid
{%- assign p_img = product.featured_image -%}
{%- if p_img != blank -%}
  {{ p_img | image_url: width: 800 | image_tag: class: 'card-am__media w-full-amatora h-auto-amatora', sizes: '(min-width: 768px) 25vw, 50vw', alt: p_img.alt, loading: 'lazy' }}
{%- endif -%}
```

`product.featured_image.alt` ya trae el alt que el merchant cargó en Shopify; si está vacío, `image_tag` cae al título del producto.

Hover con segunda imagen: renderiza `product.images[1]` con `loading: 'lazy'` y muéstrala por CSS en `:hover`. No la hagas eager.

## Regla 7 — Iconos, badges, logos chicos

Un solo tamaño, sin `sizes`, `eager` si está above-the-fold:

```liquid
{{ icon | image_url: width: 200 | image_tag: class: 'icons-am__icon', width: 48, height: 48, alt: block.settings.alt_text, loading: 'lazy' }}
```

`width: 48, height: 48` en `image_tag` fija los atributos HTML al tamaño de render (el srcset sigue teniendo hasta 200 para retina).

## Regla 8 — `alt`

- Siempre un setting `alt_text` por bloque en el schema, `"type": "text"`.
- Fallback razonable: `block.settings.alt_text | default: block.settings.heading | default: shop.name`.
- NO pases el alt ya escapado a `image_tag`: el filtro escapa solo. Escapa únicamente cuando lo imprimes tú en un atributo (`aria-label="{{ alt | escape }}"`).
- `alt=""` solo para imágenes puramente decorativas, y entonces suele ser mejor un `background-image`.

## Regla 9 — Videos

- `autoplay muted loop playsinline`: los 4 son obligatorios para autoplay en iOS.
- `poster="{{ poster | image_url: width: 1600 }}"` siempre, para no ver pantalla negra.
- `preload="metadata"` solo en el primer video visible; el resto `preload="none"`.
- Shopify `video` setting: itera `block.settings.video.sources` para los `<source>`.

```liquid
<video class="hero-am__media" autoplay muted loop playsinline
       poster="{{ block.settings.poster | image_url: width: 1600 }}"
       {% if forloop.first %}preload="metadata"{% else %}preload="none"{% endif %}>
  {%- for src in block.settings.video.sources -%}
    <source src="{{ src.url }}" type="{{ src.mime_type }}">
  {%- endfor -%}
</video>
```

## Checklist por cada imagen

- [ ] ¿`image_url: width: N | image_tag`?
- [ ] ¿Sin `format:`, sin srcset a mano, sin preload a mano?
- [ ] ¿`width` razonable para el contexto (tabla Regla 2)?
- [ ] ¿`sizes` refleja el layout real (tabla Regla 3)?
- [ ] ¿`loading: 'lazy'` salvo LCP y primeras slides?
- [ ] ¿`fetchpriority: 'high'` en UNA sola imagen de la página?
- [ ] Si hay imagen móvil: ¿`<picture>` con `<source media>` y sin `preload`?
- [ ] ¿`alt` configurable con fallback?
