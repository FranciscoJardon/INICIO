# Amatora — Catálogo de tokens y utility classes

Sistema completo de design tokens (`--am-*`) y clases utilitarias (`*-amatora`) definidas en `assets/amatora.css`. Esta es la **única** fuente de verdad — el archivo está congelado, no se añaden nuevas utilidades, se compone con las existentes.

**Convenciones:**
- Prefix `--am-` → tokens en `:root`
- Suffix `-amatora` → utility classes
- `md:` → ≥768px / `lg:` → ≥1024px / sin prefix → mobile-first todos los tamaños
- BEM con suffix `-am` → CSS scopeado por sección (`#{{ sid }} .nombre-am__elemento`)

---

## 1. Tokens (`--am-*`)

### Fuentes (editables por proyecto)
```css
--am-font-heading: ;   /* Reemplazar con fuente heading del proyecto */
--am-font-body:    ;   /* Reemplazar con fuente body del proyecto */
```

### Colores

| Token | Valor por defecto | Uso |
|---|---|---|
| `--am-color-primary`         | `#004a3b` | Color de marca principal |
| `--am-color-primary-hover`   | `#004a3b` | Hover del primary |
| `--am-color-secondary`       | `#7db38e` | Color de marca secundario |
| `--am-color-secondary-hover` | `#7db38e` | |
| `--am-color-black`           | `#000000` | |
| `--am-color-white`           | `#ffffff` | |
| `--am-color-danger`          | `#dc2626` | Errores, alertas |
| `--am-text-primary`          | `#004a3b` | Texto principal |
| `--am-text-secondary`        | `#004a3b` | Texto secundario |
| `--am-bg-light`              | `#D1E0EF` | Fondo claro |
| `--am-bg-warm`               | `#F6F4F1` | Fondo cálido |
| `--am-border`                | `#D0D0D0` | Bordes por defecto |

### Espaciado (`--am-space-*`)

| Token | px |
|---|---|
| `--am-space-0`  | 0   |
| `--am-space-1`  | 4   |
| `--am-space-2`  | 8   |
| `--am-space-3`  | 12  |
| `--am-space-4`  | 16  |
| `--am-space-6`  | 24  |
| `--am-space-8`  | 32  |
| `--am-space-10` | 40  |
| `--am-space-12` | 48  |
| `--am-space-14` | 56  |
| `--am-space-16` | 64  |
| `--am-space-20` | 80  |
| `--am-space-25` | 112 |

⚠️ **No existen `5`, `7`, `9`, `11`, `13`, `15`, `18`, `20` (excepto el `20` que vale 80px), `24`.** Si necesitas un valor intermedio, elige el más cercano.

### Leading

| Token | Valor |
|---|---|
| `--am-leading-none`    | 1     |
| `--am-leading-tight`   | 1.25  |
| `--am-leading-normal`  | 1.5   |
| `--am-leading-relaxed` | 1.75  |

---

## 2. Utility classes — Catálogo completo

### Display
`block-amatora` · `inline-block-amatora` · `inline-amatora` · `flex-amatora` · `inline-flex-amatora` · `grid-amatora` · `hidden-amatora`

### Flexbox
- **Direction:** `flex-row-amatora` `flex-col-amatora` `flex-wrap-amatora` `flex-nowrap-amatora`
- **Grow/Shrink:** `flex-1-amatora` `grow-amatora` `grow-0-amatora` `shrink-amatora` `shrink-0-amatora`
- **Align items:** `items-{start|center|end|stretch|baseline}-amatora`
- **Justify content:** `justify-{start|center|between|around|evenly|end}-amatora`
- **Self:** `self-{start|center|end|stretch}-amatora`
- **Justify items/self:** `justify-items-center-amatora` · `justify-self-{start|center|end}-amatora`
- **Gap:** `gap-{1|2|3|4|6|8|10|12|14}-amatora` · `gap-x-{1|2|3|4|6|8}-amatora` · `gap-y-{1|2|3|4|6|8}-amatora`

### Grid
- **Columns:** `grid-cols-{1..12}-amatora`
- **Col span:** `col-span-{1..12|full}-amatora`
- **Col start:** `col-start-{1..7}-amatora`
- **Row span:** `row-span-{1|2|3}-amatora`

### Margin
- **All:** `m-{0|1|2|3|4|6|8}-amatora`
- **Top:** `mt-{0|1|2|3|4|6|8|12}-amatora` · `-mt-2-amatora` (negativo)
- **Bottom:** `mb-{0|1|2|3|4|6|8}-amatora`
- **Left:** `ml-{0|1|2|3|4|6|8|auto}-amatora`
- **Right:** `mr-{0|1|2|3|4|6|8|auto}-amatora`
- **X axis:** `mx-{1|2|4|auto}-amatora`
- **Y axis:** `my-{1|2|4|6|8}-amatora`

### Padding
- **All:** `p-{0|1|2|3|4|6|8}-amatora`
- **X axis:** `px-{0|1|2|3|4|6|8}-amatora`
- **Y axis:** `py-{1|2|3|4|6|8|10|12|14|16|20}-amatora`
- **Top:** `pt-{4|12|20|25}-amatora`
- **Right/Bottom/Left:** `pr-4-amatora` · `pb-{4|6|8|12}-amatora` · `pl-4-amatora`

### Width
- **Relativos:** `w-full-amatora` · `w-auto-amatora` · `w-1\/2-amatora` · `w-1\/3-amatora` · `w-2\/3-amatora` · `w-1\/4-amatora` · `w-3\/4-amatora` · `w-screen-amatora` · `w-fit-amatora` · `w-min-amatora` · `w-max-amatora`
- **Píxeles:** `w-{10|20|30|40|50|60|70|80|100|300}-amatora`
- **Min:** `min-w-0-amatora` · `min-w-full-amatora`
- **Max:** `max-w-xs-amatora` (240px) · `max-w-{100|200|250|300|350|400|500|600|700|800|900}-amatora` · `max-w-full-amatora` · `max-w-none-amatora`

### Height
- **Relativos:** `h-full-amatora` · `h-auto-amatora` · `h-screen-amatora` · `h-fit-amatora`
- **Píxeles:** `h-{40|50|70|100|300|400|500|600|700|800}-amatora`
- **Min:** `min-h-0-amatora` · `min-h-screen-amatora` · `min-h-full-amatora`
- **Max:** `max-h-{300|400|500}-amatora` · `max-h-screen-amatora` · `max-h-full-amatora` · `max-h-none-amatora`

### Aspect ratio
`aspect-ratio-amatora` (1:1) · `aspect-9-amatora` (9/11) · `aspect-video-amatora` (16/9) · `aspect-auto-amatora`

### Position
- **Type:** `relative-amatora` · `absolute-amatora` · `fixed-amatora` · `sticky-amatora` · `static-amatora`
- **Inset:** `inset-0-amatora` · `top-0-amatora` · `right-0-amatora` · `bottom-{0|4|10}-amatora` · `left-0-amatora`
- **Z-index:** `z-{0|1|10|20|30|40|50|100}-amatora`
- **Centrados:** `top-50-amatora` · `left-50-amatora` · `center-amatora` (centra absoluto en X+Y)

### Tipografía
- **Alineación:** `text-{left|center|right|justify}-amatora`
- **Tamaños:** `text-{xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl}-amatora`
- **Weights:** `font-{thin|light|normal|medium|semibold|bold|black}-amatora`
- **Leading:** `leading-{none|tight|normal|relaxed}-amatora`
- **Tracking:** `tracking-{tight|normal|wide|wider|widest}-amatora`
- **Decoration:** `text-decoration-amatora` (none) · `text-underline-amatora` · `text-line-through-amatora`
- **Estilo:** `italic-amatora` · `not-italic-amatora`
- **Case:** `uppercase-amatora` · `lowercase-amatora` · `capitalize-amatora` · `normal-case-amatora`
- **Whitespace:** `whitespace-{nowrap|normal|pre}-amatora`
- **Overflow texto:** `truncate-amatora` · `line-clamp-{1|2|3}-amatora` · `break-words-amatora`

#### Escala tipográfica (memorizar)

| Clase | font-size / line-height |
|---|---|
| `text-xs-amatora`   | 12 / 16 |
| `text-sm-amatora`   | 14 / 20 |
| `text-base-amatora` | 16 / 24 |
| `text-lg-amatora`   | 18 / 28 |
| `text-xl-amatora`   | 20 / 28 |
| `text-2xl-amatora`  | 24 / 32 |
| `text-3xl-amatora`  | 30 / 36 |
| `text-4xl-amatora`  | 36 / 40 |
| `text-5xl-amatora`  | 48 / 52 |
| `text-6xl-amatora`  | 60 / 64 |
| `text-7xl-amatora`  | 72 / 76 |

### Bordes
- **Sólidos:** `border-amatora` (1px gris) · `border-{primary|secondary}-amatora` (2px brand) · `border-{white|black}-amatora` (1px)
- **Sin borde:** `border-none-amatora` · `border-0-amatora`
- **Width:** `border-{2|4}-amatora`
- **Por lado:** `border-{t|b|l|r}-amatora` (1px gris) · `border-{t|b|l|r}-0-amatora`

### Border radius
`rounded-none-amatora` · `rounded-amatora` (4px) · `rounded-md-amatora` (6px) · `rounded-lg-amatora` (8px) · `rounded-xl-amatora` (12px) · `rounded-2xl-amatora` (16px) · `rounded-full-amatora` (9999px)
- **Top only:** `rounded-t-amatora` · `rounded-t-{lg|xl}-amatora`
- **Bottom only:** `rounded-b-amatora` · `rounded-b-{lg|xl}-amatora`

### Sombras
`shadow-none-amatora` · `shadow-{sm|md|lg|xl}-amatora`

### Opacidad
`opacity-{0|25|50|75|100}-amatora`

### Overflow
`overflow-{hidden|auto|scroll|visible}-amatora` · `overflow-x-{auto|hidden}-amatora` · `overflow-y-{auto|hidden}-amatora`

### Object-fit
`object-{cover|contain|fill|none}-amatora`

### Cursor / pointer / select
`cursor-{pointer|default|not-allowed}-amatora` · `pointer-events-{none|auto}-amatora` · `select-{none|text|all}-amatora`

### Listas
`list-{none|disc|decimal}-amatora`

### Transiciones
- **Base:** `transition-amatora` (todo, 150ms ease-in-out)
- **Específicas:** `transition-all-amatora` · `transition-colors-amatora` · `transition-opacity-amatora` · `transition-transform-amatora`
- **Duration:** `duration-{100|150|200|300|500}-amatora`
- **Easing:** `ease-{in-out|in|out}-amatora`

### Transforms
- **Scale:** `scale-{95|100|105|110}-amatora`
- **Rotate:** `rotate-{45|90|180}-amatora` · `-rotate-90-amatora`

### Hover states
`hover:opacity-{80|100}-amatora` · `hover:shadow-lg-amatora` · `hover:scale-105-amatora` · `hover:underline-amatora`

### Order (flex/grid)
`order-{1|2|3}-amatora` · `order-{first|last|none}-amatora`

### Accesibilidad
`sr-only-amatora` — visualmente oculto, accesible para screen readers.

---

## 3. Colores como utility classes

### Texto
`text-{primary|secondary|black|white|danger|muted|muted-light}-amatora`

### Fondos
`bg-{primary|secondary|black|white|light|warm|transparent}-amatora`

---

## 4. Container

```css
.container-amatora {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
/* max-widths por breakpoint: */
@media (min-width: 640px)  { max-width: 640px;  }
@media (min-width: 768px)  { max-width: 968px;  }
@media (min-width: 1024px) { max-width: 1024px; }
@media (min-width: 1280px) { max-width: 1500px; }
```

🚨 **No tiene padding horizontal.** Combina siempre con `px-4-amatora` o `px-6-amatora`:

```html
<div class="container-amatora px-4-amatora md:px-6-amatora">…</div>
```

---

## 5. Responsive — prefijos `md:` y `lg:`

`md:` aplica desde 768px, `lg:` desde 1024px. Patrón mobile-first: la clase sin prefijo es la versión móvil; sobrescribes con `md:`/`lg:` para tablet/desktop.

### Disponibles en `md:` (≥768px)
Colores texto · Display · Flex direction · Grid (cols 1..6, 12 + col-span 1..12) · Gap (1..14) · Padding (p, px, py, pt, pr, pb, pl) · Margin (m, mx, my, mt, mr, mb, ml) · Tipografía (text-sm a text-5xl, text-{left|center|right}) · Width (relativos + px 10..300) · max-w (xs, 100..400) · Height (auto, full, 100..800) · Items/Justify · Self/Justify-self · Position (relative, absolute, fixed, sticky, inset, top, right, bottom, left) · Z-index (1..100) · Centrados absolutos · Order (1..3) · Transform (`md:scale-2-amatora` = scale(1.2))

### Disponibles en `lg:` (≥1024px)
Colores texto · Display · Flex direction · Grid (cols 1..6, 12 + col-span 1..12) · Gap (1..8) · Padding (p, px, py, pt, pr, pb, pl) · Margin (m, mx, my, mt, mr, mb, ml) · Tipografía (text-sm a text-5xl) · Width (relativos) · Height (auto, full) · Items/Justify · Z-index (1..100) · Order (1..3) · Transform (`lg:scale-3-amatora` = scale(1.35))

---

## 6. Componentes compuestos (sección 27 del CSS)

### Botones — `primary` y `secondary`, todo configurable

Solo dos clases base + dos modificadores. Todo lo demás se configura por CSS variables.

| Clase                    | Cuándo usar                                                     |
|--------------------------|-----------------------------------------------------------------|
| `btn-primary-amatora`    | Acción principal (CTA, "Agregar al carrito", "Comprar")         |
| `btn-secondary-amatora`  | Acción alternativa ("Ver más", "Saber más")                     |

| Modificador              | Efecto                                                          |
|--------------------------|-----------------------------------------------------------------|
| `btn-block-amatora`      | Ancho completo (max 450px) + esquina signature `0 0 30px 0`     |
| `btn-outline-amatora`    | Fondo transparente + borde del color base; combina con primary o secondary |

**Variables disponibles:** `--btn-bg`, `--btn-fg`, `--btn-border`, `--btn-radius`, `--btn-py`, `--btn-px`, `--btn-fs`, `--btn-fw`, `--btn-w`, `--btn-max`, `--btn-bg-hover`.

**Tres niveles de override:**

```liquid
{# 1. Por instancia #}
<a class="btn-primary-amatora" style="--btn-bg: #ff6b35; --btn-radius: 8px;">Comprar</a>

{# 2. Por sección — todos los botones del bloque heredan #}
<div id="{{ sid }}" style="--btn-bg: #ff6b35; --btn-radius: 12px;">
  <a class="btn-primary-amatora">Comprar</a>
</div>

{# 3. Global desde theme settings (theme.liquid) #}
<style>
  :root {
    --btn-bg:     {{ settings.btn_primary_bg }};
    --btn-radius: {{ settings.btn_radius }}px;
  }
</style>
```

**Estados (set por `amatora-add-to-cart.liquid`, render por CSS):**

- `data-state="loading"` → spinner reemplaza el `.btn-label`
- `data-state="success"` → "✓ Agregado" por 1.5s
- `data-state="error"` → "⚠ Intenta de nuevo"

```liquid
<button class="btn-primary-amatora" data-add-to-cart data-variant-id="{{ variant.id }}">
  <span class="btn-label">Agregar al carrito</span>
</button>
```

**Centrar `.btn-block-amatora`:** envolver en `<div class="flex-amatora justify-center-amatora">…</div>` porque tiene `max-width: 450px`.

### Card

```css
.card-amatora {
  background: var(--am-color-white);
  border: 1px solid var(--am-border);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  padding: 16px;
}
```

Solo para tarjetas blancas genéricas. Si tu card tiene background colorido, elementos absolutos, o ratios no estándar — escribe una clase componente específica (`.mi-card-am`) en vez de usar `.card-amatora`.

---

## 7. Reset incluido (sección 1)

- `box-sizing: border-box` en todo
- `body { overflow-x: hidden }`
- `img, video { max-width: 100%; height: auto }`
- `button { background: none; border: none; cursor: pointer }`
- `.product-form__submit` ya tiene estilo pill (radius 30px, weight 800, width 100%, padding 20px 0)
