# Examples — almaflow-figma-component

Cada arquivo aqui tem **sintoma** (o que vai aparecer pra você quando o bug acontecer) → **causa raiz** → **fix copiável**. Coletados durante a evolução cliente v1.5 → v1.6 (task `2026-05-03-figma-cliente-v1-components-v1-6`).

## Bugs catalogados

| # | Arquivo | Sintoma típico |
|---|---|---|
| 1 | [bug-01-dm-sans-fontname.md](bug-01-dm-sans-fontname.md) | `Cannot use unloaded font "DM Sans Semi Bold"` |
| 2 | [bug-02-add-button-fixed-100.md](bug-02-add-button-fixed-100.md) | Frame-filho fica gigante (100×100) dentro de auto-layout |
| 3 | [bug-03-warn-banner-sequence.md](bug-03-warn-banner-sequence.md) | Variant sai com largura/altura erradas após conversão pra auto-layout |
| 4 | [bug-04-combine-variants-orphan.md](bug-04-combine-variants-orphan.md) | `"Grouped nodes must be in the same page as the parent"` |
| 5 | [bug-05-stripe-absolute-order.md](bug-05-stripe-absolute-order.md) | Stripe não aparece OU conta na largura do parent auto-layout |
| 6 | [bug-06-padding-itemspacing-defaults.md](bug-06-padding-itemspacing-defaults.md) | Frame ganha padding=16 e itemSpacing=10 sem você pedir |
| 7 | [bug-07-type-guards.md](bug-07-type-guards.md) | `TypeError: no such property 'children' on TEXT node` |
| 8 | [bug-08-name-clash-staff.md](bug-08-name-clash-staff.md) | `search_design_system` retorna 2 componentes com mesmo nome |

## Padrões validados

| # | Arquivo | Quando usar |
|---|---|---|
| 1 | [pattern-01-token-binding.md](pattern-01-token-binding.md) | Aplicar fills/strokes/radius/padding/gap via tokens semânticos |
| 2 | [pattern-02-paint-style-gradient.md](pattern-02-paint-style-gradient.md) | Gradiente em fill (Figma best practice: Style, não Variable) |
| 3 | [pattern-03-variant-addition.md](pattern-03-variant-addition.md) | Adicionar variant nova a um ComponentSet existente |
| 4 | [pattern-04-layout-2col-grid.md](pattern-04-layout-2col-grid.md) | Posicionar componentes na Components page (10:5) sem overlap |
| 5 | [pattern-05-publication-audit.md](pattern-05-publication-audit.md) | Validar tudo antes de publicar a library |

## Imagens de referência

Em `images/` — screenshots dos componentes finais cliente v1.6 e o caso broken/fixed do bug-02.

| Componente | Imagem |
|---|---|
| Warn banner (golden path) | `warn-banner-final.png` |
| Queue status hero (composição complexa) | `queue-status-hero.png` |
| Client topbar (4 variants) | `topbar-4-variants.png` |
| Pre-order lock banner (3 variants) | `pre-order-lock-banner-3-states.png` |
| Pre-order item row (2 variants) | `pre-order-item-row-2-states.png` |
| Form field (3 variants) | `form-field-3-states.png` |
| Counter (3 variants) | `counter-3-states.png` |
| Mini-cart pill (2 variants) | `mini-cart-2-states.png` |
| Info card | `info-card.png` |
| Called hero | `called-hero.png` |
| Cancelled hero | `cancelled-hero.png` |
| Menu item card BROKEN | `menu-card-broken.png` |
| Menu item card FIXED | `menu-card-fixed.png` |
