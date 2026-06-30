# Bug 05 — Ordem para `layoutPositioning = "ABSOLUTE"`

## Sintoma
Stripe (rectangle 3px de borda) aparece em posição errada, não estica vertical, ou conta na largura do parent auto-layout (causando bug-03).

## Causa raiz
`node.layoutPositioning = "ABSOLUTE"` só tem efeito quando o nó está parented em um frame com `layoutMode != "NONE"`. Setar antes do parent ter `layoutMode` definido falha silenciosamente — o nó fica em flow.

Adicionalmente, `constraints` (que controla como o stripe se estica quando o parent muda de tamanho) precisa ser setado depois do `layoutPositioning`.

E `resize` precisa ser por último, depois que o constraint vertical=STRETCH já está aplicado.

## Fix — sequência canônica

```js
// Pré-condição: parent (variant) já tem layoutMode definido
variant.layoutMode = "VERTICAL";
/* ... resto da config do parent ... */

// 1. Criar stripe
const stripe = figma.createRectangle();
stripe.name = "Left stripe";
stripe.fills = [FILL("color/client/gold/default")];

// 2. Append PRIMEIRO
variant.appendChild(stripe);

// 3. layoutPositioning depois do append
stripe.layoutPositioning = "ABSOLUTE";

// 4. constraints depois do layoutPositioning
stripe.constraints = { horizontal: "MIN", vertical: "STRETCH" };

// 5. position e resize por último
stripe.x = 0; stripe.y = 0;
stripe.resize(3, variant.height);
```

## Por que essa ordem
- **appendChild antes**: Figma só sabe que a propriedade `layoutPositioning` existe quando o nó está num parent com auto-layout.
- **layoutPositioning antes de constraints**: `constraints` só se aplica a nós absolutos.
- **constraints antes de resize**: STRETCH faz o stripe esticar quando o parent muda de tamanho. Se você fizer resize primeiro e o parent crescer depois (por causa de outros children sendo adicionados), STRETCH ajusta automaticamente. Sem STRETCH, o stripe fica preso na altura do resize inicial.

## Caveat: se o parent crescer depois do stripe
Mesmo com `vertical: "STRETCH"`, se você adicionar children flow ao parent **depois** de criar o stripe, o stripe precisa ser explicitamente atualizado:
```js
// Após criar todo o resto e variant ter altura final:
stripe.resize(3, variant.height);  // re-resize para acompanhar
```

A maneira mais segura é criar o stripe **por último** (após todos os children em flow já estarem no parent). Aí o `variant.height` já está estável.

## Referência cruzada
- Bug detectado em S2.1 desta sessão (Warn banner). Tentativa 0: stripe em flow contou na primary axis → variant 359 wide.
- Ver também bug-03 (warn banner sequence).
- Pattern correto exemplificado em `pattern-01-token-binding.md` e na Golden path do SKILL.md.
