---
name: figma_guide
description: Guia completo para trabalhar com Figma via MCP `use_figma`. Cobre limitações de execução síncrona, carregamento de fontes, armadilhas de auto-layout, bugs invisíveis de clipping/overflow, cascata manual de resize e workflow HTML→Figma. Invocar ANTES de qualquer tarefa que envolva criar ou editar nodes no Figma.
---

# figma_guide — trabalho com Figma via MCP `use_figma`

Consultar este guia **antes** de qualquer edição no Figma. Cada seção vem de bugs reais encontrados e resolvidos em produção (controle `figma-template-tela`, abril 2026).

---

## 1. Execução — top-level await FUNCIONA, `.then()` NÃO

**Descoberta crítica (abril 2026):** top-level `await` funciona no MCP `use_figma`. O código é executado como módulo ES — não precisa envolver em IIFE, e pode aguardar promises diretamente.

**✅ Padrão correto com await:**
```javascript
await figma.loadFontAsync({family:"Inter", style:"Bold"});
const node = figma.createText();
node.fontName = {family:"Inter", style:"Bold"};
node.characters = "Título em Bold";
figma.closePlugin("ok");
```

**✅ Padrão correto síncrono (também funciona):**
```javascript
(() => {
  const node = figma.getNodeById("123:456");
  node.characters = "novo texto"; // fonte já em cache
  figma.closePlugin(JSON.stringify({ok: true}));
})();
```

**❌ Padrão que QUEBRA (não use):**
```javascript
figma.loadFontAsync({family:"Inter",style:"Bold"}).then(() => {
  // código dentro do .then() não executa — plugin fecha antes
  figma.closePlugin("never reached");
});
```

**Regra prática:**
- Para carregar fontes não-default → `await figma.loadFontAsync(...)` no topo do script
- Para editar textos com fontes já no doc → IIFE síncrono (mais rápido)
- Nunca usar `.then()` ou callbacks async (`setTimeout`, `setInterval`)
- Validar com retorno de `closePlugin`: string → OK; "no return value" → tem `.then()` no caminho

---

## 2. Fontes — o comportamento depende de NOVO vs EXISTENTE

| Cenário | Comportamento |
|---|---|
| `node.characters = "..."` em nó EXISTENTE com fonte já usada no doc | ✅ Funciona sem `loadFontAsync` (fonte em cache) |
| `node.fontName = {family, style: "Semi Bold"}` em nó NOVO | ❌ Quebra com `Cannot use unloaded font` |
| `createText()` + `characters = "..."` (sem tocar fontName) | ✅ Usa Inter Regular (default pré-carregada) |

**How to apply:**
- Para editar textos herdados de clone → setar `characters` direto (try/catch pra confirmar).
- Para textos NOVOS → usar Inter Regular e criar hierarquia com `fontSize` + `fills` (cor), não com peso.
- Gotcha: é `"Semi Bold"` com espaço (não `SemiBold`). Mesmo pra Extra Bold.

---

## 3. Posicionamento — auto-layout é armadilha silenciosa

**3a.** `resize(w, 1)` depois de setar sizing modes AUTO trava `height=1`. Auto-layout com filhos adicionados depois não recalcula.

**3b. Frame com `layoutMode` ≠ `"NONE"` RESETA `x`/`y` explícitos dos filhos.** Você seta `child.x = 20` → auto-layout sobrescreve para 0. Bug silencioso porque o Y parece OK (segue o fluxo). Só aparece no screenshot.

**How to detect:** script que compara `child.x + child.width` vs `parent.width` em todos os filhos → flagrar qualquer `x=0` quando deveria ter padding.

**How to apply:**
- Se precisar de posicionamento absoluto misto com auto-flow → `parent.layoutMode = "NONE"` antes de posicionar.
- Se usar auto-layout puro → configurar `padding` no pai + `layoutAlign`/`layoutGrow` nos filhos, não tentar sobrescrever x/y.
- **Não misturar os dois paradigmas** no mesmo container.

---

## 4. Clipping e overflow — bugs invisíveis no screenshot

**4a.** `clipsContent = true` oculta conteúdo silenciosamente. Sempre calcular altura real: `max(child.y + child.height)` para todos os filhos antes de travar altura do pai.

**4b.** Overflow horizontal (texto > width do frame container) também é silencioso. Bug do CTA: texto 211px dentro de frame de 198px → aparentou estar "fora do botão".

**4c.** Screenshot do frame PAI ≠ screenshot do nó FILHO. Clipping só aparece no frame pai — inspecionar o filho mostra conteúdo "real". Para debug de clipping: sempre screenshot do pai.

**Audit script padrão (rodar antes de aceitar entrega):**
```javascript
// Para cada frame de conteúdo, listar todos os filhos com:
// - x, y, w, h, right=x+w, bottom=y+h
// - flag "OVERFLOW" se right > parent.width
// - flag "CLIPPED" se bottom > parent.height
// - flag "X_ZERO" se x=0 quando deveria ter padding
(() => {
  const parent = figma.getNodeById("PARENT_ID");
  const report = parent.children.map(c => ({
    name: c.name, x: c.x, y: c.y, w: c.width, h: c.height,
    right: c.x + c.width, bottom: c.y + c.height,
    overflowX: (c.x + c.width) > parent.width,
    overflowY: (c.y + c.height) > parent.height,
  }));
  figma.closePlugin(JSON.stringify(report, null, 2));
})();
```

---

## 5. Espaçamento e cascata de resize — o efeito dominó manual

**Regra:** quando você expande um elemento com irmãos em posição absoluta, os irmãos **não se movem sozinhos**. É cascata manual obrigatória.

**Exemplo real:** expandi `ContentRow` de 540→771 para caber o Almoço expandido. Os irmãos `SafetyWrap` e `FooterBar` permaneceram em `y=776` e `y=832` (valores do clone original). Resultado: `ContentRow.bottom=876` sobrepôs `SafetyWrap` em 100px.

**Checklist ao fazer resize em um container vertical:**
1. Recalcular altura total do Main: `Σ alturas dos irmãos`.
2. Reposicionar todos os irmãos **abaixo** do container expandido (`sibling.y = anterior.y + anterior.height`).
3. Atualizar altura do Frame raiz + Sidebar + Main.
4. Reposicionar elementos "pinned bottom" (ex: `UserFooter.y = main.height - userFooter.height - padding`).

**Alternativa:** migrar Main inteiro para `layoutMode = "VERTICAL"` com `itemSpacing`. Trade-off: perde controle fino de posicionamento, mas elimina cascata.

**Espaçamento semântico:** elementos sequenciais grudam em `gap=0` se você só calcular `y = anterior.y + anterior.height`. Sempre reservar `gap` visual consciente por seção (ex: 24px entre bloco de refeições e footer hint). Não é cosmético — é hierarquia visual.

---

## 6. Workflow HTML→Figma que comprovadamente dá certo

1. **Protótipo HTML primeiro** (React+Babel CDN, inline CSS tokens). Validação visual barata e iterável. Aprovação do usuário antes de tocar o Figma.
2. **Controle anti-slop (`controle/<slug>/`)** antes de qualquer edição:
   - `00_FONTES.md` — nodes de referência, arquivo, protótipo HTML, verificações
   - `01_LEDGER.md` — append-only (verify/action/decision/block/scope)
   - `02_LIMITES.md` — escopo, halt conditions, definition of done
   - `03_CURSOR.md` — plano em fases atômicas + status
3. **Dividir em fases P1–Pn com screenshot de verificação em cada uma.** Pega bugs cedo, evita cascata.
4. **Screenshot após cada mudança não-trivial.** Nunca confiar que a ação "funcionou" sem ver.
5. **Audit script antes de aceitar entrega:** overflow horizontal, clipping vertical, elementos com x=0 indevido, overlap entre irmãos.
6. **Ordem dos edits:** mudanças estruturais primeiro (layout, tamanhos), depois conteúdo, depois polish.

---

## 7. Casos reais — exemplos concretos de bugs e correções

Todos os exemplos abaixo vieram da implementação do frame **"11 — Dietas / Template — Selecionar"** (node `2703:230`, arquivo `VRWykaDLUgqfIystanHOvf`, abril 2026). Usar como referência antes de abrir novas tarefas.

### 7.1. Async que nunca executa
**Tentativa:** `figma.loadFontAsync({family:"Inter",style:"Semi Bold"}).then(() => { /* criar nó */ figma.closePlugin("ok"); })`
**Resultado:** `"Code executed with no return value"` em 4–5 tentativas consecutivas.
**Fix:** descobri empiricamente que `node.characters = "..."` em nó **existente** funciona sem `loadFontAsync` se a fonte já está no doc (cache). Reescrevi tudo síncrono.
**Lição:** se o retorno de `closePlugin` é "no return value", algo na sua cadeia é async — caçar e eliminar.

### 7.2. Fonte não carregada em nó novo
**Tentativa:** `const t = figma.createText(); t.fontName = {family:"Inter", style:"Semi Bold"}; t.characters = "Título";`
**Erro:** `Cannot use unloaded font "Inter Semi Bold"`
**Fix:** usei Inter Regular (default pré-carregada) e criei hierarquia via `fontSize: 18` + `fills: [{type:"SOLID", color:{r:0.05,g:0.07,b:0.13}}]` em vez de peso.
**Lição:** textos NOVOS → Inter Regular + tamanho + cor. Não tentar trocar weight.

### 7.3. Auto-layout travando height=1
**Tentativa:** criei ListColumn com `layoutMode="VERTICAL"`, `primaryAxisSizingMode="AUTO"`, `counterAxisSizingMode="FIXED"`, `resize(360, 1)` e depois adicionei 5 cards.
**Resultado:** coluna permaneceu com `height=1`, cards invisíveis no screenshot.
**Fix:** reconstruí com `layoutMode="NONE"` e FIXED height=759, posicionando cada card manualmente com `y = anteriorY + anteriorH + gap`.
**Lição:** auto-layout + resize(_, 1) é armadilha. Ou deixa AUTO 100% puro, ou vai 100% absoluto.

### 7.4. Auto-layout resetou x=20 para x=0 silenciosamente
**Sintoma:** PreviewColumn tinha `layoutMode="VERTICAL"`. Setei `title.x = 20`, `hint.x = 20`, `mealCard[0..4].x = 20`, `separator.x = 20`, `footerHint.x = 20` — **9 elementos**. No screenshot todos apareceram grudados na borda esquerda.
**Debug:** audit script comparando `child.x + child.width` vs `parent.width` revelou que todos estavam em `x=0`.
**Fix:** `prevCol.layoutMode = "NONE"` e re-setar `x=20` em cada um dos 9 elementos não-fullwidth. PreviewHeader/MetaRow/divider sólido ficaram em `x=0` (full width intencional).
**Lição:** auto-layout sobrescreve x/y dos filhos. Para posicionamento misto, desligar layoutMode no pai.

### 7.5. CTA com texto overflowando o botão
**Sintoma:** usuário reportou "CTA está com o texto 'Aplicar templete ao paciente' fora do botao".
**Diagnóstico:** texto tinha `width=211px` dentro de frame CTA `width=198px`. Além disso, encontrei um node `2703:404` com "→" duplicado do node original.
**Fix:** removi o node duplicado `2703:404`, resize do CTA 198→265px, reposicionei `x=915` para manter alinhamento direita no FooterBar.
**Lição:** overflow horizontal não aparece no screenshot do filho, só do pai. Medir texto antes de escolher width do container.

### 7.6. SafetyStrip sobrepondo Meal_Almoço (100px de overlap)
**Sintoma:** depois de expandir Meal_Almoço com tabela de alimentos, `ContentRow` cresceu de 540→660→771. Mas `SafetyWrap.y=776` e `FooterBar.y=832` permaneceram nos valores originais do clone.
**Cálculo do overlap:** `ContentRow.bottom = 216 + 771 = 987`, mas `Safety.y = 776` → overlap de **211px** (depois corrigido empiricamente para 100px visível).
**Fix:** escopo expandido (L-017) — frame de 900→1111px de altura. Reposicionei `Safety.y=987`, `Footer.y=1043`, `UserFooter.y = main.height - userFooter.height - padding` (pin bottom).
**Lição:** expandir container vertical exige cascata manual de TODOS os irmãos abaixo + ajuste do frame raiz + pin bottom.

### 7.7. Footer hint grudado no Meal_Jantar (gap=0)
**Sintoma:** usuário pediu "precisa de um pouco mais de espacamento" para o hint `ℹ Alimentos e quantidades poderão ser ajustados na etapa Revisar`.
**Diagnóstico:** `Jantar.bottom = 704`, `hint.y = 704` → gap = 0px. Grudado.
**Fix:** `hint.y = 728` (gap de 24px). Cascata completa: PreviewCol 731→759, ContentRow 771→799, Frame 1111→1139, Safety.y 987→1015, Footer.y 1043→1071, UserFooter reposicionado.
**Lição:** `y = anterior.y + anterior.height` cria zero-gap. Sempre adicionar gap visual consciente entre seções semânticas.

### 7.9. Rebuild de lista de cards com fontes Bold/Semi Bold (top-level await)
**Cenário:** ListColumn tinha 5 cards simplificados sem borda, sem padding, sem gap, sem pesos tipográficos corretos. Protótipo HTML exigia cards com border 1px gray-200 (1.5px green-500 selected), radius 12, padding 12/14, gap 8, title Bold + kcal pill Bold + tag pill Semi Bold + "MAIS USADO" Bold uppercase.
**Primeira tentativa (IIFE síncrono):** `fontName = {family:"Inter", style:"Bold"}` → 18 warnings `Cannot use unloaded font "Inter Bold"`. Cards criados mas em Regular.
**Fix:** descobri que top-level `await figma.loadFontAsync(...)` funciona no MCP:
```javascript
await figma.loadFontAsync({family:"Inter", style:"Bold"});
await figma.loadFontAsync({family:"Inter", style:"Semi Bold"});
// iterar nodes e aplicar fontName sem try/catch
```
Segunda call aplicou 18 pesos corretos (13 Bold + 5 Semi Bold) iterando por IDs dos cards recém-criados.
**Lição:** para textos NOVOS com peso diferente de Regular, use script com `await loadFontAsync` no topo em vez de try/catch ou clonagem de nodes. Simplifica drasticamente.

### 7.8. Template do controle anti-slop que funcionou
Estrutura em `controle/figma-template-tela/`:
- `00_FONTES.md` — frame de referência 2686:229, shell nodes (Sidebar, Topbar, PageHeader, etc.), posição nova tela x=1513 y=8440, protótipo HTML em `design/prototipos/nutricionista/dieta/dietas-template.html`.
- `01_LEDGER.md` — 19 entradas append-only: L-001 (criação) até L-019 (breathing room no footer hint). Cada entrada com fonte + resultado + ref opcional.
- `02_LIMITES.md` — objetivo (1440×900), dentro/fora do escopo, halt conditions, definition of done, histórico de mudanças de escopo (L-017 expansão 900→1111 aceita pelo usuário).
- `03_CURSOR.md` — 11 passos atômicos divididos em 5 fases (Shell → Estrutura → Lista → Preview → Verificação), cada passo com `✅ verificar: get_screenshot`.

**Aprovação em 11 fases** evitou que bugs (como o auto-layout da PreviewColumn) contaminassem fases subsequentes.

---

## Checklist rápido antes de executar qualquer tarefa Figma

- [ ] Código 100% síncrono? (sem `await`, `.then()`, `setTimeout`)
- [ ] Textos novos usam Inter Regular? Textos editados usam `characters` direto?
- [ ] Container pai tem `layoutMode` definido? Sei qual paradigma estou usando?
- [ ] Vou fazer resize em container? Mapeei todos os irmãos que precisam cascatear?
- [ ] Plano dividido em fases atômicas com screenshot de verificação?
- [ ] Audit script de overflow/clipping pronto para rodar antes do aceite?
