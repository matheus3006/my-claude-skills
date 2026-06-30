# modo_uso.md — como usar a skill `/multi-agent`

Padrões de invocação + exemplos reais. Complementa `README.md` (referência) e `PROMPT.md` (protocolo).

---

## 0. TL;DR

```
/multi-agent <descrição curta da tarefa>
```

A skill entra em **5 passos obrigatórios** antes de executar qualquer código:

```
1. Fase 0.a — análise: verify + grafo + quebra (IA propõe N/composição/max_parallel)
   ↓
2. Fase 0.b — gera planejamento/<slug>/PLANO.md com a proposta da IA
   ↓
3. Fase 0.c — revisão ÚNICA (calibração + aprovação juntos)
              ├── "Aprovado — executar" → segue (1 clique)
              ├── "Ajustar números" → sub-AskQuestion (agentes/composição/max_parallel) → v2 → volta aqui
              └── "Rejeitar — entendimento/escopo/aceite" → sub-AskQuestion → v+1 → volta aqui
   ↓
4. Fase 0.d → 5 — cria controle/<slug>/, baseline, execução em ondas, supervisor, fechamento
   ↓
5. Fase 6 — AskQuestion "tarefa finalizada?" → cleanup
```

**Princípio**: 1 turno humano para aprovar (não 2 como antes). Se o plano estiver bom, você clica "Aprovado" e segue. Ajustes granulares só se precisar.

**Nada é criado em `controle/` nem no código até o PLANO.md estar aprovado.**

---

## 1. Invocação mínima

**Cenário**: tarefa pequena, 3-5 agentes.

```
/multi-agent extrair PatientCredentialService do PatientService
```

Fluxo esperado:
- Fase 0.a: slug `srp-patient-credentials`, verify do código, quebra em ~3 tarefas atômicas
- Fase 0.b: IA propõe `3 agentes (2 sonnet + 1 opus)`, `max_parallel=4`, `1 rodada`
- Fase 0.c (revisão única): você clica `Aprovado — executar` (um clique só)
- Execução → consolidação → cleanup

---

## 2. Invocação com documento de apoio

**Cenário**: auditoria já feita, quer delegar execução.

```
/multi-agent refatorar módulo billing em SRP — ler backend/AlMaNutriSaas/SRP_BILLING_AUDIT.md como fonte de verdade
```

O orquestrador vai `Read` o documento na Fase 0 antes de montar o plano.

---

## 3. Invocação com hint de roteamento

**Cenário**: você já sabe que a tarefa é 80% mecânica.

```
/multi-agent migrar todos os handlers de v1/ para v2/ — tarefa mecânica, prefira Codex
```

Na Fase -1 a pergunta de composição vai sugerir `Maioria Codex`.

---

## 4. Invocação com overlay de projeto

**Cenário**: projeto com comandos build/test específicos que você não quer digitar a cada vez.

Criar `multiAgent/overlays/<nome>.md`:

```markdown
# overlay: almanutri
BUILD_CMD_BACKEND: cd backend/AlMaNutriSaas && ./mvnw -q -DskipTests package
TEST_CMD_BACKEND:  cd backend/AlMaNutriSaas && ./mvnw -q test
BUILD_CMD_FRONT:   cd frontend && npm run build
TEST_CMD_FRONT:    cd frontend && npm test
PROJECT_ROOT:      /Users/matheus/AlMaNutri
```

Invocar referenciando:

```
/multi-agent (overlay: almanutri) corrigir lint em todos os handlers do backend
```

---

## 5. Tarefa grande (21+ agentes)

**Cenário**: refactor massivo. Máquina não aguenta 21 agentes simultâneos.

```
/multi-agent separar monólito em microserviços conforme controle/refactor-microservices/PLANO.md
```

Fase 0.a a IA faz a quebra e pode propor, por exemplo, `23 agentes (12 codex + 8 sonnet + 3 opus)`, `max_parallel=4`, `4 rodadas`.

Fase 0.c calibração — você pode:
- `Aceitar proposta` em tudo
- `Mais agentes` / `Menos agentes` se a quebra estiver grossa/fina
- `Mais Codex` se achar que 8 Sonnet é overkill para o volume mecânico
- `max_parallel=8` se a máquina aguenta

A cada mudança a IA reescreve PLANO v2 e reapresenta.

Fase 0.d monta tabela tipo:

```
Rodada 1: 12 agentes mecânicos (codex) → 3 ondas de 4
Rodada 2: 8 agentes de refactor (sonnet) → 2 ondas de 4
Rodada 3: 3 agentes arquiteturais (opus) → 1 onda de 3
Rodada 4: supervisor (opus) → 1
```

---

## 6. Retomada (conversa interrompida)

**Cenário**: você fechou o Claude Code no meio.

Basta dizer:

```
continuar tarefa ativa
```

O orquestrador lê `controle/_ACTIVE`, pega o slug, lê CURSOR → LEDGER → LIMITES → FONTES e retoma do último passo marcado.

---

## 7. Pular planejamento (NÃO recomendado)

Se realmente quer ir direto ao código (quebra o anti-slop):

```
/non-control
/multi-agent <tarefa>
```

`/non-control` desativa o protocolo por um turno. Use apenas para tarefas triviais de 1 agente. **Não aplica em tarefas multi-agente de verdade.**

---

## 7.5. A revisão única da Fase 0.c

A IA termina 0.a/0.b com um PLANO draft (ex: `14 agentes, 8 codex + 5 sonnet + 1 opus, max_parallel=4`). Você recebe **uma única pergunta-mestre**:

```
P — Plano draft em planejamento/<slug>/PLANO.md. Como seguir?
   [Aprovado — executar]                (plano OK, números OK → segue)
   [Ajustar números]                     (abre sub-AskQuestion de agentes/composição/max_parallel)
   [Rejeitar — entendimento/escopo/aceite]  (abre sub-AskQuestion de ajuste estrutural)
```

### Caminho feliz (1 clique)

Você lê o PLANO, concorda → `Aprovado — executar`. 0.c termina em 1 turno humano. Economia de ~2-5 min vs fluxo antigo que tinha 2 loops.

### Ajuste de números

Se só os números estão off (ex: "14 agentes é demais, quero 8"):

```
Você: [Ajustar números]

Sub-AskQuestion:
  P2.a — Agentes:       [Aceitar 14] [Mais] [Menos] [Other: digitar]
  P2.b — Composição:    [Aceitar] [Mais Codex] [Mais Sonnet] [Mais Opus] [Other]
  P2.c — max_parallel:  [2] [4] [6] [8+] [Other]

Você ajusta o que quiser. IA volta para 0.a, requebra se necessário, reescreve v2 → volta para a pergunta-mestre acima.
```

### Rejeição estrutural

Se o PLANO não entendeu seu pedido (escopo errado, aceite mal-definido, alternativa questionável):

```
Você: [Rejeitar — entendimento/escopo/aceite]

Sub-AskQuestion:
  O que mudar? [escopo] [aceite] [entendimento] [alternativa] [Other]
  Se escopo: [maior] [menor]

IA reescreve v+1 → volta para a pergunta-mestre.
```

### Regras
- O PLANO é salvo em disco — você pode reler a qualquer momento
- Cada iteração incrementa a versão e registra em "Histórico de iterações"
- Após **3 ciclos sem convergir** (contando ajustes de números + rejeições), orquestrador para e pede conversa livre
- Pedido original (seção 1 do PLANO) nunca muda; só a interpretação (seção 2) e a proposta (seção 4)

---

## 8. max_parallel recomendado por hardware

Usado como default na proposta da IA (Fase 0.b) e ajustável pelo usuário em 0.c. Cada agente Claude em worktree = 1 processo git + 1 sessão de modelo; cada agente Codex = 1 processo `codex` rodando gpt-5.4 xhigh. Calibrar:

- Mac M1/M2/M3 base (8GB): `2`
- Mac M1/M2/M3 Pro (16-18GB): `4` (recomendado — é o default da IA)
- Mac M3 Max / 32GB+: `6-8`
- Workstation >64GB: `8+`

Se você sabe que sua máquina aguenta mais, responda P3 com o valor real — a IA usa `4` como chute conservador.

---

## 9. O que a Fase 6 faz (cleanup)

Ao supervisor retornar `approve` e build/test passarem, você recebe:

```
Tarefa finalizada com sucesso?
- Sim, apagar (mantém orquestrador + CONSOLIDADO)
- Não, manter tudo para inspeção
- Parcial (quero escolher o que apagar)
```

**Sim** apaga:
- `controle/<slug>/sub-agente-codex-*/`, `controle/<slug>/sub-agente-sonnet-*/`, `controle/<slug>/sub-agente-opus-*/`
- `/tmp/wt-<slug>-*` (worktrees)
- `/tmp/brief-<slug>-*.md` + `/tmp/codex-out-<slug>-*.txt`

**Sim** NÃO apaga:
- `controle/<slug>/` (orquestrador)
- `controle/<slug>/CONSOLIDADO.md` (sumário unificado com tudo que cada agente fez)
- Arquivos de código (mudanças já estão no git)

---

## 10. Anti-padrões (não faça)

- ❌ Responder números na primeira mensagem antes do plano: "só vai com 10 agentes Sonnet, paralelo máximo" → orquestrador ignora e segue Fase 0.a primeiro
- ❌ Aprovar plano no olho sem ler: perde o ponto do anti-slop
- ❌ Rodar cleanup manualmente (`rm -rf controle/<slug>/sub-agente-*`) antes da Fase 6: quebra a auditoria do supervisor
- ❌ Misturar agentes de rodadas diferentes numa onda: quebra o grafo de dependências
- ❌ Deixar o `controle/_ACTIVE` com slug antigo quando já arquivado: próxima sessão retoma fantasma

---

## 11. Interrompendo no meio

Se quer parar:

```
halt
```

Orquestrador:
1. Registra em LEDGER tipo `block`
2. Mantém worktrees em disco
3. Marca CURSOR como `interrompido`
4. **Não** executa cleanup

Retomar depois com "continuar tarefa ativa".

Se quer abortar de vez (descartar trabalho):

```
abortar tarefa ativa
```

Pergunta de confirmação antes de `git worktree remove --force` em tudo + `rm -rf controle/<slug>*`.

---

## 12. Economia esperada

Com a skill bem usada (vs fazer tudo direto com Opus sem delegação):

| Cenário | Tokens Anthropic | Tokens Codex | Total relativo |
|---------|-----------------:|-------------:|---------------:|
| Tudo no Opus direto | 100% | 0% | 100% |
| Com skill multi-agent | ~25% | (plano OpenAI) | ~25% Anthropic + Codex |

Redução depende de quanto da tarefa é mecânica.

---

## 13. Debug

Se algo der errado no meio:

- `cat controle/<slug>/01_LEDGER.md` — histórico completo
- `ls controle/<slug>/sub-agente-*` — subagentes ativos
- `git worktree list` — worktrees pendentes
- `ls /tmp/codex-out-<slug>-*` — outputs dos Codex
- `cat /tmp/codex-out-<slug>-<id>.txt` — última mensagem de um Codex específico
- `ls /tmp/out-<slug>-*.json` — outputs dos workers Sonnet (Bash launcher)
- `jq .result /tmp/out-<slug>-<id>.json` — YAML final de um worker específico
- `jq .usage /tmp/out-<slug>-<id>.json` — tokens/cache/custo por worker

O orquestrador não esconde estado: tudo está em disco.

---

## 14. Workers Sonnet: Bash launcher vs Agent tool

A skill tem **2 caminhos para Sonnet executor**. Escolha baseada em bucket + tipo de tarefa.

### Default: Bash launcher (`launch-claude-worker.sh`)

**Drena bucket "Somente Sonnet"** — não consome bucket "todos os modelos".

Use quando:
- Brief é determinístico (operação literal, zero julgamento)
- Escopo é fechado (lista exata de arquivos)
- Saída esperada é YAML estruturado (mesmo schema do Codex)
- Ganho: worker roda em processo próprio, libera bucket compartilhado

Como o orquestrador dispara:
```
Bash (run_in_background: true)
  multiAgent/scripts/launch-claude-worker.sh <id> sonnet <brief> <wt> <out>
```

Métricas após conclusão: `jq '{duration_ms, total_cost_usd, usage}' <out>`.

### Caso raro: Agent tool (`Agent({model:"sonnet"})`)

**Drena bucket "todos os modelos"** — caro, compartilhado com Opus.

Use APENAS quando:
- Precisa de interação tool-by-tool com a sessão pai durante a execução
- O worker precisa que o orquestrador veja seus tool-results ao vivo (ex: parar no meio para trocar brief)

Na prática: quase sempre o launcher resolve. Se você está pensando "vou usar Agent tool pra ver o que ele está fazendo" → use o launcher e leia `jq .result` depois.

### Regra de bolso

| Situação | Caminho |
|---|---|
| Brief determinístico + escopo fechado | Bash launcher |
| Brief exige julgamento do worker | **Refazer brief → Opus via Agent**, não Sonnet |
| Worker precisa negociar com orquestrador ao vivo | Agent tool (raro) |

### Economia observada

Baseline empírico (2 workers paralelos, brief trivial):
- `claude -p --model sonnet` via Bash: ~$0.07-0.09/worker, cache_creation ~9k tokens (prefixo system+CLAUDE.md+hook reaproveitado entre invocações via cache 1h)
- `Agent({model:"sonnet"})` equivalente: consome bucket "todos os modelos" (mesmo custo em dólares, mas bucket compartilhado com Opus = limita Opus disponível pra arquitetura)

Conclusão: workers Sonnet via Bash **não competem** com orquestrador Opus por cota.
