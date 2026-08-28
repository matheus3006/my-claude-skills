---
name: integrar-ao-prototipo
description: Adiciona uma tela, fluxo ou funcionalidade nova a um protótipo HTML+JSX que já existe, reusando os primitivos e tokens dele. Use quando o usuário pedir para incluir, somar, acrescentar ou integrar mais uma tela/feature ao protótipo, ou para consolidar uma tela aprovada num protótipo maior (vitrine). NÃO use para criar protótipo do zero (novo-prototipo) nem para refinar tela que já está no protótipo (melhorar-prototipo).
---

# integrar-ao-prototipo

Adiciona tela ou funcionalidade nova a um protótipo existente **sem duplicar o que já
está lá**.

**Leia primeiro:** `~/.claude/prototipo-html/references/convencoes.md`.

Esta é a operação mais frequente e a que mais gera drift. Dois modos de falha dominam:
criar um primitivo que já existia no `ui.jsx`, e quebrar a ordem de carregamento do
`index.html`. Os passos 2 e 4 existem para impedir cada um deles.

## Passo 1 — Achar o protótipo e o alvo

Liste a raiz de protótipos, escolha o alvo (argumento, ou a pasta mais recente, dizendo
qual escolheu). Liste `components/` para ver o que já existe.

Se não existir protótipo, pare e oriente `/novo-prototipo`.

Em modo rigoroso (`AGENTS.md` + `controle/`), obedeça o protocolo do projeto antes de
editar — veja `~/.claude/prototipo-html/references/deteccao-projeto.md`.

## Passo 2 — Ler antes de escrever (obrigatório)

**Leia `ui.jsx` e `i18n.jsx` por inteiro antes de criar qualquer componente.**

Não é formalidade. Em protótipo maduro o `ui.jsx` passa de mil linhas; escrever um
segundo `Button` porque não se olhou o primeiro cria dois sistemas visuais divergindo em
silêncio, e o handoff para a stack real vira adivinhação.

Leia também os tokens no `<style>` do `index.html` e uma tela existente — para copiar a
convenção de composição, não só a de nomes.

Decida, para cada peça da tela nova:

1. Primitivo já existe → **use**
2. Existe mas não cobre o caso → **estenda via prop**, não copie
3. Não existe e é reutilizável → **adicione em `ui.jsx`**
4. Não existe e é só desta tela → local no `<dominio>.jsx`

Antes de escrever, diga ao usuário o que vai reusar e o que vai criar. Se a lista de
"criar" estiver grande, provavelmente você não leu o `ui.jsx` direito.

## Passo 3 — Escrever a tela

Crie `components/<dominio>.jsx`. Regras que não mudam:

- Tokens via `var(--*)` — zero hex, zero px mágico
- Strings via `t('chave')` — adicione as chaves em `i18n.jsx`, em **todos** os locales
- Mocks em `data.jsx`, nunca PII real
- Os 8 estados cobertos (default, hover, focus, active, disabled, loading, empty, error)

Precisa de token que não existe? Adicione ao `:root` **e** ao `[data-theme="dark"]`.
Token que só existe em um tema quebra o outro.

## Passo 4 — Registrar no index.html (onde tudo quebra)

Duas edições, ambas obrigatórias:

**a) Inserir o script na posição correta da cadeia.**

```
i18n → data → icons → ui → device → router → painel → <telas> → app
```

Tela nova entra **depois** de `painel.jsx` e **antes** de `app.jsx`. Os `.jsx` são
scripts globais, sem módulos: fora de ordem dá `X is not defined` em runtime, sem erro
de sintaxe — o protótipo abre em branco e o motivo só aparece no console.

**b) Bump do `?v=` em todos os scripts, para o mesmo número.**

Sem isso o browser serve o `.jsx` cacheado e você revisa a versão antiga.

## Passo 5 — Registrar a rota

Duas edições:

**a) `router.jsx`** — acrescente a rota em `ROUTES` (com `:param` se a tela receber id).

**b) `app.jsx`** — registre no `SCREEN_MAP` (`ROTA: Componente`) e, se o protótipo tiver
modo Showcase, acrescente o alvo na grade para a tela aparecer na revisão de conjunto.

Navegue-se até a tela nova por `useRouter().navigate(...)` a partir de onde ela é
alcançada no fluxo real — não deixe a tela órfã, alcançável só por URL.

A tela recebe `estado` e responde aos 8 estados; o `PrototypeErrorBoundary` já a
envolve, e a tela nova é justamente a mais provável de quebrar.

## Passo 6 — Verificar antes de entregar

Suba com `/iniciar-prototipo` e, pelo preview MCP:

- Console limpo — sem erro e sem warning
- Nenhum 404 em `components/*.jsx`
- Tab nova renderiza nos dois temas
- Tabs antigas continuam funcionando (regressão é o risco aqui)
- Screenshot da tela nova

Depois de integrar tela em protótipo grande, dê uma passada em `/auditar-prototipo` —
integração é onde hex mágico e string hard-coded entram sem ninguém ver.

## Passo 7 — Entregar

- O que foi reusado do `ui.jsx` e o que foi criado (e por quê)
- Chaves novas no `i18n.jsx`
- Tokens novos, se houve
- Posição do script na cadeia e o novo `?v=`
- Screenshot da tela nova nos dois temas

## Anti-padrões

- Escrever componente antes de ler o `ui.jsx` → é o modo de falha nº 1
- Copiar um primitivo e mudar duas linhas em vez de estender via prop
- Registrar o script no fim, depois do `app.jsx` → quebra em runtime
- Esquecer o bump do `?v=` → revisa a versão antiga sem perceber
- Adicionar token só no `:root` e não no dark
- Adicionar chave i18n em um locale só
- Entregar sem conferir que as telas antigas continuam de pé
