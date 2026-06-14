# File tree — estructura canónica del theme Amatora

Estructura estándar de un theme Shopify Online Store 2.0 que usa el sistema Amatora.

---

## Estructura de carpetas

```
theme/
├── assets/
│   ├── amatora.css          ← Sistema de design (utilidades + tokens) — NO EDITAR
│   ├── amatora.js           ← Slider Amatora + componentes JS — NO EDITAR
│   ├── base.css             ← Estilos base del theme original (Dawn, etc.)
│   ├── *.svg                ← Iconos del proyecto
│   └── ...
│
├── blocks/                  ← Theme blocks (OS 2.0) — bloques reutilizables a nivel global
│
├── config/
│   ├── settings_schema.json ← Configuración global (logo, fuentes, colores)
│   └── settings_data.json   ← Valores guardados por el merchant
│
├── layout/
│   ├── theme.liquid         ← Layout principal — aquí cargas amatora.css y amatora.js
│   └── password.liquid      ← Layout de password page
│
├── locales/                 ← Traducciones (es.json, en.default.json, etc.)
│
├── sections/
│   ├── header-amatora.liquid
│   ├── footer-amatora.liquid
│   ├── banner-hero-amatora.liquid
│   ├── productos-destacados-amatora.liquid
│   ├── testimonios-amatora.liquid
│   └── ... (cada sección Amatora termina en -amatora.liquid)
│
├── snippets/
│   ├── product-card-amatora.liquid
│   ├── icon-{nombre}.liquid
│   └── ... (snippets reutilizables)
│
└── templates/
    ├── index.json
    ├── product.json
    ├── collection.json
    ├── page.json
    └── ...
```

---

## Convenciones de nombres

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Sección Amatora | `sections/{nombre-kebab}-amatora.liquid` | `banner-hero-amatora.liquid` |
| Snippet Amatora | `snippets/{nombre-kebab}-amatora.liquid` | `product-card-amatora.liquid` |
| Clase CSS componente | `.{nombre}-am__{elemento}` (BEM) | `.banner-am__media` |
| Modifier | `.{nombre}-am__{elemento}--{modifier}` | `.banner-am__media--mob` |
| Sección ID scope | `{% assign sid = '{nombre}-' | append: section.id %}` | `banner-hero-1234567` |
| Schema name | `{Nombre Capitalizado} Amatora` | `"Banner Hero Amatora"` |
| Schema class | `section-{nombre-kebab}-amatora` | `"section-banner-hero-amatora"` |
| Preset category | `"category": "Amatora"` | (siempre el mismo) |

---

## Carga obligatoria en `layout/theme.liquid`

Dentro del `<head>`, ANTES de cualquier sección que dependa del sistema:

```liquid
<head>
  …
  {{ 'amatora.css' | asset_url | stylesheet_tag }}
  …
</head>
```

Antes de `</body>` o con `defer` en `<head>`:

```liquid
<script src="{{ 'amatora.js' | asset_url }}" defer></script>
```

⚠️ **Sin estos dos archivos, las utility classes y el slider NO funcionan.** Cada sección Amatora asume que ambos están cargados.

---

## Orden de prioridad CSS

El theme carga CSS en este orden (de menor a mayor especificidad):

1. `base.css` (theme original — Dawn/etc.)
2. `amatora.css` (sistema Amatora — sobrescribe lo necesario)
3. `<style>` scopeado dentro de cada section (`#{{ sid }} .…-am__…`)

El scoping con `#{{ sid }}` evita que el CSS de una sección filtre a otras del mismo template.

---

## Compatibilidad con el theme original

El sistema Amatora **convive** con el theme base — no lo reemplaza. Desde v0.4.0 es opt-in puro:

- Las clases nativas del theme (ej: `.product-form__submit`, `.cart-drawer`, `.header__menu`) siguen funcionando intactas — Amatora ya no las pisa
- Las utilidades Amatora (`*-amatora`) solo aplican donde se usen — instalar no cambia el look de ningún theme
- Los tokens `--am-*` están en `:root` pero no afectan estilos que no los referencian
- Excepciones documentadas: 2 reglas theme-specific en `amatora.css` sección 1 (ver `reference/system-overview.md` §7)

---

## Eliminar / desactivar el sistema

Si en el futuro quieres dejar de usar Amatora en una página:

1. Quita la carga de `amatora.css` y `amatora.js` del `theme.liquid`
2. Las secciones que dependían de él dejarán de verse correctamente — reemplázalas o elimínalas

No hay desinstalador automático: el sistema es additive.
