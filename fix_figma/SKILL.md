---
name: fix_figma
description: Audit a Figma frame URL for structural errors (overlaps, out-of-bounds, text overflow, broken layouts) and apply a UX-justified fix. Uses /ui-ux-pro-max, /bencium-impact-designer, and /bencium-controlled-ux-designer to validate the best resolution path via a truth table before touching anything.
metadata:
  version: 1.0.0
---

# fix_figma — Figma Structural Audit & Fix

Receives a Figma frame URL, detects structural problems, proposes fix options using design skills, validates via a truth table, and implements the approved path.

## Invocation

```
/fix_figma <figma-url>
```

The URL must be a `figma.com/design/...?node-id=...` link pointing to a specific frame.

---

## Phase 1 — Structural Scan

Extract `fileKey` and `node-id` from the URL, then run the detection script below via `use_figma`.

### Detection Script

```javascript
// Run on the target frame and all descendants
const frameId = '<node-id>'; // replace : with : in node-id format
const frame = figma.root.findOne(n => n.id === frameId);
if (!frame) return 'Frame not found';

const issues = [];
const frameBounds = frame.absoluteBoundingBox;

function checkNode(node, depth = 0) {
  if (!node.absoluteBoundingBox) return;
  const nb = node.absoluteBoundingBox;

  // 1. Out-of-frame bounds (clips outside parent frame)
  if (depth > 0) {
    const pb = node.parent?.absoluteBoundingBox;
    if (pb && node.parent?.type === 'FRAME' && node.parent?.clipsContent) {
      const overRight  = nb.x + nb.width  - (pb.x + pb.width);
      const overBottom = nb.y + nb.height - (pb.y + pb.height);
      const overLeft   = pb.x - nb.x;
      const overTop    = pb.y - nb.y;
      if (overRight > 2 || overBottom > 2 || overLeft > 2 || overTop > 2) {
        issues.push({ type: 'OUT_OF_BOUNDS', id: node.id, name: node.name,
          detail: `overflows parent by R:${Math.round(overRight)} B:${Math.round(overBottom)} L:${Math.round(overLeft)} T:${Math.round(overTop)}` });
      }
    }
  }

  // 2. Orphan overlays at root frame level (WO_, Chip_, AnnotCard_, ConflictBlock_, Toast_, Modal_, CTA_Disabled_)
  const OVERLAY_PATTERNS = [/^WO_/, /^Chip_/, /^AnnotCard/, /^ConflictBlock/, /^CTA_Disabled/, /^Toast/, /^Modal_/];
  if (node.parent?.id === frameId && OVERLAY_PATTERNS.some(p => p.test(node.name))) {
    issues.push({ type: 'ORPHAN_OVERLAY', id: node.id, name: node.name,
      detail: `Floating overlay at root of frame — x:${Math.round(node.x)} y:${Math.round(node.y)}` });
  }

  // 3. Documentation annotations inside UI frames (AnnotCard_, [Anotações], [Doc])
  const DOC_PATTERNS = [/^\[Anotações\]/, /^\[Doc\]/, /^AnnotCard_BG/];
  if (node.parent?.id === frameId && DOC_PATTERNS.some(p => p.test(node.name))) {
    issues.push({ type: 'DOC_IN_UI_FRAME', id: node.id, name: node.name,
      detail: `Documentation element inside UI frame — should be on canvas below frame` });
  }

  // 4. Text nodes wider than parent
  if (node.type === 'TEXT') {
    const pb = node.parent?.absoluteBoundingBox;
    if (pb && nb.width > pb.width + 4) {
      issues.push({ type: 'TEXT_OVERFLOW_WIDTH', id: node.id, name: node.name,
        detail: `Text ${Math.round(nb.width)}px wider than parent ${Math.round(pb.width)}px` });
    }
    if (pb && nb.height > pb.height + 4) {
      issues.push({ type: 'TEXT_OVERFLOW_HEIGHT', id: node.id, name: node.name,
        detail: `Text ${Math.round(nb.height)}px taller than parent ${Math.round(pb.height)}px` });
    }
  }

  // Recurse
  if ('children' in node) node.children.forEach(c => checkNode(c, depth + 1));
}

checkNode(frame);
return JSON.stringify({ frameId, frameName: frame.name, issueCount: issues.length, issues }, null, 2);
```

---

## Phase 2 — Issue Classification

After scan, classify each issue into one of four categories:

| Category | Trigger | Root Cause |
|---|---|---|
| `ORPHAN_OVERLAY` | WO_, Chip_, Toast_, Modal_ at root | Designer copy-pasted overlay without reparenting |
| `DOC_IN_UI_FRAME` | AnnotCard_, [Anotações] inside frame | Documentation artifact placed inside UI frame |
| `OUT_OF_BOUNDS` | Node overflows clipping parent | Wrong parent, wrong coordinates, or missing clipsContent=false |
| `TEXT_OVERFLOW` | Text wider/taller than container | Fixed-size container without text wrapping |

---

## Phase 3 — Fix Options via Truth Table

For each issue found, invoke the three design skills mentally and build a truth table. **Do not implement until user approves.**

### Truth Table Template

| Option | Description | ui-ux-pro-max | bencium-impact-designer | bencium-controlled-ux-designer | Complexity | Recommended |
|---|---|---|---|---|---|---|
| A | Reparent to semantic parent frame | ✓ error-near-field | ✓ functional layering | ✓ material honesty | Low | ✓ if parent exists |
| B | Redesign as in-flow component (no overlay) | ✓ progressive-disclosure | ✓ commit boldly | ✓ simplicity through reduction | Medium | ✓ if state communication needed |
| C | Move to canvas below frame (doc artifacts) | ✓ nav-hierarchy | ✓ every element justified | ✓ invisibility of tech | Low | ✓ for documentation overlays |
| D | Delete (if truly redundant) | ✓ | ✓ | ✓ | None | ✓ if no information loss |

### Design Skill Decision Rules

**From `/ui-ux-pro-max`:**
- `error-placement` → errors belong near the field they relate to, not floating
- `primary-action` → each screen has one primary CTA; WO_CTA overlays violate this
- `progressive-disclosure` → state documentation → show below frame, not on top

**From `/bencium-impact-designer`:**
- Every element must justify its existence — orphan overlays don't
- Commit to a direction: inline card > floating rectangle overlay
- Functional layering over visual depth: no WO_ workarounds

**From `/bencium-controlled-ux-designer`:**
- Material honesty: UI elements communicate function, not compensate for structural errors
- Simplicity through reduction: if an overlay exists only to patch a missing state, design the state properly

---

## Phase 4 — Implementation

After user approves the chosen option:

### ORPHAN_OVERLAY fix (Option A — reparent)
```javascript
// Find semantic parent (AssistPanel, FooterBar, Main, WizardCard, etc.)
const orphan = figma.root.findOne(n => n.id === '<orphan-id>');
const semanticParent = figma.root.findOne(n => n.name === '<parent-name>');
const newX = orphan.absoluteBoundingBox.x - semanticParent.absoluteBoundingBox.x;
const newY = orphan.absoluteBoundingBox.y - semanticParent.absoluteBoundingBox.y;
semanticParent.appendChild(orphan);
orphan.x = newX; orphan.y = newY;
```

### ORPHAN_OVERLAY fix (Option B — redesign as inline card)
See `examples/ex-01-conflict-overlay-to-inline-card.md` for full pattern.

### DOC_IN_UI_FRAME fix (Option C — move to canvas)
```javascript
const annotFrame = figma.root.findOne(n => n.id === '<doc-frame-id>');
const uiFrame = figma.root.findOne(n => n.id === '<ui-frame-id>');
const section = uiFrame.parent; // or figma.currentPage
const targetAbsX = uiFrame.absoluteBoundingBox.x + 240; // align with Main column
const targetAbsY = uiFrame.absoluteBoundingBox.y + uiFrame.height + 40; // below frame
const secAbsX = section.absoluteBoundingBox?.x ?? 0;
const secAbsY = section.absoluteBoundingBox?.y ?? 0;
section.appendChild(annotFrame);
annotFrame.x = targetAbsX - secAbsX;
annotFrame.y = targetAbsY - secAbsY;
annotFrame.name = '[Doc] ' + annotFrame.name.replace(/^\[Anotações\]\s*/, '');
```

### OUT_OF_BOUNDS fix
```javascript
// Option 1: set clipsContent = false on parent
parent.clipsContent = false;
// Option 2: reparent to larger container
// Option 3: resize parent to fit content
```

---

## Phase 5 — Verification

After fix, re-run Phase 1 scan on the same frame. Confirm:
- `issueCount === 0`
- No new overlaps introduced
- Frame structure: only `Sidebar` + `Main` (+ semantic children) at root level

---

## Naming Conventions

| Prefix | Meaning | Action |
|---|---|---|
| `WO_` | Workaround overlay | Remove or reparent; redesign the underlying state |
| `Chip_` | Status chip overlay | Reparent to parent bar/footer; remove _BG raw rect |
| `AnnotCard_` | Annotation background | Move to canvas below frame |
| `[Anotações]` | Documentation group | Move to canvas; rename `[Doc]` |
| `[Overlay]` | Grouped workarounds | Evaluate if they can be redesigned inline |
| `CTA_Disabled_` | Disabled state overlay | Redesign with proper opacity/fill on CTA rect |
| `ConflictBlock_` | Conflict state overlay | Use Option B: ConflictSummary inline card |

---

## Examples

See `examples/` directory for annotated fix patterns:

- [`ex-01-conflict-overlay-to-inline-card.md`](examples/ex-01-conflict-overlay-to-inline-card.md) — WO_ conflict overlays → ConflictSummary card in AssistPanel flow
- [`ex-02-annotation-overlay-to-canvas-doc.md`](examples/ex-02-annotation-overlay-to-canvas-doc.md) — [Anotações] inside UI frame → moved to section canvas below frame

---

## Anti-Patterns (Never Do)

- **Never** group orphan overlays into `[Overlay]` and leave them inside the frame — this is structural debt, not a fix
- **Never** set `clipsContent=false` to "hide" an overflow problem — investigate why it overflows
- **Never** move a documentation frame to a hidden layer — move it to canvas level instead
- **Never** implement a fix before presenting the truth table to the user
- **Never** delete elements without confirming they carry no information value
