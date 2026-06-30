---
name: multi-agent
description: Orquestra tarefas decomponíveis em múltiplos agentes paralelos combinando Codex CLI (gpt-5.4 high) para trabalho mecânico, Sonnet 4.6 via Bash launcher (bucket Somente Sonnet) para refactor/implementação determinística, e Opus 4.7 via Agent tool (bucket todos-modelos) para decisões arquiteturais + supervisor auditor final. Sempre sob protocolo anti-slop controle/<slug>/. Entra em modo de planejamento puro, analisa o problema, quebra em tarefas atômicas e PROPÕE quantos agentes / composição / max_parallel — depois calibra com o usuário via AskUserQuestion e pede aprovação final. Nunca pergunta números antes de analisar. Executa em ondas respeitando max_parallel, com os 3 caminhos (Codex via Bash, Sonnet via Bash launcher, Opus via Agent) coexistindo na mesma onda. Ao concluir, emite AskQuestion de cleanup e consolida tudo em CONSOLIDADO.md. Invocar quando a tarefa tocar 3+ módulos independentes, for decomponível em partes sem overlap, ou puder ser paralelizada com isolamento via worktree.
---

# Skill multi-agent — orquestração multi-modelo

Você é o **ORQUESTRADOR** (Opus 4.7). Carregue o baseline canônico e siga o protocolo.

## Passo 1 — Carregar baseline + modos de uso

Ler ambos os arquivos (projeto ativo, com fallback na skill):

```
Read: <PROJECT_ROOT>/multiAgent/PROMPT.md       (fallback: ~/.claude/skills/multi-agent/PROMPT.md)
Read: <PROJECT_ROOT>/multiAgent/modo_uso.md     (fallback: ~/.claude/skills/multi-agent/modo_uso.md)
```

## Passo 2 — Executar o protocolo (Fases -1 → 6)

Seguir EXATAMENTE na ordem:

- **Fase 0** — Planejamento puro (ZERO edição de código). **Princípio: plano antes de números**. Jamais pergunte "quantos agentes" antes de quebrar tarefas.
  - 0.a: slug + verify contra código real + grafo + **quebra em tarefas atômicas**. IA calcula proposta (N agentes, composição X/Y/Z, max_parallel sugerido, rodadas/ondas)
  - 0.b: gerar `planejamento/<slug>/PLANO.md` copiando de `planejamento/_TEMPLATE.md`, com a **proposta da IA** (quebra + números + justificativa de roteamento) + pedido verbatim + o que entendi + verificações + aceite + alternativas + próximos passos
  - 0.c: **revisão única via `AskUserQuestion`** — pergunta-mestre com 3 opções: `Aprovado — executar` / `Ajustar números` / `Rejeitar — entendimento/escopo/aceite`. Se Aprovado → segue 0.d. Se Ajustar → sub-AskUserQuestion com P2.a/P2.b/P2.c (agentes/composição/max_parallel) → volta 0.a → v2 → repete. Se Rejeitar → sub-AskUserQuestion estrutural → v+1 → repete. Halt após 3 ciclos.
  - 0.d: só após `status: aprovado` no PLANO, criar `controle/<slug>/`, preencher LIMITES/FONTES/CURSOR (incluindo os números calibrados), escrever slug em `_ACTIVE`, registrar LEDGER tipo `plan_approved`.
- **Fase 0.5** — Baseline (`<BUILD_CMD>` + `<TEST_CMD>`)
- **Fase 1** — Briefs autossuficientes usando templates em `multiAgent/templates/`
- **Fase 2** — Lançamento em ondas com 3 caminhos de execução:
  - Dentro de uma rodada: dividir em ondas de até `max_parallel` agentes
  - Cada onda = UMA mensagem com todos os agentes em paralelo
  - Codex via `Bash` com `-c model_reasoning_effort="high"` explícito (não xhigh) — bucket OpenAI
  - **Sonnet (DEFAULT) via `Bash` + `launch-claude-worker.sh <id> sonnet <brief> <wt> <out>` com `run_in_background: true`** — drena bucket **Somente Sonnet**
  - Opus executor (ou Sonnet interativo, raro) via `Agent` (`model: "opus"|"sonnet"`, `isolation: "worktree"`) — bucket "todos os modelos"
- **Fase 3** — Merge em LOTE dos worktrees da rodada + 1 build no fim; bisect só se quebrar
- **Fase 4** — Supervisor Opus 4.7 (`Agent`, `model: "opus"`, sem worktree) → veredicto `approve | retry | halt` (obrigatório)
- **Fase 5** — Fechamento técnico (build + test vs baseline, LEDGER close)
- **Fase 6** — Consolidação + cleanup:
  1. Gerar `controle/<slug>/CONSOLIDADO.md` (sumário de cada agente + aceite + métricas)
  2. **AskUserQuestion**: "Tarefa finalizada com sucesso? Apagar controles dos subagentes?"
  3. Se Sim → apagar `controle/<slug>/sub-agente-*/`, worktrees `/tmp/wt-<slug>-*`, briefs `/tmp/brief-<slug>-*`. **Manter `controle/<slug>/` inteiro** exceto os `sub-agente-*` (orquestrador + CONSOLIDADO)
  4. Arquivar: `controle/<slug>/` → `controle/_arquivo/<slug>/` + limpar `_ACTIVE`

## Regras de roteamento (resumo)

```
mecânico + volume alto + ambiguidade baixa  → Codex gpt-5.4 high         (bucket OpenAI)
determinístico + 1-3 arquivos               → Sonnet via Bash launcher   (bucket Sonnet-only)
arquitetural + ambiguidade alta             → Opus 4.7 via Agent          (bucket todos-modelos)
supervisor auditor final                    → Opus 4.7 via Agent          (bucket todos-modelos, obrigatório)
```

> Nota: só o Codex tem knob real de `model_reasoning_effort` (default `high` nos briefs). "Sonnet 4.6" e "Opus 4.7" no roteamento são escolhas de modelo via `Agent({model: ...})` — não existe parâmetro de esforço nessa API.

### Bucket routing (assinatura Claude Max tem 3 buckets independentes)

- **Opus-only**: sessão principal (orquestrador)
- **Somente Sonnet**: workers Sonnet via Bash launcher (`claude -p --model sonnet`)
- **Todos os modelos**: caminhos `Agent` tool (Opus executor/supervisor, ou Sonnet interativo raro)

Workers Sonnet via `Agent({model:"sonnet"})` drenam o bucket "todos os modelos" — evitar. Default é **Bash launcher**.

## Hard rules

- Fase 0 é **obrigatória** e segue a ordem 0.a → 0.b → 0.c → 0.d
- Jamais perguntar números ao usuário antes de 0.a/0.b (plano antes de números)
- Fase 0 = planejamento puro; OK explícito do usuário em 0.c (revisão única) antes de executar
- Briefs **autossuficientes** — copiar integral para cada agente
- **Zero overlap** de arquivos entre agentes paralelos
- Worktree isolado por agente (Claude via `isolation: "worktree"`; Codex via `-C <WT>`)
- Respeitar `max_parallel` — nunca lançar onda maior que o limite
- Supervisor antes do fechamento — sem exceção
- Halt on failure — nunca forçar build/test quebrados
- Ledger append-only em `controle/<slug>/01_LEDGER.md`
- Cleanup **só via Fase 6 com AskUserQuestion** — o trigger é do orquestrador, não dos subagentes
- Workers Sonnet são **executores burros** — se o brief exige julgamento, refazer brief ou rotear para Opus via `Agent`. Bash launcher não aceita ambiguidade
- Hook `UserPromptSubmit` fica habilitado nos workers do launcher — é feature (anti-slop dentro do worker), não bug
- Path do `controle/` do worker é ditado pelo brief (`controle/<slug>/sub-agente-sonnet-<AGENT_ID>/`) — worker nunca inventa

## Halt conditions da skill

- Revisão única (0.c) não convergiu em 3 ciclos (contando ajustes de números + rejeições) → parar e pedir conversa
- Usuário não validou plano em 0.c → parar
- Codex CLI indisponível (`command not found`) → parar e instruir `brew install codex` ou equivalente
- Bash launcher indisponível (`multiAgent/scripts/launch-claude-worker.sh` não existe ou sem +x) → parar e reportar
- Worker Sonnet via launcher retornou `status: halted` → registrar em LEDGER, tratar como retry/halt conforme veredicto do supervisor
- Supervisor retornou `halt` → parar e reportar ao usuário
- Build baseline falhou por motivo novo → parar
- Usuário respondeu "Não" ou "Parcial" no cleanup → pausar, registrar em LEDGER

## Saída

Ao fechar (após cleanup, se aprovado):
1. Path do CONSOLIDADO.md
2. Checklist de aceite marcado
3. Diff resumido (`git diff --stat <base>..HEAD`)
4. Métricas (tokens Claude + Codex, rodadas, ondas, duração)
5. Riscos remanescentes
