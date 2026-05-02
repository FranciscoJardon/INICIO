# Prompt — UPDATE

**Cuándo usar:** theme que YA tiene Amatora instalado en alguna versión previa (0.1.x, 0.2.x, etc.) y querés llevarlo a la versión más nueva del repo.

**Diferencia con `init.md` e `implement.md`:** este lee `assets/AMATORA_VERSION` para saber desde qué versión venís, baja `MIGRATIONS.md` del repo, y aplica los renames + cambios de estructura entre tu versión y la target — find/replace en `sections/*.liquid` y `snippets/*.liquid`.

**Cómo usar:** parate en la raíz del theme y pegá el bloque debajo.

---

```
Actualizá este proyecto Shopify a la última versión del sistema Amatora desde:
  Repo:     https://github.com/FranciscoJardon/INICIO
  Raw base: https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/

Cuando el prompt diga "descargá del repo <archivo>", construí la URL así:
  <Raw base> + <path en el repo>
Ejemplo: system/AMATORA_VERSION
  → https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/system/AMATORA_VERSION

Asume que estoy parado en la raíz del theme y que Amatora ya está instalado
en alguna versión previa (0.1.x, 0.2.x, etc.). Hacé exactamente estos pasos.

═══════════════════════════════════════════════════════════════
PASO 1 — DETECCIÓN DE VERSIÓN
═══════════════════════════════════════════════════════════════
  a) Leé `assets/AMATORA_VERSION`. Si no existe, asumí "0.1.0" (legacy
     pre-versionado) y avisame que estoy en ese estado.
  b) Bajá del repo `system/AMATORA_VERSION` para saber la target.
  c) Si versión actual == target → no hay nada que actualizar. Reportá y
     salí.
  d) Si `assets/amatora.css` y `assets/amatora.js` no existen, parate:
     este es un caso de inicialización, no de actualización. Avisame que
     use el prompt init.md.

═══════════════════════════════════════════════════════════════
PASO 2 — BACKUP
═══════════════════════════════════════════════════════════════
Antes de tocar nada:
  cp assets/amatora.css           assets/amatora.css.bak.<timestamp>
  cp assets/amatora.js            assets/amatora.js.bak.<timestamp>
  cp config/settings_schema.json  config/settings_schema.json.bak.<timestamp>

Para cada snippet/section que vayás a modificar en pasos 5-6, hacé backup
también justo antes de tocarlo:
  cp <archivo> <archivo>.bak.<timestamp>

═══════════════════════════════════════════════════════════════
PASO 3 — LEER CHANGELOG
═══════════════════════════════════════════════════════════════
Bajá del repo `MIGRATIONS.md`. Identificá las entradas entre la versión
actual (exclusive) y la target (inclusive). Estas son "las migraciones
aplicables".

Mostrame en el reporte qué versiones vas a aplicar y qué hace cada una
en una línea.

═══════════════════════════════════════════════════════════════
PASO 4 — REEMPLAZAR ASSETS DEL SISTEMA
═══════════════════════════════════════════════════════════════
Bajá del repo y sobrescribí:
  - assets/amatora.css
  - assets/amatora.js
  - assets/AMATORA_VERSION

Si la migración aplicable lista snippets/secciones nuevos del sistema
(como amatora-add-to-cart.liquid en v0.2.0), bajalos también:
  - snippets/amatora-tokens.liquid (si la migración lo lista)
  - snippets/amatora-add-to-cart.liquid (si la migración lo lista)
  - sections/banner-amatora.liquid (solo si se pidió explícitamente —
    actualizar la sección base puede pisar customizaciones)

═══════════════════════════════════════════════════════════════
PASO 5 — APLICAR RENAMES DE CLASE
═══════════════════════════════════════════════════════════════
Para cada migración aplicable, recorré:
  - sections/*.liquid
  - snippets/*.liquid
  - templates/*.liquid

Y aplicá los reemplazos listados en MIGRATIONS.md sección "Renames de
clase 1:1". Llevá la cuenta: file → cantidad de reemplazos.

═══════════════════════════════════════════════════════════════
PASO 6 — APLICAR CAMBIOS DE ESTRUCTURA
═══════════════════════════════════════════════════════════════
Para los cambios de estructura listados en cada migración (ej. envolver
el texto de un botón en <span class="btn-label">):
  - Identificá los matches en sections/snippets/templates.
  - Si el match es claro (un solo nodo de texto, contenido literal),
    aplicá el cambio.
  - Si el match es ambiguo (íconos hermanos, contenido dinámico,
    liquid mezclado), NO lo apliques. Registralo en "casos ambiguos"
    del reporte con archivo+línea para que lo revise manualmente.

═══════════════════════════════════════════════════════════════
PASO 7 — APLICAR CAMBIOS DE INLINE-STYLE
═══════════════════════════════════════════════════════════════
Para los renames de inline-style a CSS variables (ej.
style="background: ..." → style="--btn-bg: ..."), aplicá lo evidente
y reportá lo dudoso como caso ambiguo.

═══════════════════════════════════════════════════════════════
PASO 8 — SETTINGS NUEVOS
═══════════════════════════════════════════════════════════════
Para cada migración que liste settings nuevos:
  - Sumalos a `config/settings_schema.json` (en el panel "Amatora —
    Diseño base" si existe, o agregá el panel completo si no).
  - Si un id ya existe en el schema, NO lo dupliques. Avisá en el
    reporte.

═══════════════════════════════════════════════════════════════
PASO 9 — SNIPPETS REGISTRADOS EN theme.liquid
═══════════════════════════════════════════════════════════════
Si una migración pide registrar un snippet nuevo en theme.liquid (ej.
{% render 'amatora-add-to-cart' %}), verificá si ya está; si no,
agregalo en la posición que indique la migración (típicamente antes
de </body>).

═══════════════════════════════════════════════════════════════
PASO 10 — SINCRONIZAR EL SKILL
═══════════════════════════════════════════════════════════════
Sincronizá `skill/SKILL.md` y `skill/reference/*` del repo a:
  ~/.claude/skills/amatora-theme-builder/

Backup previo a:
  ~/.claude/skills/amatora-theme-builder.bak.<timestamp>

═══════════════════════════════════════════════════════════════
PASO 11 — REPORTE FINAL
═══════════════════════════════════════════════════════════════
Mostrame en este formato:

  Versión: <antes>  →  <después>
  Migraciones aplicadas:
    - vX.Y.Z: <descripción 1 línea>
  Backups creados:
    - assets/amatora.css.bak.<timestamp>
    - assets/amatora.js.bak.<timestamp>
    - config/settings_schema.json.bak.<timestamp>
    - <cada section/snippet tocado>.bak.<timestamp>
  Archivos del sistema actualizados:
    - assets/amatora.css, amatora.js, AMATORA_VERSION
    - snippets/* (si aplica)
  Renames aplicados:
    - sections/<archivo>: N reemplazos
    - snippets/<archivo>: N reemplazos
    Total: N en N archivos.
  Cambios de estructura aplicados:
    - sections/<archivo>:<linea> — descripción
  Casos ambiguos (revisión humana requerida):
    - sections/<archivo>:<linea> — qué se encontró y por qué no se tocó
  Settings nuevos agregados al schema:
    - <id 1>, <id 2>, ...
  Settings que ya existían (no duplicados):
    - <id> (en panel "<nombre>")
  Skill sincronizado en ~/.claude/skills/amatora-theme-builder/
  Próximos pasos manuales:
    - Revisar los casos ambiguos arriba
    - Probar el theme en preview
    - Una vez confirmado, borrar los .bak

REGLAS:
- NO commitees ni pushees. Yo reviso y commiteo.
- Si un archivo .liquid queda con sintaxis inválida después de tu edit,
  rollback ese archivo desde el backup y reportalo como caso ambiguo.
- Si encontrás una clase tipo .btn-foo que no es de Amatora, NO la toques.
- Conservá los .bak hasta que yo confirme que todo funciona.
- Si en cualquier paso un find/replace tiene >50 matches en un archivo,
  parate y mostrame el archivo: probablemente hay algo raro.
```
