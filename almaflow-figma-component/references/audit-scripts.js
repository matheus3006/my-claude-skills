// audit-scripts.js — 3 audits obrigatórios pré-publicação da library almaFlow.
// Cole o trecho relevante no topo do seu use_figma call.
// Última atualização: 2026-05-03 (após cliente v1.6).

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

const FRAME_LIKE = new Set(["FRAME","COMPONENT","COMPONENT_SET","INSTANCE"]);

// IDs cliente v1.6 (atualizar quando library evoluir)
const CLIENTE_IDS = [
  // v1.5 in-place edited (Node IDs preservados)
  "198:248",  // Client topbar
  "198:267",  // Store card
  "198:280",  // Queue status hero
  "198:286",  // Warn banner
  "198:307",  // Menu item card
  "198:312",  // Category tab
  "198:323",  // Pre-order item row
  "198:339",  // Pre-order lock banner
  // v1.6 new
  "239:15",   // Form field
  "239:40",   // Counter
  "239:48",   // LGPD consent box
  "239:55",   // Mini-cart pill
  "239:62",   // Stat tile
  "239:63",   // Menu link CTA
  "242:2",    // Info row (helper)
  "242:5",    // Info card
  "242:15",   // Cliente pre-order empty
  "243:2",    // Called hero
  "243:10",   // Cancelled hero
];

// Snapshot Staff library (atualizar quando Staff publicar versão nova oficialmente)
const STAFF_EXPECTED = [
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

// ─────────────────────────────────────────────────────────────────────────
// AUDIT 1: findRawPaints — zero hex cru em cliente components
// ─────────────────────────────────────────────────────────────────────────

async function findRawPaints(rootIds) {
  const styles = await figma.getLocalPaintStylesAsync();
  const styleIds = new Set(styles.map(s => s.id));

  function paintHasVarOrStyle(paint) {
    if (!paint) return true;
    if (paint.type !== "SOLID") return true;  // gradients via Style
    return !!(paint.boundVariables && paint.boundVariables.color);
  }

  function isPaintLayerOk(node, kind) {
    const paints = node[kind];
    if (!paints || paints.length === 0) return { ok: true };
    const styleId = kind === "fills" ? node.fillStyleId : node.strokeStyleId;
    if (typeof styleId === "string" && styleId && styleIds.has(styleId)) {
      return { ok: true };
    }
    for (const p of paints) {
      if (!paintHasVarOrStyle(p)) return { ok: false };
    }
    return { ok: true };
  }

  function walk(node, results) {
    if ("fills" in node && Array.isArray(node.fills)) {
      const r = isPaintLayerOk(node, "fills");
      if (!r.ok) results.push({ id: node.id, name: node.name, type: node.type, kind: "fills" });
    }
    if ("strokes" in node && Array.isArray(node.strokes)) {
      const r = isPaintLayerOk(node, "strokes");
      if (!r.ok) results.push({ id: node.id, name: node.name, type: node.type, kind: "strokes" });
    }
    if (FRAME_LIKE.has(node.type) && Array.isArray(node.children)) {
      for (const c of node.children) walk(c, results);
    }
  }

  const rawPaints = [];
  for (const id of rootIds) {
    const n = await figma.getNodeByIdAsync(id);
    if (n) walk(n, rawPaints);
  }
  return rawPaints;  // empty array = pass
}

// ─────────────────────────────────────────────────────────────────────────
// AUDIT 2: detectOverlaps — zero sobreposição entre ComponentSets na page
// ─────────────────────────────────────────────────────────────────────────

async function detectOverlaps(ids) {
  const out = [];
  for (const id of ids) {
    const n = await figma.getNodeByIdAsync(id);
    if (!n) continue;
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
        overlaps.push({
          a: a.name + " (" + a.id + ")",
          b: b.name + " (" + b.id + ")",
          aRect: `${a.x},${a.y} ${a.w}x${a.h}`,
          bRect: `${b.x},${b.y} ${b.w}x${b.h}`,
        });
      }
    }
  }
  return overlaps;  // empty array = pass
}

// ─────────────────────────────────────────────────────────────────────────
// AUDIT 3: verifyStaffIntegrity — Staff library não pode ter mudado
// ─────────────────────────────────────────────────────────────────────────

async function verifyStaffIntegrity() {
  const deltas = [];
  for (const e of STAFF_EXPECTED) {
    const n = await figma.getNodeByIdAsync(e.id);
    if (!n) {
      deltas.push({ id: e.id, expected: e, actual: null, reason: "missing" });
      continue;
    }
    const actual = { name: n.name, w: Math.round(n.width), h: Math.round(n.height) };
    if (actual.name !== e.name || actual.w !== e.w || actual.h !== e.h) {
      deltas.push({ id: e.id, expected: e, actual, reason: "drift" });
    }
  }
  return deltas;  // empty array = pass
}

// ─────────────────────────────────────────────────────────────────────────
// findSuspiciousDefaults — heurística para bug-02 (Add button 100×100)
// ─────────────────────────────────────────────────────────────────────────

async function findSuspiciousDefaults(rootIds) {
  function walk(node, results, parentName) {
    if (FRAME_LIKE.has(node.type) || node.type === "RECTANGLE") {
      // Frame ou rect com 100×100 dentro de auto-layout = suspeito
      if (Math.round(node.width) === 100 && Math.round(node.height) === 100) {
        results.push({
          id: node.id, name: node.name, type: node.type,
          parent: parentName, dims: "100x100 (default createFrame size — suspeito)",
        });
      }
    }
    if (FRAME_LIKE.has(node.type) && Array.isArray(node.children)) {
      for (const c of node.children) walk(c, results, node.name);
    }
  }

  const results = [];
  for (const id of rootIds) {
    const n = await figma.getNodeByIdAsync(id);
    if (n) walk(n, results, "(root)");
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────
// runAllAudits — executa os 3 audits + retorna verdict
// ─────────────────────────────────────────────────────────────────────────

async function runAllAudits() {
  const rawPaints = await findRawPaints(CLIENTE_IDS);
  const overlaps = await detectOverlaps(CLIENTE_IDS.concat(STAFF_EXPECTED.map(e => e.id)));
  const staffDeltas = await verifyStaffIntegrity();
  const suspicious = await findSuspiciousDefaults(CLIENTE_IDS);

  const passed = rawPaints.length === 0
              && overlaps.length === 0
              && staffDeltas.length === 0;

  return {
    passed,
    rawPaintCount: rawPaints.length,
    overlapCount: overlaps.length,
    staffDeltaCount: staffDeltas.length,
    suspiciousDefaultsCount: suspicious.length,
    rawPaints: rawPaints.slice(0, 20),
    overlaps: overlaps.slice(0, 20),
    staffDeltas,
    suspiciousDefaults: suspicious.slice(0, 20),
  };
}

// Uso no use_figma call:
//   const result = await runAllAudits();
//   figma.closePlugin(JSON.stringify(result, null, 2));
//
// Verdict:
//   passed === true → liberar publicação manual da library
//   passed === false → fix bugs primeiro, NÃO publicar
