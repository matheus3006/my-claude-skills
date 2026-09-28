# Checklist de qualidade do protótipo

Usado por `/auditar-prototipo` como roteiro de verificação e por `/novo-prototipo` e
`/integrar-ao-prototipo` como critério de pronto. Cada item é verificável — se não dá
para checar objetivamente, não entra aqui.

## 1. Estrutura e carregamento

- [ ] `index.html` existe e `components/` existe
- [ ] Ordem dos scripts respeita
      `i18n → data → icons → ui → device → router → painel → <telas> → app`
- [ ] Todo `<script>` de componente tem `?v=N`, todos com o mesmo N
- [ ] `app.jsx` é o último script antes do bloco de render
- [ ] Nenhum `import` ou `export` nos `.jsx`
- [ ] Nenhum arquivo em `components/` órfão (não referenciado no `index.html`)

Como checar a ordem: extrair a sequência de `src="components/..."` do `index.html` e
comparar com a cadeia esperada. Um arquivo de tela que aparece antes de `ui.jsx` é
falha, mesmo que ainda não use nenhum primitivo — vai quebrar no primeiro uso.

## 2. Tokens

- [ ] `:root` define a paleta light e `[data-theme="dark"]` sobrescreve
- [ ] Escalas presentes: `--space-*`, `--radius-*`, `--shadow-*`
- [ ] Zero hex literal nos `.jsx` (`#RGB`, `#RRGGBB`, `rgb(`, `rgba(` com cor fixa)
- [ ] Zero `px` mágico repetido no JSX — espaçamento vem de `var(--space-*)`

Exceções aceitáveis para hex/rgba no JSX: overlays translúcidos pontuais e valores
dentro de SVG decorativo. Qualquer cor de superfície, texto, borda ou estado é token.

Como checar: `grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(' components/*.jsx`. Cada hit precisa
de justificativa; o padrão é migrar para token.

## 3. Os 8 estados

- [ ] **default** — dados típicos, não o caso mais favorável
- [ ] **hover** — feedback visível em todo elemento clicável
- [ ] **focus** — outline visível, e visível **nos dois temas**
- [ ] **active/pressed** — transformação sutil ao toque
- [ ] **disabled** — opacidade reduzida + `cursor: not-allowed` + sem resposta a clique
- [ ] **loading** — skeleton ou spinner, sem layout shift ao resolver
- [ ] **empty** — ícone/ilustração + copy explicativo + CTA
- [ ] **error** — mensagem clara + ação de recuperação

Estado só conta se der para **ver no showcase**, sem editar código — pelo seletor de
Estado do painel flutuante, aplicado à tela ativa.

Confira também as superfícies de cada visão: telas de App em iOS e Android; telas de Web
em Desktop e Tablet. Conteúdo cortado ou scroll horizontal dentro da moldura é FAIL.

- [ ] **Visão por plataforma** — na visão App, palco e grade do Showcase só têm telas de
      App (moldura de celular); na visão Web, só telas de Web (moldura de navegador).
      Tela de desktop misturada com tela de iPhone na mesma grade é FAIL.
- [ ] Persona com mais de uma plataforma tem seletor de plataforma; o painel só oferece
      as superfícies da plataforma ativa.

## 4. Acessibilidade

- [ ] Contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande (≥ 18.66px bold ou ≥ 24px)
- [ ] Contraste verificado **nos dois temas** — dark costuma reprovar onde light passa
- [ ] Foco visível em todos os interativos, nunca `outline: none` sem substituto
- [ ] Ordem de tabulação lógica, seguindo a ordem visual
- [ ] `role` e `aria-label` onde a semântica HTML não cobre (ícone-botão, switcher, tab)
- [ ] Alvo de toque ≥ 44×44px em layout mobile
- [ ] Informação nunca transmitida só por cor (estado tem ícone ou texto junto)

Para contraste, resolver a CSS var para o valor final antes de calcular — comparar
`var(--muted)` contra `var(--bg)` só faz sentido depois de resolvido, e o valor muda
entre os temas.

## 5. i18n

- [ ] Nenhuma string visível hard-coded no JSX
- [ ] Toda chave usada existe no dicionário (sem `undefined` renderizado)
- [ ] Se multi-locale: toda chave existe em **todos** os locales
- [ ] Interpolação `{param}` resolve corretamente

Como checar chave órfã: extrair os `t('...')` dos componentes e conferir contra as
chaves de `TRANSLATIONS`. Falta em um locale só aparece ao trocar o idioma — por isso
entra no checklist e não na inspeção visual.

## 6. Runtime

- [ ] Console sem erro e sem warning do React
- [ ] Nenhum 404 em `components/*.jsx` na aba de rede
- [ ] Troca de tema não quebra layout nem apaga texto
- [ ] Troca de tab não vaza estado da tab anterior
- [ ] ErrorBoundary presente e funcional por tab
- [ ] Nenhum layout shift ao sair de loading

Duas mensagens são **esperadas** e não contam como falha — vêm do CDN, não do código:

```
[info] Download the React DevTools for a better development experience
[warn] You are using the in-browser Babel transformer. Be sure to precompile…
```

O warn do Babel é inerente ao padrão (transpilação em browser é o que dá o zero build
step). Marcá-lo como FAIL é falso positivo. Qualquer outra mensagem conta.

## 7. Dados

- [ ] Mocks em `data.jsx`, não espalhados pelas telas
- [ ] **Zero PII real** — nome, telefone, e-mail, endereço, documento, cartão
- [ ] Dados fictícios e visivelmente fictícios
- [ ] Nenhum token, chave de API ou segredo, mesmo de ambiente de teste

Este item é bloqueante. Protótipo costuma virar link compartilhado; PII real ali é
vazamento, não descuido de organização.

## 8. Pronto para aprovar

- [ ] Todas as telas do escopo estão no showcase
- [ ] Os 8 estados marcados
- [ ] Seções 1–7 sem falha aberta
- [ ] Servindo sem erro no console
- [ ] Aprovação explícita do usuário registrada

Sem os 5 itens acima, não iniciar implementação na stack real.

## Formato do relatório de auditoria

Uma linha por item verificado, agrupado por seção:

```
## 2. Tokens
PASS  :root + [data-theme="dark"] presentes
PASS  escalas --space/--radius/--shadow completas
FAIL  hex literal em components/checkout.jsx:142  #E5E7EB → use var(--border)
WARN  rgba() em components/ui.jsx:88 (overlay) — aceitável, sem ação
```

Fechar com contagem (`N PASS · N FAIL · N WARN`) e, se houver FAIL, a lista ordenada do
que corrigir. Não silenciar item não verificado: marcar `SKIP` e dizer por quê.
