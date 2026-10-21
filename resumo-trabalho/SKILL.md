---
name: resumo-trabalho
description: Resumo do trabalho de um período, agrupado pelas partes do produto, para quem não lê código. Use quando o usuário pedir um resumo ou status do que foi feito nos últimos dias, para mandar ao cliente, ao sócio ou ao gestor. NÃO use para o relatório ponto a ponto de uma entrega (relatorio-de-entrega) nem para o corpo de PR (pr).
---

# Resumo do trabalho

O resumo cabe numa mensagem de chat. Cada linha é um **efeito**: o que quem usa o produto
passa a ver ou fazer. Quem lê é o cliente, o sócio ou o gestor, e essa pessoa não abre o
GitHub.

## 1. Perguntar quantos dias

Antes de qualquer busca, pergunte com o AskUserQuestion "Quantos dias você quer resumir?".
Dê as opções "2 dias (Recomendado)", "Só hoje" e "7 dias". O usuário também pode digitar
outro número ou um intervalo de datas.

- Pule a pergunta só se o pedido já disser o período ("o resumo da semana", "de 19 a 20/10").
- Os dias são corridos, no fuso local, e terminam hoje.

**Pronto quando:** a data de início e a data de fim estão fixadas.

## 2. Levantar os fatos

O repositório e o tracker estão no `AGENTS.md`/`docs/agents/issue-tracker.md` do projeto.
Converta `closedAt`/`mergedAt` (UTC) para o fuso local antes de cortar por dia.

```bash
gh issue list --state closed --limit 300 --json number,title,closedAt,stateReason,labels
gh pr list --state merged --limit 100 --json number,title,mergedAt,body
gh pr list --state open --json number,title,body,comments
git log --all --since="<início>" --format='%ad %h %s' --date=iso
```

- **Tarefa fechada** é a issue fechada como `COMPLETED` no período. As `NOT_PLANNED` e os
  mapas (`wayfinder:map`) ficam fora da conta.
- O conteúdo vem do corpo das PRs e do comentário de resolução das issues, não do título.
- **Esperando aprovação** é PR aberta ou pergunta ao humano ainda sem resposta nos
  comentários.
- Se um dia do período não tem nada fechado, ele sai do título. Se o período inteiro estiver
  vazio, diga isso e pergunte se é para recuar.

**Pronto quando:** cada PR mergeada e cada issue fechada do período teve o corpo lido, e a
contagem de tarefas fechadas está anotada.

## 3. Agrupar

- Um grupo por parte do produto, com o nome que quem lê usa ("Caixa da loja", "App do
  passageiro (celular)"), nunca o nome da pasta ou do componente.
- Cada efeito aparece uma vez, no grupo onde quem usa vai encontrá-lo.
- No fim, e só com conteúdo: **Regras do negócio** (valor, prazo, permissão), **Qualidade**
  (só o que foi visto passar) e **Esperando aprovação** ("Nada", se for o caso, com o que
  vem a seguir na fila).

**Pronto quando:** toda PR do período caiu em algum grupo.

## 4. Escrever

Siga o formato de [EXEMPLO.md](EXEMPLO.md): título "Resumo de <dias>", a linha "Nestes <n>
dias, fechamos <N> tarefas." e os grupos em negrito com uma lista embaixo. Sem tabela nem
link.

- Escreva o efeito, não a obra: "O caixa manda o valor direto para a maquininha", e não
  "integração com a API da maquininha".
- Sem jargão: nada de PR, merge, issue, ticket, componente, endpoint, rotina nem número.
- Diga o estado do trabalho logo na abertura. Se for protótipo ou desenho para aprovar,
  escreva isso; o leitor nunca pode achar que um desenho já funciona.
- Uma linha com mais de três ou quatro itens vira sublista.
- Bastidor de processo (sessões, skills, quantidade de prints) fica fora, até da Qualidade.

**Pronto quando:** o número de tarefas bate com o passo 2, nenhuma linha tem palavra técnica
e o estado do trabalho está dito.
