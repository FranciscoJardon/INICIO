<#
.SYNOPSIS
  Instala/actualiza el skill amatora-theme-builder en Claude Code.

.DESCRIPTION
  Por default instala la skill EN EL PROYECTO actual (en `.claude/skills/`
  de la carpeta donde estés parado). Eso hace que la skill viaje con el
  repo del proyecto — al clonar en otra máquina, la skill viene incluida.

  Si pasás -Global, instala globalmente en ~/.claude/skills/ y queda
  activa en CUALQUIER proyecto donde abras Claude Code.

  Si pasás -ProjectPath <ruta>, instala en .claude/skills/ de esa ruta
  específica (útil para instalar en otro proyecto sin estar parado ahí).

  Hace siempre:
    1. Verifica/actualiza ~/amatora-system (clone local del sistema).
    2. Backup del skill anterior si existe.
    3. Copia skill/SKILL.md y skill/reference/* al destino, convirtiendo
       line endings a LF (necesario para que el parser YAML del frontmatter
       lea bien el campo description).

.EXAMPLE
  .\sync-amatora-skill.ps1

  Sin argumentos: instala en .claude/skills/ del directorio actual
  (modo por-proyecto, default).

.EXAMPLE
  .\sync-amatora-skill.ps1 -Global

  Instala globalmente en ~/.claude/skills/ — la skill queda activa
  en cualquier proyecto.

.EXAMPLE
  .\sync-amatora-skill.ps1 -ProjectPath "C:\Users\javie\Desktop\olaa"

  Instala en C:\Users\javie\Desktop\olaa\.claude\skills\ aunque no
  estés parado en esa carpeta.

.PARAMETER Global
  Si está presente, instala globalmente en ~/.claude/skills/ en vez
  de en el proyecto.

.PARAMETER ProjectPath
  Ruta del proyecto donde instalar (override del directorio actual).
  Si NO se pasa y -Global no está activo, usa el directorio actual.
#>
param(
  [switch]$Global,
  [string]$ProjectPath
)

$ErrorActionPreference = "Stop"

# 1. Sistema Amatora local
$amatoraRoot = "$env:USERPROFILE\amatora-system"
if (-not (Test-Path $amatoraRoot)) {
  Write-Host "==> Clonando sistema Amatora a $amatoraRoot"
  git clone https://github.com/FranciscoJardon/INICIO.git $amatoraRoot
  if ($LASTEXITCODE -ne 0) { throw "git clone Amatora falló" }
} else {
  Write-Host "==> Actualizando sistema Amatora (git pull)"
  git -C $amatoraRoot pull
  if ($LASTEXITCODE -ne 0) { throw "git pull Amatora falló" }
}

# 2. Verificar que el skill existe en el clone
$skillSource = Join-Path $amatoraRoot "skill"
if (-not (Test-Path "$skillSource\SKILL.md")) {
  throw "No encontré $skillSource\SKILL.md. ¿Está bien clonado el repo?"
}

# 3. Determinar destino
if ($Global) {
  $skillTarget = "$env:USERPROFILE\.claude\skills\amatora-theme-builder"
  $modeLabel = "GLOBAL ($env:USERPROFILE\.claude\skills\)"
} else {
  if ($ProjectPath) {
    $base = (Resolve-Path $ProjectPath -ErrorAction Stop).Path
  } else {
    $base = (Get-Location).Path
  }
  $skillTarget = Join-Path $base ".claude\skills\amatora-theme-builder"
  $modeLabel = "PROYECTO ($base\.claude\skills\)"
}
Write-Host "==> Modo: $modeLabel"

# 4. Backup del skill instalado si existe
if (Test-Path $skillTarget) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $bak = "$skillTarget.bak.$stamp"
  Write-Host "==> Backup del skill anterior: $bak"
  Rename-Item $skillTarget $bak
}

# 5. Copiar (forzando LF — el parser YAML del frontmatter de SKILL.md
#    falla con CRLF, lo que deja la skill cargada sin descripción)
New-Item -ItemType Directory -Force -Path $skillTarget | Out-Null

function Copy-AsLF {
  param([string]$Source, [string]$Dest)
  $content = [System.IO.File]::ReadAllText($Source)
  $contentLF = $content -replace "`r`n", "`n" -replace "`r", "`n"
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($Dest, $contentLF, $utf8NoBom)
}

Copy-AsLF "$skillSource\SKILL.md" "$skillTarget\SKILL.md"

$refTarget = Join-Path $skillTarget "reference"
New-Item -ItemType Directory -Force -Path $refTarget | Out-Null
Get-ChildItem "$skillSource\reference" -File | ForEach-Object {
  Copy-AsLF $_.FullName (Join-Path $refTarget $_.Name)
}

Write-Host "==> Skill instalado (con LF endings) en $skillTarget"

# 6. Verificación
$installedSkill = Join-Path $skillTarget "SKILL.md"
$sourceSize = (Get-Item "$skillSource\SKILL.md").Length
$installedSize = (Get-Item $installedSkill).Length
if ($sourceSize -ne $installedSize) {
  Write-Warning "Tamaños distintos: source=$sourceSize, installed=$installedSize"
} else {
  Write-Host "==> Verificado: SKILL.md sincronizado ($installedSize bytes)"
}

Write-Host ""
Write-Host "==> LISTO"
if ($Global) {
  Write-Host "    Skill activa en CUALQUIER proyecto donde abras Claude Code."
} else {
  Write-Host "    Skill activa SOLO cuando abrás Claude Code en:"
  Write-Host "      $base"
  Write-Host "    Si commiteás .claude/skills/ al repo del proyecto, otros"
  Write-Host "    devs reciben la skill al clonar."
}
