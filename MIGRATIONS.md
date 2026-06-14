# MIGRATIONS

Lista de cambios breaking entre versiones. El **prompt de actualización** (ver `README.md`) lee este archivo para saber qué reemplazar en `sections/*.liquid` y `snippets/*.liquid` de un proyecto que ya tenía Amatora instalado.

Formato por release:
- **Renames de clase** — busca/reemplaza directo.
- **Renames de estructura** — el HTML cambió (ej. agregar `<span class="btn-label">`). Requiere lógica.
- **Settings nuevos** — agregar a `config/settings_schema.json`.
- **Snippets nuevos** — copiar a `snippets/` y registrar en `theme.liquid`.

---

## v0.5.0 → desde v0.4.x

Foco del release: **simplificación**. `amatora.css` baja de 1684 → 1474 líneas quitando utilities redundantes / nicho que casi nadie usa.

### Removido del CSS (BREAKING para quien las haya usado)

**Section 30 — `lg:` breakpoint entero** (~138 líneas)
- Se removieron TODAS las clases con prefijo `lg:` (md: ahora cubre tablet + desktop).
- Si una sección vieja usaba `lg:flex-amatora`, `lg:grid-cols-3-amatora`, `lg:text-xl-amatora`, etc. → reemplazar por la `md:` equivalente.

**Utilities raramente usadas removidas:**

| Categoría | Removido | Reemplazo |
|---|---|---|
| Grid columns | `grid-cols-7/8/9/10/11`, `col-span-7/8/9/10/11` (y `md:` equivalentes) | Usar `grid-cols-6` o `grid-cols-12` |
| Grid niche | `col-start-1..7`, `row-span-1..3`, `justify-items-center`, `justify-self-*` | Inline style si hace falta |
| Gap separado | `gap-x-1..8`, `gap-y-1..8` | Usar `gap-*` simétrico (95% de los casos) |
| Widths px raros | `w-10/20/30/40/60/70/80` (y `md:` equiv.) | Mantener `w-50/100/300`. Para otros, `style="width:NNpx"` |
| Heights px raros | `h-40/50/70`, `md:h-200/400/600/700/800` | Mantener `h-100/300/400/500/600/700/800` (base); en `md:`, solo `h-300/500` |
| Gap-14 | `gap-14-amatora` (y `md:`) | Usar `gap-12-amatora` |
| `md:w-img-amatora` | `width: 60%` random | `md:w-2/3-amatora` o inline |

### Migración

1. Reemplazar `assets/amatora.css` y `assets/AMATORA_VERSION` por la versión nueva.
2. Buscar y reemplazar en `sections/*.liquid` + `snippets/*.liquid`:
   - `lg\:([a-z-]+)-amatora` → revisar caso por caso si usar `md:` o quitar
   - `gap-x-N-amatora` y `gap-y-N-amatora` → `gap-N-amatora` (si la asimetría era importante, usar inline)
   - `grid-cols-(7|8|9|10|11)-amatora` → revisar diseño (probablemente debía ser 6 o 12)
   - `w-(10|20|30|40|60|70|80)-amatora` → inline `style="width:NNpx"` o repensar
3. Si nada de eso aparece en tus archivos → no hay migración necesaria, solo aprovechás el archivo más liviano.

> **Nota honesta sobre el recorte:** el plan original prometía bajar a ~700 líneas (cut "Medio"). El cut real es de 1684 → 1474 porque las utilities clave del sistema (componentes de slider, botones, escala de typography) son las que pesan y no se pueden tocar sin romper el comportamiento. El resto del sistema se trabaja en passes futuros.

---

## v0.4.0 → desde v0.3.x

Foco del release: **Amatora ya no rompe themes avanzados.** Pasa de "framework que impone un diseño" a "caja de herramientas opt-in". Instalar Amatora en cualquier theme (nuevo o en producción) ya no cambia nada visualmente hasta que uses una clase `-amatora`.

### Reset global y tipografía base removidos (BREAKING — visual)

Se quitaron de `system/amatora.css` todas las reglas que pisaban elementos del theme sin opt-in:

| Removido | Por qué rompía |
|----------|----------------|
| `* , *::before, *::after { box-sizing; margin:0; padding:0 }` | Un reset global sobre un theme establecido **colapsa todo el spacing**. Era la causa principal de "instalo y rompe todo". |
| `html { line-height; -webkit-text-size-adjust }` | Cambiaba el line-height base del theme. |
| `body { margin:0; overflow-x:hidden }` | Podía ocultar scroll horizontal intencional. |
| `img, video { max-width:100%; height:auto }` | Pisaba el sizing de imágenes del theme. |
| `h6 {}`, `h2,h3 {}`, `h4,p,a,button { font-style }` | Reset de font-style global. |
| `h1-h6 { font-family }`, `p,a,button… { font-family }`, `p { color }` | **Pisaban la tipografía y el color de texto** de todo el theme. |

### Clases nuevas — reemplazo opt-in de la tipografía

Como ya no hay `h1,h2 { font-family: var(--am-font-heading) }` global, la fuente del panel Amatora se aplica con 2 clases nuevas:

```css
.font-heading-amatora { font-family: var(--am-font-heading); }
.font-body-amatora    { font-family: var(--am-font-body); }
```

Uso en secciones nuevas:

```liquid
<h2 class="font-heading-amatora text-3xl-amatora">Título</h2>
<p class="font-body-amatora text-muted-amatora">Texto</p>
```

### Migración para themes con Amatora v0.3.x instalado

1. Reemplazar `assets/amatora.css` y `assets/AMATORA_VERSION` por la versión nueva.
2. En las **secciones Amatora que ya construiste**, revisá:
   - **Headings** que dependían de la fuente Amatora global → agregá `class="font-heading-amatora"`.
   - **Párrafos** que dependían de `p { color: var(--am-text-primary) }` → agregá `class="text-muted-amatora"` (o la clase de color que corresponda).
   - **Layout que dependía del reset `* { margin:0 }`** → si una sección Amatora se ve con espaciado raro, agregá los `.m-*-amatora` / `.p-*-amatora` explícitos que falten.
3. Las secciones **del theme original** (no-Amatora) ahora recuperan su tipografía y spacing nativos — eso es lo esperado.

> Las 2 reglas theme-specific (`.cart-totals__tax-note` hidden, posición de `.dialog-modal`) se mantienen — son ajustes puntuales conocidos del operador, no parte del core.

---

## v0.3.0 → desde v0.2.x

Foco del release: que **instalar Amatora no rompa el theme** y que el panel del customizer **realmente afecte el look**. Resuelve los reportes de "los colores quedan default" e "instalo y se rompen los sliders del theme".

### Pisadas globales removidas (BREAKING — visual)

Se quitaron de `system/amatora.css` dos selectores que pisaban elementos del theme sin opt-in:

| Removido                          | Por qué                                                                            |
|-----------------------------------|------------------------------------------------------------------------------------|
| `button { background: none; border: none; cursor: pointer; }` | Mataba todos los botones del theme (header, drawer, paginación, **flechas de slideshow nativo** — explica "los sliders del theme se ven mal"). |
| `.product-form__submit { padding: 20px 0; border-radius: 30px; font-weight: 800; width: 100%; }` | Pisaba el add-to-cart de PDP sin que el dev opte. |

**Lo que SÍ queda** (a propósito): `.cart-totals__tax-note { display: none !important }` y la pisada de posición de `.dialog-modal[open].search-modal__content`.

**Migración:** si tu theme dependía visualmente de alguna de las dos pisadas removidas:

- Para el look del add-to-cart 100% ancho con esquina pill → usá las clases nativas del sistema sobre tu propio `<button>`:
  ```liquid
  <button class="btn-primary-amatora btn-block-amatora"
          data-add-to-cart
          data-variant-id="{{ product.selected_or_first_available_variant.id }}">
    <span class="btn-label">Agregar al carrito</span>
  </button>
  ```
- Para neutralizar botones específicos del theme → escribí tu propia regla en `assets/<theme>.css` o usá las utility classes de Amatora (`.bg-transparent-amatora`, `.border-none-amatora`).

### Heredar colores del theme al instalar (NUEVO)

`scripts/install.ps1` ahora detecta los colores ya configurados en `config/settings_schema.json` + `config/settings_data.json` (soporta schema clásico Y `color_scheme_group` de Dawn 2.0+) y los usa como defaults del panel Amatora antes del merge. Imprime tabla `| ID Amatora | Valor rescatado | Origen |` antes de aplicar.

**Migración:** no aplica para themes ya migrados — esto solo corre en `install.ps1` (theme limpio). Si querés re-rescatar colores en un theme que ya tiene Amatora instalado, edití manualmente el panel en el customizer.

### Settings nuevos del panel

Agregar a `config/settings_schema.json` dentro del panel "Amatora — Diseño base":

**Sliders / Carruseles (header nuevo):**
- `slider_dots_style` (select: bar / circle / progress / progress-segmented, default `bar`)
- `slider_arrows_pos` (select: header / sides, default `header`)
- `slider_show_arrows` (checkbox, default `true`)
- `slider_show_dots` (checkbox, default `true`)
- `slider_gap` (range 0-40, default 16)
- `slider_arrow_size` (range 28-60, default 44)
- `slider_arrow_icon` (image_picker, opcional — sube SVG/PNG cuadrado apuntando a la derecha; la flecha "Anterior" se voltea con `scaleX(-1)`)
- `slider_transition_speed` (select: smooth / normal / fast, default `smooth`)

Defaults idénticos al hardcoded anterior — no hay regresión visual.

### `window.AmatoraConfig` (NUEVO contrato runtime)

`amatora-tokens.liquid` ahora emite un `<script>` que setea `window.AmatoraConfig` con:
- `sliderDotsStyle`, `sliderArrowsPos`, `sliderShowArrows`, `sliderShowDots`
- `sliderArrowIcon` (URL del CDN, solo si el dev subió uno)

`amatora.js` lee este objeto en el constructor de `SliderAmatora` con prioridad: **data-attribute > opts (constructor) > AmatoraConfig (panel) > hardcoded default**. Cualquier slider con `data-dots-style="…"` propio sigue ganando (override por sección).

**Migración:** ninguna. Si tu código accedía a `window.AmatoraConfig` antes (no debería existir), revisá colisión.

### Reemplazos de archivo

Para themes con Amatora v0.2.x, reemplazar:
- `assets/amatora.css`
- `assets/amatora.js`
- `assets/AMATORA_VERSION`
- `snippets/amatora-tokens.liquid`

Hacer el merge incremental en `config/settings_schema.json` agregando los settings nuevos al panel "Amatora — Diseño base" sin tocar valores existentes que el merchant ya haya configurado.

> Verificación post-upgrade:
> 1. Customizer abre y muestra el header "Sliders / Carruseles" con sus 8 settings.
> 2. En la home, las flechas y botones del theme nativo recuperan su look original (ya no neutralizados).
> 3. Cambiar `slider_dots_style` en el customizer → recargar → cualquier `[data-amatora-slider]` sin `data-dots-style` propio refleja el cambio.

---

## v0.2.1 → desde v0.2.0

### Bugfix — `amatora-tokens.liquid` deja `@font-face` colgando en `<body>`

**Bug:** los `font_face` filters estaban FUERA del bloque `<style>` en `snippets/amatora-tokens.liquid`. El filtro `font_face` de Shopify devuelve `@font-face { ... }` como texto crudo (sin `<style>`); fuera del `<style>` el HTML parser lo escupe al inicio del `<body>` como texto visible.

**Fix:** mover los `font_face` DENTRO del bloque `<style>` que ya existe.

**Migración para themes que ya tienen v0.2.0 instalado:**

Reemplazar todo `snippets/amatora-tokens.liquid` por la versión nueva del repo. No hay cambios de naming, no hay otros archivos afectados, no hay settings nuevos. `install.ps1 -Force` lo hace automáticamente.

> Verificación: después de aplicar el fix, abrir devtools en la home y confirmar que el `<head>` tiene UN solo `<style>` con los `@font-face` y los `:root` adentro, y que el `<body>` no tiene texto crudo de `@font-face` colgando.

---

## v0.2.0 → desde cualquier 0.1.x

### Botones — API simplificada (BREAKING)

**Renames de clase 1:1** (busca/reemplaza textual en `sections/*.liquid`, `snippets/*.liquid`, `templates/*.liquid`):

| Buscar (clase vieja)            | Reemplazar (clase nueva)                            |
|---------------------------------|-----------------------------------------------------|
| `class="btn-general"`           | `class="btn-primary-amatora btn-block-amatora"`     |
| `class="btn-amatora"`           | `class="btn-primary-amatora"`                       |
| `class="btn-secondary-amatora"` | `class="btn-secondary-amatora btn-block-amatora"`   |
| `class="btn-outline-amatora"`   | `class="btn-primary-amatora btn-outline-amatora"`   |

> Para clases que aparecen junto a otras (ej. `class="btn-general mt-4-amatora"`), aplicá el reemplazo del segmento — no del atributo entero.

**Cambio de estructura — texto del botón en `<span class="btn-label">`:**

Cualquier botón Amatora ahora necesita el texto envuelto en `<span class="btn-label">` para que el spinner (estado `data-state="loading"`) lo pueda ocultar sin layout shift.

```liquid
ANTES:
<a href="..." class="btn-general">Comprar</a>

DESPUÉS:
<a href="..." class="btn-primary-amatora btn-block-amatora">
  <span class="btn-label">Comprar</span>
</a>
```

Si el botón ya tiene íconos u otros elementos hermanos, envolvé SOLO el nodo de texto en `.btn-label`.

**Reemplazo de inline-style por CSS variables:**

```liquid
ANTES:
<a class="btn-general"
   style="background: {{ section.settings.cta_bg }}; color: {{ section.settings.cta_fg }};">
  CTA
</a>

DESPUÉS:
<a class="btn-primary-amatora btn-block-amatora"
   style="--btn-bg: {{ section.settings.cta_bg }}; --btn-fg: {{ section.settings.cta_fg }};">
  <span class="btn-label">CTA</span>
</a>
```

> Por qué: con variables, el estado `:hover` y los modificadores siguen funcionando. Con `style="background: ...;"` el merchant pierde el hover.

### Add-to-cart — snippet nuevo

`snippets/amatora-add-to-cart.liquid` es nuevo. Después de copiarlo, registralo en `layout/theme.liquid` antes de `</body>`:

```liquid
{% render 'amatora-add-to-cart' %}
```

Botones que sumen producto al carrito ahora siguen este contrato:

```liquid
<button class="btn-primary-amatora"
        data-add-to-cart
        data-variant-id="{{ product.selected_or_first_available_variant.id }}">
  <span class="btn-label">Agregar al carrito</span>
</button>
```

> Si el código viejo tenía un `<form action="/cart/add" method="post">` con un submit normal, dejalo — sigue funcionando como fallback no-JS. El snippet hace `e.preventDefault()` cuando el JS está activo.

### Setting nuevo

Agregar a `config/settings_schema.json` (si ya existe el id, no duplicar):

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

### Casos ambiguos que requieren revisión humana

El prompt de update debe **parar y reportar** (no auto-resolver) si encuentra:

- Botones con CSS custom inline para `padding`, `border-radius`, `font-size`, `font-weight` — esos hay que migrar a `--btn-py`, `--btn-radius`, `--btn-fs`, `--btn-fw`.
- `<button>` con `class="btn-amatora"` que ya tiene listener JS propio para add-to-cart — hay que decidir si reemplazar por el snippet nuevo o conservar el listener custom.
- Clases que extienden `.btn-general` con otra clase componente (ej. `.mi-seccion__cta`) que tenga reglas CSS escritas — esas reglas hay que reescribir como overrides de `--btn-*`.
