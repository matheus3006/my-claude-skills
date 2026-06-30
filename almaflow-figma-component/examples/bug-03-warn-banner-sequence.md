# Bug 03 — Variant sai com dimensões erradas após conversão tardia para auto-layout

## Sintoma
Tentativa 1 do Warn banner saiu como variant **217×209** em vez do esperado **327×~120**:
```
{ "variantW": 359, "variantH": 33, ... }    // tentativa 0
{ "variantW": 217, "variantH": 209, ... }   // tentativa 1
{ "variantW": 327, "variantH": 123, ... }   // tentativa 2 (correto)
```

Ao screenshot, o conteúdo aparecia comprimido, com stripe contando como item de flow ao invés de absolute.

## Causa raiz
Múltiplos problemas se acumulam quando você muda `layoutMode` no fim do script:

1. **Stripe ainda em flow no momento da conversão** — eu adicionei o stripe (3px wide rectangle) à variant antes de chamar `variant.layoutMode = "HORIZONTAL"`. Quando converti para HORIZONTAL, o stripe contou na primary axis (width = stripe + content = 3 + 12 + 185 + ... = 217). O `layoutPositioning = "ABSOLUTE"` foi setado **depois** da conversão — tarde demais.

2. **Defaults Figma aplicados** — ao ativar `layoutMode`, Figma aplica `padding=16` e `itemSpacing=10` (ver bug-06). Esses inflam dimensões inesperadas.

3. **Sizing modes não setados na ordem correta** — `resize(327, h)` antes de setar `primaryAxisSizingMode` é ignorado quando o sizing mode é AUTO.

## Fix — sequência canônica para edit in-place de variant existente

```js
const variant = await figma.getNodeByIdAsync("198:281");

// 1. CLEAR
for (const c of [...variant.children]) c.remove();

// 2. layoutMode IMEDIATAMENTE seguido de zerar defaults
variant.layoutMode = "VERTICAL";
variant.paddingTop = 0; variant.paddingRight = 0;
variant.paddingBottom = 0; variant.paddingLeft = 0;
variant.itemSpacing = 0;

// 3. Sizing modes ANTES do resize
variant.primaryAxisSizingMode = "AUTO";
variant.counterAxisSizingMode = "FIXED";
variant.resize(327, variant.height);

// 4. Estilo
variant.fills = [FILL("color/client/gold/soft")];
variant.strokes = [FILL("color/client/gold/default")];
variant.strokeWeight = 1;
variant.strokeAlign = "INSIDE";
setRadius(variant, "radius/md");

// 5. Children em flow — para CADA, layoutSizing* explícito após appendChild
const inner = figma.createFrame();
inner.layoutMode = "HORIZONTAL";
inner.paddingTop = 12; inner.paddingBottom = 12;
inner.paddingLeft = 18; inner.paddingRight = 14;
inner.itemSpacing = 12;
inner.fills = [];
variant.appendChild(inner);
inner.layoutSizingHorizontal = "FILL";
inner.layoutSizingVertical = "HUG";
/* ... iconWrap, content, etc. ... */

// 6. Children absolutos POR ÚLTIMO (após variant ter dimensões definitivas)
const stripe = figma.createRectangle();
stripe.fills = [FILL("color/client/gold/default")];
variant.appendChild(stripe);
stripe.layoutPositioning = "ABSOLUTE";
stripe.constraints = { horizontal: "MIN", vertical: "STRETCH" };
stripe.x = 0; stripe.y = 0;
stripe.resize(3, variant.height);
```

Resultado correto:

![Warn banner final — gold bg, 3px stripe, icon, title, body, CTA + dismiss](images/warn-banner-final.png)

## Princípio geral
Para evitar trap de auto-layout sequence:
- Setar `layoutMode` **logo no início** (não no fim)
- Zerar `padding/itemSpacing` **imediatamente** (combate bug-06)
- Setar sizing modes **antes do resize** (caso contrário, AUTO ignora o resize)
- Adicionar children em flow **antes** dos absolutos
- Setar `layoutPositioning = "ABSOLUTE"` **depois** do `appendChild`

## Referência cruzada
- Bug original em S2.1 desta sessão. Tentativa 0 (217×209) → tentativa 1 (idem) → tentativa 2 final (327×123).
- Ver também: bug-05 (ABSOLUTE positioning order) e bug-06 (padding defaults).
