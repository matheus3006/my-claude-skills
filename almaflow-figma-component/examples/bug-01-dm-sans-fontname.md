# Bug 01 — DM Sans `Semi Bold` vs `SemiBold`

## Sintoma
```
Error: The font "DM Sans Semi Bold" could not be loaded.
Available styles for "DM Sans": ["9pt Italic","9pt Regular","Black",...,"SemiBold","SemiBold Italic",...].
```

A skill global `figma_guide` documenta `"Semi Bold"` (com espaço) — esse padrão é válido para a fonte **Inter** mas **não** para a fonte DM Sans neste arquivo Figma.

## Causa raiz
Cada family de fonte tem seu próprio set de style names. O Plugin API exige a string exata. Inter usa `"Semi Bold"` (com espaço) por convenção da Google Fonts, mas DM Sans neste file usa `"SemiBold"` (sem espaço).

A mensagem de erro do `loadFontAsync` é a fonte de verdade — sempre lista os styles disponíveis para a family solicitada.

## Fix

Lista canônica de styles disponíveis para as 2 fontes deste arquivo (`ef4cdtGuwgovAERD3kMhHg`):

| Family | Style strings válidas |
|---|---|
| `Bebas Neue` | `Regular` |
| `DM Sans` | `Regular`, `Medium`, `SemiBold`, `Bold` (mais Italic, Light, ExtraBold, Thin etc.) |

Carregamento canônico no início do script:

```js
await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" });
await figma.loadFontAsync({ family: "DM Sans",    style: "Regular" });
await figma.loadFontAsync({ family: "DM Sans",    style: "Medium" });
await figma.loadFontAsync({ family: "DM Sans",    style: "SemiBold" });  // ← SEM espaço
await figma.loadFontAsync({ family: "DM Sans",    style: "Bold" });
```

## Como descobrir os styles para uma family nova
Tente carregar com qualquer string e leia a mensagem de erro — ela lista todos os disponíveis. Exemplo:
```js
await figma.loadFontAsync({ family: "DM Sans", style: "?" }).catch(e => console.log(e.message));
// → lista todos os styles disponíveis
```

## Referência cruzada
- `figma_guide` global, seção "Fontes — comportamento depende de NOVO vs EXISTENTE"
- Bug original detectado em S2.1 desta sessão (Warn banner rebuild, primeira tentativa)
