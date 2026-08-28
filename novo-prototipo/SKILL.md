---
name: novo-prototipo
description: Cria um protótipo HTML+JSX do zero (React 18 + Babel standalone, zero build step) quando ainda não existe protótipo para a tela ou fluxo. Use ao iniciar uma tela nova, um fluxo novo ou um showcase visual, e quando o usuário pedir protótipo, mockup, wireframe interativo ou "quero ver como fica antes de implementar". NÃO use se já existe um protótipo e a intenção é adicionar tela nova (use integrar-ao-prototipo) ou refinar tela existente (use melhorar-prototipo).
---

# novo-prototipo

Cria o protótipo HTML+JSX de uma tela ou fluxo, do zero, em qualquer projeto.
Zero build step: React 18 + Babel standalone via CDN, abre no browser e funciona.

**Leia primeiro:** `~/.claude/prototipo-html/references/convencoes.md` — é o contrato.
Não improvise estrutura, ordem de carregamento ou tokens.

**Onde isto se encaixa.** Se o protótipo nasceu de um ticket de decisão do `/wayfinder`, a
resposta do ticket é a decisão visual — e a aprovação que o `/portar-prototipo` vai exigir
depois. Se nasceu solto, o caminho é o mesmo, só sem o mapa por cima. O fluxo completo, da
ideia solta até o código, está em [FLUXOS.md](https://github.com/matheus3006/my-claude-skills/blob/main/FLUXOS.md).

## Antes de qualquer coisa: existe protótipo?

Liste a raiz de protótipos do projeto. Se já existir um protótipo cobrindo a área:

- Quer adicionar tela ao que existe → **pare e use `/integrar-ao-prototipo`**
- Quer refinar tela que já está lá → **pare e use `/melhorar-prototipo`**

Criar um segundo protótipo paralelo é o começo do drift: dois `ui.jsx` divergindo,
duas paletas, e ninguém sabe qual é a verdade. Só siga aqui se for terreno novo.

## Passo 1 — Detectar o projeto

Siga `~/.claude/prototipo-html/references/deteccao-projeto.md` e reporte em três linhas:
raiz de protótipos, modo de rigor, stack de destino, origem dos tokens de marca.

Em **modo rigoroso** (`AGENTS.md` + `controle/`), obedeça o protocolo do projeto antes
de editar: task ativa, plano aprovado, o que o `AGENTS.md` mandar. Em **modo leve**,
siga direto.

## Passo 2 — Fechar o escopo

Antes de escrever, use `AskUserQuestion` para travar o que ainda estiver em aberto:

- **Telas do escopo** — quais entram neste protótipo
- **Plataforma alvo** — mobile (device frame com safe area), web, ou ambos
- **Identidade visual** — reaproveitar tokens encontrados no projeto, ou definir novos
- **Idiomas** — monolíngue (sem switcher) ou multi-locale

Pergunte só o que não deu para inferir do projeto. Se a detecção já respondeu, diga o
que assumiu e siga — não transforme a skill em interrogatório.

## Passo 3 — Scaffold

```bash
cp -r ~/.claude/prototipo-html/template <raiz>/<YYYY-MM-DD>-<slug>
```

O `<slug>` descreve a tela ou fluxo, em kebab-case: `checkout`, `onboarding-cliente`,
`admin-relatorios`.

Depois de copiar, adapte na ordem:

1. **Tokens** no `index.html` — `--primary`, `--accent` e derivados, nos dois temas.
   Use os valores reais do projeto quando a detecção os encontrou. Quando não, use os
   neutros do template e **diga ao usuário que são placeholder**.
2. **`i18n.jsx`** — as strings reais das telas. Monolíngue: mantenha só `pt-BR` e remova
   o switcher de idioma do `app.jsx`.
3. **`data.jsx`** — mocks das telas. **Nunca PII real**, nem em comentário.
4. **`components/<dominio>.jsx`** — as telas, substituindo `telas.jsx`. Uma por domínio,
   não uma por arquivo quando forem da mesma família. Cada tela recebe `estado` e
   responde aos 8 estados visuais.
5. **`router.jsx`** — as rotas reais do fluxo em `ROUTES`.
6. **`index.html`** — registre cada arquivo de tela **depois** de `painel.jsx` e
   **antes** de `app.jsx`, com `?v=1`.
7. **`app.jsx`** — atualize `SCREEN_MAP` (rota → componente) e os alvos da grade do modo
   Showcase. Mantenha o header enxuto e o `PrototypeErrorBoundary`.

## Passo 4 — Cobrir os 8 estados

default, hover, focus, active, disabled, loading, empty, error — cada um visível pelo
seletor de Estado do painel flutuante, sem editar código.

Os três que somem quando se tem pressa, e que são justamente os que a implementação vai
precisar: **empty** (ícone + copy + CTA), **error** (mensagem clara + recuperação),
**loading** (skeleton na mesma caixa do conteúdo, sem layout shift).

Confira também as quatro superfícies. Mesmo em projeto web, a tela vai ser aberta no
celular — o device frame mobile não é enfeite de app nativo, é como se revisa responsivo.

## Passo 5 — Servir e verificar você mesmo

Suba com `/iniciar-prototipo` (ou `python3 -m http.server 8765` na pasta).

**Não entregue sem ter verificado.** Pelo preview MCP:

- `read_console_messages` — zero erro, zero warning do React
- `read_network_requests` — nenhum 404 em `components/*.jsx`
- screenshot em light **e** dark
- percorrer as tabs de estado

Console sujo ou tela em branco quase sempre é ordem de carregamento errada no
`index.html` — confira a cadeia `i18n → data → icons → ui → telas → app`.

## Passo 6 — Entregar

Devolva ao usuário:

- URL do protótipo
- Telas e estados cobertos
- O que ficou como placeholder (tokens de marca, copy provisória, mock raso)
- Screenshot dos dois temas

E o próximo passo: `/melhorar-prototipo` para refinar, `/integrar-ao-prototipo` para
somar tela, `/auditar-prototipo` antes de aprovar, `/portar-prototipo` depois de aprovado.

## Anti-padrões

- Criar protótipo novo quando já existe um que cobre a área → integre
- Inventar cor de marca sem procurar a paleta real do projeto
- Pular os estados empty/error/loading "porque é só um mockup" — são eles que revelam
  o que falta no fluxo
- Entregar sem abrir no browser
- Colocar lógica de negócio real; protótipo simula
- PII real nos mocks
