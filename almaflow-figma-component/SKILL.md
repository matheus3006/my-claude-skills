---
name: almaflow-figma-component
description: Use ao criar ou editar ComponentSets/Components na library `almaFlow` do Figma do AlMaFlow (file `ef4cdtGuwgovAERD3kMhHg`, Components page `10:5`) via `use_figma` MCP. Cobre sequência canônica para evitar bugs reais do Plugin API (default FIXED 100×100, padding/itemSpacing defaults ao ativar layoutMode, fontes DM Sans `SemiBold` sem espaço, `combineAsVariants` exigindo parent comum), helpers de token binding (`FILL`, `setRadius`), workflow de variant addition em set existente, gradiente via Paint Style, convenção de layout 2-col na Components page, e audit pré-publicação obrigatório (zero raw hex, zero overlaps, Staff library integrity). Invoque sempre que tocar a library cliente ou Staff do AlMaFlow — mesmo que o pedido só mencione "criar componente Figma" ou "editar variant" sem detalhar AlMaFlow. NÃO use para frames de tela em Ready for dev `10:6` (esses ficam em `/nova-tela-fe`).
version: 0.2.0
---

# almaflow-figma-component

Skill complementar à `figma_guide` (genérica do Plugin API) com aprendizados específicos da library `almaFlow` no file `ef4cdtGuwgovAERD3kMhHg`. Bugs documentados aqui foram coletados em produção durante a evolução cliente v1.5 → v1.6 (task `2026-05-03-figma-cliente-v1-components-v1-6`), onde 8 ComponentSets foram editados in-place e 11 novos foram criados. Cada um dos bugs catalogados em `examples/` custou ao menos um retry — o objetivo da skill é que essa experiência não se repita.

## Quando esta skill se aplica

- Editar ComponentSet existente da library cliente ou Staff (`almaFlow`).
- Criar ComponentSet novo na Components page `10:5`.
- Adicionar variant a set existente (nova dimensão ou novo value).
- Renomear/reposicionar componente publicado.
- Auditar a library antes de publicar nova versão.

## Quando **não** se aplica

- Criar/editar frame de tela em Ready for dev `10:6` → use `/nova-tela-fe`.
- Refatorar código Angular consumidor de Figma → use `/almaflow-feature`.
- Mudança puramente conceitual em ADR/MVP → use `/almaflow-att-docs`.

## Pré-requisitos

1. **Ler `figma_guide`** global primeiro — top-level `await` no MCP, fontes (cache vs novas), `layoutPositioning="ABSOLUTE"`, clipping invisível, cascade manual de resize. Esta skill assume essas regras.
2. **Conhecer a topologia do file**:
   - `Components` (page `10:5`): todas as ComponentSets + Components da library.
   - `Ready for dev` (page `10:6`): frames de tela. **Fora de escopo desta skill.**
3. **Library publicada**: `almaFlow`, libraryKey `lk-7a5a8b0c64a9...c2fd` (versão atual no registry: `docs_almaFlow/frontend/figma-screen-registry.md > Library versions`).

## Golden path — editar variant existente in-place

Sequência abaixo evita os 8 bugs catalogados em `examples/`. Use como template e ajuste conteúdo.

> **Antes de criar componente novo, conferir `references/HTML-prototype-mapping.md`** — pode já existir mapping HTML→Figma para o componente; nesse caso, edite o existente em vez de duplicar.

```js
// === 0. Top-level await funciona no MCP use_figma ===
await figma.loadFontAsync({ family:"Bebas Neue", style:"Regular" });
await figma.loadFontAsync({ family:"DM Sans",    style:"Regular" });
await figma.loadFontAsync({ family:"DM Sans",    style:"SemiBold" });  // SEM espaço (bug-01)
await figma.loadFontAsync({ family:"DM Sans",    style:"Bold" });

// === 1. Helpers (ver references/helpers.js para versão completa) ===
const allVars = await figma.variables.getLocalVariablesAsync();
const V = (name) => allVars.find(v => v.name === name);
const FILL = (varName, alpha) => figma.variables.setBoundVariableForPaint(
  { type:"SOLID", color:{r:0,g:0,b:0}, opacity: alpha == null ? 1 : alpha },
  "color", V(varName)
);
function setRadius(node, varName) {
  const v = V(varName);
  for (const c of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"]) {
    node.setBoundVariable(c, v);
  }
}

// === 2. Editar variant existente preservando Node ID ===
const variant = await figma.getNodeByIdAsync("198:281");  // exemplo: Warn banner Visible
for (const c of [...variant.children]) c.remove();

// === 3. layoutMode IMEDIATAMENTE seguido de zerar defaults ===
//      Figma aplica padding=16 e itemSpacing=10 quando você ativa auto-layout (bug-06)
variant.layoutMode        = "VERTICAL";
variant.paddingTop = 0; variant.paddingRight = 0;
variant.paddingBottom = 0; variant.paddingLeft = 0;
variant.itemSpacing       = 0;

// === 4. Sizing modes ANTES do resize ===
variant.primaryAxisSizingMode = "AUTO";   // VERTICAL: height hugs content
variant.counterAxisSizingMode = "FIXED";  // VERTICAL: width fixo
variant.resize(327, variant.height);

// === 5. Estilo via tokens semânticos (NUNCA hex cru) ===
variant.fills = [FILL("color/client/gold/soft")];
variant.strokes = [FILL("color/client/gold/default")];
variant.strokeWeight = 1;
variant.strokeAlign = "INSIDE";
setRadius(variant, "radius/md");

// === 6. Children: para CADA frame-filho de auto-layout, layoutSizing* explícito ===
//      Sem isso, frames-filho herdam default FIXED 100×100 (bug-02)
const inner = figma.createFrame();
inner.name = "Content";
inner.layoutMode = "HORIZONTAL";
inner.paddingTop = 12; inner.paddingBottom = 12;
inner.paddingLeft = 18; inner.paddingRight = 14;
inner.itemSpacing = 12;
inner.fills = [];
variant.appendChild(inner);
inner.layoutSizingHorizontal = "FILL";  // ← OBRIGATÓRIO após appendChild
inner.layoutSizingVertical   = "HUG";   // ← OBRIGATÓRIO após appendChild

// === 7. Stripes/badges absolutos: appendChild → layoutPositioning → constraints → resize ===
const stripe = figma.createRectangle();
stripe.fills = [FILL("color/client/gold/default")];
variant.appendChild(stripe);                               // 1. parent primeiro
stripe.layoutPositioning = "ABSOLUTE";                     // 2. depois absoluto
stripe.constraints = { horizontal:"MIN", vertical:"STRETCH" }; // 3. constraints
stripe.x = 0; stripe.y = 0;
stripe.resize(3, variant.height);                          // 4. resize por último

figma.closePlugin(JSON.stringify({ id: variant.id, w: variant.width, h: variant.height }));
```

## Golden path — criar ComponentSet novo (multi-variant)

```js
const page = await figma.getNodeByIdAsync("10:5");

function newComp(name) {
  const c = figma.createComponent();
  c.name = name;
  page.appendChild(c);  // ← OBRIGATÓRIO antes de combineAsVariants (bug-04)
  return c;
}

const v1 = newComp("State=Default");
/* build content with same pattern as Golden path 1 (zerar padding, sizing modes, etc.) */

const v2 = newComp("State=Locked");
/* build content */

const set = figma.combineAsVariants([v1, v2], page);
set.name = "Pre-order item row";
set.x = 10595; set.y = 1620;  // convenção 2-col, ver pattern-04
set.fills = [];
set.strokes = [];

// combineAsVariants empilha variants em x=0,y=0 — reposicionar manualmente
let y = 20, maxW = 0;
for (const v of set.children) {
  v.x = 20; v.y = y;
  y += v.height + 28;
  if (v.width > maxW) maxW = v.width;
}
set.resize(maxW + 40, y - 28 + 20);
```

## Convenção de layout — Components page (10:5)

Detalhes em `examples/pattern-04-layout-2col-grid.md`.

| Largura set | Posicionamento |
|---|---|
| ≤ 700px | 2 colunas: x=10595 (left) / x=11600 (right), gap vertical=80 |
| > 700px | Full row sozinho na coluna left (x=10595), gap=80 |
| Variants dentro do set | padding=20, vertical gap=28 |

Wide sets típicos: Client topbar (4 variants × 393w → 1696w), Menu item card (8 variants × 327w → 2852w).

## Naming hygiene

Antes de criar um componente novo, **search_design_system** pelo nome — Staff library tem nomes genéricos que conflitam (ex.: `168:234 Pre-order empty state` vs cliente). Prefixe com "Cliente" (ou semântica equivalente) quando ambíguo.

```js
async function nameAvailable(name) {
  const r = await figma.searchDesignSystem({ query: name });
  return r.components.filter(c => c.name === name).length === 0;
}
const desired = "Pre-order empty state";
if (!(await nameAvailable(desired))) {
  // Renomear para "Cliente pre-order empty" antes de criar
}
```
Detalhes e convenções de prefix em `examples/bug-08-name-clash-staff.md`.

## Audit obrigatório antes de publicar

Rodar os 3 scripts de `references/audit-scripts.js`:

| Audit | Critério de falha |
|---|---|
| `findRawPaints` | qualquer `paint.type==="SOLID"` sem `boundVariables.color` e sem `fillStyleId/strokeStyleId` em local styles |
| `detectOverlaps` | qualquer par de ComponentSets com bounding boxes que se intersectam |
| `verifyStaffIntegrity` | qualquer um dos 16 Staff Node IDs com `name`, `width` ou `height` diferente do esperado |

Snapshot de Staff IDs esperados em `references/audit-scripts.js` (atualizar quando Staff library evoluir oficialmente).

**One-liner (cole `references/audit-scripts.js` inteiro no use_figma call e termine com)**:
```js
const result = await runAllAudits();
figma.closePlugin(JSON.stringify(result, null, 2));
// result.passed === true → publicar; false → fixar bugs primeiro
```

## Checklist rápido pré-execução

- [ ] Li `figma_guide` global?
- [ ] Auditei tokens existentes (`getLocalVariablesAsync` + filter por nome) antes de criar novo?
- [ ] Cada frame-filho de auto-layout tem `layoutSizingHorizontal/Vertical` explícito após `appendChild`?
- [ ] Zerei `paddingTop/Right/Bottom/Left` e `itemSpacing` imediatamente após setar `layoutMode`?
- [ ] DM Sans carregado com style `"SemiBold"` (sem espaço)?
- [ ] Components appendados à page ANTES de `combineAsVariants`?
- [ ] Stripes/badges absolutos: `appendChild → layoutPositioning → constraints → resize` (nessa ordem)?
- [ ] Type-guard `if (FRAME_LIKE.has(node.type))` antes de acessar `.children/.layoutMode` em walk recursivo?
- [ ] Nome do componente não colide com Staff library (`search_design_system` antes de criar)?
- [ ] Reposicionei variants dentro do set após `combineAsVariants` (ou eles ficam empilhados em x=0,y=0)?
- [ ] Rodei os 3 audits (`findRawPaints`, `detectOverlaps`, `verifyStaffIntegrity`)?
- [ ] Tirei screenshot de cada componente novo/editado e comparei visualmente vs HTML protótipo correspondente?

## Bugs catalogados (consultar quando o sintoma aparecer)

| # | Bug | Sintoma típico | Ver |
|---|---|---|---|
| 1 | DM Sans font name | `Cannot use unloaded font "DM Sans Semi Bold"` | `examples/bug-01-dm-sans-fontname.md` |
| 2 | Default FIXED 100×100 | Frame-filho ocupa altura/largura demais | `examples/bug-02-add-button-fixed-100.md` |
| 3 | Auto-layout sequence | Variant sai com largura/altura erradas | `examples/bug-03-warn-banner-sequence.md` |
| 4 | combineAsVariants orphan | "Grouped nodes must be in the same page" | `examples/bug-04-combine-variants-orphan.md` |
| 5 | ABSOLUTE positioning order | Stripe não aparece ou conta na primary axis | `examples/bug-05-stripe-absolute-order.md` |
| 6 | Padding/itemSpacing defaults | Variant ganha 16/10 sem você pedir | `examples/bug-06-padding-itemspacing-defaults.md` |
| 7 | Type guards faltando | `TypeError: no such property 'children' on TEXT` | `examples/bug-07-type-guards.md` |
| 8 | Staff name clash | search_design_system retorna 2 componentes | `examples/bug-08-name-clash-staff.md` |

## Padrões validados (consultar como receita)

| # | Pattern | Ver |
|---|---|---|
| 1 | Token binding canônico (fills/strokes/radius/padding/gap) | `examples/pattern-01-token-binding.md` |
| 2 | Gradiente via Paint Style (não Variable) | `examples/pattern-02-paint-style-gradient.md` |
| 3 | Variant addition em ComponentSet existente | `examples/pattern-03-variant-addition.md` |
| 4 | Layout convention 2-col na Components page | `examples/pattern-04-layout-2col-grid.md` |
| 5 | Audit pre-publicação (3 scripts) | `examples/pattern-05-publication-audit.md` |

## Referências executáveis

- `references/helpers.js` — `V`, `FILL`, `setRadius`, `setupAutoLayout` prontos pra colar.
- `references/audit-scripts.js` — `findRawPaints`, `detectOverlaps`, `verifyStaffIntegrity` prontos pra colar.
- `references/HTML-prototype-mapping.md` — mapping classes HTML do protótipo cliente → ComponentSet Figma → Node ID.
- `examples/images/` — screenshots dos componentes finais (referência visual + casos broken/fixed).
