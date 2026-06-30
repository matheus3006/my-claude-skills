# Bug 04 — `combineAsVariants` requer parent comum

## Sintoma
```
Error: in combineAsVariants: Grouped nodes must be in the same page as the parent
```

Tentei criar um ComponentSet com:
```js
const v1 = figma.createComponent();
v1.name = "Type=Default";
/* build content */
const v2 = figma.createComponent();
v2.name = "Type=Focused";
/* build content */
const set = figma.combineAsVariants([v1, v2], page);  // ← FALHA
```

## Causa raiz
`figma.createComponent()` cria o nó **órfão** (sem parent). `figma.combineAsVariants(comps, parent)` exige que todos os componentes em `comps` já estejam parented na mesma page que `parent` — caso contrário, falha.

A documentação da API não enfatiza isso e a mensagem de erro é clara em retrospecto, mas não óbvia se você assumiu que combineAsVariants faria o "move" automaticamente.

## Fix
Sempre `page.appendChild(comp)` antes de `combineAsVariants`:

```js
const page = await figma.getNodeByIdAsync("10:5");

function newComp(name) {
  const c = figma.createComponent();
  c.name = name;
  page.appendChild(c);  // ← OBRIGATÓRIO
  return c;
}

const v1 = newComp("Type=Default");
/* build content */
const v2 = newComp("Type=Focused");
/* build content */
const v3 = newComp("Type=Error");
/* build content */

const set = figma.combineAsVariants([v1, v2, v3], page);
set.name = "Form field";
set.x = 10595; set.y = 1620;
set.fills = []; set.strokes = [];
```

## Cuidado adicional: variants ficam empilhados em x=0,y=0
`combineAsVariants` cria o set mas **não posiciona variants** dentro dele — todos ficam em `x=0, y=0` se você não reposicionar. Resultado: visualmente parece que tem só 1 variant porque os outros estão sob ele.

Reposicionar manualmente após criar:
```js
let y = 20, maxW = 0;
for (const v of set.children) {
  v.x = 20; v.y = y;
  y += v.height + 28;       // gap interno do set
  if (v.width > maxW) maxW = v.width;
}
set.resize(maxW + 40, y - 28 + 20);  // padding 20 horizontal/vertical
```

## Referência cruzada
- Bug detectado em S3 CALL 1 desta sessão (criação dos 6 utility ComponentSets).
- Após fix, todos os 6 sets foram criados corretamente.
