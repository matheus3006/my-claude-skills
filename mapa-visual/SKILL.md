---
name: mapa-visual
description: Mapa visual do que fazer agora sobre um conjunto de issues — ondas, o que cada uma trava, como funciona, rótulos do GitHub e o contrato — em três vistas (grafo, roteiro, contrato). Use quando o usuário pedir um mapa visual, "o que temos que fazer agora" para ver, o que cada issue trava, ou como fica o contrato de uma fila ou camada de issues.
---

# mapa-visual

Uma página HTML que responde "o que fazemos agora" sobre um recorte de issues — uma camada, um mapa do `/wayfinder`, um PRD e as fatias dele. As mesmas issues aparecem em três vistas, trocadas por `?variant=` e pela barra no rodapé:

- **A · Grafo** — ondas (colunas) × jornadas (linhas), com as arestas de dependência; passar o mouse acende a cadeia.
- **B · Roteiro** — passo a passo, com cada cartão aberto e um checkpoint humano entre as ondas.
- **C · Contrato** — as rotas de hoje × as propostas, agrupadas por recurso, mais as tabelas, os eventos externos e os ADRs.

## O modelo é fixo — siga-o à risca

O usuário aprovou este modelo exatamente como está em [`exemplo/index.html`](exemplo/index.html). **Reproduza-o, não o redesenhe.**

- **Nunca edite `modelo/template.html` para um mapa.** Tudo que muda entre mapas mora no `mapa.json`. Se faltar um campo, a correção é no template **para todos os mapas**, com o exemplo re-renderizado e conferido — nunca uma cópia desviada.
- As três vistas, a ordem delas, os alertas no topo, a legenda dos rótulos do GitHub, o selo ao lado do rótulo, a gaveta de detalhe e a barra de variantes aparecem **sempre**. Não troque cores, fontes nem layout, e não acrescente uma quarta vista.
- Antes de escrever o seu `mapa.json`, leia [`exemplo/mapa.json`](exemplo/mapa.json): é o padrão de **densidade e tom** — frases curtas de mecanismo, nomes no lugar de números, cada aresta inferida com o seu motivo.

## Passos

### 1. Recorte

Nomeie o recorte e a pergunta ("camada 2: o que fazer agora") e liste os ids das issues que entram, incluindo as de outros mapas que travam este. Defina as **jornadas** (as linhas) pelo eixo que o projeto já usa.

**Pronto quando** houver uma lista fechada de ids, com a jornada de cada um.

### 2. Levantamento

Mande um subagente ler tudo com o prompt de [LEVANTAMENTO.md](LEVANTAMENTO.md). Ele devolve `levantamento.json` e as contradições que achou. **Verifique você mesmo** a contradição mais grave antes de construir em cima dela: leia o trecho no código ou na issue.

**Pronto quando** toda issue do recorte estiver no JSON com todos os campos, e a contradição mais grave tiver sido conferida na fonte.

### 3. Síntese

Aqui você é o arquiteto: o levantamento traz fatos, e a síntese decide o caminho. Escreva o `mapa.json` pelo [ESQUEMA.md](ESQUEMA.md):

- **Ondas** pela dependência real, não pela ordem de criação das issues. A onda 0 é o que trava as outras — em geral decisão, e quem decide é o humano. Toda onda termina num `checkpoint`: o que o humano decide ou confere antes da seguinte.
- **Arestas**: `nativa` é o bloqueio registrado no GitHub; `inferida` é o que só o texto diz, e sempre leva `motivo`.
- **Pronta só no rótulo**: para cada nó `ready-for-agent` sem bloqueio, pergunte se ele espera, de fato, algo que o GitHub não registra — uma decisão aberta, uma emenda, um ADR que ainda não existe. Se esperar, o id entra em `prontas_so_no_rotulo` e ganha aresta inferida.
- **Alertas**: cada contradição vira `trava`, se impede o caminho, ou `corrigir`, se é divergência de texto — ou é descartada, com o motivo dito ao usuário.

**Pronto quando** todo nó `ready-for-agent` tiver passado pela pergunta da pronta só no rótulo, e toda contradição do levantamento tiver virado alerta ou sido descartada em voz alta.

### 4. Montar e verificar

```bash
python3 ~/.claude/skills/mapa-visual/modelo/montar.py <mapa.json> <pasta_saida>
```

O script confere a consistência do `mapa.json` e puxa do GitHub, na hora, o estado e os rótulos de cada nó. Sirva a pasta com `python3 -m http.server <porta>`, abra no Browser pane e passe pelas três vistas.

**Pronto quando** o console estiver sem erro nas três vistas, o grafo tiver tantas arestas desenhadas quanto o `mapa.json` e a gaveta abrir num nó de cada onda.

### 5. Entregar

Dê a URL com `?variant=A`, uma linha por vista e **o que o mapa mudou na recomendação**: a onda 0 e as prontas só no rótulo, primeiro. As arestas inferidas são candidatas a bloqueio nativo: ofereça registrá-las no GitHub, **sem registrar por conta própria**.

Por padrão o mapa fica no scratchpad. Se o usuário quiser guardá-lo, ele vai para um branch descartável `prototype/mapa-<recorte>` do projeto, com o `mapa.json` e o `index.html`, e nunca para a branch principal.
