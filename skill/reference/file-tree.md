# File tree — estructura canónica del theme Amatora

Estructura estándar de un theme Shopify Online Store 2.0 que usa el sistema Amatora.

---

## Estructura de carpetas

```
theme/
├── assets/
│   ├── amatora.css          ← Sistema de diseño (utilities + tokens). No se edita por proyecto
│   ├── amatora.js           ← Slider Amatora. Congelado
│   ├── AMATORA_VERSION      ← Versión instalada
│   ├── base.css             ← Estilos base del theme original (Dawn, etc.)
│   └── ...
│
├── blocks/                  ← Theme blocks (OS 2.0)
│
├── config/
│   ├── settings_schema.json ← Incluye el panel "Configuraciones Amatora"
│   └── settings_data.json   ← Valores guardados por el merchant
│
├── layout/
│   ├── theme.liquid         ← Aquí se cargan los 4 tags Amatora (ver abajo)
│   └── password.liquid
│
├── locales/
│
├── sections/
│   ├── banner-amatora.liquid              ← Instalado por install.ps1 (smoke-test)
│   ├── header-amatora.liquid
│   ├── productos-destacados-amatora.liquid
│   ├── testimonios-amatora.liquid
│   └── ... (cada sección Amatora termina en -amatora.liquid)
│
├── snippets/
│   ├── amatora-tokens.liquid          ← Puente customizer → CSS vars (instalado)
│   ├── amatora-add-to-cart.liquid     ← Lógica de agregar al carrito + drawer (instalado)
│   ├── product-card-amatora.liquid    ← Card de producto estándar (ver buttons.md §5)
│   ├── icon-{nombre}.liquid
│   └── ...
│
└── templates/
    ├── index.json
    ├── product.json
    ├── collection.json
    └── ...
```

---

## Convenciones de nombres

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Sección Amatora | `sections/{nombre-kebab}-amatora.liquid` | `banner-hero-amatora.liquid` |
| Snippet Amatora | `snippets/{nombre-kebab}-amatora.liquid` | `product-card-amatora.liquid` |
| Clase CSS componente | `.{nombre}-am__{elemento}` (BEM) | `.banner-am__cta` |
| Modifier | `.{nombre}-am__{elemento}--{modifier}` | `.banner-am__cta--dark` |
| Sección ID scope | `{% assign sid = '{nombre}-' | append: section.id %}` | `banner-hero-1234567` |
| Schema name | `{Nombre Capitalizado} Amatora` | `"Banner Hero Amatora"` |
| Schema class | `section-{nombre-kebab}-amatora` | `"section-banner-hero-amatora"` |
| Preset category | `"category": "Amatora"` | (siempre el mismo) |

---

## Carga obligatoria en `layout/theme.liquid`

Los 4 tags, en este orden. `install.ps1` los inserta solo; si el theme se armó a mano, verifica que estén.

```liquid
<head>
  …
  {{ 'amatora.css' | asset_url | stylesheet_tag }}
  {% render 'amatora-tokens' %}
  <script src="{{ 'amatora.js' | asset_url }}" defer></script>
  …
</head>
<body>
  …
  {% render 'amatora-add-to-cart' %}
</body>
```

- `amatora-tokens` va DESPUÉS de `amatora.css`: sus `:root` sobrescriben los defaults de fábrica con lo que el merchant configuró en el panel.
- `amatora.js` con `defer`: no bloquea el parseo y corre antes de `DOMContentLoaded`.
- `amatora-add-to-cart` antes de `</body>`: un solo listener delegado para toda la página.

⚠️ **Sin estos tags, las utilities, el slider y el carrito NO funcionan.** Cada sección Amatora asume que están cargados. Recuérdalo al cerrar cada respuesta.

---

## Dónde se configura qué

| Qué | Dónde |
|---|---|
| Colores de marca, texto, fondos, bordes | Customizer → Configuraciones Amatora → Colores |
| Fuentes de títulos y cuerpo | Customizer → Configuraciones Amatora → Tipografía |
| Radius, tamaño y padding de botones | Customizer → Configuraciones Amatora → Botones |
| Dots, flechas, gap, velocidad de sliders | Customizer → Configuraciones Amatora → Sliders |
| Abrir drawer al agregar, productos con variantes | Customizer → Configuraciones Amatora → Carrito |
| Defaults de fábrica (si el panel no existe) | `assets/amatora.css` sección 2 |
| Override por sección o instancia | `style="--btn-bg: …"`, `#{{ sid }} [data-amatora-slider] { --sl-radius: 0; }` |

---

## Orden de prioridad CSS

1. `base.css` (theme original)
2. `amatora.css` (sistema: utilities + defaults de fábrica en `:root`)
3. `amatora-tokens.liquid` (`:root` con lo que el merchant configuró)
4. `<style>` scopeado dentro de cada sección (`#{{ sid }} .…-am__…`)

El scoping con `#{{ sid }}` evita que el CSS de una sección filtre a otras.

---

## Compatibilidad con el theme original

El sistema Amatora **convive** con el theme base; no lo reemplaza. Es opt-in puro:

- Las clases nativas del theme (`.product-form__submit`, `.cart-drawer`, `.header__menu`) siguen intactas
- Las utilities `*-amatora` solo aplican donde se usen
- Los tokens `--am-*` están en `:root` pero no afectan estilos que no los referencian
- El add-to-cart de Amatora usa el `<cart-drawer>` del theme, no trae uno propio
- Excepciones documentadas: 2 reglas theme-specific en `amatora.css` sección 1 (ver `system-overview.md` §7)

---

## Eliminar / desactivar el sistema

1. Quita los 4 tags de `theme.liquid`
2. Las secciones que dependían de él dejan de verse bien: reemplázalas o elimínalas

No hay desinstalador automático: el sistema es aditivo.
