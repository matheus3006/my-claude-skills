# Bug 07 — TypeError ao acessar props de Frame em TEXT/RECTANGLE

## Sintoma
```
TypeError: node.layoutMode: no such property 'layoutMode' on TEXT node
TypeError: node.children: no such property 'children' on TEXT node
TypeError: node.layoutMode: no such property 'layoutMode' on RECTANGLE node
```

Geralmente em scripts de audit que fazem walk recursivo de uma árvore mista (FRAME + TEXT + RECTANGLE + INSTANCE).

## Causa raiz
O Plugin API do Figma define propriedades específicas por tipo de nó:

| Tipo | Tem `.children`? | Tem `.layoutMode`? | Tem `.padding*`? | Tem `.fills`? |
|---|---|---|---|---|
| FRAME | sim | sim | sim | sim |
| COMPONENT | sim | sim | sim | sim |
| COMPONENT_SET | sim | sim | sim | sim |
| INSTANCE | sim | sim | sim | sim |
| GROUP | sim | não | não | não |
| TEXT | **não** | **não** | **não** | sim |
| RECTANGLE | **não** | **não** | **não** | sim |
| ELLIPSE | **não** | **não** | **não** | sim |
| VECTOR | **não** | **não** | **não** | sim |

Acessar uma property inexistente lança TypeError (não retorna `undefined`).

## Fix — type guard antes de acessar
```js
const FRAME_LIKE = new Set(["FRAME","COMPONENT","COMPONENT_SET","INSTANCE"]);
// (GROUP é container mas não tem layoutMode/padding)

function describe(node) {
  const out = {
    id: node.id, name: node.name, type: node.type,
    x: Math.round(node.x), y: Math.round(node.y),
    w: Math.round(node.width), h: Math.round(node.height),
  };

  if (node.type === "TEXT") {
    out.chars = node.characters;
    out.fontSize = node.fontSize;
    return out;  // text não tem children ou layout
  }

  if (FRAME_LIKE.has(node.type)) {
    out.layoutMode = node.layoutMode;
    out.padding = `T${node.paddingTop} R${node.paddingRight} B${node.paddingBottom} L${node.paddingLeft}`;
    out.itemSpacing = node.itemSpacing;
    if (Array.isArray(node.children)) {
      out.children = node.children.map(describe);
    }
  }

  // RECTANGLE, ELLIPSE, VECTOR, etc: só geometry básica
  return out;
}
```

## Pattern alternativo — `'in' operator`
```js
if ("layoutMode" in node) {
  out.layoutMode = node.layoutMode;
}
if (Array.isArray(node.children)) {
  // ...
}
```

Útil quando você não quer manter um set de tipos hardcoded — `in` checa se a property existe naquele node específico.

## Referência cruzada
- Bug encontrado 3x em sequência durante audit script desta sessão (cada vez um type novo lançou).
- O helper `auditScript` em `references/audit-scripts.js` tem o type guard correto.
