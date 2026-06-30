---
name: visual-tuning-prototype
description: Use when a stakeholder keeps requesting precise visual layout changes — "make the logo lower", "put the email near the center", an exact gap/size — that you can't converge on verbally and that are slow to iterate through code-change → rebuild → screenshot cycles, especially when the control you tweak (flex ratios, margins, paddings) barely moves the result and you've already guessed once or twice without landing it.
---

# Visual Tuning Prototype

## Overview

When a human needs to pick **precise visual values** (spacing, position, size) and your loop is
`code → rebuild → eyeball → "a bit more / too much"`, **stop guessing**. Build a small interactive HTML
tool that renders the real component faithfully, exposes the tunable values as **live controls** (sliders +
drag) with **visual guides**, and **exports the chosen values mapped to the exact code lines**. The human
tunes directly; you port the numbers once.

**Core principle:** move the iteration into the browser — instant, human-driven — and reduce the device/code
side to a **single deterministic port**. Your job shifts from *"guess the number"* to *"build the knob and
read off the result."*

This builds on the project's `html-prototype` workflow (HTML+JSX prototype as the source of visual truth,
approve before porting). It is the specialization for **tuning exact values**, not mocking a new screen.

## When to use

- A stakeholder wants a layout value "just so" but can only describe it vaguely ("lower… too much… a hair less").
- Each `code change → rebuild → screenshot` cycle is slow (Flutter/native rebuild, deploy preview).
- The control you're tweaking **barely moves** the thing (e.g. `Spacer(flex)` ratios when content is tall).
- **You've iterated 1–2 times without converging.** That is the trigger — switch now, don't grind five cycles.

**When NOT to use:** a single obvious value; no human judgment needed; the loop is already instant (<2s hot
reload) **and** you can name the exact target value.

## The trap (why the loop never converges)

Two failures compound:

1. **Wrong control surface.** `Spacer(flex)` / `Expanded` only distribute *leftover* space. When the content
   nearly fills the screen, leftover is tiny, so changing the ratio (2:1 → 3:1) moves the block only a few px.
   The founder asks for "much lower"; the knob can't deliver it. (Real case: 3:1 moved ~15px.)
2. **You are a lossy translator.** Human speaks a feeling → you guess an integer → slow rebuild → human reacts
   to a number he never sees. Recency bias erases the previous version; nobody ever holds a value.

The fix attacks both: change the medium (browser, real-time) **and** hand the human the knob directly.

## Workflow (Cadillac end-to-end)

1. **Recognize the trigger early** (after 1–2 failed guesses, not 5). Name it: "this is a tuning problem, not a
   value problem — I'll build the knob."
2. **Activate the task** (`controle/`): reopen if closed, plan-mode + `AskUserQuestion` to pin the **control
   granularity** (single position drag · light fine-tune · full per-gap control), present the plan, get the ok.
3. **Build the tool** in `prototipos_html/<task-id>/` (React 18 + Babel standalone via CDN, CSS-var tokens,
   light/dark). Apply the **5 load-bearing details** below.
4. **Serve + self-verify** (`/iniciar-prototipo` or `python3 -m http.server`; or `preview_start` on the
   existing `prototipos` launch config, then navigate to `/<task-id>/`). Use the preview MCP: console clean,
   screenshot, exercise a slider + the drag loop, check both themes. The tool's own render must be faithful
   before the human touches it.
5. **Human tunes + approves.** Hand over the URL. He drags / moves sliders until the guides confirm it
   (email marker on the center line, no overflow warning). He types `/aprovar-plano`. **Read off the exact
   values** from the export panel (or his "Copiar valores" paste).
6. **Port the values 1:1 in ONE edit** (`1 Write` of the whole file — watchdog cadence). Pick a control
   surface that can *reach* the goal (see detail #5). Keep graceful behavior (e.g. bottom `Spacer(flex:1)` +
   `SliverFillRemaining` so it still collapses with the keyboard).
7. **Verify** (`superpowers:verification-before-completion`): `flutter analyze` (0) · `flutter test` · `smoke`
   · device `flutter drive` → **READ the screenshot** (not md5/size). Confirm it matches the approved tool.
8. **Close:** commit + push + merge the PR. Update `controle/` + memory.

## The 5 load-bearing details (what makes it actually work)

These are what agents miss — the baseline test showed strong agents reach for "harness + sliders" on their own
but drop these, and dropping any one of them quietly recreates the back-and-forth.

| # | Detail | Why it matters | Failure if skipped |
|---|--------|----------------|--------------------|
| 1 | **Recognize the trigger early** | 1–2 failed guesses = switch to the tool | Grind 5 rebuild cycles, frustrate the human |
| 2 | **Init to the EXACT current shipped values; keep in sync** | Human starts from reality; "Reset" reproduces the device | Defaults drift from prod → the tool *lies*; he tunes against a fiction |
| 3 | **Export mapped to exact code lines** (e.g. `Spacer(flex:3)` → `SizedBox(height: 88)`) + copy button | The port is mechanical, not a second guessing game | "Read off the numbers" → you re-translate, reintroducing error |
| 4 | **Validity feedback + objective guides** (center line, target marker, live delta, overflow/scroll/clip warning) | Makes "near the middle" measurable; a value that doesn't *fit* is wrong | He approves a pretty layout that scrolls/clips on device |
| 5 | **Match prototype model to port model + pick a reachable control surface** | The exported value must port 1:1 AND be able to achieve the goal | Tuned in flex (couldn't move it) or in absolute px that won't survive the port |

**Render faithfully** underpins all of it: real assets/SVG, real element order, realistic field heights, a real
device frame with safe-area insets, and a frame-size selector (the "center" depends on screen height).

## Cadillac gotchas (don't relearn these)

- **Watchdog cadence (#41/#37b):** 1 external edit per `ESTADO`+`LEDGER` touch; multi-region in one file → **one
  whole-file Write**. Memory (`~/.claude/.../memory/`) is gated as an external edit; **update memory while
  `fase=execucao`, before flipping `concluida`**. Editing `controle/` is always allowed and re-activates the task.
- **`flutter drive` (#33a/#40d):** canonical command is `flutter drive --driver=test_driver/integration_test.dart
  --target=integration_test/demo_screens_test.dart -d <sim>` — **do NOT** also pass `-t lib/main_demo.dart` (it
  overrides `--target` and kills the binding). The drive is reaped at turn end → run it under **Monitor** so the
  turn stays open; "Driver extension is taking a long time" is normal, not an error.
- **Format (#42):** this codebase does **not** use `dart format` (CI runs only `analyze` + `test`). Match the
  file's existing idiom — do **not** `dart format` (it diverges your file from its siblings and balloons the diff).
- **LEDGER cap 150:** compact it before logging if it's near the cap.
- **Approval is exact-match:** the watchdog records approval only when the prompt is exactly `aprovado` /
  `/aprovar-plano` with an active task — "approved + values in one message" does **not** count.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Keep tweaking the same control because "one more should do it" | After 2 guesses, build the tool |
| Tool opens at arbitrary defaults | Init to the exact shipped values; add "Reset to current" |
| Tool exports raw numbers | Export the actual code lines to change, with a copy button |
| Tune to "perfect center" ignoring fit | Add an overflow/clip warning; let the human trade off knowingly |
| Tune in `flex`/absolute px, then fight the port | Model the prototype the way the code lays out; port deterministically |
| Reformat the ported file with `dart format` | Match the file's idiom (CI doesn't enforce format here) |
| Claim "looks good" from md5/size of the screenshot | Open and **read** the PNG |

## Worked example — login spacing refino (PR #59)

Founder, on device: "logo clearly lower, email near the vertical center." Adjusting `Spacer(flex)` 2:1 → 3:1
moved ~15px (trap #1: tall content → tiny leftover). Decision: build the knob.

- **Tool:** `prototipos_html/2026-06-05-onboarding-fe/` (`index.html` + `components/login_positioner.jsx`).
  Reference implementation to copy/adapt. It renders the real login (logo SVG → email → password → forgot → OR →
  Google → Apple → Sign-in → Sign-up) inside an iPhone frame (393×852 / Pro 402×874, safe areas), with: a slider
  per gap **+ numeric input**, drag-the-block, an **amber center guideline** + **sage email-center marker** +
  live "Δ to center" readout, an **overflow warning**, light/dark, and a **"Valores para o Flutter"** export
  (each value mapped to its `login_screen.dart` line) with a copy button. It **initialized to the current
  shipped layout** (so it opened showing "email 95px above center" — exactly the complaint).
- **Key finding the tool surfaced:** the login block (587px) is taller than the usable area (711px), so email at
  the *exact* center forces the sign-up link ~65–80px off-screen (it would scroll). The overflow warning made
  this visible; the founder chose a big logo pushed down (email in the upper third, fits) instead.
- **Founder approved:** `topo=88 · logoW=240 · logoEmail=55` (rest unchanged) · 393×852.
- **Port — 3 lines, one `Write`** of `apps/mobile/lib/features/auth/presentation/login_screen.dart`:
  `Spacer(flex:3)` → `SizedBox(height: 88)` (fixed px, deterministic — detail #5, the surface flex couldn't
  reach); `BrandLogo(width: 190→240)`; gap `36→55`. Kept `Spacer(flex:1)` at the bottom + `SliverFillRemaining`.
- **Verify:** `analyze` 0 · `flutter test` 412 · `smoke-e03a` 35/35 · `flutter drive` iPhone 17 exit 0 →
  **read `10-login.png`** (logo bigger + lower, email upper-third, order intact, sign-up fits). CI green → PR
  **#59 merged** (`64bef60`, squash).

**Generalize:** the stack is incidental. Any time a human must choose exact visual values and the code loop is
slow/lossy, build the faithful knob, hand it over, export to the code, port once, verify by reading the result.
