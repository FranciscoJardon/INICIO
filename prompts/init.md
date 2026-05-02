# Prompt — INIT

**Cuándo usar:** theme Shopify limpio (Dawn u otro) descargado fresh, sin Amatora previo y sin código del cliente que pueda chocar. Si el theme ya está en producción con código custom, usar `implement.md` en su lugar.

**Cómo usar:** parate en la raíz del theme (con `assets/`, `config/`, `layout/`, etc) y pegá todo el bloque debajo en Claude Code.

---

```
Inicializa este proyecto Shopify con el sistema de diseño Amatora desde:
  Repo:     https://github.com/FranciscoJardon/INICIO
  Raw base: https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/

Cuando el prompt diga "descargá del repo <archivo>", construí la URL así:
  <Raw base> + <path en el repo>
Ejemplo: system/amatora.css
  → https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/system/amatora.css

Asume que estoy parado en la raíz del theme descargado (con assets/, config/,
layout/, sections/, snippets/, templates/). Hacé exactamente estos pasos en
orden y al final mostrame un reporte.

═══════════════════════════════════════════════════════════════
PASO 1 — REVISIÓN DEL TEMPLATE (no toques nada todavía)
═══════════════════════════════════════════════════════════════
Verificá el estado actual del theme:
  a) Listá las carpetas presentes (assets/, config/, layout/, sections/,
     snippets/, templates/). Si falta alguna obligatoria, parate y avisame.
  b) Confirmá que NO existe `assets/AMATORA_VERSION`. Si existe, este theme
     ya tiene Amatora — parate y decime que use el prompt de actualización.
  c) Verificá que NO existan archivos con los mismos nombres que voy a
     instalar (amatora.css, amatora.js, amatora-tokens.liquid,
     amatora-add-to-cart.liquid, banner-amatora.liquid). Si existe alguno,
     parate y avisame qué encontraste.
  d) Leé `config/settings_schema.json` y revisá si ya existen settings con
     los ids: am_primary, am_secondary, am_accent, am_text, am_bg_light,
     am_font_heading, am_font_body, btn_primary_bg, btn_primary_fg,
     btn_radius, btn_fs, add_to_cart_with_variants. Si alguno coincide,
     parate y mostrame el conflicto.
  e) Leé `layout/theme.liquid` y verificá que tiene <head>, </head>, </body>.
     Si falta alguno (theme corrupto), parate y avisame.

Si TODO el paso 1 pasa sin conflictos, seguí. Si NO, parate y reportá
todo lo encontrado antes de tocar nada.

═══════════════════════════════════════════════════════════════
PASO 2 — DESCARGA DE ASSETS
═══════════════════════════════════════════════════════════════
Descargá del repo y poné en `assets/`:
  - amatora.css
  - amatora.js
  - AMATORA_VERSION

═══════════════════════════════════════════════════════════════
PASO 3 — DESCARGA DE SNIPPETS
═══════════════════════════════════════════════════════════════
Descargá del repo y poné en `snippets/`:
  - amatora-tokens.liquid
  - amatora-add-to-cart.liquid

═══════════════════════════════════════════════════════════════
PASO 4 — DESCARGA DE LA SECCIÓN DE VERIFICACIÓN
═══════════════════════════════════════════════════════════════
Descargá del repo y poné en `sections/`:
  - banner-amatora.liquid

(Esta sección sirve como smoke-test: cuando entre al customizer, debe
aparecer "Banner Amatora" en la lista de secciones disponibles.)

═══════════════════════════════════════════════════════════════
PASO 5 — MERGE DEL SCHEMA
═══════════════════════════════════════════════════════════════
Bajá del repo `settings_schema.amatora.json`. Es un objeto que representa
UN panel del array de `config/settings_schema.json`.

Insertá ese objeto al final del array de `config/settings_schema.json`,
respetando JSON válido. NO toques los paneles existentes.

═══════════════════════════════════════════════════════════════
PASO 6 — EDITAR layout/theme.liquid
═══════════════════════════════════════════════════════════════
En `layout/theme.liquid`, agregá lo siguiente, en este orden EXACTO:

  a) Dentro del <head>, justo antes de </head>:
       {{ 'amatora.css' | asset_url | stylesheet_tag }}
       {% render 'amatora-tokens' %}
       <script src="{{ 'amatora.js' | asset_url }}" defer></script>

  b) Justo antes de </body>:
       {% render 'amatora-add-to-cart' %}

═══════════════════════════════════════════════════════════════
PASO 7 — INSTALAR EL SKILL EN MI CLI
═══════════════════════════════════════════════════════════════
Copiá del repo `skill/SKILL.md` y `skill/reference/*` a:
  ~/.claude/skills/amatora-theme-builder/SKILL.md
  ~/.claude/skills/amatora-theme-builder/reference/*

Si esa carpeta ya existe, hacé backup en
  ~/.claude/skills/amatora-theme-builder.bak.<timestamp>
antes de pisar.

═══════════════════════════════════════════════════════════════
PASO 8 — REPORTE FINAL
═══════════════════════════════════════════════════════════════
Mostrame en este formato:

  Versión instalada: <leer assets/AMATORA_VERSION>
  Archivos creados:
    - assets/amatora.css, amatora.js, AMATORA_VERSION
    - snippets/amatora-tokens.liquid, amatora-add-to-cart.liquid
    - sections/banner-amatora.liquid
  Archivos modificados:
    - layout/theme.liquid (con resumen de los 4 inserts)
    - config/settings_schema.json (panel "Amatora — Diseño base" agregado)
  Skill sincronizado en ~/.claude/skills/amatora-theme-builder/
  Smoke-test:
    1. Abrir customizer
    2. Ir a "Personalizar tema"
    3. Verificar que el panel "Amatora — Diseño base" aparece en la
       sección de Configuración del tema
    4. Verificar que "Banner Amatora" aparece al agregar sección a la home
  Próximo paso: configurar colores y fuente en el panel "Amatora — Diseño
    base", agregar el banner a la home.

REGLAS:
- No edites secciones existentes (sections/*.liquid distintos a banner-amatora.liquid).
- No corras `git commit` ni `git push`. Yo reviso.
- Si algún paso falla, parate y avisame; no improvises.
```
