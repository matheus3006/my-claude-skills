# Pattern 06 — Brand-glow halo (RECTANGLE full-frame + 2 GRADIENT_RADIAL stacked)

Padrão canônico do brand-glow halo das telas top-level em `Ready for dev` (`10:6`). Estabelecido em T03.06 (O1 Owner consolidated dashboard, 2026-05-06) como referência visual; replicado erroneamente em T03.01 (sem halo) e T03.02 (ELLIPSE solid alpha) antes de ser uniformizado em 2026-05-07.

## Quando aplicar

- Toda tela top-level em `Ready for dev` que precisa de brand presence ambient (não-auth).
- Telas com `Internal page header 340:2` ou `Brand hero 291:12` no topo.
- Frames com Brand=Cadillac mode (Neutral mode mantém halo red — backlog: variant per-mode se necessário).

## Quando NÃO aplicar

- Auth telas com `Brand hero` que já provê brand presence (S1 Login).
- Sheets/modais (não são frames top-level).
- Frames inteiramente skeleton (loading) — opcional, consultar usuário.

## Definição canônica

```
RECTANGLE
- name: "Brand glow halo"
- layoutPositioning: "ABSOLUTE"
- constraints: { horizontal: "STRETCH", vertical: "STRETCH" }
- x: 0, y: 0
- w/h: frame.width / frame.height (full-frame)
- strokes: []
- fills: 2 paints, both GRADIENT_RADIAL, both opacity 1, NORMAL blend
  - color: rgb(0.7843, 0.1568, 0.1647) ≈ #C82829 cadilac red
  - Layer 1 (subtle outer): stops [0/0.22, 0.65/0, 1/0]
  - Layer 2 (intense inner): stops [0/0.36, 0.55/0, 1/0]
- z-order: insertChild(0, halo) — atrás de todo conteúdo
```

## Frames-referência canônicos (clone fills daqui)

| Viewport | Frame | Halo node | Width × Height |
|---|---|---|---|
| Desktop ≥1000w | `452:372` (O1 desktop network-empty) | `458:21` | 1280×900 |
| Mobile <1000w  | `453:2` (O1 mobile all-clean) | `458:25` | 375×812 |

## Implementação canônica (Figma Plugin API)

```javascript
const haloDesktopTpl = await figma.getNodeByIdAsync("458:21");
const haloMobileTpl = await figma.getNodeByIdAsync("458:25");

const addHalo = (frame) => {
  const halo = figma.createRectangle();
  halo.name = "Brand glow halo";
  frame.appendChild(halo);                                          // 1. parent first
  halo.layoutPositioning = "ABSOLUTE";                              // 2. opt out of auto-layout
  halo.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };// 3. stretch on resize
  halo.x = 0; halo.y = 0;
  halo.resize(frame.width, frame.height);                           // 4. full-frame
  halo.strokes = [];
  halo.fills = (frame.width < 1000 ? haloMobileTpl : haloDesktopTpl).fills; // 5. clone gradient
  frame.insertChild(0, halo);                                       // 6. z-order behind
};
```

## Anti-patterns (NÃO use)

- ❌ ELLIPSE 500×240 / 900×280 com SOLID `color/tenant/glow` alpha 0.22 — visual flat, não-stacked, não combina com O1.
- ❌ Sem halo — brand presence inconsistente entre telas.
- ❌ ELLIPSE com gradient mesmo radial — usar RECTANGLE.
- ❌ Inventar gradient definition own — sempre clonar fills de O1.
- ❌ Bind `color/tenant/glow` no fill — token é alpha-only solid, não cobre gradient stops.

## Audit nuance

`findRawPaints` audit (em `references/audit-scripts.js`) só flaga `SOLID` paints sem `boundVariables.color` e sem `fillStyleId` — `GRADIENT_RADIAL` com cor RGBA raw NÃO é flagged. Por isso é OK clonar fills do O1 (RGBA hardcoded) sem precisar bind a token. Documentado em T03.06 LEDGER decision D21.

## Verification script

```javascript
const halo = frame.children.find(c => c.name === "Brand glow halo");
const ok = halo
  && halo.type === "RECTANGLE"
  && halo.layoutPositioning === "ABSOLUTE"
  && halo.constraints.horizontal === "STRETCH"
  && halo.constraints.vertical === "STRETCH"
  && Math.round(halo.width) === Math.round(frame.width)
  && Math.round(halo.height) === Math.round(frame.height)
  && halo.fills.length === 2
  && halo.fills.every(f => f.type === "GRADIENT_RADIAL");
console.assert(ok, "Halo not in canonical pattern");
```

## Audit cross-task — frames já corretos (referência)

- O1 desktop: `452:2`, `452:83`, `452:178`, `452:299`, `452:372`
- O1 mobile: `453:2`, `453:82`, `453:176`, `453:296`, `453:368`
- C1 (corrected 2026-05-07 by T03.02): `486:2`, `486:47`, `486:93`, `486:126`, `486:160`, `486:171`, `486:183`, `486:224`
- SM1: `501:2`, `501:53`, `507:2`, `507:61`, `507:119`, `507:178`, `507:236`, `507:280`, `507:324`, `507:363`
- O2 desktop: `403:2`, `404:2`, `404:125`, `404:216`, `404:315`, `404:327` (per O2 task LEDGER)
- O2 mobile: `405:2`, `405:176`, `405:329`, `405:479`, `405:491`
- SM2: `357:2`, `360:*` series

## Pre-flight checklist

- [ ] Frame target tem brand presence esperada (sim → aplicar / não → skip)?
- [ ] Já clonei fills de `458:21` (desktop ≥1000w) ou `458:25` (mobile <1000w)?
- [ ] Halo é primeiro child (`insertChild(0, halo)`)?
- [ ] Audit pós-criação passa o verification script acima?
- [ ] Screenshot visual: halo subtil top-center red glow, mais intenso no centro topo, fade diagonal?
