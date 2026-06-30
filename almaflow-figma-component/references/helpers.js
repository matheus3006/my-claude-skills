// helpers.js — biblioteca canônica de helpers para uso dentro de use_figma calls.
// Cole o trecho relevante no topo do seu script.
// Última atualização: 2026-05-03 (cliente v1.6).

// ─────────────────────────────────────────────────────────────────────────
// Setup mínimo: fontes + variable lookup
// ─────────────────────────────────────────────────────────────────────────

await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" });
await figma.loadFontAsync({ family: "DM Sans",    style: "Regular" });
await figma.loadFontAsync({ family: "DM Sans",    style: "Medium" });
await figma.loadFontAsync({ family: "DM Sans",    style: "SemiBold" }); // SEM espaço
await figma.loadFontAsync({ family: "DM Sans",    style: "Bold" });

const allVars = await figma.variables.getLocalVariablesAsync();
const V = (name) => allVars.find(v => v.name === name);

// ─────────────────────────────────────────────────────────────────────────
// FILL — bind cor SOLID a variable
// ─────────────────────────────────────────────────────────────────────────
//
//   node.fills = [FILL("color/client/gold/soft")];
//   node.strokes = [FILL("color/client/red/line")];
//   node.fills = [FILL("color/client/gold/default", 0.5)]; // alpha override

const FILL = (varName, alpha) => figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: alpha == null ? 1 : alpha },
  "color", V(varName)
);

// ─────────────────────────────────────────────────────────────────────────
// setRadius — bind 4 cantos a uma única radius variable
// ─────────────────────────────────────────────────────────────────────────
//
//   setRadius(node, "radius/md");

function setRadius(node, varName) {
  const v = V(varName);
  for (const corner of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"]) {
    node.setBoundVariable(corner, v);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// setupAutoLayout — config rápida de auto-layout zerando defaults Figma
// ─────────────────────────────────────────────────────────────────────────
//
//   setupAutoLayout(node, {
//     dir: "VERTICAL",       // ou "HORIZONTAL"
//     padT: 12, padB: 12, padL: 18, padR: 14,
//     gap: 8,
//     alignMain: "CENTER",   // primaryAxisAlignItems
//     alignCross: "MIN",     // counterAxisAlignItems
//     primarySize: "AUTO",   // sizing modes do próprio node
//     counterSize: "FIXED",
//   });

function setupAutoLayout(node, opts) {
  node.layoutMode = opts.dir;

  // Zerar defaults Figma (16/10) PRIMEIRO
  node.paddingTop = 0; node.paddingBottom = 0;
  node.paddingLeft = 0; node.paddingRight = 0;
  node.itemSpacing = 0;

  // Aplicar values reais
  if (opts.padT != null) node.paddingTop = opts.padT;
  if (opts.padB != null) node.paddingBottom = opts.padB;
  if (opts.padL != null) node.paddingLeft = opts.padL;
  if (opts.padR != null) node.paddingRight = opts.padR;
  if (opts.gap != null) node.itemSpacing = opts.gap;

  if (opts.alignMain) node.primaryAxisAlignItems = opts.alignMain;
  if (opts.alignCross) node.counterAxisAlignItems = opts.alignCross;

  if (opts.primarySize) node.primaryAxisSizingMode = opts.primarySize;
  if (opts.counterSize) node.counterAxisSizingMode = opts.counterSize;
}

// ─────────────────────────────────────────────────────────────────────────
// childSizing — set explícito de layoutSizing após appendChild
// ─────────────────────────────────────────────────────────────────────────
//
//   parent.appendChild(child);
//   childSizing(child, "FILL", "HUG");
//
// Sempre usar isso em frame-filho de auto-layout — caso contrário herda
// FIXED 100×100 (bug-02).

function childSizing(node, h, v) {
  if (h) node.layoutSizingHorizontal = h;  // "FILL" | "HUG" | "FIXED"
  if (v) node.layoutSizingVertical = v;
}

// ─────────────────────────────────────────────────────────────────────────
// makeText — text com fontName + size + lineHeight + letterSpacing + cor
// ─────────────────────────────────────────────────────────────────────────
//
//   const title = makeText({
//     family: "Bebas Neue", style: "Regular",
//     chars: "FALTAM 2 LUGARES",
//     size: 16, lineHeight: 110, letter: 4,
//     fillVar: "color/client/gold/default",
//   });

function makeText(opts) {
  const t = figma.createText();
  t.fontName = { family: opts.family, style: opts.style };
  t.characters = opts.chars;
  t.fontSize = opts.size;
  if (opts.lineHeight != null) {
    t.lineHeight = { value: opts.lineHeight, unit: "PERCENT" };
  }
  if (opts.letter != null) {
    t.letterSpacing = { value: opts.letter, unit: "PERCENT" };
  }
  if (opts.fillVar) {
    t.fills = [FILL(opts.fillVar)];
  }
  if (opts.align) t.textAlignHorizontal = opts.align;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────
// hexToRgb / makeGradient — para criar Paint Styles com gradient
// ─────────────────────────────────────────────────────────────────────────
//
//   const style = figma.createPaintStyle();
//   style.name = "Menu thumb / Burger";
//   style.paints = [makeGradient("#2A1708", "#0E0703", 155)];

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

// ─────────────────────────────────────────────────────────────────────────
// newComp — criar Component já parented à page (pré-req combineAsVariants)
// ─────────────────────────────────────────────────────────────────────────
//
//   const page = await figma.getNodeByIdAsync("10:5");
//   const v1 = newComp(page, "State=Default");
//   const v2 = newComp(page, "State=Locked");
//   const set = figma.combineAsVariants([v1, v2], page);

function newComp(page, name) {
  const c = figma.createComponent();
  c.name = name;
  page.appendChild(c);
  return c;
}

// ─────────────────────────────────────────────────────────────────────────
// repositionVariants — depois de combineAsVariants, posicionar variants
// ─────────────────────────────────────────────────────────────────────────
//
// combineAsVariants empilha tudo em x=0,y=0 (bug-04 nota).
// Reposicionar com padding=20, gap vertical=28 (convenção almaFlow).

function repositionVariants(set, padding, gap) {
  if (padding == null) padding = 20;
  if (gap == null) gap = 28;
  let y = padding;
  let maxW = 0;
  for (const v of set.children) {
    v.x = padding;
    v.y = y;
    y += v.height + gap;
    if (v.width > maxW) maxW = v.width;
  }
  set.resize(maxW + padding * 2, y - gap + padding);
  return { w: set.width, h: set.height, count: set.children.length };
}

// ─────────────────────────────────────────────────────────────────────────
// addAbsoluteStripe — stripe vertical absolute com STRETCH constraint
// ─────────────────────────────────────────────────────────────────────────
//
//   addAbsoluteStripe(variant, 3, "color/client/gold/default", "left");

function addAbsoluteStripe(parent, widthPx, fillVarName, side) {
  const stripe = figma.createRectangle();
  stripe.name = `Stripe ${side}`;
  stripe.fills = [FILL(fillVarName)];
  parent.appendChild(stripe);
  stripe.layoutPositioning = "ABSOLUTE";
  stripe.constraints = {
    horizontal: side === "right" ? "MAX" : "MIN",
    vertical: "STRETCH",
  };
  stripe.x = side === "right" ? parent.width - widthPx : 0;
  stripe.y = 0;
  stripe.resize(widthPx, parent.height);
  return stripe;
}
