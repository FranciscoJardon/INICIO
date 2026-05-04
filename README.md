# Amatora — sistema de diseño Shopify

Sistema de diseño para themes Shopify, distribuido como **skill de Claude Code**. Cualquier persona puede instalarlo en su proyecto con un solo comando.

## 🚀 Instalación — un solo comando

Parate en la raíz de tu proyecto Shopify (donde están `assets/`, `config/`, `layout/`, etc.) y corré en PowerShell:

```powershell
iex (iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content
```

Eso instala **todo lo necesario** en tu theme:

1. **Skill** en `.claude/skills/amatora-theme-builder/` — Claude Code aprende las convenciones de Amatora (3 mandatos, clases utility, optimización de imágenes).
2. **Sistema** en el theme:
   - `assets/amatora.css`, `amatora.js`, `AMATORA_VERSION`
   - `snippets/amatora-tokens.liquid`, `amatora-add-to-cart.liquid`
   - `sections/banner-amatora.liquid` (sección de prueba)
   - Panel "Amatora — Diseño base" agregado a `config/settings_schema.json`
   - Tags insertados en `layout/theme.liquid` (CSS, JS, snippets)

Es **idempotente**: si ya hay tags Amatora, no los duplica. Hace **backups con timestamp** antes de modificar `theme.liquid` y `settings_schema.json`.

### Solo querés la skill (sin tocar el theme)

Si tu cliente tiene su propio framework CSS/JS y solo querés que Claude Code conozca las convenciones de Amatora:

```powershell
& ([scriptblock]::Create((iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content)) -SkillOnly
```

### Reinstalar sobre un theme que ya tiene Amatora

Si el script detecta `assets/AMATORA_VERSION`, aborta. Para sobrescribir igual:

```powershell
& ([scriptblock]::Create((iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content)) -Force
```

> **Tip:** después de instalar, hacé commit de los cambios al repo de tu proyecto. Cualquier dev que clone va a recibir Amatora completo.

> **Mac/Linux:** próximamente, un equivalente en bash.

## Versión

`v0.2.0` — ver [MIGRATIONS.md](MIGRATIONS.md).

## Estructura

```
AMATORA-PROCESO/
├── README.md
├── MIGRATIONS.md                       ← changelog con renames y migraciones por versión
├── prompts/
│   ├── init.md                         ← theme limpio sin Amatora (instala + smoke-test)
│   ├── implement.md                    ← theme custom existente sin Amatora (auditoría primero)
│   └── update.md                       ← theme con Amatora vieja → versión nueva
├── scripts/
│   ├── install.ps1                     ← ★ one-liner público: instala skill + sistema en el theme actual
│   ├── new-amatora-project.ps1         ← proyecto nuevo desde Dawn: clona + abre VS Code + prompt al clipboard
│   └── sync-amatora-skill.ps1          ← (operador agencia) sync desde clone local con modo -Global o per-proyecto
├── skill/
│   ├── SKILL.md                        ← spec canónico (español, single source of truth)
│   └── reference/
│       ├── slider-api.md
│       ├── system-overview.md
│       ├── performance.md
│       ├── file-tree.md
│       └── section-template.liquid
└── system/                             ← LO QUE SE PUBLICA — todo lo que un theme consume
    ├── AMATORA_VERSION                 ← número de versión instalada
    ├── amatora.css                     ← CSS del sistema (assets/)
    ├── amatora.js                      ← JS del slider (assets/) — CONGELADO
    ├── amatora-tokens.liquid           ← snippet de tokens :root (snippets/)
    ├── amatora-add-to-cart.liquid      ← snippet del botón Agregar al carrito (snippets/)
    ├── banner-amatora.liquid           ← sección de banner que se instala como verificación (sections/)
    └── settings_schema.amatora.json    ← panel "Amatora — Diseño base" para config/
```

## Cómo se consume desde un proyecto Shopify

### Setup de máquina — UNA vez por operador

Antes de correr cualquier prompt, clonar este repo a una ruta local conocida:

```powershell
git clone https://github.com/FranciscoJardon/INICIO.git "$env:USERPROFILE\amatora-system"
```

(En Mac/Linux: `git clone https://github.com/FranciscoJardon/INICIO.git ~/amatora-system`.)

Para actualizar a la última versión: `git -C ~/amatora-system pull`.

#### Atajos recomendados — alias de PowerShell

Agregá esto a tu `$PROFILE` de PowerShell (`notepad $PROFILE` para abrirlo):

```powershell
function New-AmatoraProject {
  & "$env:USERPROFILE\amatora-system\scripts\new-amatora-project.ps1" @args
}

function Sync-AmatoraSkill {
  & "$env:USERPROFILE\amatora-system\scripts\sync-amatora-skill.ps1"
}
```

Recargá (`. $PROFILE`) y a partir de ahí tenés dos comandos:

| Comando | Cuándo usarlo |
|---|---|
| `New-AmatoraProject -Name cliente` | Proyecto NUEVO desde cero — clona Dawn + abre VS Code + prompt al clipboard. |
| `Sync-AmatoraSkill` | Solo querés la skill activa en Claude Code (sin tocar ningún theme). Una vez por máquina, después actualizás cuando quieras. |

### Solo querés la skill — sin tocar el theme

Si ya tenés un proyecto Shopify conectado a tu propio repo y NO querés instalar el sistema Amatora completo (ni el CSS, ni el JS, ni los snippets, ni el banner de prueba) — solo querés que Claude Code sepa de las convenciones Amatora — corré:

```powershell
Sync-AmatoraSkill
```

Esto:
1. Actualiza tu clone local de Amatora.
2. Copia `skill/SKILL.md` y `skill/reference/*` a `~/.claude/skills/amatora-theme-builder/`.
3. Backup del skill anterior si ya existía.

Una vez instalado, la skill está **activa en cualquier proyecto** donde abras Claude Code — no está vinculada a una carpeta. Cuando edites un `.liquid`, abras un schema, o menciones "slider"/"banner"/"Amatora", Claude la carga automáticamente.

> Si después de un tiempo querés actualizar a la última versión de la skill, volvé a correr `Sync-AmatoraSkill` y listo — hace `git pull` y reinstala.

### Crear un proyecto nuevo — flujo recomendado

```powershell
New-AmatoraProject -Name <nombre-cliente>
```

El script `scripts/new-amatora-project.ps1`:

1. Actualiza tu clone local de Amatora (`~/amatora-system`) — si no existe, lo crea.
2. Clona Dawn limpio a `~/Desktop/<nombre-cliente>/` (sin el `.git` del upstream, así arranca como TU repo).
3. Copia el bloque del prompt de `init.md` directamente al portapapeles.
4. Abre VS Code en la carpeta del proyecto.

Después, en la nueva ventana de VS Code: abrís Claude Code, pegás (Ctrl+V) en el chat, y Claude termina de instalar Amatora copiando desde `~/amatora-system` al theme. Cero hits a la red durante el install.

Si necesitás un theme base distinto a Dawn, pasalo con `-ThemeRepo <url>`.

> **Por qué clone local en vez de descarga vía `curl` desde el prompt:** el sandbox de Claude Code clasifica `curl` desde un repo arbitrario hacia `assets/`/`snippets/`/`sections/` como "integración de código externo no confiable" y lo bloquea por seguridad. Los prompts copian desde tu carpeta local autorizada, no desde la red.

### Los tres prompts

Todos arrancan verificando que `~/amatora-system` exista y que el template esté en buen estado antes de tocar nada.

| Prompt | Cuándo usarlo | Comportamiento |
|---|---|---|
| [`prompts/init.md`](prompts/init.md) | Theme limpio recién descargado de Shopify, sin Amatora y sin código custom que pueda chocar. | Instala todo directo + sección banner como smoke-test. |
| [`prompts/implement.md`](prompts/implement.md) | Theme custom en producción sin Amatora. Hay código del cliente que NO se puede pisar. | Audita primero, reporta conflictos, espera confirmación humana, después instala respetando lo del cliente. |
| [`prompts/update.md`](prompts/update.md) | Theme que YA tiene Amatora en una versión previa (lee `assets/AMATORA_VERSION`). | Lee `MIGRATIONS.md` del clone local, aplica renames y cambios de estructura entre la versión actual y la target. Backups automáticos. |

> El banner instalado por `init.md` es **smoke test**: si entra al customizer y "Banner Amatora" aparece en la lista de secciones, la instalación funcionó.

> Si se usa el prompt incorrecto, los tres tienen detección cruzada: `init` para si encuentra `AMATORA_VERSION`, `update` para si NO existe, `implement` para si encuentra `AMATORA_VERSION`. Cada uno te redirige al correcto.

## Workflow para editar el sistema

1. Identificás un cambio (CSS, JS-en-snippet, sección base, schema).
2. Editás directamente en `system/` o `skill/`.
3. Si el cambio es **breaking** (rename de clase, cambio de estructura HTML, setting renombrado): agregá una entrada en `MIGRATIONS.md` con find/replace exacto.
4. Bumpea `system/AMATORA_VERSION` (semver: minor para breaking, patch para bugfix).
5. Commit + push al repo. Cualquier proyecto que corra el prompt de update va a recibir el cambio.

## Reglas no-negociables

- **`amatora.js` está congelado.** Toda lógica nueva (event listeners, fetch, drawers) vive en snippets `.liquid` separados (`amatora-add-to-cart.liquid` es el primer ejemplo).
- **Spec en español.** `SKILL.md` es la única versión.
- **`skill/SKILL.md` ≡ `~/.claude/skills/amatora-theme-builder/SKILL.md`** en la máquina del autor. Sincronizar al editar (TODO: script `sync.ps1`).
- **Cada cambio breaking requiere entrada en `MIGRATIONS.md`** antes de mergear.
- **El prompt revisa antes de tocar.** Nunca pisar archivos del cliente sin reporte explícito.

## Sistema de botones — referencia rápida

Solo dos clases base + dos modificadores combinables:

| Clase | Cuándo |
|---|---|
| `.btn-primary-amatora` | Acción principal |
| `.btn-secondary-amatora` | Acción alternativa |
| `+ .btn-block-amatora` | Ancho completo (max 450px) + esquina signature (CTA hero) |
| `+ .btn-outline-amatora` | Transparente con borde |

Variables: `--btn-bg`, `--btn-fg`, `--btn-border`, `--btn-radius`, `--btn-py`, `--btn-px`, `--btn-fs`, `--btn-fw`, `--btn-w`, `--btn-max`, `--btn-bg-hover`.

Estados (set por `amatora-add-to-cart.liquid`, render por `amatora.css`):
- `data-state="loading"` — spinner real (refleja `/cart/add.js`).
- `data-state="success"` — "Agregado" por 1.5s.
- `data-state="error"` — "Intenta de nuevo".

Variantes: `settings.add_to_cart_with_variants`:
- `link_to_product` (default) — manda al PDP, texto cambia a "Ver opciones".
- `show_variants_inline` — abre drawer (requiere implementar el drawer aparte).

Detalle completo en [skill/SKILL.md](skill/SKILL.md) § "Botón Agregar al carrito — comportamiento estándar".

## Pendientes

- [x] ~~`git init` + push a remote~~ — publicado en https://github.com/FranciscoJardon/INICIO. Los tres prompts ya tienen las URLs reales (repo + raw base).
- [ ] Probar `prompts/init.md` en un theme Dawn limpio.
- [ ] Probar `prompts/implement.md` en un theme custom de un cliente actual.
- [ ] Drawer de variantes para activar `show_variants_inline`.
- [ ] Script `sync.ps1` que copie `skill/` → `~/.claude/skills/amatora-theme-builder/`.
