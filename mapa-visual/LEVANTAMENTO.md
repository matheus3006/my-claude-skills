# O levantamento: prompt do subagente

Mande ao subagente (`general-purpose`, em primeiro plano) o texto abaixo, preenchendo os `<…>`. Ele só lê; quem sintetiza é você.

```
Repo: <caminho local> (GitHub <dono/repo>, use `gh`; código em <branch base>, leia com `git show <branch>:<path>` / `git grep … <branch>`).
Tarefa só de leitura: NÃO edite, comente, feche nem atribua nada.

Objetivo: dados estruturados para um mapa visual de <recorte>. Escreva JSON em <scratchpad>/levantamento.json e responda com um resumo curto + tudo que for surpreendente ou contraditório.

Issues: <lista de ids, com o papel de cada grupo>.
Leia de cada uma o corpo inteiro + comentários (`gh issue view N --comments`); bloqueios por
`gh api repos/<dono>/<repo>/issues/N/dependencies/blocked_by` e `.../blocking`.

Por issue, um objeto (texto em português simples, sem número de issue solto na prosa — use nomes):
id, titulo_curto (≤6 palavras), titulo, estado, tipo ("fatia"|"prd"|"prd-a-escrever"|"decisao"|"tarefa"|"needs-triage"), labels, jornada (<ids das jornadas>),
o_que_e (1–2 frases), como_funciona (3–6 frases: o mecanismo real — tabelas, estados, transações, webhooks, idempotência — tirado do texto, nunca inventado),
bloqueado_por (só bloqueios ABERTOS), bloqueio_fechado, trava (abertos que ela bloqueia), nota_bloqueio (quando o texto diz depender de algo que não está registrado como bloqueio),
contrato: {rotas_novas:[{metodo,caminho,o_que_faz}], rotas_alteradas:[…], campos:[], tabelas:[], eventos_externos:[]} — "(proposto)" quando a issue só sugere; caminho não definido vira "(<o que é> — caminho não definido)",
telas_que_esperam (arquivos do front que apontam para a issue; procure o marcador que o projeto usa, ex.: `git grep -n "sem contrato — #<id>"`),
pronto_para_agente (aberta + ready-for-agent + zero bloqueio aberto), riscos (0–3, só se o texto disser ou implicar claramente).

No topo: contrato_atual (toda rota do contrato gerado do projeto, {metodo, caminho, operationId}, + total), adrs_relevantes (id, titulo, status, essencia), ordem_sugerida (topológica pelo grafo, sem opinião).
Seja exato: o que não souber vira null, nunca palpite. Procure ativamente contradições entre issue × issue, issue × ADR e issue × código.
```
