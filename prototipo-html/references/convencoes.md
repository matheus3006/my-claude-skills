# Convenções do protótipo HTML+JSX

Contrato compartilhado por todas as skills `*-prototipo`. Leia antes de criar,
editar, auditar ou portar qualquer protótipo.

Padrão nascido em um projeto interno. Substitui Figma como fonte de verdade visual
antes da implementação na stack real: React 18 + Babel standalone via CDN, zero build
step, abre no browser e funciona.

## Estrutura canônica

```
<raiz-de-prototipos>/<task-id>/
├── index.html            # tokens CSS + chrome do showcase + orquestrador
└── components/
    ├── i18n.jsx          # TRANSLATIONS centralizadas
    ├── data.jsx          # mocks (nunca PII real) + DEFAULTS
    ├── icons.jsx         # SVG inline
    ├── ui.jsx            # primitivos: Button, Card, Field, Skeleton, EmptyState, ErrorState
    ├── device.jsx        # superfícies: desktop, tablet, iOS, Android + escala
    ├── router.jsx        # rotas hash + navegação real entre telas
    ├── painel.jsx        # painel de controle flutuante do showcase
    ├── <dominio>.jsx     # telas, uma ou mais por domínio
    └── app.jsx           # Showcase shell + mapa rota→tela + ErrorBoundary
```

`<raiz-de-prototipos>` é `prototipos_html/` por padrão. Se o projeto já usa outro nome,
respeite o que existe — nunca crie uma segunda raiz.

`<task-id>` no formato `YYYY-MM-DD-<slug>`. Um protótipo por tela/fluxo, exceto
protótipos consolidados (vitrines), que agregam várias telas.

## As 5 regras que carregam o peso

### 1. Ordem de carregamento é load-bearing

Os `.jsx` são carregados como scripts globais via `<script type="text/babel" src=...>`.
Não há módulos, não há `import`/`export`: tudo vira global, na ordem em que aparece no
`index.html`. A ordem é obrigatória:

```
i18n → data → icons → ui → device → router → painel → <telas> → app
```

Cada camada só pode usar o que veio antes dela. `app.jsx` é sempre o último — é ele que
monta o mapa rota → componente, porque é o único ponto onde router e telas já existem.

Inverter a ordem produz `X is not defined` em runtime, sem erro de sintaxe — o protótipo
abre em branco e o motivo só aparece no console.

Ao adicionar um arquivo, insira-o na posição correta da cadeia: tela nova entra
**depois** de `painel.jsx` e **antes** de `app.jsx`.

### 2. Cache-bust obrigatório

Todo `<script>` de componente carrega com `?v=N`:

```html
<script type="text/babel" src="components/ui.jsx?v=3"></script>
```

O browser cacheia `.jsx` agressivamente. Sem o bump você edita, recarrega e vê a versão
antiga — e queima a iteração debugando um arquivo que não está rodando.

Ao alterar qualquer componente, incremente o `?v=` de **todos** os scripts de uma vez.
Um número único para o protótipo inteiro é mais simples e menos sujeito a erro do que
versionar arquivo a arquivo.

### 3. Tokens só via CSS variables

Cores, espaçamentos, raios e sombras vivem no `<style>` do `index.html`: `:root` define
o tema light, `[data-theme="dark"]` sobrescreve. O switch de tema muda o atributo no
`<html>`, nada mais.

Nos componentes, sempre `var(--token)`. Zero hex e zero px mágico espalhado pelo JSX —
é o que permite trocar a identidade visual inteira em um arquivo, e o que faz o
mapeamento para o tema da stack real ser mecânico em vez de arqueológico.

Escalas mínimas: `--space-1..6`, `--radius-sm/md/lg/full`, `--shadow-sm/md/lg`, mais
tokens semânticos (`--bg`, `--fg`, `--surface`, `--border`, `--muted`, `--ok`, `--warn`,
`--danger` e variantes `-soft`).

### 4. Os 8 estados visuais

Todo componente interativo cobre: **default, hover, focus, active, disabled, loading,
empty, error**. O showcase precisa permitir ver cada um sem editar código.

Os três mais esquecidos, e os que custam mais caro depois:
- **empty** — ícone ou ilustração + copy explicativo + CTA de saída
- **error** — mensagem clara + ação de recuperação (não só "algo deu errado")
- **loading** — skeleton que ocupa a mesma caixa do conteúdo final, sem layout shift

`focus` precisa de outline visível de verdade — não `outline: none` com um box-shadow
que desaparece no dark.

### 5. Reuso antes de escrita

**Antes de criar qualquer componente, leia `ui.jsx` e `i18n.jsx` do protótipo.**

Em protótipos maduros o `ui.jsx` passa de mil linhas. Criar um segundo `Button` porque
não se olhou o primeiro é o modo de falha número um: o protótipo passa a ter dois
sistemas visuais divergindo em silêncio, e o handoff para a stack real vira adivinhação.

Ordem correta ao integrar algo novo:
1. Ler `ui.jsx` → o primitivo já existe? Use.
2. Existe mas não cobre o caso? Estenda via prop, não copie.
3. Não existe e é reutilizável? Adicione em `ui.jsx`.
4. Não existe e é específico da tela? Aí sim, local no `<dominio>.jsx`.

Mesma lógica para `i18n.jsx`: nenhuma string hard-coded no JSX, nunca. Toda string
visível passa pelo dicionário, mesmo em projeto de um idioma só — a estrutura pronta
evita um refactor completo depois.

## i18n

```js
const TRANSLATIONS = {
  'pt-BR': { chave: 'valor', comParam: 'Olá, {name}' },
};
```

Acesso via hook `useT(lang)`, que resolve interpolação `{param}`. Idioma padrão pt-BR;
adicionar locale é acrescentar uma chave de topo, sem tocar nos componentes.

Se o projeto é monolíngue, mantenha a estrutura e omita o switcher de idioma do showcase.

## Showcase

O `app.jsx` monta o shell de revisão. A divisão é deliberada:

**Header — só marca e modo.** `Protótipo | Showcase`, nada além disso. O header não
cresce com o número de telas, então nunca corta nem empurra controle para fora da vista.

**Painel de controle flutuante** (`painel.jsx`) — canto inferior direito, fechado
mostrando o estado ativo (`iOS · Escuro · loading`), expandindo para:

- **Superfície** — só as da plataforma da visão ativa: App → iOS · Android; Web → Desktop · Tablet
- **Tema** — Claro · Escuro
- **Estado** — os 8 estados visuais, aplicados à tela ativa
- **Reset** — volta aos defaults e limpa a rota

Fecha com Esc (devolvendo o foco ao botão) e com clique fora.

Controle de revisão não pode disputar espaço com o conteúdo revisado. Quando os
switchers moram no header, o primeiro protótipo com telas demais os empurra para fora —
e some justamente o controle de tema, que é o que menos se pode perder.

**Navegação entre telas é o router, não abas.** O protótipo navega como o app final
navega; abas mentiriam sobre o fluxo. Modo Showcase troca para a grade com todas as
telas lado a lado, para revisão de conjunto.

**Cada visão mostra só as telas da sua plataforma.** Uma visão é uma persona (ou perfil)
numa plataforma: "Morador · App", "Síndico · Web". Na visão App, palco e grade do Showcase
mostram **só** telas de App, em moldura de celular (iOS ou Android); na visão Web, **só**
telas de Web, em moldura de navegador (Desktop ou Tablet). Nunca misturar telas de
desktop com telas de iPhone na mesma grade — a revisão de uma plataforma não pode tropeçar
na outra (referência: cadillac-prototipos.vercel.app, uma aba por visão com Showcase próprio).

Consequências práticas:

- Quem usa mais de uma plataforma (ex.: síndico na Web e no App) ganha um seletor de
  plataforma no header, ao lado do modo — só aparece quando a persona tem as duas.
- O seletor de Superfície do painel oferece só as superfícies da plataforma ativa.
- Navegar para uma tela de outra plataforma troca a visão junto; a grade filtra pela
  plataforma ativa.
- Tela que existe nas duas plataformas (ex.: login) entra uma vez em cada visão, na
  moldura certa. Telas "gêmeas" de um mesmo posto (ex.: Web da guarita + celular do
  porteiro) são duas visões, não um par lado a lado.

Mobile e tablet renderizam dentro de device frame (status bar, dynamic island, home
indicator, safe area) e escalam para caber; desktop entra em moldura de navegador.

**ErrorBoundary** envolve a tela ativa e cada tile da grade — tela quebrada não derruba
o showcase, e o boundary mostra o stack em vez de deixar em branco.

## Mocks

`data.jsx` guarda os dados de exemplo. **Nunca PII real** — nem em código, nem em
comentário. Nomes, telefones, e-mails e endereços são sempre fictícios e visivelmente
fictícios.

Protótipo não tem lógica de negócio: rede, cálculo de preço e regra de domínio são
simulados. O que se valida é a superfície visual e o fluxo, não a implementação.

## Anti-padrões

| Não faça | Por quê |
|---|---|
| Tailwind, Bootstrap ou framework de CSS | Contradiz o modelo de tokens e infla o protótipo |
| Build step (Vite, webpack, esbuild) | O ganho inteiro do padrão é o zero-friction |
| `import`/`export` nos `.jsx` | Não há módulos; quebra o carregamento global |
| Lógica de negócio real | Protótipo simula com mocks — valida visual, não implementação |
| Usar a stack final no protótipo | Perde a iteração rápida que justifica o padrão |
| Hex ou px direto no JSX | Quebra a troca de tema e o mapeamento para a stack real |
| String hard-coded no componente | Fura o i18n e espalha copy pelo código |
| Editar sem bump do `?v=` | Você revisa a versão antiga sem perceber |

## Servir

```bash
cd <raiz-de-prototipos>/<task-id>
python3 -m http.server 8765
```

Precisa ser servido por HTTP — abrir o `index.html` via `file://` falha, porque o Babel
busca os `.jsx` por XHR e o navegador bloqueia por CORS.

A skill `/iniciar-prototipo` cuida disso, incluindo porta ocupada e smoke test.

## Aprovação

Protótipo é fonte de verdade visual: só depois de aprovado vira código de produção.
A aprovação é explícita do usuário — não se infere de silêncio nem de um "legal".

O nível de cerimônia depende do projeto; veja `deteccao-projeto.md`.
