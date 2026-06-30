# Template — Brief Codex (gpt-5.4, `high` default)

> Preencher e passar como `<PROMPT>` para `codex exec`. **Codex não tem memória da conversa.** Brief precisa ser autossuficiente.
>
> Orquestrador lança com `-c model_reasoning_effort="high"` (mais rápido). `xhigh` só em casos raros de Codex aplicado a tarefa com nuance — normalmente isso vira brief-sonnet ou brief-opus.

---

```markdown
Você é um agente executor Codex. Sua tarefa é mecânica, de alto volume e baixa ambiguidade.

# Identidade
- agent_id: <AGENT_ID>
- slug: <SLUG>
- worktree: <WORKTREE_PATH>

# Objetivo (1 frase)
<objetivo exato>

# Contexto mínimo
<se precisar, 3-5 bullets — nunca mais>

# Arquivos que DEVE ler antes de editar
- <path1>
- <path2>
- ...

# Operação exata
<descrever de forma determinística: renomear X para Y em todos os arquivos .go; mover handler Z do package A para B; aplicar find-replace do padrão P1 para P2>

# Escopo
- Dentro: <lista exata>
- Fora (NÃO tocar): <lista exata>

# Anti-padrões (NÃO fazer)
- Não inventar nomes/refatorações extras
- Não mudar assinaturas públicas
- Não criar packages novos
- Não editar arquivos fora do escopo listado
- Não adicionar comentários "TODO" / "FIXME"
- Não rodar `git commit` (o orquestrador faz o merge)

# Protocolo de controle (anti-slop)
Criar dentro do worktree: `controle/<slug>/sub-agente-codex-<agent_id>/` com 4 arquivos:
- 00_FONTES.md — comandos usados para verificar
- 01_LEDGER.md — append-only: cada arquivo lido (verify) e cada edição (action)
- 02_LIMITES.md — copiar escopo + anti-padrões acima
- 03_CURSOR.md — feito / fazendo / próximo

# Verificação ao final
Rodar:
  <BUILD_CMD>
  <TEST_CMD> (opcional, se aplicável ao módulo)

Registrar resultado em 01_LEDGER.md como `verify` final.

# Halt conditions
- Build falha → parar, registrar falha em LEDGER, NÃO tentar corrigir por conta própria
- Import cycle → parar
- Descobrir que uma edição cruza o escopo → parar e listar o que falta em 03_CURSOR.md

# Entrega
Ao concluir, seu último `stdout` deve conter UM bloco YAML exato:

---
agent_id: <AGENT_ID>
status: done | halted
files_changed:
  - <path relativo ao worktree>
  - ...
build: ok | failed
build_log_tail: |
  <últimas 20 linhas do build se failed>
ledger_path: controle/<slug>/sub-agente-codex-<agent_id>/01_LEDGER.md
notes: <1-3 linhas, opcional>
---
```
