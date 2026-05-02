# Prompt — IMPLEMENT

**Cuándo usar:** theme custom existente en producción que NO tiene Amatora todavía. Hay código del cliente que NO se debe pisar. El prompt audita primero, reporta conflictos, espera confirmación humana, y solo después instala.

**Diferencia con `init.md`:** init asume theme limpio y ejecuta directo. Implement nunca toca nada hasta que vos confirmes que el reporte de auditoría se ve bien.

**Cómo usar:** parate en la raíz del theme y pegá todo el bloque debajo.

---

```
Implementá Amatora en este theme Shopify custom desde:
  Repo:     https://github.com/FranciscoJardon/INICIO
  Raw base: https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/

Cuando el prompt diga "descargá del repo <archivo>", construí la URL así:
  <Raw base> + <path en el repo>
Ejemplo: system/amatora.css
  → https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/system/amatora.css

Este theme ya está en producción y NO tiene Amatora. Hay código del cliente
que NO se debe pisar. Trabajá en modo dry-run primero, reportá conflictos,
y solo procedé cuando yo confirme.

═══════════════════════════════════════════════════════════════
FASE 1 — AUDITORÍA (NO TOQUES NADA)
═══════════════════════════════════════════════════════════════
Recorré el theme y reportá:

  1. Estado de carpetas estándar (assets/, config/, layout/, sections/,
     snippets/, templates/).

  2. ¿Existe `assets/AMATORA_VERSION`?
       - Si SÍ: parate. Esto es modo update, no implement.
       - Si NO: continuar.

  3. ¿Existen archivos con nombres que voy a instalar?
       - assets/amatora.css, assets/amatora.js
       - snippets/amatora-tokens.liquid, snippets/amatora-add-to-cart.liquid
       - sections/banner-amatora.liquid
     Para cada conflicto: nombre + tamaño + primeras 5 líneas.

  4. ¿`config/settings_schema.json` ya tiene settings con estos ids?
       am_primary, am_secondary, am_accent, am_text, am_bg_light,
       am_font_heading, am_font_body, btn_primary_bg, btn_primary_fg,
       btn_radius, btn_fs, add_to_cart_with_variants
     Para cada coincidencia: id + dónde está (qué panel) + valor default
     actual.

  5. ¿`layout/theme.liquid` ya carga algún CSS o JS con nombre similar
     a amatora? (busca substring "amatora" en el archivo). Si sí, mostrá
     las líneas.

  6. ¿Hay clases CSS en `assets/*.css` que terminen en `-amatora` y NO
     vengan de amatora.css? Esas son potencial duplicación de utilities.
     Listalas con archivo+línea.

  7. ¿Hay sliders existentes en sections/snippets que usen Swiper, Slick,
     Glide, Splide o algún slider custom? Listá los archivos. (Después
     de implementar Amatora, esos slider deberían migrar a
     [data-amatora-slider], pero esa migración es manual y posterior.)

Mostrame TODO lo anterior como reporte estructurado y PARATE.
NO descargues archivos del repo todavía. NO edites nada.

═══════════════════════════════════════════════════════════════
FASE 2 — ESPERAR CONFIRMACIÓN
═══════════════════════════════════════════════════════════════
Esperá a que yo te diga explícitamente "procedé". Si tengo conflictos
del paso 4, te voy a decir cuáles ids del cliente conservar y cuáles
reemplazar.

═══════════════════════════════════════════════════════════════
FASE 3 — INSTALACIÓN (cuando yo apruebe)
═══════════════════════════════════════════════════════════════
Solo si te dije "procedé". Hacé los mismos pasos del prompt INIT (2-7),
con dos diferencias críticas:

  - PASO 5 (schema): para CADA setting con id en conflicto, NO sobreescribas.
    Conservá el del cliente. Reportá cuál se conservó vs cuál se agregó.

  - PASO 7 (skill): si ~/.claude/skills/amatora-theme-builder/ ya existe,
    hacé backup como en el INIT y procedé.

  - PASO EXTRA: hacé backup automático de los archivos del cliente que
    vas a tocar:
      cp layout/theme.liquid          layout/theme.liquid.bak.<timestamp>
      cp config/settings_schema.json  config/settings_schema.json.bak.<timestamp>

═══════════════════════════════════════════════════════════════
FASE 4 — REPORTE FINAL
═══════════════════════════════════════════════════════════════
Mismo formato que INIT, más:
  - Backups creados (con paths exactos)
  - Settings que se conservaron del cliente (por conflicto de id)
  - Sliders custom detectados que requieren migración manual posterior
  - Lista de archivos del cliente con clases `-amatora` previas que
    ahora podrían chocar con amatora.css

REGLAS:
- NO commitees ni pushees.
- NO toques sections/*.liquid existentes (excepto el banner que instalás).
- NO toques snippets/*.liquid del cliente.
- NO toques assets/*.css del cliente (solo agregás amatora.css al lado).
- NO modifiques scripts JS del cliente.
- Conservá los .bak hasta que yo confirme que todo funciona.
```
