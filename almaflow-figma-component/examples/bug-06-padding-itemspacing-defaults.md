# Bug 06 — Defaults `padding=16` e `itemSpacing=10` ao ativar `layoutMode`

## Sintoma
Variant ou frame ganha espaçamento interno que você não pediu — content aparece com gaps e padding "do nada", inflando dimensões.

Exemplo concreto da Warn banner tentativa 0:
```
"variantW": 359, "variantH": 33,
"padding": "T16 R16 B16 L16",  // <- não setei isso!
"itemSpacing": 10,             // <- nem isso!
```

## Causa raiz
Quando você muda `layoutMode` de `"NONE"` para `"VERTICAL"` ou `"HORIZONTAL"`, Figma aplica defaults para padding (16 em todos os lados) e itemSpacing (10). Esses defaults vêm do "Default Auto Layout" preset do Figma desktop.

## Fix
**Imediatamente** após setar `layoutMode`, zerar todos os padding + itemSpacing antes de qualquer outra coisa:

```js
variant.layoutMode = "VERTICAL";
variant.paddingTop = 0; variant.paddingRight = 0;
variant.paddingBottom = 0; variant.paddingLeft = 0;
variant.itemSpacing = 0;

// AGORA pode setar valores reais que você quer
variant.paddingTop = 12;
variant.paddingBottom = 12;
variant.paddingLeft = 18;
variant.paddingRight = 14;
variant.itemSpacing = 12;
```

Ou usar o helper `setupAutoLayout` em `references/helpers.js` que já zera defaults antes de aplicar a config.

## Por que zerar antes de setar
Se você setar `paddingTop = 12` mas não tocar `paddingRight`, `paddingBottom`, `paddingLeft`, esses 3 ficam com 16 (default). É fácil esquecer um lado.

A regra "zerar tudo, depois setar o que você quer" é mais robusta.

## Referência cruzada
- Bug detectado em S2.1 (Warn banner) e S2.5 (Queue status hero) desta sessão.
- Está embutido no `setupAutoLayout` helper de `references/helpers.js`.
