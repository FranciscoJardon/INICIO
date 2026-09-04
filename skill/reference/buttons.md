# Botones y carrito — Referencia completa

Las clases base, los modificadores y el contrato `--btn-*` están en `SKILL.md`. Aquí vive el detalle del **Mandato 4**: el contrato de agregar al carrito, cómo se abre el drawer del theme, el patrón de card de producto y los eventos.

## 1. Estados visuales — controlados por CSS en amatora.css

4 estados, manejados por el atributo `data-state`. El CSS de cada estado vive en `amatora.css`: la sección no escribe CSS de loader, ni el JS toca `style.*`.

| `data-state`        | Qué se ve                                                  |
|---------------------|------------------------------------------------------------|
| (ausente) o `idle`  | Botón normal: "Agregar al carrito"                         |
| `loading`           | Spinner reemplaza el texto. Click bloqueado.               |
| `success`           | "Agregado". Persiste 1.5s, vuelve a `idle`.                |
| `error`             | "Intenta de nuevo". Persiste hasta el próximo click.       |

🚨 **El loader es REAL.** Refleja el fetch a `/cart/add`: `loading` se pone ANTES del fetch y se quita cuando responde. Prohibido `setTimeout(..., 800)` para "que se vea cargando". La única excepción es el timer de 1.5s que mantiene `success` visible DESPUÉS de la respuesta (es feedback, no loader).

## 2. HTML obligatorio

El `<span class="btn-label">` es necesario para que el spinner lo oculte sin layout shift:

```liquid
<button type="button" class="btn-primary-amatora"
        data-add-to-cart
        data-variant-id="{{ product.selected_or_first_available_variant.id }}"
        data-quantity="1">
  <span class="btn-label">Agregar al carrito</span>
</button>
```

`data-quantity` es opcional (default 1). `type="button"` evita que un `<form>` envolvente haga submit.

## 3. Lógica — un solo snippet, nunca fetch por sección

`amatora.js` no se toca. La lógica vive en `snippets/amatora-add-to-cart.liquid`, renderizado UNA vez en `theme.liquid` antes de `</body>`:

```liquid
{% render 'amatora-add-to-cart' %}
```

Usa **event delegation**: un solo listener en `document` cubre todos los `[data-add-to-cart]`, incluso los inyectados por AJAX o por la Section Rendering API.

### Cómo abre el drawer del theme

El snippet no trae un drawer propio: usa el del theme. En Dawn y todos sus derivados el carrito es un custom element `<cart-drawer>` (o `<cart-notification>`) que expone `getSectionsToRender()` y `renderContents()`. El snippet:

1. Busca `document.querySelector('cart-notification') || document.querySelector('cart-drawer')`.
2. Manda a `/cart/add` el `id`, `quantity` y, si encontró el elemento, `sections` (ids de las secciones del carrito) y `sections_url`.
3. Con la respuesta llama `cart.renderContents(json)`: **el drawer se abre con el ítem nuevo y el contador del header se actualiza**, igual que el botón nativo del PDP.

Se desactiva desde el customizer: Configuraciones Amatora → Carrito → "Abrir el carrito al agregar". Si está apagado, solo se muestra el estado `success` y se emite el evento.

### Themes que no son Dawn

Si el theme no tiene `<cart-drawer>` ni `<cart-notification>`, el snippet igual agrega el producto, muestra `success` y emite `amatora:cart:added`. Engancha ahí el drawer del theme (ver §7) y dilo explícitamente en tu respuesta.

## 4. Productos con variantes — configurable

Con más de una variante no se puede agregar sin saber cuál. El merchant elige en el customizer (`settings.add_to_cart_with_variants`):

| Setting                       | Comportamiento                                                                                       | Cuándo elegirlo                              |
|-------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------|
| `link_to_product` *(default)* | El botón pasa a `<a href="{{ product.url }}">`: manda al PDP donde el cliente elige variante.        | Catálogos chicos, productos con muchas opciones. |
| `show_variants_inline`        | El botón abre un drawer/modal con selector de variantes; el botón final del drawer agrega al carrito. | Productos con 2-3 variantes simples (talle, color). |

🚨 **Cuando linkea al PDP, el texto del botón cambia.** Decir "Agregar al carrito" a algo que navega es UX rota.

| Caso                                              | Texto correcto              |
|---------------------------------------------------|-----------------------------|
| Sin variantes (o solo la default) → agrega directo | "Agregar al carrito"        |
| Con variantes + `link_to_product`                 | "Ver opciones"              |
| Con variantes + `show_variants_inline`            | "Agregar al carrito"        |
| Sin stock                                         | "Agotado" (`disabled`)      |

## 5. Card de producto estándar — `snippets/product-card-amatora.liquid`

Cada vez que el usuario pida una card de producto (o un grid/slider de productos), parte de este patrón. Todo con utilities; sin `<style>` en el snippet (se renderiza N veces).

```liquid
{%- comment -%}
  snippets/product-card-amatora.liquid
  Uso: {% render 'product-card-amatora', product: product, loading: 'lazy' %}
{%- endcomment -%}
{%- liquid
  assign p_img       = product.featured_image
  assign behavior    = settings.add_to_cart_with_variants | default: 'link_to_product'
  assign img_loading = loading | default: 'lazy'
-%}
<div class="flex-amatora flex-col-amatora gap-3-amatora">

  <a href="{{ product.url }}" class="block-amatora overflow-hidden-amatora rounded-xl-amatora">
    {%- if p_img != blank -%}
      {{ p_img | image_url: width: 800 | image_tag: class: 'w-full-amatora h-auto-amatora aspect-9-amatora object-cover-amatora', sizes: '(min-width: 768px) 25vw, 50vw', alt: p_img.alt, loading: img_loading }}
    {%- endif -%}
  </a>

  <a href="{{ product.url }}" class="text-base-amatora font-medium-amatora text-primary-amatora text-decoration-amatora">
    {{ product.title }}
  </a>
  <span class="text-sm-amatora text-muted-amatora">{{ product.price | money }}</span>

  {%- if product.available == false -%}
    <button type="button" class="btn-primary-amatora" disabled>
      <span class="btn-label">Agotado</span>
    </button>
  {%- elsif product.has_only_default_variant -%}
    <button type="button" class="btn-primary-amatora"
            data-add-to-cart
            data-variant-id="{{ product.selected_or_first_available_variant.id }}">
      <span class="btn-label">Agregar al carrito</span>
    </button>
  {%- elsif behavior == 'show_variants_inline' -%}
    <button type="button" class="btn-primary-amatora" data-open-variants="{{ product.handle }}">
      <span class="btn-label">Agregar al carrito</span>
    </button>
  {%- else -%}
    <a href="{{ product.url }}" class="btn-primary-amatora">
      <span class="btn-label">Ver opciones</span>
    </a>
  {%- endif -%}

</div>
```

En un grid o slider de productos, las primeras 3 cards van con `loading: 'eager'` y el resto `'lazy'` (ver `images.md` Regla 4).

## 6. Eventos

El snippet dispatcha en `document`:

| Evento                  | Cuándo                          | `event.detail` |
|-------------------------|---------------------------------|----------------|
| `amatora:cart:added`    | Después de un fetch exitoso     | `{ item, button, cart }`: `item` es la respuesta de `/cart/add`, `button` el elemento clickeado, `cart` el `<cart-drawer>`/`<cart-notification>` usado (o `null`) |
| `amatora:cart:error`    | Después de un fetch fallido     | `{ error, button }` |

## 7. Integrar un theme que no es Dawn

Escucha el evento y abre el drawer con lo que el theme exponga. Ejemplo genérico que refresca el contador y abre un drawer por clase:

```liquid
{# snippets/amatora-cart-bridge.liquid — render una vez antes de </body> #}
<script>
  document.addEventListener('amatora:cart:added', async () => {
    const cart = await fetch('/cart.js').then((r) => r.json());
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = cart.item_count; });
    document.querySelector('.cart-drawer')?.classList.add('is-open');
  });
</script>
```

Adapta el selector y el método de apertura al theme concreto. Si el theme expone un evento propio (`cart:refresh`, `cart:open`), dispáralo desde aquí.

## 8. Self-check del botón add-to-cart

- [ ] ¿Tiene `<span class="btn-label">` adentro?
- [ ] ¿`type="button"` + `data-add-to-cart` + `data-variant-id` cuando agrega directo?
- [ ] Si tiene variantes: ¿respeta `settings.add_to_cart_with_variants`? ¿El texto cambia a "Ver opciones" cuando linkea?
- [ ] ¿Sin `fetch('/cart/add')` en la sección? ¿La lógica está solo en `amatora-add-to-cart.liquid`?
- [ ] ¿Ningún `setTimeout` simulando carga?
- [ ] Si el theme no es Dawn: ¿dijiste cómo enganchar el drawer al evento?
