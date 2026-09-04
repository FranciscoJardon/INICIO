# MIGRATIONS

Lista de cambios breaking entre versiones. El **prompt de actualización** (ver `README.md`) lee este archivo para saber qué reemplazar en `sections/*.liquid` y `snippets/*.liquid` de un proyecto que ya tenía Amatora instalado.

Formato por release:
- **Renames de clase** — busca/reemplaza directo.
- **Renames de estructura** — el HTML cambió (ej. agregar `<span class="btn-label">`). Requiere lógica.
- **Settings nuevos** — agregar a `config/settings_schema.json`.
- **Snippets nuevos** — copiar a `snippets/` y registrar en `theme.liquid`.

---

## v0.8.1 → desde v0.8.0

Bugfixes encontrados probando v0.8.0 end-to-end: `install.ps1` real sobre un Dawn 16 limpio, `shopify theme check` sobre el resultado, y test del slider y del carrito en Chromium headless.

- **`install.ps1 -Force` (BUG):** el reemplazo del panel viejo generaba un `settings_schema.json` anidado (`[[…], {…}]`) y perdía `theme_info`. PowerShell 5.1 entrega un array JSON como un solo objeto; ahora se aplana y se verifica antes de escribir. Si corriste v0.8.0 con `-Force` sobre un theme que ya tenía panel Amatora, revisa que `config/settings_schema.json` sea un array plano; si no, restaura el `.bak` y vuelve a correr.
- **Scripts `.ps1` sin guiones largos ni flechas Unicode.** Sin BOM, PowerShell 5.1 los leía como ANSI y esos caracteres se convertían en comillas: error de parseo al ejecutarlos directo (`New-AmatoraProject`, `Sync-AmatoraSkill`). El one-liner con `iwr` no lo sufría.
- **`amatora.js`:** `dragstart` cancelado en el viewport. Chromium iniciaba un drag nativo al arrastrar sobre un `<a>` o `<img>`, el slider no recibía `mouseup` y cancelaba el siguiente click.
- **`amatora.js`:** ResizeObserver en el viewport (re-mide al pasar de `display:none` a visible: tabs, drawers), `shopify:block:deselect` reanuda el autoplay, `shopify:section:unload` destruye instancias, `role="region"` en el viewport.
- **Panel:** fuente de cuerpo por defecto `assistant_n4` (`helvetica_n4` está deprecada; lo marca theme-check).

Migración: reemplazar `assets/amatora.js`, `assets/AMATORA_VERSION` y el panel (o `install.ps1 -Force`). Sin renames.

---

## v0.8.0 → desde v0.7.x

Foco del release: **la skill dice la verdad sobre el sistema y el sistema deja de estorbar al performance.** Colores y botones vuelven al customizer bajo un solo panel, imágenes con `image_tag`, slider sin `visibility: hidden`, add-to-cart que abre el drawer del theme.

### Skill (`SKILL.md` + `reference/`)

- Eliminados los prefijos `lg:` y `xl:` de toda la documentación: **nunca existieron en amatora.css**. Solo hay `md:` (≥768px). Busca `lg:` y `xl:` en tus secciones y cámbialos por `md:` o quítalos.
- Corregida la escala de `gap-*` (no existe `gap-14-amatora`) y la nota de espaciado.
- Mandato 2: nueva regla de oro, "si existe una utility, se usa la utility"; el `<style>` de una sección debe ser mínimo.
- Mandato 3 reescrito: `image_url: width: N | image_tag: …`. **`format: 'webp'` no es un valor válido de `image_url`** (solo acepta `jpg`/`pjpg`); Shopify negocia WebP/AVIF solo. Política de loading: `lazy` por default; `eager` + `fetchpriority: 'high'` solo en la imagen LCP; primeras 3 slides de un slider `eager`.
- Nuevo Mandato 4 (carrito): todo agregar-al-carrito usa `data-add-to-cart` y el snippet abre el drawer del theme. Patrón de card de producto en `reference/buttons.md` §5.
- Ya no hace falta el patrón Liquid `is_single`: el JS detecta cuando todo cabe (`.is-static`).
- `install.ps1` ahora copia `reference/buttons.md` e `images.md` (antes faltaban: la skill instalada tenía referencias rotas).
- Voz unificada a "tú". Frontmatter `description` bajo el límite de 1024 caracteres.

### `settings_schema.amatora.json` (BREAKING)

Panel renombrado a **"Configuraciones Amatora"**. Vuelven los colores y la forma de los botones al customizer: es la única fuente de verdad; `amatora.css` sección 2 queda como defaults de fábrica.

Settings nuevos: `am_color_primary`, `am_color_primary_hover`, `am_color_secondary`, `am_color_secondary_hover`, `am_text_primary`, `am_text_secondary`, `am_bg_light`, `am_bg_warm`, `am_border`, `am_btn_radius`, `am_btn_fs`, `am_btn_fw`, `am_btn_py`, `am_btn_px`, `am_cart_open_drawer`.

`install.ps1 -Force` reemplaza el panel viejo automáticamente (reformatea `settings_schema.json`; deja backup). El rescate de colores del theme ahora también escribe los `default` del panel.

### `amatora-tokens.liquid`

Inyecta colores, botones, fuentes y slider desde el panel. Debe renderizarse DESPUÉS de `amatora.css`. Publica `AmatoraConfig.cartOpenDrawer` y `AmatoraConfig.cartVariants`.

### `amatora-add-to-cart.liquid`

- POST a `/cart/add` pidiendo las `sections` del carrito. Si el theme tiene `<cart-drawer>` / `<cart-notification>` (Dawn y derivados), llama `renderContents()`: el drawer se abre con el ítem y el contador se actualiza.
- Respeta `settings.am_cart_open_drawer`.
- `amatora:cart:added` ahora trae `detail.cart`.
- Maneja el 422 de Shopify (sin stock) como estado `error`.

### `amatora.css` sección 28 (slider)

- **Se elimina el `visibility: hidden` pre-init.** Antes, el hero no pintaba hasta que corría amatora.js y el LCP se retrasaba aunque la imagen ya hubiera bajado. Ahora el pre-init es un flex simple que respeta `--sl-visible-sm/md/lg`, `--sl-gap` y `--sl-peek` inline.
- Nuevo `.is-static` (sin flechas ni dots cuando todo cabe), `touch-action: pan-y` en el viewport, `:focus-visible`, `prefers-reduced-motion`.

### `amatora.js` v3.1

- Medidas cacheadas: cero `getComputedStyle` / `offsetWidth` por frame durante el drag.
- Listeners de mouse en `window` solo mientras dura el drag.
- El drag con mouse funciona sobre slides que son `<a>` (antes no arrancaba).
- `data-dots-style`, `data-arrows-pos` y `data-variant` inválidos caen al default (antes `progress-segmented` dejaba los dots invisibles).
- Autoplay: pausa con pestaña oculta, fuera del viewport y con reduced-motion; se reinicia tras interacción manual.
- Teclado (← →) en el viewport, `aria-current` en dots.
- `shopify:block:select` muestra el slide del block seleccionado en el customizer.
- API nueva: `refresh()`, `SliderAmatora.get(el)`.

### `banner-amatora.liquid`

Reescrito: `image_tag`, utilities en vez de CSS custom, dots `bar`/`circle` con default `bar` (antes `progress-segmented`, removido en v0.6.0 y roto desde entonces), sin `is_single`, CSS vars inline para el pre-init.

### Migración

1. Reemplazar `assets/amatora.css`, `assets/amatora.js`, `assets/AMATORA_VERSION`, `snippets/amatora-tokens.liquid`, `snippets/amatora-add-to-cart.liquid` y `sections/banner-amatora.liquid`, o correr `install.ps1 -Force`.
2. Panel del customizer: `install.ps1 -Force` lo reemplaza solo. A mano: borra el panel "Amatora — Diseño base" de `config/settings_schema.json` y pega `system/settings_schema.amatora.json`.
3. En `sections/*.liquid` y `snippets/*.liquid`:
   - `format: 'webp'` → quitar.
   - `lg:` / `xl:` → `md:` o quitar.
   - `data-dots-style="progress"` / `"progress-segmented"` → `"bar"`.
   - `{% unless is_single %}` alrededor de `data-amatora-slider` → quitar el condicional (el JS lo maneja). Si lo dejas, sigue funcionando.
   - `<img>` con `srcset` a mano y `<link rel="preload">` a mano → `image_tag` (recomendado, no obligatorio).
   - Botones de agregar al carrito con fetch propio → `data-add-to-cart` + `data-variant-id`.
4. Revisar los colores en el customizer si el rescate automático no los encontró.

---

## v0.7.1 → desde v0.7.0

Foco del release: **flag `-ToolsOnly` para instalación no invasiva**. Mismo sistema, nueva forma de instalarlo.

### Nueva opción

```powershell
& ([scriptblock]::Create((iwr ".../install.ps1" -UseBasicParsing).Content)) -ToolsOnly
```

| Qué hace | Qué NO hace |
|---|---|
| ✅ Instala la skill en `.claude/skills/` | ❌ No edita `layout/theme.liquid` |
| ✅ Copia `assets/amatora.css` (con rescate de colores) | ❌ No mergea panel en `config/settings_schema.json` |
| ✅ Copia `assets/amatora.js` | ❌ No copia snippets (`amatora-tokens.liquid`, `amatora-add-to-cart.liquid`) |
| ✅ Copia `assets/AMATORA_VERSION` | ❌ No copia `sections/banner-amatora.liquid` |

**Mientras los tags no estén en `theme.liquid`, el theme funciona exactamente como antes.** Amatora está disponible pero inactivo.

### Para qué sirve

- Probar Amatora en un theme en producción sin riesgo
- Instalar la base ahora y wirelo después cuando lo necesités
- Theme custom del cliente donde no querés tocar nada sin revisar

### Cómo activar después manualmente

Agregá a `layout/theme.liquid` justo antes de `</head>`:

```liquid
{{ 'amatora.css' | asset_url | stylesheet_tag }}
<script src="{{ 'amatora.js' | asset_url }}" defer></script>
```

Ya. El theme empieza a tener las clases `-amatora` disponibles. Cero invasión hasta que vos decidas usarlas.

### Migración

Ninguna. Solo es una flag nueva, los modos existentes (`default`, `-SkillOnly`, `-Force`) funcionan igual.

---

## v0.7.0 → desde v0.6.x

Foco del release: **arquitectura de configuración invertida**. `assets/amatora.css` pasa a ser la única fuente de verdad para colores y forma de botones. El customizer del tema queda solo para fonts, sliders y comportamiento del carrito.

### El problema que se arregló

En v0.6.x los colores podían venir de tres lugares: defaults en `amatora.css`, defaults del customizer (en el panel "Amatora — Diseño base"), o valores rescatados por el installer al copiarlos al customizer. Cuando un dev veía un color inesperado en una sección, tenía que rastrear el cascade: ¿es del CSS? ¿es del customizer? ¿es del rescate? La sesión de un usuario lo evidenció — el verde "apareció de la nada" y hubo que ir snippet por snippet hasta encontrar el `settings.am_primary`.

### Cambios

**`settings_schema.amatora.json` (BREAKING)** — Removidos los settings:
- Header "Colores" entero (`am_primary`, `am_primary_hover`, `am_secondary`, `am_secondary_hover`, `am_accent`, `am_text`, `am_bg_light`)
- Header "Botones — forma y tamaño" (`btn_primary_bg`, `btn_primary_fg`, `btn_radius`, `btn_fs`)

El panel ahora arranca con un párrafo informativo que apunta al dev a `assets/amatora.css`. Quedan los headers Tipografía, Sliders / Carruseles, Comportamiento del carrito.

**`amatora-tokens.liquid` (BREAKING)** — Removidos los bloques `:root` que inyectaban `--am-color-*`, `--am-text-*`, `--am-bg-light`, `--btn-bg`, `--btn-fg`, `--btn-radius`, `--btn-fs`. El snippet ahora solo inyecta `@font-face` + las variables de fuentes + los CSS vars del slider. Más liviano y predecible.

**`amatora.css` sección 2** — Agregado el subbloque "BOTONES (forma y tamaño global)" con `--btn-radius`, `--btn-fs`, `--btn-fw`, `--btn-py`, `--btn-px`. Editar acá afecta todo el sistema. La sección 2 sigue siendo la única zona del CSS que el dev edita en cada proyecto.

**`install.ps1`** — El rescate de colores ahora muta `assets/amatora.css` directamente (en memoria, antes de escribirlo). Mapeo simplificado de roles a CSS vars:
- `primary`  → `--am-color-primary` + `--am-color-primary-hover`
- `secondary` → `--am-color-secondary` + `--am-color-secondary-hover`
- `text`     → `--am-text-primary` + `--am-text-secondary`
- `bg_light` → `--am-bg-light`

Si el theme no tiene `settings_data.json` (theme recién bajado sin guardar), el CSS se instala con sus defaults.

### Migración para themes con v0.6.x instalada

1. **Backup del panel viejo del customizer**: si el merchant ya configuró colores en el panel "Amatora — Diseño base", anotalos antes (Color primario, etc.). Vas a tenerlos que escribir en `amatora.css` sección 2.
2. **Editar `config/settings_schema.json`** del theme: borrar a mano el panel `"name": "Amatora — Diseño base"` viejo (tiene settings que ya no se usan).
3. **Correr `install.ps1 -Force`**: copia el sistema nuevo, mete el panel reducido, y si tu theme tiene colores en su propio schema → el rescate los escribe directo en `amatora.css`.
4. **Si los colores rescatados no son los que querés**: editar manualmente `assets/amatora.css` sección 2.

### Stats

| Archivo | v0.6.x | v0.7.0 | Cambio |
|---|---|---|---|
| `amatora-tokens.liquid` | 109 | 67 | -42 (-39%) |
| `settings_schema.amatora.json` | 14 settings | 11 settings | -3 colores + -2 btn |
| `install.ps1` rescate map | 7 IDs | 4 roles | más simple |

### Filosofía

**Un sistema, una fuente de verdad por concepto.** Colores → `amatora.css`. Sliders → customizer. Cart behavior → customizer. Fuentes → customizer (porque Shopify provee el font picker y vale la pena el merchant pueda tocarlas). No más cascada implícita.

---

## v0.6.0 → desde v0.5.x

Foco del release: **simplificar el slider JS** removiendo features niche que casi nadie usaba pero pesaban en código + API mental.

### Features removidas (BREAKING si las usabas)

| Feature | Reemplazo / Por qué se removió |
|---|---|
| **Counter** (`data-counter="true"`, "1/N" en el header) | Niche. Si lo necesitás, escribe markup propio en el header de la sección. |
| **Dots style `progress`** (barra continua que se llena) | El estilo `bar` (default) cubre el caso visual. Quien necesite barra de progreso real, usa CSS propio. |
| **Dots style `progress-segmented`** (tipo "stories" de Instagram) | Mismo caso. Se elimina del JS y del CSS. |
| **`data-dots-align`** (left / center / right del contenedor de dots) | Solo era relevante para los estilos progress removidos. |
| **`data-progress-width/height/radius/gap/bg`** (5 CSS vars opcionales) | Mismo caso, solo para progress. |

**`slider_dots_style` en el panel del customizer:** ahora solo expone `bar` y `circle`. Si tenías el setting en `progress` o `progress-segmented`, hay que reelegirlo.

### Lo que SE MANTIENE intacto

Todo lo demás del slider sigue funcionando igual:
- `data-visible-{desktop,tablet,mobile}` para slides por breakpoint
- `data-gap`, `data-peek`, `data-variant` (default/banner)
- `data-arrows`, `data-arrows-pos`, `data-dots`
- `data-loop`, `data-autoplay`, `data-label`
- `data-accent` (override del color de dots por instancia)
- Drag + touch + resize + Section Rendering API
- AmatoraConfig (defaults globales del panel)
- Custom arrow icon (v0.3.0)

### Stats

| Archivo | Antes | Ahora | Cambio |
|---|---|---|---|
| `amatora.css` | 1474 | 1376 | -98 (-7%) |
| `amatora.js` | 663 | 625 | -38 (-6%) |
| `settings_schema.amatora.json` | 4 opciones de dots | 2 opciones | clearer |

### Migración

1. Reemplazar `assets/amatora.css`, `assets/amatora.js`, `assets/AMATORA_VERSION` y `snippets/amatora-tokens.liquid` por las versiones nuevas.
2. Buscar en `sections/*.liquid` + `snippets/*.liquid` por los atributos removidos:
   - `data-counter="true"` → quitar o reemplazar con markup custom en el header
   - `data-dots-style="progress"` o `"progress-segmented"` → cambiar a `"bar"` o `"circle"`
   - `data-dots-align="..."` → eliminar (no tenía efecto en bar/circle)
   - `data-progress-width/height/radius/gap/bg` → eliminar
3. En el customizer del cliente, si el panel "Amatora — Diseño base" tenía `slider_dots_style` seteado en uno de los dos valores removidos, va a caer al default `bar` automáticamente.

---

## v0.5.2 → desde v0.5.1

Foco del release: **terminar el trim del SKILL.md** moviendo el detalle de Mandato 3 (Imágenes) a su propio reference. Solo docs, sin breaking ni cambio de comportamiento.

### Cambios

- **`skill/SKILL.md`** baja de 645 → 449 líneas. El Mandato 3 pasa de 229 a 33 líneas: queda el resumen de las 5 reglas core + quick checklist + pointers.
- **`skill/reference/images.md`** (nuevo, 230 líneas) — Contiene las 11 reglas detalladas con tablas de anchos por contexto, la política completa de `loading="eager"` vs `lazy` (cuándo falla en Shopify y qué hacer), patterns de `<picture>` + preload, casos edge (productos en slider, banner hero, iconos, videos).

### Resumen de la simplificación del skill

| | Inicio (pre-trim) | Fin (v0.5.2) | Reducción |
|---|---|---|---|
| `SKILL.md` | 782 | 449 | -42% |
| Nuevos `reference/buttons.md` + `reference/images.md` | — | 363 | (cargan on-demand) |
| Total siempre-cargado en context | 782 | 449 | -333 líneas |

El contenido completo se preserva — solo se reorganiza para que SKILL.md (lo que se carga en cada trigger del skill) quede más liviano.

### Migración

Ninguna. Solo docs.

---

## v0.5.1 → desde v0.5.0

Foco del release: **simplificar el skill**. Solo cambios de documentación, sin breaking ni cambios de comportamiento.

### Cambios

- **`skill/SKILL.md`** baja de 782 → 645 líneas. El detalle del patrón **opcional** de add-to-cart (4 estados, productos con variantes, eventos custom, schema completo) se movió a `skill/reference/buttons.md` (nuevo, 133 líneas). En SKILL.md queda la API esencial de botones + un pointer.
- **Add-to-cart re-categorizado de "obligatorio" a "OPCIONAL".** El theme puede seguir usando su propio botón de "Agregar al carrito" sin tocar el patrón Amatora.
- **`skill/reference/system-overview.md` §7** reescrita — describía un reset global que ya no existe desde v0.4.0.
- **`skill/reference/file-tree.md`** actualizado — la sección "Compatibilidad con el theme original" ahora refleja que Amatora ya no pisa `.product-form__submit` ni otras clases nativas.

### Migración

Ninguna. Solo docs. Si tu workflow lee `SKILL.md` directamente, mismo contenido pero más corto y mejor organizado.

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
