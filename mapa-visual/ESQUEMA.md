# mapa.json — o esquema

O `montar.py` recusa o arquivo se uma aresta, um alerta ou um nó apontar para algo que não existe. O exemplo completo é [`exemplo/mapa.json`](exemplo/mapa.json).

## Topo

| Campo | O que é |
|---|---|
| `titulo` | Vira o `<h1>` e o título da aba. Diz o recorte e a pergunta: "Camada 2: o que fazer agora". |
| `subtitulo_html` | Uma ou duas frases: o que é o recorte, de onde saiu o levantamento, a data e a instrução "clique em qualquer issue". |
| `repositorio` | `dono/repo`, usado pelo `gh`. |
| `url_issues` | `https://github.com/<dono>/<repo>/issues/` |
| `levantado_em` | Data ISO do levantamento. |
| `ondas` | Lista ordenada de colunas. Cada onda tem `{id, nome, resumo, checkpoint}`: `id` é um inteiro a partir de 0, `nome` tem no máximo 4 palavras, `resumo` é uma frase e `checkpoint` diz o que o humano decide ou confere antes da onda seguinte. |
| `jornadas` | Lista ordenada de linhas. Cada jornada tem `{id, nome, cor}`, com `cor` de 1 a 8 (a paleta está no template; 1 é vermelho, 2 laranja, 3 azul, 4 verde, 5 roxo, 6 cinza, 7 ciano, 8 ocre). |
| `grupo` | Opcional: um PRD cujas fatias andam juntas. Tem `{chave, nome_curto, titulo, id_prd, fatias: [ids em ordem], onda, jornada}`. A `chave` (ex.: `"pagamento"`) pode ser a origem de uma aresta; a seta sai da última fatia. |
| `prontas_so_no_rotulo` | Ids marcados `ready-for-agent` sem bloqueio no GitHub que, na verdade, esperam alguma coisa. Ganham o selo vermelho. |
| `nos` | As issues (ver abaixo). |
| `arestas` | Cada aresta é `{de, para, tipo, motivo}`, com `tipo` `"nativa"` (bloqueio registrado no GitHub) ou `"inferida"` (só no texto). Toda inferida exige `motivo`: uma frase dizendo por que depende. |
| `alertas` | Cada alerta é `{gravidade, etiqueta, titulo, texto, resolve: [ids]}`. A `gravidade` é `"trava"` quando impede o caminho e `"corrigir"` quando é divergência de texto. A `etiqueta` é curta ("trava o Pagamento", "corrigir no texto"). O `texto` diz a contradição e a saída, se já existir uma. |
| `contrato_atual` | `{origem, como_nasce_html, rotas: [{metodo, caminho, operationId}]}`: as rotas que existem hoje. |
| `pistas_de_recurso` | Lista de pares `[palavra, recurso]`. Põem a rota proposta sem caminho no grupo certo da variante C, pela palavra que aparece no texto dela. |
| `titulo_externos` | Título do bloco de eventos fora do sistema na variante C. |
| `notas_contrato` | Opcional: `[{titulo, itens: [frases]}]`, uma decisão que muda o contrato e ainda não está em rota nenhuma. |
| `adrs` | `[{id, titulo, status, essencia}]`, os que governam o recorte. |
| `cores_label` | Opcional: `{rótulo: {cor, descricao}}`. O `montar.py` preenche do GitHub; só é preciso escrever para montar com `--sem-rede`, como no exemplo, cujo repositório é fictício. |

## Nó

Os campos vêm do levantamento ([LEVANTAMENTO.md](LEVANTAMENTO.md)); a síntese acrescenta `onda`.

`id`, `titulo_curto` (no máximo 6 palavras), `titulo`, `estado`, `tipo` (`fatia` · `prd` · `prd-a-escrever` · `decisao` · `tarefa` · `needs-triage`), `labels`, `jornada`, `onda`, `o_que_e` (1 a 2 frases), `como_funciona` (3 a 6 frases de mecanismo), `bloqueado_por`, `trava`, `contrato {rotas_novas, rotas_alteradas, campos, tabelas, eventos_externos}` (rota = `{metodo, caminho, o_que_faz}`; caminho ainda não definido vai entre parênteses: `"(agenda da Quadra — caminho não definido)"`), `telas_que_esperam`, `pronto_para_agente`, `riscos`.

`estado` e `labels` o `montar.py` reescreve com o que o GitHub tem na hora do build.
