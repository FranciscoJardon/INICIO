# MIGRATIONS

Lista de cambios breaking entre versiones. El **prompt de actualización** (ver `README.md`) lee este archivo para saber qué reemplazar en `sections/*.liquid` y `snippets/*.liquid` de un proyecto que ya tenía Amatora instalado.

Formato por release:
- **Renames de clase** — busca/reemplaza directo.
- **Renames de estructura** — el HTML cambió (ej. agregar `<span class="btn-label">`). Requiere lógica.
- **Settings nuevos** — agregar a `config/settings_schema.json`.
- **Snippets nuevos** — copiar a `snippets/` y registrar en `theme.liquid`.

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
