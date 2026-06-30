# Pattern 01 — Token binding canônico (fills, strokes, radius, padding, gap)

## Quando usar
Sempre que aplicar cor, raio, padding ou gap em qualquer ComponentSet/Component da library `almaFlow`. **Zero raw hex** e **zero raw px** são critérios de aceite (ver `pattern-05-publication-audit.md`).

## API canônica

### 1. Fill / stroke (cor SOLID)

```js
const allVars = await figma.variables.getLocalVariablesAsync();
const V = (name) => allVars.find(v => v.name === name);

const FILL = (varName, alpha) => figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: alpha == null ? 1 : alpha },
  "color", V(varName)
);

// Aplicar
node.fills = [FILL("color/client/gold/soft")];
node.strokes = [FILL("color/client/gold/default")];
node.strokeWeight = 1;
node.strokeAlign = "INSIDE";  // dentro do bounding (não estoura layout)
```

A `color: { r: 0, g: 0, b: 0 }` é um placeholder — o `setBoundVariableForPaint` substitui pela cor do variable resolvido. O `opacity` no paint é multiplicado com o alpha embutido na cor (se a variable resolve em rgba com alpha < 1, o resultado final é `varAlpha × paintOpacity`).

### 2. Radius (4 cantos)

```js
function setRadius(node, varName) {
  const v = V(varName);
  for (const corner of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"]) {
    node.setBoundVariable(corner, v);
  }
}

setRadius(variant, "radius/md");           // 4 cantos iguais
node.setBoundVariable("topLeftRadius",     V("radius/lg"));   // só top-left
node.setBoundVariable("topRightRadius",    V("radius/lg"));   // só top-right
// (top arredondado, bottom reto — útil pra cards de modal/sheet)
```

### 3. Padding (4 lados)

```js
node.setBoundVariable("paddingTop",    V("space/inset/md"));
node.setBoundVariable("paddingBottom", V("space/inset/md"));
node.setBoundVariable("paddingLeft",   V("space/inset/lg"));
node.setBoundVariable("paddingRight",  V("space/inset/lg"));
```

Para padding fixo em código (16, 14 etc.) **sem** binding, é tolerado em casos raros — mas o critério "zero raw px" do audit pode flagrar. Prefira variables sempre que possível.

### 4. Item spacing (gap entre filhos de auto-layout)

```js
node.setBoundVariable("itemSpacing", V("space/stack/md"));
```

### 5. Stroke weight
Não é bindável atualmente. Setar diretamente:
```js
node.strokeWeight = 1;
```
1px é a única espessura na library cliente (e está consistente em todos componentes).

## Catálogo de tokens cliente almaFlow

| Categoria | Variables disponíveis |
|---|---|
| Surface (cliente) | `color/client/surface/{base,page,raised,elevated,overlay}` |
| Border (cliente) | `color/client/border/{default,strong}` |
| Red brand (cliente) | `color/client/red/{default,pressed,soft,line,deep,glow}` |
| Gold accent (cliente) | `color/client/gold/{default,soft,line,glow}` |
| Green feedback (cliente) | `color/client/green/{default,soft}` |
| Text (cliente) | `color/client/text/{default,muted,subtle,inverse}` |
| Surface (compartilhado) | `color/surface/{base,raised,elevated,overlay}` |
| Border (compartilhado) | `color/border/{default,strong}` |
| Text (compartilhado) | `color/text/{default,secondary,muted,inverse}` |
| Brand (Staff) | `color/brand/{default,foreground,pressed}` |
| Aging (Staff) | `color/aging/{calm,warn,escalation,urgent,empty}/{background,foreground}` |
| Feedback | `color/feedback/{success,danger,error,focus}/{default,fg,line,soft}` |
| Radius | `radius/{sm,md,full}` (sm=9, md=14, full=999) |
| Space inset | `space/inset/{xs,sm,md,lg}` |
| Space stack | `space/stack/{xs,sm,md,lg}` |
| Font size | `font/size/{11,12,13,14,16,18,20,22,24,28,32,36,38,46,106}` |
| Font weight | `font/weight/{400,500,600,700}` |
| Font letter | `font/letter/{0_04,0_06,0_08}` |
| Font family | `font/family/{display,body}` |
| Layout | `layout/topbar/height`, `layout/menu-thumb/height`, `layout/action-bar/height` |

(Inventário completo via `getLocalVariablesAsync()` — sempre confirmar antes de criar variables novas.)

## Anti-padrão

```js
// ❌ Hex cru — falha o audit
node.fills = [{ type: "SOLID", color: { r: 0.78, g: 0.57, b: 0.16 }, opacity: 1 }];

// ❌ Px cru em radius
node.cornerRadius = 14;  // funciona mas não bindado a token

// ❌ Px cru em padding individual
node.paddingTop = 12;  // funciona mas não bindado
```

## Pattern recomendado

```js
// ✅ Tudo bindado a tokens semânticos
node.fills = [FILL("color/client/gold/default")];
node.strokes = [FILL("color/client/gold/line")];
node.strokeWeight = 1;
setRadius(node, "radius/md");
node.setBoundVariable("paddingTop", V("space/inset/sm"));
node.setBoundVariable("paddingBottom", V("space/inset/sm"));
node.setBoundVariable("paddingLeft", V("space/inset/md"));
node.setBoundVariable("paddingRight", V("space/inset/md"));
node.setBoundVariable("itemSpacing", V("space/stack/sm"));
```

## Referência cruzada
- Helpers prontos: `references/helpers.js`.
- Audit que detecta raw hex/px: `references/audit-scripts.js > findRawPaints`.
- Inventário de tokens da library: rodar `getLocalVariablesAsync` antes de criar nova.
