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

Las imágenes mal manejadas son la causa #1 de LCP lento en Shopify. Cada `<img>` que escribas DEBE cumplir 5 reglas core:

1. **`image_url` con `width:` y `format: 'webp'` explícitos** — ej. `{{ img | image_url: width: 1100, format: 'webp' }}`
2. **`width` y `height` HTML attrs SIEMPRE** — evita CLS al cargar
3. **`srcset` + `sizes` si la imagen ocupa ancho variable** — sin ellos, móvil baja desktop
4. **`loading="eager"` por default + `decoding="async"`** — lazy falla en Shopify (carruseles, customizer preview, iconos pop-in)
5. **LCP única**: `fetchpriority="high"` + `<link rel="preload">` con `imagesrcset` — solo en UNA imagen por página

#### Patrones críticos

**Desktop / móvil con art-direction**: usar UN `<picture>` con `<source media>`, NUNCA dos `<img>` ocultos con CSS (el navegador baja ambas).

**Iconos chicos**: width fijo (~200w para 2x retina), sin `srcset`, `loading="eager"` (lazy en iconos crea pop-in al scrollear).

**Productos en grid**: `srcset` 200/400/600, NUNCA pedir 800+. El contenedor real de una product card es ~280-360px.

**Videos**: `autoplay muted loop playsinline` + `poster` con `image_url` + `preload="metadata"` solo en el primero.

#### Quick checklist por cada `<img>`

- [ ] `image_url` con `width:` y `format: 'webp'`?
- [ ] `width` y `height` HTML attrs?
- [ ] Si ancho variable: `srcset` + `sizes`?
- [ ] `loading="eager"` + `decoding="async"`?
- [ ] `fetchpriority="high"` SOLO en LCP (uno por página)?
- [ ] LCP tiene `<link rel="preload">` con `imagesrcset`?
- [ ] `alt` configurable y descriptivo?
- [ ] Width pedido razonable (no 3840 para card de 300px)?

Ver `reference/images.md` para las 11 reglas detalladas con tablas de anchos por contexto, política completa de `loading="lazy"` (cuándo falla en Shopify y qué hacer), patterns de preload, y casos edge (productos en slider, banner hero con `<picture>`, iconos vs imágenes, alternativas a lazy con `fetchpriority="low"`).

Ver `reference/performance.md` para targets de LCP/CLS/INP.

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

### Botones — `primary` y `secondary`

Solo 2 clases base + 2 modificadores. Todo lo demás se configura por CSS variables — nunca escribas CSS de botón nuevo (padding, radius, bg, hover).

| Clase | Cuándo usar |
|---|---|
| `.btn-primary-amatora`   | Acción principal: "Comprar", CTA del hero. |
| `.btn-secondary-amatora` | Acción alternativa: "Ver más", links de soporte. |

| Modificador | Efecto |
|---|---|
| `.btn-block-amatora`   | Ancho completo (max 450px) con esquina signature. Para CTAs de hero. |
| `.btn-outline-amatora` | Fondo transparente con borde. Combina con primary o secondary. |

#### Override por instancia / sección / global

Los botones leen variables `--btn-*` con fallback al token global. 3 niveles:

```liquid
<!-- 1. Por instancia -->
<a class="btn-primary-amatora" style="--btn-bg: #ff6b35; --btn-radius: 8px;">CTA</a>

<!-- 2. Por sección -->
<div id="{{ sid }}" style="--btn-bg: #ff6b35;">
  <!-- todos los btn-primary-amatora aquí dentro heredan -->
</div>

<!-- 3. Global (en theme.liquid desde panel Amatora) -->
<style>:root { --btn-bg: {{ settings.btn_primary_bg }}; }</style>
```

Variables disponibles: `--btn-bg`, `--btn-fg`, `--btn-border`, `--btn-radius`, `--btn-py`, `--btn-px`, `--btn-fs`, `--btn-fw`, `--btn-w`, `--btn-max`, `--btn-bg-hover`.

🚨 **Prohibido**:
- ❌ Escribir `.mi-seccion-am__cta { padding: ...; }` — overridea con `--btn-*` en su lugar.
- ❌ `style="background: ...;"` — usa `style="--btn-bg: ...;"` para que el hover siga funcionando.

#### Centrar un `.btn-block-amatora`

Envuélvelo en flex (tiene max-width):
```liquid
<div class="flex-amatora justify-center-amatora">
  <a class="btn-primary-amatora btn-block-amatora">Comprar</a>
</div>
```

#### Add-to-cart con feedback visual — OPCIONAL

Si querés botones de "Agregar al carrito" con estados visuales reales (spinner durante el fetch, "Agregado" en éxito, error al fallar), Amatora trae el snippet `amatora-add-to-cart.liquid`. **Es opcional, no obligatorio** — el theme puede seguir usando su propio add-to-cart sin tocar nada de esto.

Si lo activás (`{% render 'amatora-add-to-cart' %}` antes de `</body>`), basta agregar `data-add-to-cart` + `data-variant-id` al botón:

```liquid
<button class="btn-primary-amatora"
        data-add-to-cart
        data-variant-id="{{ product.selected_or_first_available_variant.id }}">
  <span class="btn-label">Agregar al carrito</span>
</button>
```

Ver `reference/buttons.md` para el contrato completo (4 estados, productos con variantes, eventos `amatora:cart:added` / `amatora:cart:error` para integrar con el cart drawer del theme).

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
