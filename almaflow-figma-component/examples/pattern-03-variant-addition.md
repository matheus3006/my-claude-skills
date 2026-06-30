# Pattern 03 — Adicionar variant a ComponentSet existente

## Quando usar
- Adicionar nova value para uma propriedade existente (ex.: `State=Default` → adicionar `State=Locked`).
- Adicionar nova property dimension (ex.: passar de `Active=True/False` para `Category=Burger/Combo/Drink/Sweet × Active=True/False`).

Ambos preservam o Node ID do ComponentSet, importante para library publication continuity.

## API canônica

### Caso A — adicionar value novo a property existente

ComponentSet existente: `198:323` (Pre-order item row), atualmente com 1 variant `State=Default` (Node ID `198:313`).
Quero adicionar `State=Locked`.

```js
const set = await figma.getNodeByIdAsync("198:323");

// Idempotência: se já existir, reuse
let lockedVariant = set.children.find(c => c.name === "State=Locked");
if (!lockedVariant) {
  lockedVariant = figma.createComponent();
  lockedVariant.name = "State=Locked";
  set.appendChild(lockedVariant);  // entra no set automaticamente
}

// Build content da nova variant
/* ... fills, strokes, layout, children ... */

// Figma auto-detecta novo value "Locked" pra property "State"
```

Resultado: `set.children` agora tem 2 variants. `set.componentPropertyDefinitions` mostra `State: { type: "VARIANT", values: ["Default", "Locked"] }`.

Resultado real desta sessão: cliente v1.5 → v1.6 transformou `198:323 Pre-order item row` de 1→2 variants sem alterar o set ID.

### Caso B — adicionar property dimension nova

ComponentSet existente: `198:307` (Menu item card), atualmente com `Added=False/True` (2 variants).
Quero adicionar dimension `Category=Burger|Combo|Drink|Sweet` × `Added=False/True` = 8 variants.

```js
const set = await figma.getNodeByIdAsync("198:307");

// 1. Renomear variants existentes para incluir nova property
const existingFalse = await figma.getNodeByIdAsync("198:287");
existingFalse.name = "Category=Burger, Added=False";  // antes: "Added=False"

const existingTrue = await figma.getNodeByIdAsync("198:297");
existingTrue.name = "Category=Burger, Added=True";

// 2. Atualizar conteúdo se necessário (a categoria Burger é o "default" dos antigos)

// 3. Criar novas combinações (Combo×2, Drink×2, Sweet×2 = 6 novas)
const newDefs = [
  { cat: "Combo",  added: false }, { cat: "Combo",  added: true },
  { cat: "Drink",  added: false }, { cat: "Drink",  added: true },
  { cat: "Sweet",  added: false }, { cat: "Sweet",  added: true },
];

for (const def of newDefs) {
  const variantName = `Category=${def.cat}, Added=${def.added ? "True" : "False"}`;
  let v = set.children.find(c => c.name === variantName);
  if (!v) {
    v = figma.createComponent();
    v.name = variantName;
    set.appendChild(v);
  }
  /* build content do variant */
}
```

Figma auto-detecta a nova property `Category` quando todos os variant names contêm a chave `Category=...`. Critical: **todos** os variants do set devem usar a mesma estrutura de propriedades, senão Figma flagra inconsistência.

### Convenção de nome
- Properties separadas por `, ` (vírgula + espaço): `Property1=Value1, Property2=Value2`
- Values em PascalCase: `Default`, `WithCart`, `MinReached`
- Em ordem alfabética por property name não é obrigatório mas ajuda leitura

## Reposicionamento dentro do set
`appendChild` adiciona o variant ao set mas **não posiciona** — fica em x=0, y=0 sobreposto. Reposicionar:

```js
let y = 20;
let maxW = 0;
for (const v of set.children) {
  v.x = 20;
  v.y = y;
  y += v.height + 28;
  if (v.width > maxW) maxW = v.width;
}
set.resize(maxW + 40, y - 28 + 20);
```

Padding=20, gap=28 é a convenção de Components page do almaFlow.

## Anti-padrão

```js
// ❌ Recriar o set inteiro perde o Node ID
const newSet = figma.combineAsVariants([oldDefault, newLocked], page);
oldSet.remove();  // perde 198:323 → quebra references no Code Connect e em frames consumers

// ❌ Criar fora do set e tentar mover depois
const v = figma.createComponent();
v.name = "State=Locked";
page.appendChild(v);  // entra na page, não no set
// agora você precisa de combineAsVariants ou move manual — erro-prone
```

## Pattern recomendado
```js
// ✅ appendChild direto no set existente preserva ID
const newVariant = figma.createComponent();
newVariant.name = "State=Locked";
set.appendChild(newVariant);  // já entra como variant
/* build content */
```

## Cuidado: name clash dentro do set
`set.children.find(c => c.name === ...)` é case-sensitive. Sempre use idempotência (verificar antes de criar) para permitir re-execução do script.

## Referência cruzada
- Caso real: cliente v1.6 adicionou variants em `198:248` (Client topbar: +WithCart, +BrandOnly), `198:323` (Pre-order item row: +Locked), `198:307` (Menu item card: 2→8 com nova dimension Category).
- Bug 04 (`combineAsVariants` orphan) é o pattern oposto: para criar set novo do zero.
