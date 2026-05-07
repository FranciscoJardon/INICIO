<#
.SYNOPSIS
  Instalador todo-en-uno de Amatora para un theme Shopify.

.DESCRIPTION
  Por default (sin parámetros) hace dos cosas:
    1. Instala la skill amatora-theme-builder en .claude/skills/ del proyecto
       (le enseña a Claude Code las convenciones del sistema).
    2. Instala el sistema en el theme:
       - assets/amatora.css, amatora.js, AMATORA_VERSION
       - snippets/amatora-tokens.liquid, amatora-add-to-cart.liquid
       - sections/banner-amatora.liquid
       - RESCATA los colores ya configurados en el customizer del theme
         (settings_data.json, soportando color_scheme_group de Dawn 2.0+)
         y los inyecta como defaults del panel Amatora antes del merge.
       - merge del panel de settings en config/settings_schema.json
       - inserción de tags en layout/theme.liquid (CSS, JS, snippets)

  Idempotente: si ya hay tags Amatora en theme.liquid o panel en el schema,
  no los duplica. Hace backups con timestamp antes de modificar.

  Ejecución pública (one-liner):
    iex (iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content

.PARAMETER SkillOnly
  Solo instala la skill (paso 1). No toca assets, snippets, sections,
  layout/theme.liquid ni config/settings_schema.json. Usar cuando el
  cliente tiene su propio framework CSS/JS y solo quiere que Claude Code
  conozca las convenciones de Amatora.

.PARAMETER Force
  Si el theme ya tiene Amatora instalado (existe assets/AMATORA_VERSION),
  por default el script aborta. Con -Force, sobrescribe igual.

.EXAMPLE
  iex (iwr ".../install.ps1" -UseBasicParsing).Content

  Default — instala skill + sistema completo.

.EXAMPLE
  & ([scriptblock]::Create((iwr ".../install.ps1" -UseBasicParsing).Content)) -SkillOnly

  Solo instala la skill, sin tocar el theme.
#>
param(
  [switch]$SkillOnly,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoBase = "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main"
$projectRoot = (Get-Location).Path
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Get-AsLF {
  param([string]$Path)
  $resp = Invoke-WebRequest -Uri "$repoBase/$Path" -UseBasicParsing
  return ($resp.Content -replace "`r`n", "`n" -replace "`r", "`n")
}
function Set-FileLF {
  param([string]$Dest, [string]$Content)
  $dir = Split-Path -Parent $Dest
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($Dest, $Content, $utf8NoBom)
}

# ============================================================
# FASE 1 — SKILL (siempre se instala)
# ============================================================
Write-Host ""
Write-Host "=== Instalando skill amatora-theme-builder ==="
$skillTarget = Join-Path $projectRoot ".claude\skills\amatora-theme-builder"
if (Test-Path $skillTarget) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $bak = "$skillTarget.bak.$stamp"
  Write-Host "==> Backup skill anterior: $bak"
  Rename-Item $skillTarget $bak
}
New-Item -ItemType Directory -Force -Path $skillTarget | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $skillTarget "reference") | Out-Null

$skillFiles = @(
  @{ src = "skill/SKILL.md";                          dest = "SKILL.md" },
  @{ src = "skill/reference/file-tree.md";            dest = "reference/file-tree.md" },
  @{ src = "skill/reference/performance.md";          dest = "reference/performance.md" },
  @{ src = "skill/reference/section-template.liquid"; dest = "reference/section-template.liquid" },
  @{ src = "skill/reference/slider-api.md";           dest = "reference/slider-api.md" },
  @{ src = "skill/reference/system-overview.md";      dest = "reference/system-overview.md" }
)
foreach ($f in $skillFiles) {
  Write-Host "==> $($f.src)"
  Set-FileLF -Dest (Join-Path $skillTarget $f.dest) -Content (Get-AsLF -Path $f.src)
}
Write-Host "==> Skill instalada en .claude/skills/amatora-theme-builder/"

if ($SkillOnly) {
  Write-Host ""
  Write-Host "=== LISTO (modo SkillOnly) ==="
  Write-Host "    Skill instalada. NO se tocó assets/, snippets/, sections/, layout/, config/."
  Write-Host "    Reiniciá Claude Code para que cargue la skill."
  return
}

# ============================================================
# FASE 2 — SISTEMA (default)
# ============================================================
Write-Host ""
Write-Host "=== Verificando que es un theme Shopify ==="
$required = @("assets", "config", "layout", "sections", "snippets")
foreach ($d in $required) {
  if (-not (Test-Path (Join-Path $projectRoot $d))) {
    throw "Falta carpeta '$d/'. ¿Estás parado en la raíz de un theme Shopify? Si solo querés la skill, corré con -SkillOnly."
  }
}
Write-Host "==> Theme Shopify detectado"

# Detectar Amatora ya instalado
$versionFile = Join-Path $projectRoot "assets/AMATORA_VERSION"
if ((Test-Path $versionFile) -and (-not $Force)) {
  $currentVersion = (Get-Content $versionFile -Raw).Trim()
  Write-Warning "El theme ya tiene Amatora (versión $currentVersion)."
  Write-Warning "Para sobrescribir, re-corré con -Force."
  Write-Warning "Para actualizar respetando customizaciones, usá el prompt update.md."
  return
}

Write-Host ""
Write-Host "=== Instalando sistema en el theme ==="
$themeLiquid = Join-Path $projectRoot "layout/theme.liquid"
$schemaPath = Join-Path $projectRoot "config/settings_schema.json"
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if (Test-Path $themeLiquid) {
  Copy-Item $themeLiquid "$themeLiquid.bak.$stamp"
  Write-Host "==> Backup: layout/theme.liquid.bak.$stamp"
}
if (Test-Path $schemaPath) {
  Copy-Item $schemaPath "$schemaPath.bak.$stamp"
  Write-Host "==> Backup: config/settings_schema.json.bak.$stamp"
}

# Descargar archivos del sistema
$systemFiles = @(
  @{ src = "system/amatora.css";                  dest = "assets/amatora.css" },
  @{ src = "system/amatora.js";                   dest = "assets/amatora.js" },
  @{ src = "system/AMATORA_VERSION";              dest = "assets/AMATORA_VERSION" },
  @{ src = "system/amatora-tokens.liquid";        dest = "snippets/amatora-tokens.liquid" },
  @{ src = "system/amatora-add-to-cart.liquid";   dest = "snippets/amatora-add-to-cart.liquid" },
  @{ src = "system/banner-amatora.liquid";        dest = "sections/banner-amatora.liquid" }
)
foreach ($f in $systemFiles) {
  Write-Host "==> $($f.src)"
  Set-FileLF -Dest (Join-Path $projectRoot $f.dest) -Content (Get-AsLF -Path $f.src)
}

# ===== Editar theme.liquid (idempotente) =====
Write-Host ""
Write-Host "=== Editando layout/theme.liquid ==="
$themeContent = [System.IO.File]::ReadAllText($themeLiquid) -replace "`r`n", "`n" -replace "`r", "`n"

$hasCss    = $themeContent -match "amatora\.css"
$hasJs     = $themeContent -match "amatora\.js"
$hasTokens = $themeContent -match "amatora-tokens"
$hasAtc    = $themeContent -match "amatora-add-to-cart"

# Construir bloque para </head>
$headBlock = ""
if (-not $hasCss)    { $headBlock += "  {{ 'amatora.css' | asset_url | stylesheet_tag }}`n" }
if (-not $hasTokens) { $headBlock += "  {% render 'amatora-tokens' %}`n" }
if (-not $hasJs)     { $headBlock += "  <script src=`"{{ 'amatora.js' | asset_url }}`" defer></script>`n" }

if ($headBlock -ne "") {
  if ($themeContent -notmatch "</head>") { throw "layout/theme.liquid no tiene </head>. ¿Theme corrupto?" }
  $headReplacement = "`n" + $headBlock + '$1</head>'
  $themeContent = $themeContent -replace "(\s*)</head>", $headReplacement
  Write-Host "==> Insertados tags antes de </head>"
} else {
  Write-Host "==> </head> ya tenía los tags Amatora — sin cambios"
}

# Bloque para </body>
if (-not $hasAtc) {
  if ($themeContent -notmatch "</body>") { throw "layout/theme.liquid no tiene </body>. ¿Theme corrupto?" }
  $bodyReplacement = "`n  {% render 'amatora-add-to-cart' %}`n" + '$1</body>'
  $themeContent = $themeContent -replace "(\s*)</body>", $bodyReplacement
  Write-Host "==> Insertado amatora-add-to-cart antes de </body>"
} else {
  Write-Host "==> </body> ya tenía amatora-add-to-cart — sin cambios"
}

Set-FileLF -Dest $themeLiquid -Content $themeContent

# ===== Mergear schema (con rescate de colores del theme) =====
Write-Host ""
Write-Host "=== Mergeando settings_schema.json ==="
$existingSchema = [System.IO.File]::ReadAllText($schemaPath)
$rescued = [ordered]@{}

if ($existingSchema -match '"name"\s*:\s*"Amatora') {
  Write-Host "==> El schema ya tiene un panel 'Amatora —...' — sin cambios"
  Write-Host "    (Skip rescate de colores: el panel ya está, los colores ya están configurados)"
} else {
  $patchContent = Get-AsLF -Path "system/settings_schema.amatora.json"

  # ----- Rescate de colores del theme -----
  Write-Host ""
  Write-Host "=== Rescatando colores del theme ==="
  $dataPath = Join-Path $projectRoot "config/settings_data.json"
  if (-not (Test-Path $dataPath)) {
    Write-Host "==> No existe config/settings_data.json — usando defaults de Amatora."
  } else {
    try {
      $themeSchema = Get-Content $schemaPath -Raw | ConvertFrom-Json
      $themeData   = Get-Content $dataPath   -Raw | ConvertFrom-Json

      # Resolver "current": objeto de valores, o nombre de preset (string) → buscar en presets
      $currentVals = $themeData.current
      if ($currentVals -is [string]) {
        $currentVals = $themeData.presets.$currentVals
      }

      # Recolectar (theme_id → color_value) en orden de aparición en el schema
      $themeColors = [ordered]@{}
      foreach ($panel in $themeSchema) {
        if ($null -eq $panel.settings) { continue }
        foreach ($s in $panel.settings) {
          if (-not $s.id) { continue }
          # Caso clásico: setting tipo color
          if ($s.type -eq 'color') {
            $val = $currentVals.($s.id)
            if ($val) { $themeColors[$s.id] = $val }
          }
          # Dawn 2.0+: color_scheme_group → primera scheme definida
          if ($s.type -eq 'color_scheme_group' -and $s.definition) {
            $groupVal = $currentVals.($s.id)
            if (-not $groupVal) { continue }
            $schemes = @($groupVal.PSObject.Properties)
            if ($schemes.Count -eq 0) { continue }
            $firstScheme = $schemes[0].Value
            if (-not $firstScheme.settings) { continue }
            foreach ($field in $s.definition) {
              if (-not $field.id) { continue }
              if ($field.type -eq 'color' -or $field.type -eq 'color_background') {
                $fieldVal = $firstScheme.settings.($field.id)
                if ($fieldVal -and $fieldVal -ne '') { $themeColors[$field.id] = $fieldVal }
              }
            }
          }
        }
      }

      if ($themeColors.Count -eq 0) {
        Write-Host "==> No se encontraron colores en el schema/data del theme."
      } else {
        # Mapeo amatora_id → patrones (primer match gana, en orden)
        $mapping = [ordered]@{
          'am_primary'     = @('accent_1','primary','main','brand','principal','color_button','button_background','button')
          'am_secondary'   = @('accent_2','secondary')
          'am_text'        = @('text','foreground','body_text','color_body')
          'am_bg_light'    = @('background_1','background','bg_primary')
          'am_accent'      = @('highlight')
          'btn_primary_bg' = @('button_background','button_bg','button')
          'btn_primary_fg' = @('button_text','button_label','button_fg','color_button_text')
        }

        foreach ($amaId in $mapping.Keys) {
          foreach ($pattern in $mapping[$amaId]) {
            $matchKey = @($themeColors.Keys | Where-Object { $_ -like "*$pattern*" })[0]
            if ($matchKey) {
              $rescued[$amaId] = @{ value = $themeColors[$matchKey]; source = $matchKey }
              break
            }
          }
        }

        # Fallback: btn_primary_bg = am_primary si no hubo match propio
        if (-not $rescued.Contains('btn_primary_bg') -and $rescued.Contains('am_primary')) {
          $rescued['btn_primary_bg'] = @{ value = $rescued['am_primary'].value; source = '(fallback de am_primary)' }
        }

        # Mutar $patchContent: reemplazar el "default" de cada id rescatado
        foreach ($amaId in $rescued.Keys) {
          $newDefault = $rescued[$amaId].value
          $rxPattern  = '("id"\s*:\s*"' + [regex]::Escape($amaId) + '"[^}]*?"default"\s*:\s*)"[^"]*"'
          $rxReplace  = '$1"' + $newDefault + '"'
          $patchContent = [regex]::Replace($patchContent, $rxPattern, $rxReplace)
        }

        # Tabla
        Write-Host ""
        Write-Host "    | ID Amatora      | Valor rescatado | Origen"
        Write-Host "    |-----------------|-----------------|--------------------------"
        foreach ($k in $rescued.Keys) {
          $v = $rescued[$k]
          Write-Host ("    | {0,-15} | {1,-15} | {2}" -f $k, $v.value, $v.source)
        }
        Write-Host ""
        Write-Host "==> $($rescued.Count) defaults reemplazados antes del merge."
      }
    } catch {
      Write-Warning "Error parseando JSON del theme: $($_.Exception.Message)"
      Write-Warning "Se usarán los defaults de Amatora."
    }
  }

  # ----- Append del patch al schema -----
  $lastBracket = $existingSchema.LastIndexOf(']')
  if ($lastBracket -lt 0) {
    throw "config/settings_schema.json no parece un array JSON válido."
  }
  $beforeBracket = $existingSchema.Substring(0, $lastBracket).TrimEnd()
  $afterBracket = $existingSchema.Substring($lastBracket)
  $needsComma = $beforeBracket -match '\}\s*$'
  $separator = if ($needsComma) { "," } else { "" }
  $newSchema = "$beforeBracket$separator`n$patchContent`n$afterBracket"
  Set-FileLF -Dest $schemaPath -Content $newSchema
  Write-Host "==> Panel 'Amatora — Diseño base' agregado al schema"
}

# ===== Reporte final =====
$installedVersion = (Get-Content $versionFile -Raw).Trim()
Write-Host ""
Write-Host "=== LISTO ==="
Write-Host "    Versión Amatora: $installedVersion"
Write-Host ""
Write-Host "    Archivos creados:"
Write-Host "      assets/amatora.css, amatora.js, AMATORA_VERSION"
Write-Host "      snippets/amatora-tokens.liquid, amatora-add-to-cart.liquid"
Write-Host "      sections/banner-amatora.liquid"
Write-Host "      .claude/skills/amatora-theme-builder/SKILL.md + reference/"
Write-Host ""
Write-Host "    Archivos modificados (con .bak.$stamp):"
Write-Host "      layout/theme.liquid"
Write-Host "      config/settings_schema.json"
if ($rescued -and $rescued.Count -gt 0) {
  Write-Host ""
  Write-Host "    Colores rescatados del theme: $($rescued.Count)"
}
Write-Host ""
Write-Host "    Próximos pasos:"
Write-Host "      1. Reiniciar Claude Code en este proyecto."
Write-Host "      2. Abrir customizer de Shopify."
Write-Host "      3. Configurar colores y fuente en panel 'Amatora — Diseño base'."
Write-Host "      4. Agregar 'Banner Amatora' a la home como smoke-test."
