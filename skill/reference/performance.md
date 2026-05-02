# Performance — LCP / CLS / INP en Shopify

Targets de Core Web Vitals que toda sección Amatora debe cumplir.

---

## 1. Targets oficiales (Google, 2026)

| Métrica | Bueno | Aceptable | Pobre |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | 2.5 – 4 s | > 4 s |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | 200 – 500 ms | > 500 ms |

INP reemplazó a FID en marzo 2024. Mide la latencia de **todas** las interacciones, no solo la primera.

---

## 2. LCP — checklist obligatorio

El LCP suele ser el **hero/banner principal** o el **título grande de la primera fold**.

### Image hero (caso más común)

- [ ] **Preload** en `<head>` (antes de la sección):
  ```liquid
  {%- if first.settings.img != blank -%}
    <link rel="preload" as="image" fetchpriority="high"
          href="{{ first.settings.img | image_url: width: 1920 }}">
  {%- endif -%}
  ```
- [ ] `loading="eager"` (no lazy) en el `<img>`
- [ ] `fetchpriority="high"` en el `<img>`
- [ ] `decoding="async"`
- [ ] Sirviendo el `width` correcto (no 4000px en hero, basta 1920)
- [ ] **Sin overlays JS-rendered encima** (un overlay con contenido cargado por JS rompe el LCP)

### Reglas para imágenes que NO son LCP

- [ ] `loading="lazy"`
- [ ] **NO** `fetchpriority="high"`
- [ ] `decoding="async"`

### Por qué importa el `image_url` con width

Shopify sirve WebP/AVIF automáticamente cuando usas el filtro. Sin el filtro recibes la imagen original (a veces 4000×3000 PNG = 8MB), que mata el LCP.

```liquid
✅ {{ img | image_url: width: 1200 }}     → ~80kb WebP
❌ {{ img.src }}                           → puede ser 8MB PNG
❌ {{ img }}                               → entrega protocol-relative URL sin transformar
```

---

## 3. CLS — checklist obligatorio

El CLS se dispara cuando elementos cambian de posición tras renderizar. Causas en Shopify:

### Imágenes sin dimensiones

- [ ] **Todo `<img>` debe tener `width` y `height`** explícitos:
  ```liquid
  ✅ <img src="…" width="{{ img.width }}" height="{{ img.height }}" …>
  ❌ <img src="…" …>   {# CLS garantizado #}
  ```

### Fuentes web

- [ ] Usar `font-display: swap` en `@font-face` (Shopify lo hace por default si subes la fuente al theme)
- [ ] Considerar `size-adjust`/`ascent-override` si el cambio de fuente causa shift visible

### Embeds (videos, iframes, widgets)

- [ ] Reservar el espacio con `aspect-ratio` o `min-height`:
  ```css
  .video-am__embed { aspect-ratio: 16/9; }
  ```

### Cookie banners, app blocks

- [ ] Si se inyectan dinámicamente en la parte alta de la página → empujan todo. Reservar slot, o renderizar `position: fixed`.

### Sliders Amatora

- [ ] El JS añade el header (label/arrows) **después** del primer paint → reservar margen vertical o aceptar que ese shift es mínimo.
- [ ] La altura del slide debe ser determinista (`aspect-ratio`, `height` fijo o `min-height`) — no dejar que dependa del contenido cargado async.

---

## 4. INP — checklist obligatorio

El INP castiga JS bloqueante en cualquier interacción (click, tap, keypress).

### Reglas

- [ ] **No bloquear el main thread** con loops largos en handlers de click
- [ ] **Defer scripts no críticos** con `defer` o `async`
- [ ] **Cargar amatora.js con `defer`** en `theme.liquid`:
  ```html
  <script src="{{ 'amatora.js' | asset_url }}" defer></script>
  ```
- [ ] Apps de terceros (chats, reviews, upsells) cargarlas **después** de `load`, no en el head
- [ ] Evitar `setInterval` cortos sin pausa (el slider Amatora pausa el autoplay en `mouseenter` y durante drag — correcto)

### Caso típico: añadir al carrito

Si el botón "Agregar al carrito" tiene un fetch + actualización del carrito + render del drawer, el INP se mide desde el click hasta que el drawer aparece. Optimizaciones:

- Mostrar feedback visual inmediato (botón en estado loading) **antes** del fetch
- Renderizar el drawer con CSS ya cargado (no bajarlo on-demand)
- Evitar reflows masivos al actualizar el contador del carrito

---

## 5. Tabla de tamaños de imagen recomendados

| Contexto | Width desktop | Width móvil | Loading |
|---|---|---|---|
| Hero / banner principal | 1920 | 1080 | eager + fetchpriority high + preload |
| Sección full-width secundaria | 1200 | 800 | lazy |
| Card de producto en grid | 600 | 400 | lazy |
| Card de producto en slider | 800 | 500 | lazy (el primero puede ser eager si es above-the-fold) |
| Thumbnail / mini | 200 | 200 | lazy |
| Avatar | 80 | 80 | lazy |
| Logo header | 240 (2x del display size) | — | eager (es above-the-fold) |
| Imagen dentro de blog post | 1200 | 800 | lazy |

### Por qué dos image_pickers (mobile + desktop)

Las aspect ratios óptimas difieren:
- **Hero móvil:** 1080×1400 (vertical, para llenar pantalla)
- **Hero desktop:** 1920×800 (horizontal, formato widescreen)

Servir la misma imagen en ambos = o sale recortada en móvil, o pesa de más. Da al merchant 2 image pickers (`img` y `img2`) y muéstralas con `display:none/block` por breakpoint, no con `srcset` (más control sobre crop).

---

## 6. Videos

- [ ] `autoplay muted loop playsinline` — los 4 atributos son obligatorios para autoplay en iOS
- [ ] `poster="{{ poster | image_url: width: 1600 }}"` — siempre, para evitar pantalla negra antes de cargar
- [ ] `preload="metadata"` solo en el primer video visible; el resto `preload="none"`
- [ ] Servir MP4 H.264 (compatibilidad universal); si quieres optimizar peso, ofrecer WebM como `<source>` adicional antes del MP4

```html
<video autoplay muted loop playsinline
       poster="{{ block.settings.poster | image_url: width: 1600 }}"
       preload="metadata">
  <source src="{{ block.settings.video | file_url }}" type="video/mp4">
</video>
```

---

## 7. Scripts inline

- ✅ Permitido: `<script>` con configuración mínima de un componente (init de un slider concreto con opts custom)
- ❌ Evitar: lógica de negocio, fetch a APIs, loops costosos
- ❌ Nunca: jQuery (no está en el theme, no la añadas)

Si necesitas init custom del slider:
```liquid
<script>
  document.addEventListener('DOMContentLoaded', function () {
    new SliderAmatora('#{{ sid }}-slider', { autoplay: 4000, loop: true });
  });
</script>
```

---

## 8. Cómo medir

- **Lighthouse** (DevTools → Lighthouse → Mobile + Performance) — score local
- **PageSpeed Insights** — datos reales (CrUX) + lab data
- **WebPageTest** — runs detallados, comparación de variantes
- **Search Console → Core Web Vitals** — datos reales agregados de tus usuarios

Test **always** en móvil (mid-tier 4G) — Google indexa mobile-first y la mayoría del tráfico de Shopify es móvil.
