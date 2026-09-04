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

  Default - instala skill + sistema completo.

.EXAMPLE
  & ([scriptblock]::Create((iwr ".../install.ps1" -UseBasicParsing).Content)) -SkillOnly

  Solo instala la skill, sin tocar el theme.

.PARAMETER ToolsOnly
  Modo NO-INVASIVO. Instala la skill + copia los assets (amatora.css con
  rescate de colores, amatora.js, AMATORA_VERSION) en assets/ del theme,
  pero NO toca layout/theme.liquid ni config/settings_schema.json. Tampoco
  copia los snippets ni la sección banner-amatora.
  El dev integra a mano cuando esté listo agregando 2 tags a theme.liquid.
  Útil cuando querés probar Amatora en un theme en producción sin riesgo.

.EXAMPLE
  & ([scriptblock]::Create((iwr ".../install.ps1" -UseBasicParsing).Content)) -ToolsOnly

  Copia los archivos a assets/ pero no edita nada del theme.
#>
param(
  [switch]$SkillOnly,
  [switch]$ToolsOnly,
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
# FASE 1 - SKILL (siempre se instala)
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
  @{ src = "skill/reference/buttons.md";              dest = "reference/buttons.md" },
  @{ src = "skill/reference/images.md";               dest = "reference/images.md" },
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
# FASE 2 - SISTEMA (default)
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
  Write-Warning "Para sobrescribir, re-corré con -Force (hace backup .bak.timestamp antes)."
  Write-Warning "Si el theme tiene customizaciones del cliente, revisá MIGRATIONS.md y aplicá renames a mano antes de pisar."
  return
}

# ============================================================
# FASE 2.A - TOOLSONLY (no invasivo: solo copia assets/)
# ============================================================
if ($ToolsOnly) {
  Write-Host ""
  Write-Host "=== Modo ToolsOnly - copiando solo a assets/, sin tocar theme.liquid ni schema ==="

  # Copiar amatora.js + AMATORA_VERSION
  foreach ($f in @(
    @{ src = "system/amatora.js";      dest = "assets/amatora.js" },
    @{ src = "system/AMATORA_VERSION"; dest = "assets/AMATORA_VERSION" }
  )) {
    Write-Host "==> $($f.src)"
    Set-FileLF -Dest (Join-Path $projectRoot $f.dest) -Content (Get-AsLF -Path $f.src)
  }

  # amatora.css con rescate de colores (en memoria, después se escribe)
  Write-Host "==> system/amatora.css (con rescate de colores)"
  $amatoraCssContent = Get-AsLF -Path "system/amatora.css"
  $rescued = [ordered]@{}
  $dataPath = Join-Path $projectRoot "config/settings_data.json"
  $schemaPath = Join-Path $projectRoot "config/settings_schema.json"

  if (-not (Test-Path $dataPath) -or -not (Test-Path $schemaPath)) {
    Write-Host "==> No existe config/settings_data.json o settings_schema.json - amatora.css se instala con los defaults."
  } else {
    try {
      $themeSchema = Get-Content $schemaPath -Raw | ConvertFrom-Json
      $themeData   = Get-Content $dataPath   -Raw | ConvertFrom-Json
      $currentVals = $themeData.current
      if ($currentVals -is [string]) { $currentVals = $themeData.presets.$currentVals }

      $themeColors = [ordered]@{}
      foreach ($panel in $themeSchema) {
        if ($null -eq $panel.settings) { continue }
        foreach ($s in $panel.settings) {
          if (-not $s.id) { continue }
          if ($s.type -eq 'color') {
            $val = $currentVals.($s.id)
            if ($val) { $themeColors[$s.id] = $val }
          }
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

      if ($themeColors.Count -gt 0) {
        $mapping = [ordered]@{
          'primary'   = @('accent_1','primary','main','brand','principal','color_button','button_background','button')
          'secondary' = @('accent_2','secondary')
          'text'      = @('text','foreground','body_text','color_body')
          'bg_light'  = @('background_1','background','bg_primary')
        }
        $cssVarMapping = [ordered]@{
          'primary'   = @('--am-color-primary', '--am-color-primary-hover')
          'secondary' = @('--am-color-secondary', '--am-color-secondary-hover')
          'text'      = @('--am-text-primary', '--am-text-secondary')
          'bg_light'  = @('--am-bg-light')
        }
        foreach ($role in $mapping.Keys) {
          foreach ($pattern in $mapping[$role]) {
            $matchKey = @($themeColors.Keys | Where-Object { $_ -like "*$pattern*" })[0]
            if ($matchKey) {
              $rescued[$role] = @{ value = $themeColors[$matchKey]; source = $matchKey }
              break
            }
          }
        }
        foreach ($role in $rescued.Keys) {
          $newColor = $rescued[$role].value
          foreach ($cssVar in $cssVarMapping[$role]) {
            $rxPattern = '(' + [regex]::Escape($cssVar) + '\s*:\s*)#[0-9a-fA-F]{3,8}'
            $rxReplace = '$1' + $newColor
            $amatoraCssContent = [regex]::Replace($amatoraCssContent, $rxPattern, $rxReplace)
          }
        }
        Write-Host ""
        Write-Host "    Colores rescatados del theme y escritos en assets/amatora.css:"
        foreach ($k in $rescued.Keys) {
          $v = $rescued[$k]
          Write-Host ("    - {0,-9} -> {1} (de '{2}')" -f $k, $v.value, $v.source)
        }
      }
    } catch {
      Write-Warning "Error parseando JSON del theme: $($_.Exception.Message). amatora.css se instala con los defaults."
    }
  }

  Set-FileLF -Dest (Join-Path $projectRoot "assets/amatora.css") -Content $amatoraCssContent

  $installedVersion = (Get-Content $versionFile -Raw).Trim()
  Write-Host ""
  Write-Host "=== LISTO (modo ToolsOnly) ==="
  Write-Host "    Versión Amatora: $installedVersion"
  Write-Host ""
  Write-Host "    Copiado a assets/:"
  Write-Host "      amatora.css  (con colores del theme rescatados si se encontraron)"
  Write-Host "      amatora.js"
  Write-Host "      AMATORA_VERSION"
  Write-Host ""
  Write-Host "    NO se tocó: layout/theme.liquid, config/settings_schema.json,"
  Write-Host "                snippets/, sections/"
  Write-Host ""
  Write-Host "    Para activar Amatora cuando estés listo, agregá MANUALMENTE a"
  Write-Host "    layout/theme.liquid justo antes de </head>:"
  Write-Host ""
  Write-Host "      {{ 'amatora.css' | asset_url | stylesheet_tag }}"
  Write-Host "      <script src=`"{{ 'amatora.js' | asset_url }}`" defer></script>"
  Write-Host ""
  Write-Host "    Mientras los 2 tags no estén en theme.liquid, el theme funciona"
  Write-Host "    exactamente como antes - Amatora está disponible pero inactivo."
  Write-Host ""
  Write-Host "    En este modo no hay panel en el customizer: la paleta se edita en assets/amatora.css sección 2."
  Write-Host "    Para tener el panel 'Configuraciones Amatora', corre la instalación completa (sin -ToolsOnly)."
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
# amatora.css se mantiene en memoria - primero se rescatan los colores del theme
# y SE MUTA el contenido del CSS, recién después se escribe a assets/.
$systemFiles = @(
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

# amatora.css va aparte: se descarga, se mutan los colores del theme, se escribe.
Write-Host "==> system/amatora.css (con rescate de colores)"
$amatoraCssContent = Get-AsLF -Path "system/amatora.css"

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
  Write-Host "==> </head> ya tenía los tags Amatora - sin cambios"
}

# Bloque para </body>
if (-not $hasAtc) {
  if ($themeContent -notmatch "</body>") { throw "layout/theme.liquid no tiene </body>. ¿Theme corrupto?" }
  $bodyReplacement = "`n  {% render 'amatora-add-to-cart' %}`n" + '$1</body>'
  $themeContent = $themeContent -replace "(\s*)</body>", $bodyReplacement
  Write-Host "==> Insertado amatora-add-to-cart antes de </body>"
} else {
  Write-Host "==> </body> ya tenía amatora-add-to-cart - sin cambios"
}

Set-FileLF -Dest $themeLiquid -Content $themeContent

# ===== Rescate de colores del theme =====
# El installer detecta los colores configurados en el theme y los escribe en
# dos lugares: como defaults de fábrica en assets/amatora.css (sección 2) y
# como "default" de los settings del panel "Configuraciones Amatora" (más abajo).
# Así el customizer arranca con la paleta real del cliente.
Write-Host ""
Write-Host "=== Rescatando colores del theme ==="
$rescued = [ordered]@{}
$dataPath = Join-Path $projectRoot "config/settings_data.json"

if (-not (Test-Path $dataPath)) {
  Write-Host "==> No existe config/settings_data.json - amatora.css se instala con los defaults."
} else {
  try {
    $themeSchema = Get-Content $schemaPath -Raw | ConvertFrom-Json
    $themeData   = Get-Content $dataPath   -Raw | ConvertFrom-Json

    # Resolver "current": objeto de valores, o nombre de preset (string)
    $currentVals = $themeData.current
    if ($currentVals -is [string]) {
      $currentVals = $themeData.presets.$currentVals
    }

    # Recolectar (theme_id -> color_value) en orden de aparición en el schema
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
        # Dawn 2.0+: color_scheme_group -> primera scheme definida
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
      # Mapeo amatora_role -> patrones del theme (primer match gana)
      $mapping = [ordered]@{
        'primary'   = @('accent_1','primary','main','brand','principal','color_button','button_background','button')
        'secondary' = @('accent_2','secondary')
        'text'      = @('text','foreground','body_text','color_body')
        'bg_light'  = @('background_1','background','bg_primary')
      }

      foreach ($role in $mapping.Keys) {
        foreach ($pattern in $mapping[$role]) {
          $matchKey = @($themeColors.Keys | Where-Object { $_ -like "*$pattern*" })[0]
          if ($matchKey) {
            $rescued[$role] = @{ value = $themeColors[$matchKey]; source = $matchKey }
            break
          }
        }
      }

      # Mapeo role -> variables CSS en amatora.css que se mutan
      $cssVarMapping = [ordered]@{
        'primary'   = @('--am-color-primary', '--am-color-primary-hover')
        'secondary' = @('--am-color-secondary', '--am-color-secondary-hover')
        'text'      = @('--am-text-primary', '--am-text-secondary')
        'bg_light'  = @('--am-bg-light')
      }

      # Mutar el contenido de amatora.css en memoria
      foreach ($role in $rescued.Keys) {
        $newColor = $rescued[$role].value
        foreach ($cssVar in $cssVarMapping[$role]) {
          $rxPattern = '(' + [regex]::Escape($cssVar) + '\s*:\s*)#[0-9a-fA-F]{3,8}'
          $rxReplace = '$1' + $newColor
          $amatoraCssContent = [regex]::Replace($amatoraCssContent, $rxPattern, $rxReplace)
        }
      }

      # Tabla
      Write-Host ""
      Write-Host "    | Rol Amatora | Color rescatado | Variables CSS afectadas               | Origen (theme)"
      Write-Host "    |-------------|-----------------|---------------------------------------|----------------"
      foreach ($role in $rescued.Keys) {
        $v = $rescued[$role]
        $vars = $cssVarMapping[$role] -join ', '
        Write-Host ("    | {0,-11} | {1,-15} | {2,-37} | {3}" -f $role, $v.value, $vars, $v.source)
      }
      Write-Host ""
      Write-Host "==> $($rescued.Count) roles mapeados. Las variables se escriben en assets/amatora.css ahora."
    }
  } catch {
    Write-Warning "Error parseando JSON del theme: $($_.Exception.Message)"
    Write-Warning "amatora.css se instala con los defaults."
  }
}

# Escribir amatora.css (con o sin los colores rescatados)
Set-FileLF -Dest (Join-Path $projectRoot "assets/amatora.css") -Content $amatoraCssContent

# ===== Mergear schema (panel "Configuraciones Amatora") =====
Write-Host ""
Write-Host "=== Mergeando settings_schema.json ==="
$patchContent = Get-AsLF -Path "system/settings_schema.amatora.json"

# Los colores rescatados pasan a ser los "default" del panel.
if ($rescued -and $rescued.Count -gt 0) {
  $schemaIdMapping = [ordered]@{
    'primary'   = @('am_color_primary', 'am_color_primary_hover')
    'secondary' = @('am_color_secondary', 'am_color_secondary_hover')
    'text'      = @('am_text_primary', 'am_text_secondary')
    'bg_light'  = @('am_bg_light')
  }
  foreach ($role in $rescued.Keys) {
    $newColor = $rescued[$role].value
    foreach ($id in $schemaIdMapping[$role]) {
      $rxPattern = '("id"\s*:\s*"' + [regex]::Escape($id) + '"[^}]*?"default"\s*:\s*")#[0-9a-fA-F]{3,8}'
      $patchContent = [regex]::Replace($patchContent, $rxPattern, ('$1' + $newColor))
    }
  }
  Write-Host "==> Colores rescatados aplicados como defaults del panel"
}

$existingSchema = [System.IO.File]::ReadAllText($schemaPath)

if ($existingSchema -match '"name"\s*:\s*"(Configuraciones Amatora|Amatora)') {
  # Instalación previa: se quitan los paneles Amatora viejos y se agrega el actual
  # (round-trip JSON; el archivo se reformatea, hay backup .bak.$stamp).
  Write-Host "==> El schema ya tiene un panel Amatora - se reemplaza por 'Configuraciones Amatora'"
  try {
    # PS 5.1: ConvertFrom-Json entrega un array JSON como UN solo objeto (no lo
    # enumera). Se aplana a mano para que la lista de paneles quede plana.
    $parsed = ConvertFrom-Json -InputObject $existingSchema
    $panels = New-Object System.Collections.ArrayList
    foreach ($item in @($parsed)) {
      if ($item -is [System.Array]) { foreach ($sub in $item) { [void]$panels.Add($sub) } }
      else { [void]$panels.Add($item) }
    }
    $kept = New-Object System.Collections.ArrayList
    foreach ($panel in $panels) {
      $n = $panel.name
      if (($n -is [string]) -and ($n -eq 'Configuraciones Amatora' -or $n -like 'Amatora*')) { continue }
      [void]$kept.Add($panel)
    }
    [void]$kept.Add((ConvertFrom-Json -InputObject $patchContent))
    $newSchema = ConvertTo-Json -InputObject $kept.ToArray() -Depth 100
    # ConvertTo-Json escapa acentos y símbolos como é; los devolvemos legibles
    $newSchema = [regex]::Replace($newSchema, '\\u([0-9a-fA-F]{4})', {
      param($m) [string][char][Convert]::ToInt32($m.Groups[1].Value, 16)
    })
    # Verificación antes de escribir: array plano de objetos y theme_info conservado
    if ($newSchema -notmatch '^\s*\[\s*\{') { throw "el schema resultante no es un array plano de paneles" }
    if (($existingSchema -match '"theme_info"') -and ($newSchema -notmatch '"theme_info"')) { throw "se perdió el panel theme_info" }
    Set-FileLF -Dest $schemaPath -Content $newSchema
    Write-Host "==> Panel 'Configuraciones Amatora' actualizado: $($kept.Count) paneles (settings_schema.json reformateado; backup .bak.$stamp)"
  } catch {
    Write-Warning "No pude reemplazar el panel automáticamente: $($_.Exception.Message)"
    Write-Warning "Borra el panel Amatora viejo de config/settings_schema.json y vuelve a correr con -Force."
  }
} else {
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
  Write-Host "==> Panel 'Configuraciones Amatora' agregado al schema"
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
  Write-Host "    Colores rescatados del theme: $($rescued.Count) (en amatora.css y como defaults del panel)"
}
Write-Host ""
Write-Host "    Próximos pasos:"
Write-Host "      1. Reiniciar Claude Code en este proyecto."
Write-Host "      2. Colores, fuentes, botones, sliders y carrito -> customizer de Shopify, panel 'Configuraciones Amatora'."
Write-Host "      3. Agregar 'Banner Amatora' a la home como smoke-test."
