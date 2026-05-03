<#
.SYNOPSIS
  Instala/actualiza el skill amatora-theme-builder en tu Claude Code CLI.

.DESCRIPTION
  Pensado para cuando NO querés instalar el sistema Amatora completo en un
  theme (el cliente tiene su propio repo/framework y no querés tocarlo),
  pero sí querés que Claude Code tenga las convenciones de Amatora
  cargadas como skill.

  Hace tres cosas:
    1. Verifica/actualiza ~/amatora-system (clone local del sistema).
    2. Backup del skill anterior si ya existe.
    3. Copia skill/SKILL.md y skill/reference/* a
       ~/.claude/skills/amatora-theme-builder/.

  Una vez instalado, la skill está activa en CUALQUIER proyecto donde
  abras Claude Code. No está vinculada a una carpeta — es global del CLI.

.EXAMPLE
  .\sync-amatora-skill.ps1

  Sin argumentos. Hace todo automático.
#>
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

# 3. Backup del skill instalado si existe
$skillTarget = "$env:USERPROFILE\.claude\skills\amatora-theme-builder"
if (Test-Path $skillTarget) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $bak = "$skillTarget.bak.$stamp"
  Write-Host "==> Backup del skill anterior: $bak"
  Rename-Item $skillTarget $bak
}

# 4. Crear destino y copiar
New-Item -ItemType Directory -Force -Path $skillTarget | Out-Null
Copy-Item "$skillSource\SKILL.md" $skillTarget -Force
Copy-Item "$skillSource\reference" $skillTarget -Recurse -Force
Write-Host "==> Skill instalado en $skillTarget"

# 5. Verificación
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
Write-Host "    La skill 'amatora-theme-builder' está activa en CUALQUIER"
Write-Host "    proyecto donde abras Claude Code. No hace falta hacer nada"
Write-Host "    más — Claude la cargará automáticamente al detectar archivos"
Write-Host "    .liquid, schemas de Shopify, o menciones a Amatora."
