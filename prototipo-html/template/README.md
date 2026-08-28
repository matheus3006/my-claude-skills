# Template de protótipo HTML+JSX

Scaffold genérico do padrão. Substitui Figma como fonte
de verdade visual antes da implementação na stack real.

Contrato completo: `~/.claude/prototipo-html/references/convencoes.md`.

## Uso

Normalmente você não copia isto à mão — use `/novo-prototipo`, que detecta o projeto,
aplica a identidade visual e monta a primeira tela.

Manualmente:

```bash
cp -r ~/.claude/prototipo-html/template <raiz-de-prototipos>/<task-id>
cd <raiz-de-prototipos>/<task-id>
python3 -m http.server 8765
```

Precisa ser servido por HTTP — `file://` falha, porque o Babel busca os `.jsx` por XHR.

## Como o showcase é organizado

**Header:** só marca e `Protótipo | Showcase`. Não cresce com o número de telas.

**Painel flutuante** (canto inferior direito): superfície (Desktop · Tablet · iOS ·
Android), tema, os 8 estados visuais e reset. Fechado mostra o estado ativo; fecha com
Esc ou clique fora.

**Navegação:** router hash, como o app final navega — não abas. O modo Showcase troca
para a grade com todas as telas lado a lado.

As superfícies mobile existem mesmo em projeto web: ver a tela no celular é parte da
revisão, não exclusividade de app nativo.

## Estrutura

- `index.html` — tokens CSS (`:root` light + `[data-theme="dark"]`), CSS do chrome e do
  painel, e o orquestrador React 18 + Babel standalone via CDN
- `components/i18n.jsx` — `TRANSLATIONS` (pt-BR, en, es)
- `components/data.jsx` — mocks e `DEFAULTS`; nunca PII real
- `components/icons.jsx` — SVG inline, sem dependência externa
- `components/ui.jsx` — primitivos: `Press`, `Button`, `Card`, `Field`, `Skeleton`,
  `EmptyState`, `ErrorState`, hook `useT`
- `components/device.jsx` — superfícies e device frames + escala para caber
- `components/router.jsx` — rotas hash e navegação
- `components/painel.jsx` — painel de controle flutuante
- `components/telas.jsx` — telas de exemplo (substitua)
- `components/app.jsx` — `Showcase`, mapa rota → tela, grade e `PrototypeErrorBoundary`

Ordem de carregamento no `index.html` é obrigatória:
`i18n → data → icons → ui → device → router → painel → <telas> → app`.

## Customizando

1. **Tokens de marca** — `--primary`, `--accent` e derivados no `index.html`. Os valores
   que vêm no template são neutros e servem de placeholder.
2. **Strings** — substitua as de exemplo em `i18n.jsx`. Projeto monolíngue: deixe só
   `pt-BR`.
3. **Mocks** — troque `MOCK_USER` / `MOCK_ITEMS` em `data.jsx` pelos dados das telas.
4. **Telas** — substitua `telas.jsx` por `components/<dominio>.jsx` e registre no
   `index.html` **depois** de `painel.jsx` e **antes** de `app.jsx`. Cada tela recebe
   `estado` e responde aos 8 estados visuais.
5. **Rotas** — acrescente em `ROUTES` (`router.jsx`) e em `SCREEN_MAP` (`app.jsx`).
6. **Cache-bust** — a cada alteração, incremente o `?v=` de todos os scripts do
   `index.html`. Sem isso o browser serve a versão antiga e você revisa código velho.

## Estados cobertos

As telas de exemplo demonstram os 8 obrigatórios: default, hover, focus, active,
disabled, loading, empty, error. Preserve a cobertura ao substituir pelas telas reais.
