# Botones Amatora — Referencia completa

Las clases base + modificadores y el contrato `--btn-*` están en `SKILL.md`. Acá vive el detalle del patrón **opcional** de add-to-cart con feedback visual (spinner / checkmark / error).

## Add-to-cart con feedback visual — patrón OPCIONAL

Es una recomendación, no un mandato. El theme puede seguir usando su propio botón "Agregar al carrito" sin tocar nada de esto. Pero si querés que los botones de toda la tienda compartan el mismo feedback (spinner durante el fetch, "Agregado" verde por 1.5s, error rojo al fallar), Amatora trae el snippet `amatora-add-to-cart.liquid` que lo hace con event delegation — un solo listener global cubre todos los botones del documento.

### 1. Estados visuales — controlados por CSS en amatora.css

4 estados, manejados por el atributo `data-state`. El CSS de cada estado vive en `amatora.css` — la sección no escribe CSS de loader, ni el JS toca `style.*`.

| `data-state`        | Qué se ve                                                  |
|---------------------|------------------------------------------------------------|
| (ausente) o `idle`  | Botón normal: "Agregar al carrito"                         |
| `loading`           | Spinner reemplaza el texto. Click bloqueado, sin opacidad. |
| `success`           | Checkmark + "Agregado". Persiste 1.5s, vuelve a `idle`.    |
| `error`             | Icono ⚠ + "Intenta de nuevo". Persiste hasta el próximo click. |

🚨 **El loader es REAL.** Refleja el estado del fetch a `/cart/add.js`: `data-state="loading"` se setea ANTES del fetch y se quita en el `.then()` / `.catch()`. Si la red está lenta, el spinner dura lo que dura la red. Prohibido `setTimeout(..., 800)` para "que se vea cargando un rato". La única excepción es el timer de 1.5s que mantiene `success` visible DESPUÉS de que el fetch ya respondió (eso es UX feedback, no loader).

### 2. Estructura HTML obligatoria

El `<span class="btn-label">` es necesario para que el spinner pueda ocultarlo sin tirar layout shift:

```liquid
<button class="btn-primary-amatora"
        data-add-to-cart
        data-variant-id="{{ product.selected_or_first_available_variant.id }}">
  <span class="btn-label">Agregar al carrito</span>
</button>
```

### 3. Lógica — un solo snippet, no JS por sección

`amatora.js` no se toca. La lógica vive en `snippets/amatora-add-to-cart.liquid` que se renderiza UNA vez en `theme.liquid` (antes de `</body>`):

```liquid
{# layout/theme.liquid — antes de </body> #}
{% render 'amatora-add-to-cart' %}
```

El snippet usa **event delegation** — un solo listener captura clicks en cualquier `[data-add-to-cart]` del documento, incluso los inyectados por AJAX o por la Section Rendering API. No se duplica JS por sección, no se rompe en re-renders parciales.

**Contrato del snippet:**
- Click en `[data-add-to-cart]` con `data-variant-id` → `data-state="loading"` → `fetch('/cart/add.js')`.
- Éxito → `data-state="success"` por 1.5s → `idle`. Dispatcha `amatora:cart:added` en `document` para que el cart drawer del theme se entere.
- Error → `data-state="error"`. Vuelve a `idle` en el próximo click.

### 4. Productos con variantes — configurable

Si un producto tiene más de una variante, NO podés agregar al carrito sin saber cuál. Dos comportamientos posibles, el merchant elige desde el customizer (`settings.add_to_cart_with_variants`):

| Setting                       | Comportamiento                                                                                       | Cuándo elegirlo                              |
|-------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------|
| `link_to_product` *(default)* | El botón pasa a `<a href="{{ product.url }}">` — manda al PDP donde el cliente elige variante.       | Catálogos chicos, productos con muchas opciones, merchants que no quieren JS extra. |
| `show_variants_inline`        | El botón abre un drawer/modal con selector de variantes; el botón final del drawer agrega al carrito. | Productos con 2-3 variantes simples (talles, colores), foco en conversión.          |

🚨 **Cuando linkea al PDP, el texto del botón cambia.** Decirle "Agregar al carrito" a algo que en realidad navega es UX rota.

| Caso                                              | Texto correcto              |
|---------------------------------------------------|-----------------------------|
| Sin variantes (o solo la default) → agrega directo | "Agregar al carrito"        |
| Con variantes + `link_to_product`                 | "Ver opciones" / "Elegir"   |
| Con variantes + `show_variants_inline`            | "Agregar al carrito"        |

**Patrón Liquid:**

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

**Setting para `config/settings_schema.json`:**

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

### 5. Eventos custom para que el cart drawer del theme reaccione

El snippet dispatcha estos eventos en `document`:

| Evento                  | Cuándo                          | `event.detail` |
|-------------------------|---------------------------------|----------------|
| `amatora:cart:added`    | Después de un fetch exitoso     | `{ item, button }` — `item` es la respuesta de `/cart/add.js`, `button` el `<button>` clickeado |
| `amatora:cart:error`    | Después de un fetch fallido     | `{ error, button }` |

Tu cart drawer puede escucharlos para abrirse / actualizar el contador / mostrar el ítem nuevo:

```js
document.addEventListener('amatora:cart:added', (e) => {
  // abrir el drawer del theme y refrescar el contador
});
```

### 6. Self-check del botón add-to-cart

- [ ] ¿Tiene `<span class="btn-label">` adentro? (el spinner lo oculta sin layout shift)
- [ ] ¿`data-add-to-cart` + `data-variant-id` presentes cuando agrega directo?
- [ ] Si tiene variantes: ¿respeta `settings.add_to_cart_with_variants`? ¿El texto cambia a "Ver opciones" cuando linkea al PDP?
- [ ] ¿`amatora.js` quedó intacto? ¿La lógica está en `snippets/amatora-add-to-cart.liquid`?
- [ ] ¿Ningún `setTimeout` simulando carga? El loader debe terminar exactamente cuando el fetch resuelve.
