# Performance — LCP / CLS / INP en Shopify

Targets de Core Web Vitals que toda sección Amatora debe cumplir, y qué hace el sistema para lograrlos.

---

## 1. Targets oficiales (Google)

| Métrica | Bueno | Aceptable | Pobre |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | 2.5 – 4 s | > 4 s |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | 200 – 500 ms | > 500 ms |

INP reemplazó a FID en marzo 2024. Mide la latencia de **todas** las interacciones, no solo la primera.

---

## 2. LCP — checklist

El LCP suele ser la **imagen del hero/banner** o el **título grande de la primera fold**.

### Imagen hero

- [ ] Renderizada con `image_url: width: 2040 | image_tag: …, loading: 'eager', fetchpriority: 'high'` (ver `images.md` Regla 4)
- [ ] `preload: true` en el `image_tag` si NO hay imagen móvil aparte
- [ ] Es la ÚNICA imagen de la página con `fetchpriority: 'high'`
- [ ] Todo lo demás `loading: 'lazy'` para que no compita por ancho de banda
- [ ] La sección hero es la primera del template (si va tercera, no es LCP y no lleva `high`)
- [ ] Sin overlays que dependan de JS para mostrarse encima
- [ ] Nada la oculta hasta que corra JS: el slider Amatora ya no usa `visibility: hidden` pre-init (desde v0.8.0). Si escribes CSS propio, NUNCA `opacity: 0` / `visibility: hidden` sobre el contenedor del hero

### Título como LCP

- [ ] La fuente de títulos se carga con `font-display: swap` (lo hace `amatora-tokens.liquid` vía `font_face`)
- [ ] El texto está en el HTML, no lo inyecta JS

### Por qué `image_url` con width

Sin el filtro recibes la imagen original (a veces 4000×3000 PNG = 8MB). Con `image_url: width: N` Shopify sirve el tamaño pedido y el formato óptimo (WebP/AVIF) según el navegador.

```liquid
✅ {{ img | image_url: width: 1200 | image_tag: … }}   → ~80kb WebP + srcset
❌ {{ img.src }}                                        → puede ser 8MB PNG
❌ {{ img | image_url: width: 1200, format: 'webp' }}   → 'webp' no es un valor válido de format
```

---

## 3. CLS — checklist

### Imágenes sin dimensiones

`image_tag` escribe `width` y `height` solo. Si por alguna razón escribes un `<img>` a mano, ponlos:

```liquid
✅ <img src="…" width="{{ img.width }}" height="{{ img.height }}" …>
❌ <img src="…" …>   {# CLS garantizado #}
```

### Fuentes web

- [ ] `font-display: swap` (lo hace el sistema)
- [ ] Considerar `size-adjust` / `ascent-override` si el cambio de fuente causa shift visible

### Embeds (videos, iframes, widgets)

Reserva el espacio:
```css
#{{ sid }} .video-am__embed { aspect-ratio: 16/9; }
```

### Cookie banners, app blocks

Si se inyectan arriba de la página empujan todo. Reservar slot o renderizar `position: fixed`.

### Sliders Amatora

- [ ] Pasa las cantidades visibles como CSS vars inline (`style="--sl-visible-lg: 3; --sl-visible-md: 2; --sl-visible-sm: 1.2;"`). Así el layout pre-init es idéntico al post-init y no hay salto
- [ ] Con `data-arrows-pos="header"` o `data-label`, el JS agrega un header arriba del track (~44px). Si el slider está above-the-fold, prefiere `data-arrows-pos="sides"` para que no haya shift
- [ ] La altura del slide debe ser determinista: `aspect-ratio` en la imagen o `min-height`, nunca depender de contenido async

---

## 4. INP — checklist

### Reglas

- [ ] No bloquear el main thread con loops largos en handlers de click
- [ ] `amatora.js` va con `defer` en `theme.liquid`
- [ ] Apps de terceros (chats, reviews, upsells) cargarlas después de `load`, no en el head
- [ ] El slider Amatora ya usa touch listeners `passive`, cachea las medidas del layout durante el drag y pausa el autoplay fuera de viewport y con la pestaña oculta

### Agregar al carrito

El INP se mide desde el click hasta que el drawer aparece. El snippet `amatora-add-to-cart.liquid` ya:

- Pone `data-state="loading"` ANTES del fetch (feedback inmediato)
- Pide las secciones del carrito en el mismo request (`sections`), así el drawer se pinta con una sola vuelta al servidor
- Usa un solo listener delegado en `document` (nada por sección)

---

## 5. Tabla de tamaños y loading (resumen)

| Contexto | `width` | `loading` | Extra |
|---|---|---|---|
| Hero / banner principal (1er slide) | 2040 | eager | `fetchpriority: 'high'` (+ `preload: true` sin móvil aparte) |
| Hero / banner (slides 2-3) | 2040 | eager | |
| Hero / banner (slides 4+) | 2040 | lazy | |
| Sección full-width secundaria | 1500 | lazy | |
| Card de producto en grid | 800 | lazy | |
| Card de producto en slider (primeras 3) | 800 | eager | |
| Card de producto en slider (4+) | 800 | lazy | |
| Thumbnail / mini | 300 | lazy | |
| Avatar | 300 | lazy | |
| Logo header | 400 | eager | |
| Icono / badge | 200 | lazy (eager si above-the-fold) | `width: 48, height: 48` en `image_tag` |
| Imagen en blog post | 1200 | lazy | |

### Dos image pickers (móvil + desktop)

Las proporciones óptimas difieren: hero móvil 1080×1400 (vertical), hero desktop 2040×850 (horizontal). Da al merchant 2 pickers (`img` e `img2`) y renderízalos con UN `<picture>` + `<source media>`. Ver `images.md` Regla 5.

---

## 6. Videos

- [ ] `autoplay muted loop playsinline`: obligatorios para autoplay en iOS
- [ ] `poster="{{ poster | image_url: width: 1600 }}"` siempre
- [ ] `preload="metadata"` solo en el primer video visible; el resto `preload="none"`

---

## 7. Scripts inline

- ✅ Permitido: `<script>` mínimo para init custom de un slider concreto
- ❌ Evitar: lógica de negocio, fetch a APIs, loops costosos
- ❌ Nunca: jQuery

Init custom del slider (raro; los `data-*` cubren casi todo):

```liquid
<script>
  document.addEventListener('DOMContentLoaded', function () {
    new SliderAmatora('#{{ sid }}-slider', { autoplay: 4000, loop: true });
  });
</script>
```

---

## 8. Cómo medir

- **Lighthouse** (DevTools → Lighthouse → Mobile + Performance): score local
- **PageSpeed Insights**: datos reales (CrUX) + lab data
- **WebPageTest**: runs detallados, comparación de variantes
- **Search Console → Core Web Vitals**: datos reales agregados

Mide **siempre** en móvil (mid-tier 4G). Google indexa mobile-first y la mayoría del tráfico de Shopify es móvil.
