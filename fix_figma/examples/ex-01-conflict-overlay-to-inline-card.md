# Example 01 — WO_ Conflict Overlays → Inline ConflictSummary Card

## Frame
`13j — Dietas / Revisar plano · Footer gate (conflito)` (2983:230)  
File: `VRWykaDLUgqfIystanHOvf`

## Problem

**Issue type:** `ORPHAN_OVERLAY` (multiple)

Inside `AssistPanel` (2983:392), 5 loose elements were direct children with no semantic grouping:

| Node | Type | Problem |
|---|---|---|
| `WO_PanelConflict` (2983:453) | RECT 364×150 | Raw overlay covering Reconciliação section |
| `ConflictBlock_BG` (2983:454) | RECT 364×76 | Background rect floating over UI content |
| `! Conflitos com restricoes` (2983:455) | TEXT | Floating text with no container |
| `Iogurte c/ lactose — Sem lactose` (2983:456) | TEXT | Floating text with no container |
| `WO_NoConflict_Extra` (2985:230) | RECT 364×80 | Second raw overlay |

Inside `FooterBar` (2983:441), same pattern:
- `WO_CTA` — rectangle covering the real CTA button
- `CTA_Disabled_BG` — second rectangle on top
- `Chip_Conflito_BG` — raw pill rectangle at x=24
- `conflito a resolver` — floating text

## Truth Table

| Option | Description | Verdict |
|---|---|---|
| A | Reparent WO_ rects to their semantic zone | ❌ Still raw rects, no UX meaning |
| B | **Redesign as in-flow ConflictSummary card + disabled CTA** | ✅ Chosen |
| C | Move to canvas as documentation | ❌ These are functional UI states, not docs |
| D | Delete | ❌ State communication needed |

**Decision:** Option B. The conflict state is a functional UI state — it needs proper UX treatment, not an overlay patch.

## Fix Applied

### AssistPanel

1. Deleted `[Overlay] ConflictBlock` group (all 5 WO_ elements)
2. Modified Reconciliação bottom status row:
   - `✓` → `⚠` (amber-600 fill)
   - `Nenhum conflito` → `1 conflito com restrições detectado` (amber-700)
3. Created `ConflictSummary` frame in flow at y=444 (where Observações was):
   - Fill: amber-50 `#FFFBEB`
   - Left accent bar: 3px × 88px, fill amber-500
   - Title: `⚠  1 conflito detectado` — Inter Semi Bold 12px, amber-700
   - Item: `Iogurte c/ lactose  →  restrição: Sem lactose` — Inter Regular 12px
   - Link: `Ver restrições do paciente →` — Inter Regular 11px, amber-600
4. Shifted `Observações` from y=444 → y=544 (+100px)
5. Extended `AssistPanel` height 796 → 896

### FooterBar

1. Deleted `WO_CTA`, `CTA_Disabled_BG`, `Chip_Conflito_BG`, conflict text nodes
2. Styled `Continuar para Ativar →` button rect: fill neutral gray, opacity 0.5
3. Styled button text: opacity 0.4
4. Added `Resolva conflitos para continuar` tip at x=964, y=52 — amber-600

## Result Structure

```
AssistPanel (auto-layout vertical)
├── Rectangle (1px border)
├── PAINEL DE REVISÃO (label)
├── Resumo clínico (frame)
├── Reconciliação (frame)
│   └── [bottom row] ⚠ 1 conflito com restrições detectado
├── ConflictSummary (frame) ← NEW, in flow
│   ├── _accent (3px amber bar)
│   ├── ConflictSummary/title
│   ├── ConflictSummary/item
│   └── ConflictSummary/link
└── Observações (frame, shifted down)

FooterBar
├── Rectangle (divider)
├── ← Voltar (text)
├── Rectangle (Editar plano bg)
├── Editar plano (text)
├── Rectangle (CTA bg, gray+opacity) ← disabled
├── Continuar para Ativar → (text, opacity 0.4)
└── ConflictTip (amber-600 text below CTA)
```

## Key Principle

> WO_ overlays are designer shortcuts — they document WHAT should exist, not HOW it should be built.  
> Always replace them with proper in-flow UI components.
