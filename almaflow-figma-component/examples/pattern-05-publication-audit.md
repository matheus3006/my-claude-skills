# Pattern 05 — Audit pré-publicação obrigatório

## Quando usar
**Antes** de pedir ao usuário para publicar nova versão da library `almaFlow`. Falha em qualquer um dos 3 audits = não publicar.

## Os 3 audits obrigatórios

### 1. `findRawPaints` — zero raw hex

Critério: nenhum paint SOLID em qualquer property de cliente ComponentSet pode ter cor não-bindada.

```js
const FRAME_LIKE = new Set(["FRAME","COMPONENT","COMPONENT_SET","INSTANCE"]);
const styles = await figma.getLocalPaintStylesAsync();
const styleIds = new Set(styles.map(s => s.id));

function paintHasVarOrStyle(paint) {
  if (!paint) return true;
  if (paint.type !== "SOLID") return true;  // gradients são via Style, não bind
  return !!(paint.boundVariables && paint.boundVariables.color);
}

function isPaintLayerOk(node, kind) {
  const paints = node[kind];
  if (!paints || paints.length === 0) return { ok: true };
  const styleId = kind === "fills" ? node.fillStyleId : node.strokeStyleId;
  if (typeof styleId === "string" && styleId && styleIds.has(styleId)) return { ok: true };
  for (const p of paints) {
    if (!paintHasVarOrStyle(p)) return { ok: false };
  }
  return { ok: true };
}

function findRawPaints(node, results) {
  if ("fills" in node && Array.isArray(node.fills)) {
    const r = isPaintLayerOk(node, "fills");
    if (!r.ok) results.push({ id: node.id, name: node.name, type: node.type, kind: "fills" });
  }
  if ("strokes" in node && Array.isArray(node.strokes)) {
    const r = isPaintLayerOk(node, "strokes");
    if (!r.ok) results.push({ id: node.id, name: node.name, type: node.type, kind: "strokes" });
  }
  if (FRAME_LIKE.has(node.type) && Array.isArray(node.children)) {
    for (const c of node.children) findRawPaints(c, results);
  }
}

const clienteIds = [/* lista dos cliente ComponentSets */];
const rawPaints = [];
for (const id of clienteIds) {
  const n = await figma.getNodeByIdAsync(id);
  if (n) findRawPaints(n, rawPaints);
}
// FAIL se rawPaints.length > 0
```

### 2. `detectOverlaps` — zero sobreposição

Critério: nenhum par de ComponentSets/Components na Components page pode ter bounding boxes que se intersectam.

```js
const ids = [/* todos os cliente + Staff IDs */];
const out = [];
for (const id of ids) {
  const n = await figma.getNodeByIdAsync(id);
  out.push({
    id: n.id, name: n.name,
    x: Math.round(n.x), y: Math.round(n.y),
    w: Math.round(n.width), h: Math.round(n.height),
  });
}

const overlaps = [];
for (let i = 0; i < out.length; i++) {
  for (let j = i + 1; j < out.length; j++) {
    const a = out[i], b = out[j];
    if (a.x < b.x + b.w && a.x + a.w > b.x &&
        a.y < b.y + b.h && a.y + a.h > b.y) {
      overlaps.push({ a: a.name, b: b.name });
    }
  }
}
// FAIL se overlaps.length > 0
```

### 3. `verifyStaffIntegrity` — Staff library 100% intocada

Critério: cada um dos 16 Staff Node IDs precisa ter o mesmo `name`, `width` e `height` que tinha antes.

```js
const staffExpected = [
  { id: "21:110", name: "Button", w: 121, h: 3260 },
  { id: "31:46",  name: "Ticket card", w: 327, h: 580 },
  { id: "36:23",  name: "Sheet shell", w: 375, h: 812 },
  { id: "47:12",  name: "_Slot/Category button", w: 272, h: 56 },
  { id: "48:26",  name: "Action bar", w: 375, h: 192 },
  { id: "49:63",  name: "Topbar", w: 375, h: 442 },
  { id: "50:98",  name: "Category card", w: 375, h: 688 },
  { id: "78:26",  name: "_Slot/Sheet action", w: 327, h: 260 },
  { id: "85:101", name: "Release sheet", w: 375, h: 1664 },
  { id: "86:94",  name: "No-show sheet", w: 375, h: 812 },
  { id: "87:179", name: "Category detail sheet", w: 375, h: 1664 },
  { id: "174:238", name: "Status chip", w: 207, h: 54 },
  { id: "163:269", name: "Tab bar", w: 415, h: 240 },
  { id: "166:241", name: "Section header", w: 391, h: 154 },
  { id: "167:261", name: "Pre-order card", w: 391, h: 365 },
  { id: "168:234", name: "Pre-order empty state", w: 375, h: 97 },
];

const deltas = [];
for (const e of staffExpected) {
  const n = await figma.getNodeByIdAsync(e.id);
  if (!n) { deltas.push({ id: e.id, expected: e, actual: null }); continue; }
  if (n.name !== e.name || Math.round(n.width) !== e.w || Math.round(n.height) !== e.h) {
    deltas.push({ id: e.id, expected: e, actual: { name: n.name, w: n.width, h: n.height } });
  }
}
// FAIL se deltas.length > 0
```

(Versão consolidada e atualizada do snapshot em `references/audit-scripts.js`.)

## Workflow recomendado

```js
// Rodar tudo em um único use_figma call
const result = {
  rawPaints: [/* findRawPaints output */],
  overlaps: [/* detectOverlaps output */],
  staffDeltas: [/* verifyStaffIntegrity output */],
};

const allPassed = result.rawPaints.length === 0
                && result.overlaps.length === 0
                && result.staffDeltas.length === 0;

if (!allPassed) {
  // NÃO PUBLICAR. Fix bugs primeiro.
  console.error("Audit FAILED:", result);
} else {
  // OK pra pedir publicação manual
  console.log("Audit OK. Pedir publicação manual da library v1.X");
}
```

## Caso real desta sessão

Audit em S4 detectou:
- `rawPaints: 0` ✅
- `overlaps: 4` ❌ → 4 overlaps causados por sets que cresceram (Client topbar 1696w invadia Store card column; Menu item card 2852w invadia 3 outros). Fix: reposicionamento single-column-when-wide (ver `pattern-04-layout-2col-grid.md`).
- `staffDeltas: 0` ✅

Após reposicionamento: 0/0/0 → publicação liberada.

## Manter o snapshot Staff atualizado

Quando Staff library oficialmente publicar nova versão (Staff v8, v9 etc.), atualizar `staffExpected` em `references/audit-scripts.js`. O snapshot é fonte de verdade do "estado intacto" — falsos positivos virão se ele estiver stale.

## Referência cruzada
- Helpers em `references/audit-scripts.js`.
- Bug correlato: nenhum (esse é o gate positivo final).
- Patterns referenciados: 01 (token binding necessário), 04 (layout que evita overlaps).
