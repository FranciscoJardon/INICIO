# Amatora — sistema de diseño Shopify

Sistema de diseño para themes Shopify, distribuido como **skill de Claude Code**. Cualquier persona puede instalarlo en su proyecto con un solo comando.

## 🚀 Instalación — un solo comando

Parate en la raíz de tu proyecto Shopify (donde están `assets/`, `config/`, `layout/`, etc.) y corré en PowerShell:

```powershell
iex (iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content
```

Eso instala **todo lo necesario** en tu theme:

1. **Skill** en `.claude/skills/amatora-theme-builder/` — Claude Code aprende las convenciones de Amatora (4 mandatos: slider, utilities, imágenes, carrito).
2. **Sistema** en el theme:
   - `assets/amatora.css`, `amatora.js`, `AMATORA_VERSION`
   - `snippets/amatora-tokens.liquid`, `amatora-add-to-cart.liquid`
   - `sections/banner-amatora.liquid` (sección de prueba)
   - Panel "Configuraciones Amatora" (colores, tipografía, botones, sliders, carrito) agregado a `config/settings_schema.json`, con los colores del theme rescatados como defaults
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

`v0.8.1` — ver [MIGRATIONS.md](MIGRATIONS.md).

## Estructura

```
AMATORA-PROCESO/
├── README.md
├── MIGRATIONS.md                       ← changelog con renames y migraciones por versión
├── scripts/
│   ├── install.ps1                     ← ★ one-liner público: instala skill + sistema + rescata colores del theme
│   ├── new-amatora-project.ps1         ← proyecto nuevo desde Dawn: clona + corre install.ps1 + abre VS Code
│   └── sync-amatora-skill.ps1          ← (operador agencia) sync desde clone local con modo -Global o per-proyecto
├── skill/
│   ├── SKILL.md                        ← spec canónico (español, single source of truth)
│   └── reference/
│       ├── slider-api.md               ← atributos, API JS, AmatoraConfig
│       ├── system-overview.md          ← catálogo de tokens + utilities (solo prefijo md:)
│       ├── images.md                   ← image_url + image_tag, loading, <picture>
│       ├── buttons.md                  ← add-to-cart, drawer del theme, card de producto
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
    └── settings_schema.amatora.json    ← panel "Configuraciones Amatora" para config/
```

## Cómo se consume desde un proyecto Shopify

El one-liner de arriba (`iex (iwr ...).Content`) cubre el 99% de los casos: parado en la raíz de un theme Shopify, instala todo en un comando — incluyendo el rescate automático de los colores ya configurados en el customizer del theme.

### Setup adicional — solo si vas a arrancar proyectos NUEVOS desde Dawn

Si querés un atajo para "clonar Dawn + instalar Amatora + abrir VS Code" en un solo comando, necesitás un clone local de este repo:

```powershell
git clone https://github.com/FranciscoJardon/INICIO.git "$env:USERPROFILE\amatora-system"
```

(En Mac/Linux: `git clone https://github.com/FranciscoJardon/INICIO.git ~/amatora-system`.)

Para actualizar: `git -C ~/amatora-system pull`.

#### Alias de PowerShell

Agregá esto a tu `$PROFILE` (`notepad $PROFILE` para abrirlo):

```powershell
function New-AmatoraProject {
  & "$env:USERPROFILE\amatora-system\scripts\new-amatora-project.ps1" @args
}

function Sync-AmatoraSkill {
  & "$env:USERPROFILE\amatora-system\scripts\sync-amatora-skill.ps1"
}
```

Recargá (`. $PROFILE`) y a partir de ahí:

| Comando | Cuándo usarlo |
|---|---|
| `New-AmatoraProject -Name cliente` | Proyecto NUEVO desde cero — clona Dawn + corre install.ps1 + abre VS Code. |
| `Sync-AmatoraSkill` | Skill activa en Claude Code globalmente, sin tocar ningún theme. |

### Solo querés la skill — sin tocar el theme

Dos formas de hacer esto:

**Vía one-liner (sin clone local):**

```powershell
& ([scriptblock]::Create((iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content)) -SkillOnly
```

Esto instala la skill en `.claude/skills/` del proyecto actual.

**Vía clone local (skill global, todos tus proyectos):**

```powershell
Sync-AmatoraSkill
```

Esto copia `skill/SKILL.md` y `skill/reference/*` a `~/.claude/skills/amatora-theme-builder/`. Queda activa en cualquier proyecto donde abras Claude Code.

### Crear un proyecto nuevo — flujo recomendado

```powershell
New-AmatoraProject -Name <nombre-cliente>
```

El script `scripts/new-amatora-project.ps1`:

1. Actualiza tu clone local de Amatora — si no existe, lo crea.
2. Clona Dawn limpio a `~/Desktop/<nombre-cliente>/` (sin el `.git` del upstream).
3. Corre `install.ps1` directamente sobre la carpeta del nuevo theme — instala todo + rescata colores.
4. Abre VS Code en la carpeta del proyecto.

Si necesitás un theme base distinto a Dawn, pasalo con `-ThemeRepo <url>`.

### Theme con Amatora ya instalado (re-install / upgrade)

Si el theme ya tiene `assets/AMATORA_VERSION` y querés pisarlo con la versión nueva del repo:

```powershell
& ([scriptblock]::Create((iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content)) -Force
```

`-Force` hace backups con timestamp (`*.bak.YYYYMMDD-HHMMSS`) antes de pisar `theme.liquid` y `settings_schema.json`. Si tu theme tiene **secciones custom** que usan clases viejas de Amatora (ej. `.btn-general` que se renombró a `.btn-primary-amatora` en v0.2.0), revisá [MIGRATIONS.md](MIGRATIONS.md) y aplicá los renames a mano antes de pisar.

## Workflow para editar el sistema

1. Identificás un cambio (CSS, JS-en-snippet, sección base, schema).
2. Editás directamente en `system/` o `skill/`.
3. Si el cambio es **breaking** (rename de clase, cambio de estructura HTML, setting renombrado): agregá una entrada en `MIGRATIONS.md` con find/replace exacto para que devs que actualicen sepan qué tocar a mano.
4. Bumpea `system/AMATORA_VERSION` (semver: minor para breaking, patch para bugfix).
5. Commit + push al repo. Quien corra `install.ps1 -Force` después recibe la versión nueva.

## Tests

Antes de publicar una versión, corre las dos verificaciones que se usaron para la v0.8.1:

```powershell
# 1. Slider + add-to-cart en Chromium headless (36 comprobaciones: layout pre-init sin salto,
#    static, autoplay, teclado, drag, drawer de Dawn, estados del botón)
npm i --no-save playwright          # una vez; si falta el browser: npx playwright install chromium
node tests/test-amatora.js

# 2. Instalación real sobre un Dawn limpio + theme-check oficial de Shopify
git clone --depth 1 https://github.com/Shopify/dawn.git $env:TEMP\dawn-test; cd $env:TEMP\dawn-test
iex (iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install.ps1" -UseBasicParsing).Content
shopify theme check --path .        # no debe haber offenses en archivos amatora ni en el panel del schema
```

## Reglas no-negociables

- **`amatora.js` está congelado.** Toda lógica nueva (event listeners, fetch, drawers) vive en snippets `.liquid` separados (`amatora-add-to-cart.liquid` es el primer ejemplo).
- **Spec en español.** `SKILL.md` es la única versión.
- **`skill/SKILL.md` ≡ `~/.claude/skills/amatora-theme-builder/SKILL.md`** en la máquina del autor. Sincronizar al editar (`Sync-AmatoraSkill`).
- **Cada cambio breaking requiere entrada en `MIGRATIONS.md`** antes de mergear.
- **`install.ps1` es idempotente y hace backups.** Nunca pisar archivos del cliente sin `-Force` explícito.

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

Al agregar, el snippet abre el `<cart-drawer>` / `<cart-notification>` del theme (Dawn y derivados) vía Section Rendering API, con el ítem nuevo y el contador actualizado. Se apaga desde el panel (`am_cart_open_drawer`). Themes sin ese elemento: escuchar `amatora:cart:added`.

Variantes: `settings.add_to_cart_with_variants`:
- `link_to_product` (default) — manda al PDP, texto cambia a "Ver opciones".
- `show_variants_inline` — abre drawer (requiere implementar el drawer aparte).

Detalle completo en [skill/reference/buttons.md](skill/reference/buttons.md).

## Pendientes

- [x] ~~`git init` + push a remote~~ — publicado en https://github.com/FranciscoJardon/INICIO.
- [x] ~~Script `install.ps1` todo-en-uno con rescate de colores del theme~~ — v0.3.0.
- [x] ~~Probar `install.ps1` en un theme Dawn limpio~~ — v0.8.1: instalación y `-Force` probados sobre Dawn 16 (rescate de colores, reemplazo del panel, `shopify theme check` sin offenses en archivos Amatora).
- [x] ~~Slider y add-to-cart en navegador~~ — v0.8.1: test en Chromium headless (layout pre-init sin salto, static, autoplay, teclado, drag, drawer de Dawn).
- [ ] Probar en una tienda real con el customizer: panel "Configuraciones Amatora" y drawer al agregar desde una card.
- [ ] Probar `install.ps1 -Force` en un theme custom de un cliente actual con secciones existentes.
- [ ] Drawer de variantes para activar `show_variants_inline`.
- [ ] Equivalente en bash de `install.ps1` para Mac/Linux.
