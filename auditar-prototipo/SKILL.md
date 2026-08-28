---
name: auditar-prototipo
description: Audita um protótipo HTML+JSX contra o checklist de qualidade e devolve um relatório PASS/FAIL por item — ordem de carregamento, cache-bust, tokens, 8 estados visuais, contraste WCAG AA, i18n, console limpo e ausência de PII nos mocks. Use antes de aprovar um protótipo ou antes de portar para a stack real, e quando o usuário pedir revisão, auditoria, verificação ou "está pronto?". NÃO use para propor melhorias de design (melhorar-prototipo) — esta skill só verifica e reporta.
---

# auditar-prototipo

Gate de qualidade. Verifica, reporta e **não conserta sem pedir**.

**Roteiro:** `~/.claude/prototipo-html/references/checklist-qualidade.md`.
**Contrato:** `~/.claude/prototipo-html/references/convencoes.md`.

A auditoria é factual: cada item vira PASS, FAIL, WARN ou SKIP com evidência —
arquivo e linha. Sem "parece ok". Item que você não conseguiu verificar é SKIP com o
motivo, nunca PASS por omissão.

## Passo 1 — Achar o alvo

Argumento, ou a pasta mais recente da raiz de protótipos (dizendo qual escolheu).
Sem protótipo, pare e oriente `/novo-prototipo`.

## Passo 2 — Auditoria estática

Sem subir servidor. Percorra as seções 1, 2, 5 e 7 do checklist.

**Ordem de carregamento** — extraia a sequência de `src="components/..."` do
`index.html` e compare com
`i18n → data → icons → ui → device → router → painel → <telas> → app`. Tela antes do
`ui.jsx` é FAIL mesmo que ainda não use primitivo: quebra no primeiro uso.

**Cache-bust** — todo script de componente tem `?v=N`, todos com o mesmo N.

**Arquivo órfão** — `.jsx` em `components/` não referenciado no `index.html`.

**Hex e px mágico:**
```bash
grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(' components/*.jsx
```
Cada hit é FAIL com o token sugerido, exceto overlay translúcido pontual e SVG
decorativo — esses viram WARN sem ação.

**Tokens** — `:root` e `[data-theme="dark"]` presentes, escalas `--space-*`,
`--radius-*`, `--shadow-*` completas, e nenhum token definido só em um tema.

**i18n** — extraia os `t('...')` dos componentes e confronte com as chaves de
`TRANSLATIONS`. Chave usada e inexistente é FAIL (renderiza `undefined`). Multi-locale:
chave que falta em um locale é FAIL — só aparece ao trocar o idioma.

**PII e segredo nos mocks** — nome real, telefone, e-mail, endereço, documento, cartão,
token, chave de API. Isto é **bloqueante**: protótipo vira link compartilhado, e PII
real ali é vazamento. Reporte no topo, não no meio da lista.

## Passo 3 — Auditoria em runtime

Suba com `/iniciar-prototipo` e, pelo preview MCP, cubra as seções 3, 4 e 6.

**Console e rede** — `read_console_messages` sem erro nem warning do React;
`read_network_requests` sem 404 em `components/*.jsx`.

**Os 8 estados** — percorra o seletor de Estado no painel flutuante. Estado só conta se
der para ver no showcase sem editar código. Confira que `empty` tem CTA, `error` tem
ação de recuperação e `loading` não causa layout shift ao resolver.

**Superfícies** — pelo painel, percorra Desktop, Tablet, iOS e Android. Conteúdo cortado
ou scroll horizontal dentro do device frame é FAIL. Vale para projeto web também: a tela
vai ser aberta no celular independentemente da stack.

**Temas** — alterne Claro e Escuro no painel. Troca de tema não pode quebrar layout nem
apagar texto.

**Painel** — abre e fecha pelo botão, fecha com Esc devolvendo o foco ao botão, fecha ao
clicar fora, e o resumo fechado reflete o estado ativo.

**Contraste** — resolva as CSS vars para os valores finais antes de calcular (via
`javascript_tool`, `getComputedStyle`), e calcule **nos dois temas**. Alvo: 4.5:1 para
texto normal, 3:1 para texto grande. Dark reprova onde light passa — é o caso comum.

**Foco** — foco visível em todo interativo, nos dois temas. `outline: none` sem
substituto visível é FAIL.

**Tabs** — trocar de tab não vaza estado da anterior; `ErrorBoundary` presente.

## Passo 4 — Relatório

Uma linha por item, agrupado por seção do checklist:

```
## 2. Tokens
PASS  :root + [data-theme="dark"] presentes
PASS  escalas --space/--radius/--shadow completas
FAIL  hex literal em components/checkout.jsx:142  #E5E7EB → use var(--border)
WARN  rgba() em components/ui.jsx:88 (overlay) — aceitável, sem ação
```

Feche com:

- Contagem: `N PASS · N FAIL · N WARN · N SKIP`
- Se houver FAIL: lista ordenada do que corrigir, mais grave primeiro
- Veredito explícito: **pronto para aprovar** ou **não pronto**, com o motivo

PII real ou segredo nos mocks reprova sozinho, independente do resto.

## Passo 5 — Corrigir (só se pedirem)

Auditoria e correção são passos separados: misturar as duas coisas faz o relatório virar
narrativa do que você consertou, e o usuário perde a visão do estado real.

Se o usuário pedir a correção, aplique os FAIL na ordem do relatório, faça bump do `?v=`
e re-audite os itens tocados.

## Anti-padrões

- PASS em item que não foi verificado — use SKIP e diga por quê
- Auditar só no tema light
- Calcular contraste sobre o nome da CSS var em vez do valor resolvido
- Reportar "console limpo" sem ter aberto o console
- Corrigir durante a auditoria sem separar o relatório
- Tratar PII nos mocks como observação de organização — é bloqueante
