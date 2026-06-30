# HTML prototype → Figma component mapping (cliente v1.6)

Mapping entre as classes/blocks do protótipo HTML cliente (`prototipos_html/2026-04-30-cliente-v1-queue-flow.html`) e os ComponentSets/Components correspondentes na library `almaFlow` Figma. Use como guia ao criar novos protótipos cliente — se o pattern já existe na library, instancie em vez de inventar.

## Topbars

| HTML | Figma ComponentSet | Variants |
|---|---|---|
| `<header class="topbar">` (lojas — só brand) | `198:248 Client topbar` | `Type=BrandOnly` |
| `<header class="topbar">` (waiting/cancelled — brand+sep+store) | `198:248 Client topbar` | `Type=Default` |
| `<header class="topbar">` (form/preorder — back+brand+sep+store) | `198:248 Client topbar` | `Type=WithBack` |
| `<header class="topbar">` (cardapio — back+brand+sep+title+mini-cart) | `198:248 Client topbar` | `Type=WithCart` (+ instance de Mini-cart pill) |

## Lista de lojas (C1)

| HTML | Figma |
|---|---|
| `.stores-heading` | text node (Bebas 22 + tokens) |
| `.store-card` | `198:267 Store card` (Status=Open / Status=Closed) |

## Form (C2)

| HTML | Figma |
|---|---|
| `.form-title` + `.form-subtitle` | text nodes inline |
| `.field` (label + input + error) | `239:15 Form field` (Type=Default / Focused / Error) |
| `.counter-row` | `239:40 Counter` (State=Default / MinReached / MaxReached) |
| `.lgpd-box` | `239:48 LGPD consent box` (Checked=True / False) |
| `.btn-primary` "Entrar na fila" | `21:110 Button` (Variant=Primary, Size=Lg) |

## Status na fila (C3 + C3-warn)

| HTML | Figma |
|---|---|
| `.warn-banner` | `198:286 Warn banner` (State=Visible) |
| `.pos-hero` (eyebrow + número + badge + strip + labels) | `198:280 Queue status hero` (State=Waiting / Next) |
| `.stats-row > .stat-tile` (3 tiles) | `239:62 Stat tile` × 3 (Color=Default / Gold) |
| `.info-card` (3 rows) | `242:5 Info card` (com 3 instances de `242:2 Info row`) |
| `.menu-link` "Ver cardápio" | `239:63 Menu link CTA` |
| `.leave-link` "Sair da fila" | text node (text-subtle 13 600) |

## Mesa pronta (C4)

| HTML | Figma |
|---|---|
| Toda a tela `.called-wrap` | `243:2 Called hero` (single, 327×400) |

> Nota: o radial gradient red-deep do bg fica no Frame consumer (C4 frame), não no componente. Componente assume bg transparente.

## Saiu da fila (C5)

| HTML | Figma |
|---|---|
| Toda a tela `.cancelled-wrap` | `243:10 Cancelled hero` (single, 327×400) |

## Cardápio (C6)

| HTML | Figma |
|---|---|
| `.menu-store-lbl` "Cadilac Burger — …" | text node (text-subtle 11 700 letter 0.12) |
| `.cat-tabs > .cat-tab` (4 tabs) | `198:312 Category tab` × 4 (Active=True / False) |
| `.item-card` | `198:307 Menu item card` (Category × Added = 8 variants) |
| `.mini-cart` no topbar | `239:55 Mini-cart pill` (State=Empty / HasItems) |
| `.menu-footer` "Pré-pedido consultivo…" | text node (text-subtle 11 center) |

## Lista de pré-pedidos (C7)

| HTML | Figma |
|---|---|
| `#po-banner.preorder-banner.draft` | `198:339 Pre-order lock banner` (State=Draft) |
| `#po-banner.preorder-banner.warning` | `198:339 Pre-order lock banner` (State=Warning) |
| `#po-banner.preorder-banner.locked` | `198:339 Pre-order lock banner` (State=Locked) |
| `#po-empty` (estado vazio com ícone + título + sub + CTA) | `242:15 Cliente pre-order empty` (single, 327×280) |
| `.po-card` (item da lista com stepper) | `198:323 Pre-order item row` (State=Default) |
| `.po-card` (item locked com static qty) | `198:323 Pre-order item row` (State=Locked) |
| `.preorder-submit` "Enviar minha lista" | `21:110 Button` (Variant=Primary, Size=Lg) |
| `.preorder-footer` consultivo | text node (text-subtle 11 center) |

## Sheets / overlays

| HTML | Figma |
|---|---|
| `.leave-sheet` (sair da fila) | `36:23 Sheet shell` (State=Open) com slot body customizado |
| `.warn-snackbar` (snackbar gold) | not yet componentizado — text + frame inline ou novo componente futuro |

## Categorias e gradientes (Menu thumbs)

| HTML class | Figma Paint Style |
|---|---|
| `.item-img.burger`, `.po-thumb.burger` | `Menu thumb / Burger` |
| `.item-img.combo`, `.po-thumb.combo` | `Menu thumb / Combo` |
| `.item-img.drink`, `.po-thumb.drink` | `Menu thumb / Drink` |
| `.item-img.sweet`, `.po-thumb.sweet` | `Menu thumb / Sweet` |

## Buttons compartilhados

| HTML | Figma |
|---|---|
| `.btn-primary` (red) | `21:110 Button` (Variant=Primary, Size=Lg) |
| `.btn-ghost` (border + text-2) | `21:110 Button` (Variant=Ghost, Size=Lg) |
| `.btn-danger` (red, mesmo de primary) | `21:110 Button` (Variant=Primary, Size=Lg) — hoje sem distinção visual |
| `.add-btn` (gold-line pill) | parte do `198:307 Menu item card` (Footer > Add button) |
| `.counter-btn` (− / +) | parte do `239:40 Counter` (Counter btn) |
| `.po-step-btn` (− / +) | parte do `198:323 Pre-order item row` (Stepper > Step btn) |

## Componentes ainda não mapeados (gaps conhecidos)

- `.warn-snackbar` (snackbar floating bottom). HTML existe; sem ComponentSet ainda.
- `.skel-card` (skeleton loader). HTML existe; sem ComponentSet ainda.
- `.overlay` + `.leave-sheet` (modal overlay). Reusa `36:23 Sheet shell` Staff mas sem variant cliente customizado.

Esses gaps são aceitáveis no MVP porque aparecem apenas em estados transientes ou de loading. Se uma futura fidelity-fix exigir, criar como ComponentSet seguindo este mesmo workflow.

## Como usar este mapping

1. Antes de "criar componente novo", checar este arquivo — pode já existir.
2. Antes de implementar Angular, conferir o Node ID Figma correspondente.
3. Quando criar componente novo, **adicionar linha aqui** + atualizar `examples/README.md`.
