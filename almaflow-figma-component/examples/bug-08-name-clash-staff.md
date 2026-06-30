# Bug 08 — Name clash com Staff library

## Sintoma
`search_design_system` retorna 2 (ou mais) componentes com **exatamente o mesmo nome** dentro da library `almaFlow`. Desambiguar requer olhar Node IDs — quando o consumidor (frame/Angular) só sabe o nome, vira jogo de adivinhação.

## Causa raiz
A library `almaFlow` é compartilhada entre Staff e Cliente. Nomes genéricos como "Pre-order empty state", "Topbar", "Card" são naturais para ambos contextos, mas fazem clash quando coexistem.

Caso real desta sessão:
- Staff já tinha `168:234` chamado "Pre-order empty state" (estado vazio quando Staff não tem pré-pedidos)
- Cliente criou novo `242:15` também chamado "Pre-order empty state" (estado vazio quando Cliente não tem itens)
- Mesmo conceito, contextos diferentes → nomes idênticos = ambiguidade

## Fix — naming hygiene

**Antes de criar componente novo**, rodar `search_design_system` pelo nome pretendido. Se houver match, prefixar com qualificador semântico (geralmente o profile/surface):

```js
const search = await figma.searchDesignSystem({ query: "Pre-order empty state" });
if (search.components.length > 0) {
  // Já existe — prefixar
  componentName = "Cliente pre-order empty";  // ou "Staff pre-order empty"
}
```

## Convenções recomendadas para almaFlow

| Padrão | Uso |
|---|---|
| Sem prefixo | Componentes genéricos não-ambíguos (Button, Sheet shell, Status chip) |
| Prefix `Cliente ` | Componente específico do profile Cliente quando nome conflita |
| Prefix `Staff ` | Componente específico do profile Staff quando nome conflita |
| Prefix `_Slot/` | Helper interno usado apenas como slot de outro componente (não deve aparecer em search direto) |

Cliente v1.6 segue essa regra:
- "Client topbar" (cliente, distinto do Staff Topbar) ✓
- "Cliente pre-order empty" (cliente, conflitava com Staff Pre-order empty state) ✓
- "Form field", "Counter", "LGPD consent box" — nomes únicos, sem prefix ✓

## Pré-flight check no SKILL.md golden path
```js
async function nameAvailable(name) {
  const result = await figma.searchDesignSystem({ query: name });
  return result.components.filter(c => c.name === name).length === 0;
}

const desiredName = "Pre-order empty state";
if (!(await nameAvailable(desiredName))) {
  console.warn(`Name "${desiredName}" already exists in almaFlow library — prefix with profile`);
}
```

## Referência cruzada
- Bug detectado pós-S3 CALL 2 desta sessão. Componente `242:15` foi renomeado de "Pre-order empty state" para "Cliente pre-order empty" antes da publicação.
