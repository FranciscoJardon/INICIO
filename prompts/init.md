# Prompt — INIT

**Cuándo usar:** theme Shopify limpio (Dawn u otro) descargado fresh, sin Amatora previo y sin código del cliente que pueda chocar. Si el theme ya está en producción con código custom, usar `implement.md` en su lugar.

## Paso previo — UNA SOLA VEZ por máquina del operador

Clonar el sistema Amatora a una ruta local conocida:

```powershell
git clone https://github.com/FranciscoJardon/INICIO.git "$env:USERPROFILE\amatora-system"
```

(En Mac/Linux: `git clone https://github.com/FranciscoJardon/INICIO.git ~/amatora-system`.)

Si ya lo tenés clonado, actualizá a la última versión:

```powershell
git -C "$env:USERPROFILE\amatora-system" pull
```

> **Por qué clone local y no descarga vía `curl`:** el sandbox de Claude Code clasifica `curl` desde un repo arbitrario hacia `assets/`, `snippets/`, `sections/` como "integración de código externo no confiable" y lo bloquea por seguridad. Copiar desde una carpeta local que vos ya autorizaste no dispara esa regla.

## Cómo usar

Parate en la raíz del theme (con `assets/`, `config/`, `layout/`, etc.) y pegá todo el bloque debajo en Claude Code. Asume que el clone local está en `~/amatora-system` — si lo pusiste en otra ruta, sustituila en el bloque antes de pegar.

---

```
Inicializa este proyecto Shopify con el sistema de diseño Amatora.

El sistema Amatora ya está clonado localmente en:
  ~/amatora-system
(Si lo tengo en otra ruta, sustituilo en cada PASO.)

Asume que estoy parado en la raíz del theme descargado (con assets/, config/,
layout/, sections/, snippets/, templates/). Hacé exactamente estos pasos en
orden y al final mostrame un reporte.

═══════════════════════════════════════════════════════════════
PASO 0 — VERIFICAR EL CLONE LOCAL
═══════════════════════════════════════════════════════════════
Confirmá que existe ~/amatora-system con estos archivos exactos:
  ~/amatora-system/system/AMATORA_VERSION
  ~/amatora-system/system/amatora.css
  ~/amatora-system/system/amatora.js
  ~/amatora-system/system/amatora-tokens.liquid
  ~/amatora-system/system/amatora-add-to-cart.liquid
  ~/amatora-system/system/banner-amatora.liquid
  ~/amatora-system/system/settings_schema.amatora.json
  ~/amatora-system/skill/SKILL.md
  ~/amatora-system/skill/reference/

Si falta algo, parate y avisame: necesito clonarlo o actualizarlo primero.

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
PASO 2 — COPIAR ASSETS
═══════════════════════════════════════════════════════════════
Copiá desde `~/amatora-system/system/` a `assets/`:
  - amatora.css
  - amatora.js
  - AMATORA_VERSION

═══════════════════════════════════════════════════════════════
PASO 3 — COPIAR SNIPPETS
═══════════════════════════════════════════════════════════════
Copiá desde `~/amatora-system/system/` a `snippets/`:
  - amatora-tokens.liquid
  - amatora-add-to-cart.liquid

═══════════════════════════════════════════════════════════════
PASO 4 — COPIAR LA SECCIÓN DE VERIFICACIÓN
═══════════════════════════════════════════════════════════════
Copiá desde `~/amatora-system/system/` a `sections/`:
  - banner-amatora.liquid

(Esta sección sirve como smoke-test: cuando entre al customizer, debe
aparecer "Banner Amatora" en la lista de secciones disponibles.)

═══════════════════════════════════════════════════════════════
PASO 4.5 — HEREDAR COLORES DEL THEME (rescate)
═══════════════════════════════════════════════════════════════
Antes de insertar el panel Amatora en settings_schema.json, vas a
RESCATAR los colores que el theme ya tiene configurados y usarlos
como defaults del panel Amatora. Así, al instalar, Amatora arranca
con la paleta del cliente en vez de los colores genéricos del sistema.

Procedimiento:

  a) Leé `config/settings_schema.json` y `config/settings_data.json`.

  b) Identificá los settings de color del theme. Dos casos posibles:

     CASO 1 — Schema clásico (theme antiguo):
       Settings con `"type": "color"` en el top-level de cada panel.
       El valor actual está en `settings_data.json → current → <id>`.

     CASO 2 — Color schemes (Dawn 2.0+ y similares):
       Existe un setting con `"type": "color_scheme_group"`.
       Los valores están en `settings_data.json → current →
       <group_id> → <scheme_id> → settings → <field>`.
       Usá la PRIMERA scheme definida (típicamente "scheme-1" o
       la marcada como default por el theme).

     Si `current` en settings_data.json es un STRING (nombre de preset),
     resolvé buscando en `presets[<nombre>]`.

  c) Mapeá los IDs/campos del theme a los IDs de Amatora con esta
     prioridad (primer match gana, sin saltarse el orden):

       am_primary       ← ids que contengan, en orden:
                          "accent_1", "primary", "main", "brand",
                          "principal", "color_button", "button_background"
       am_secondary     ← "accent_2", "secondary"
       am_text          ← "text", "foreground", "body_text", "color_body"
       am_bg_light      ← "background_1", "background", "bg_primary"
       am_accent        ← "accent", "highlight"
                          (excluyendo accent_1 / accent_2)
       btn_primary_bg   ← "button_background", "button_bg", "button"
                          (si no hay match, usar el mismo valor que am_primary)
       btn_primary_fg   ← "button_text", "button_label", "button_fg",
                          "color_button_text"

     Los hover (am_primary_hover, am_secondary_hover) NO se rescatan:
     dejá el default de Amatora.

  d) Leé `~/amatora-system/system/settings_schema.amatora.json`.
     Para cada `id` que tenga match en el paso (c), reemplazá el
     campo `default` con el color rescatado del theme.
     Para los que NO tengan match, dejá el default original.

  e) Mostrame esta tabla ANTES de seguir al PASO 5:

       | ID Amatora      | Default original | Valor rescatado | Origen          |
       | --------------- | ---------------- | --------------- | --------------- |
       | am_primary      | #004a3b          | #4a90e2         | colors_accent_1 |
       | am_secondary    | #9c6b3f          | (sin match)     | —               |
       | btn_primary_bg  | #004a3b          | #ff6600         | color_button    |
       ...

     Si hay más de un match plausible para un mismo id Amatora,
     parate y preguntame antes de elegir.

  f) Una vez mostrada la tabla, usá ese schema MODIFICADO (no el
     original de ~/amatora-system) en el PASO 5 para hacer el merge.

REGLA: si NO existe `config/settings_data.json` (theme recién
descargado sin guardar nunca), saltá este paso completo y usá los
defaults originales de Amatora. Avisame en el reporte final.

═══════════════════════════════════════════════════════════════
PASO 5 — MERGE DEL SCHEMA
═══════════════════════════════════════════════════════════════
Tomá el schema MODIFICADO en el PASO 4.5 (con los defaults rescatados
del theme). Si el PASO 4.5 se saltó, leé directamente
`~/amatora-system/system/settings_schema.amatora.json`.
Es un objeto que representa UN panel del array de `config/settings_schema.json`.

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
PASO 7 — INSTALAR EL SKILL EN EL PROYECTO
═══════════════════════════════════════════════════════════════
Instalá la skill DENTRO del proyecto (no globalmente). Así viaja con
el repo: cualquier dev que clone este theme va a recibir la skill.

Copiá a `.claude/skills/amatora-theme-builder/` del proyecto:
  ~/amatora-system/skill/SKILL.md          → .claude/skills/amatora-theme-builder/SKILL.md
  ~/amatora-system/skill/reference/*       → .claude/skills/amatora-theme-builder/reference/

🚨 CRÍTICO: convertí line endings a LF al copiar. Si copiás con CRLF
(default de Windows), el parser YAML del frontmatter de SKILL.md no
lee el campo `description:` y la skill se carga SIN sus triggers.

Si la carpeta `.claude/skills/amatora-theme-builder/` ya existe en el
proyecto, hacé backup en `.claude/skills/amatora-theme-builder.bak.<timestamp>`
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
  Colores rescatados del theme: <N de M, o "no aplicó (sin settings_data.json)">
  Skill sincronizado en .claude/skills/amatora-theme-builder/ del proyecto
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
