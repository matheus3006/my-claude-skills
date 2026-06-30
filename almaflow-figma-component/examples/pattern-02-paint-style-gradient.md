# Pattern 02 — Gradiente via Paint Style (não Variable)

## Quando usar
Para qualquer fill com gradient (linear, radial, angular). Variables só armazenam cores SOLID; gradients vão como Paint Style — alinhado com a Figma best practice oficial.

Caso real desta sessão: 4 menu thumbs categorizados (Burger / Combo / Drink / Sweet), cada um com gradient 155° linear de tom escuro pra mais escuro.

## API canônica

### Criar Paint Style com gradient

```js
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function makeGradient(startHex, endHex, angleDeg) {
  if (angleDeg == null) angleDeg = 155;
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const rad = (angleDeg - 90) * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: [
      [cos, -sin, 0.5 - 0.5 * cos + 0.5 * sin],
      [sin,  cos, 0.5 - 0.5 * sin - 0.5 * cos],
    ],
    gradientStops: [
      { position: 0, color: { ...start, a: 1 } },
      { position: 1, color: { ...end,   a: 1 } },
    ],
  };
}

// Criar style único
const style = figma.createPaintStyle();
style.name = "Menu thumb / Burger";
style.paints = [makeGradient("#2A1708", "#0E0703", 155)];

// Aplicar a um node
await node.setFillStyleIdAsync(style.id);
```

### Por que `setFillStyleIdAsync` (assíncrono)
Plugin API exige async para paint styles publicados (mesmo que locais). Sempre `await`.

### Múltiplas categorias em batch

```js
const thumbStyles = [
  { name: "Menu thumb / Burger", start: "#2A1708", end: "#0E0703" },
  { name: "Menu thumb / Combo",  start: "#1E0A04", end: "#0C0502" },
  { name: "Menu thumb / Drink",  start: "#021320", end: "#010A12" },
  { name: "Menu thumb / Sweet",  start: "#17081C", end: "#0A040E" },
];

const existingStyles = await figma.getLocalPaintStylesAsync();

for (const def of thumbStyles) {
  const existing = existingStyles.find(s => s.name === def.name);
  if (existing) continue;  // duplicate guard
  const s = figma.createPaintStyle();
  s.name = def.name;
  s.paints = [makeGradient(def.start, def.end, 155)];
}
```

## Por que styles em vez de variables
Per Figma best practice: "Variables store Color, Number, String or Boolean. Use Styles only for gradients and composite effects."

Razões:
- Variables não suportam gradient como tipo de valor.
- Styles preservam o look composto (stops + transform + opacity).
- Frame consumidores fazem instance override de Style sem detach.

## Anti-padrão

```js
// ❌ Aplicar gradient inline (não bindado a Style)
node.fills = [{
  type: "GRADIENT_LINEAR",
  gradientStops: [...],
}];
// O audit findRawPaints flagra esse caso (gradient sem styleId).
```

## Pattern recomendado

```js
// ✅ Bindar a Style publicado
const style = (await figma.getLocalPaintStylesAsync()).find(s => s.name === "Menu thumb / Burger");
await node.setFillStyleIdAsync(style.id);
```

## Override de Style por categoria (frame consumer)
No frame que consome Menu item card, para mostrar Combo em vez de Burger, override o thumb fill style:
```js
const inst = menuItemCardComponent.createInstance();
const thumbInstance = inst.children[0];  // o thumb interno
const comboStyle = (await figma.getLocalPaintStylesAsync()).find(s => s.name === "Menu thumb / Combo");
await thumbInstance.setFillStyleIdAsync(comboStyle.id);
```

## Bind individual stops a primitives (avançado)
Se quiser controle mais fino e os stops também serem variables (raro):
```js
const startColor = V("color/menu/thumb/burger/start");  // variable hipotética
const endColor   = V("color/menu/thumb/burger/end");
const paint = {
  type: "GRADIENT_LINEAR",
  gradientTransform: [...],
  gradientStops: [
    figma.variables.setBoundVariableForPaint(
      { position: 0, color: { r:0, g:0, b:0, a: 1 } }, "color", startColor
    ),
    figma.variables.setBoundVariableForPaint(
      { position: 1, color: { r:0, g:0, b:0, a: 1 } }, "color", endColor
    ),
  ],
};
style.paints = [paint];
```
Esta sessão optou pelo modo simples (raw hex em stops) porque os stops do menu thumb são decorativos, sem necessidade de theming — o style isolado já basta.

## Referência cruzada
- Bug correlato: `bug-08-name-clash-staff.md` (paint style names também podem clash).
- Helper `makeGradient` está em `references/helpers.js`.
