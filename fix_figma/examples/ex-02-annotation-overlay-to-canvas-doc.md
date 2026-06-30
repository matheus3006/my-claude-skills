# Example 02 — Documentation Annotation Inside UI Frame → Canvas Level

## Frame
`13k — Dietas / Revisar plano · Autosave states` (2986:230)  
File: `VRWykaDLUgqfIystanHOvf`

## Problem

**Issue type:** `DOC_IN_UI_FRAME`

A documentation frame `[Anotações] Autosave States` (3102:418) was a direct child of the UI frame 2986:230:

- Frame size: 1440×1050
- Annotation position: x=170, y=68 (1100×112)
- x=170 **invades the Sidebar** (Sidebar spans x=0 to x=240)
- y=68 **covers the Topbar** (Topbar spans y=0 to y=60)

The annotation was documenting three chip states of the Topbar autosave indicator:
- `idle` → "Rascunho salvo"
- `saving` → "● Salvando..."
- `success` → "✓ Salvo!"

This is **design documentation**, not functional UI. It has no place inside the UI frame it overlaps.

## Truth Table

| Option | Description | Verdict |
|---|---|---|
| A | Reparent to Topbar as actual chip component variants | ✅ Ideal long-term, but requires component refactor |
| B | **Move to canvas below frame as standalone doc artifact** | ✅ Chosen — immediate fix, zero information loss |
| C | Hide with visibility toggle | ❌ Hidden debt, not fixed |
| D | Delete | ❌ Documentation has value for devs |

**Decision:** Option B. Documentation frames belong on the canvas adjacent to their reference frame, not inside it.

## Fix Applied

```javascript
const annotFrame = figma.root.findOne(n => n.id === '3102:418');
const uiFrame    = figma.root.findOne(n => n.id === '2986:230');
const section    = figma.root.findOne(n => n.id === '2954:230');

// Target: below frame, aligned with Main column (x+240), 40px gap
const targetAbsX = uiFrame.absoluteBoundingBox.x + 240;
const targetAbsY = uiFrame.absoluteBoundingBox.y + uiFrame.height + 40;
const secAbsX    = section.absoluteBoundingBox.x;
const secAbsY    = section.absoluteBoundingBox.y;

section.appendChild(annotFrame);
annotFrame.x = targetAbsX - secAbsX;  // → 3280 in section coords
annotFrame.y = targetAbsY - secAbsY;  // → 3350 in section coords
annotFrame.name = '[Doc] Autosave Chip States';
annotFrame.resize(960, annotFrame.height);
```

## Result

**Before:**
```
13k frame (2986:230) — 1440×1050
├── Sidebar (0,0) 240×1050
├── Main (240,0) 1200×1050
└── [Anotações] Autosave States (170,68) 1100×112  ← overlaps both Sidebar and Topbar
```

**After:**
```
13k frame (2986:230) — 1440×1050
├── Sidebar (0,0) 240×1050
└── Main (240,0) 1200×1050         ← clean

Section canvas (2954:230)
├── 13k frame (at section coords 3040,2260)
└── [Doc] Autosave Chip States (at section coords 3280,3350)  ← 40px below frame, Main-aligned
```

Frame 13k now has exactly 2 children: `Sidebar` and `Main`.

## Anatomy of the Correct Documentation Placement

```
┌──────────────── 13k UI Frame (1440×1050) ──────────────────┐
│  Sidebar (240px) │  Main (1200px)                          │
│  nav items       │  Topbar: [...breadcrumb] [Rascunho salvo]│
│                  │  HeaderStrip                             │
│                  │  ReviewColumn | AssistPanel              │
│                  │  FooterBar                               │
└─────────────────────────────────────────────────────────────┘
                           ↕ 40px gap
              ┌────────── [Doc] Autosave Chip States (960px) ──────┐
              │  AUTOSAVE CHIP — ESTADOS DO TOPBAR                 │
              │  [Rascunho salvo] → [● Salvando...] → [✓ Salvo!]  │
              │    idle (default)      saving           success     │
              └────────────────────────────────────────────────────┘
```

## Key Principle

> Documentation frames that span across multiple UI zones (Sidebar+Main) cannot be placed inside any one of those zones without causing overlap.  
> They must live on the canvas, adjacent to the frame they annotate — never inside it.

## When to Use This Pattern vs. Example 01

| Situation | Pattern |
|---|---|
| Overlay is a **functional UI state** (conflict, error, toast) | Ex-01: redesign as in-flow component |
| Overlay is **design documentation** (chip states, annotation cards) | Ex-02: move to canvas below frame |
| Overlay is an **intermediate workaround** (WO_ prefix) | Ex-01: identify the state it represents, implement properly |
