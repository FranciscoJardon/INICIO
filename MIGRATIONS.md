# MIGRATIONS

Lista de cambios breaking entre versiones. El **prompt de actualización** (ver `README.md`) lee este archivo para saber qué reemplazar en `sections/*.liquid` y `snippets/*.liquid` de un proyecto que ya tenía Amatora instalado.

Formato por release:
- **Renames de clase** — busca/reemplaza directo.
- **Renames de estructura** — el HTML cambió (ej. agregar `<span class="btn-label">`). Requiere lógica.
- **Settings nuevos** — agregar a `config/settings_schema.json`.
- **Snippets nuevos** — copiar a `snippets/` y registrar en `theme.liquid`.

---

## v0.2.1 → desde v0.2.0

### Bugfix — `amatora-tokens.liquid` deja `@font-face` colgando en `<body>`

**Bug:** los `font_face` filters estaban FUERA del bloque `<style>` en `snippets/amatora-tokens.liquid`. El filtro `font_face` de Shopify devuelve `@font-face { ... }` como texto crudo (sin `<style>`); fuera del `<style>` el HTML parser lo escupe al inicio del `<body>` como texto visible.

**Fix:** mover los `font_face` DENTRO del bloque `<style>` que ya existe.

**Migración para themes que ya tienen v0.2.0 instalado:**

Reemplazar todo `snippets/amatora-tokens.liquid` por la versión nueva del repo. No hay cambios de naming, no hay otros archivos afectados, no hay settings nuevos. El prompt `update.md` lo hace automáticamente al copiar el snippet desde `~/amatora-system/system/`.

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
