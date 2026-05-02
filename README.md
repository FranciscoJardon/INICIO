# Amatora — sistema de diseño Shopify

Repositorio fuente del sistema de diseño Amatora. Este repo contiene **lo que se publica** y se inyecta en cualquier theme Shopify para usar Amatora.

> Este NO es un theme. Es un sistema de diseño que se instala dentro de un theme.

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

Hay **tres prompts**. Todos arrancan revisando el template antes de tocar nada. El usuario elige el que aplica según el estado del theme.

| Prompt | Cuándo usarlo | Comportamiento |
|---|---|---|
| [`prompts/init.md`](prompts/init.md) | Theme limpio recién descargado de Shopify, sin Amatora y sin código custom que pueda chocar. | Instala todo directo + sección banner como smoke-test. |
| [`prompts/implement.md`](prompts/implement.md) | Theme custom en producción sin Amatora. Hay código del cliente que NO se puede pisar. | Audita primero, reporta conflictos, espera confirmación humana, después instala respetando lo del cliente. |
| [`prompts/update.md`](prompts/update.md) | Theme que YA tiene Amatora en una versión previa (lee `assets/AMATORA_VERSION`). | Baja `MIGRATIONS.md`, aplica renames y cambios de estructura entre la versión actual y la target. Backups automáticos. |

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
