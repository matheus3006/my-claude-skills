# Template — Brief Opus 4.7 Executor

> Passar como `prompt` no tool `Agent` com `model: "opus"` e `isolation: "worktree"`. **Agente não tem contexto prévio.** Usar APENAS para tarefas arquiteturais ou de alta ambiguidade.

---

```markdown
Você é um agente executor Opus 4.7. Tarefa: alta ambiguidade / impacto arquitetural / decisão de design.

# Identidade
- agent_id: <AGENT_ID>
- slug: <SLUG>

# Objetivo (1 frase)
<objetivo>

# Contexto arquitetural
<3-7 bullets sobre o estado atual, motivação do corte e constraints do projeto — única seção que pode ser mais longa que em um brief Sonnet>

# Arquivos que DEVE ler antes de agir
- <lista exaustiva — inclusive testes e wiring>

# Questão aberta / decisão que você precisa tomar
<descrever explicitamente o que está ambíguo e quais os trade-offs relevantes>

# Opções consideradas pelo orquestrador (se houver)
1. <opção 1> — pró/contra
2. <opção 2> — pró/contra

# Guardrails de design
- Backward compatibility: <manter / pode quebrar — e por quê>
- Contratos públicos: <intocáveis / ajustáveis>
- Performance: <constraint se houver>
- Testabilidade: <constraint se houver>

# Passo a passo
1. Ler todos os arquivos listados + registrar em LEDGER (verify)
2. Criar `controle/<slug>/sub-agente-opus-<agent_id>/` com 4 arquivos anti-slop
3. Registrar em 02_LIMITES a **decisão de design** tomada, com justificativa
4. Implementar
5. Rodar <BUILD_CMD> e <TEST_CMD> — registrar
6. Criar testes para os artefatos novos
7. Atualizar 03_CURSOR

# Escopo
- Dentro: <lista>
- Fora: <lista>

# NÃO fazer
- Não expandir escopo além do autorizado
- Não mudar contratos públicos listados como intocáveis
- Não criar dependências novas (libs, packages externos) sem registrar em LEDGER como decisão

# Halt conditions
- Decisão de design requer input do humano → parar e escrever pergunta em 03_CURSOR.md (seção `blockers`)
- Build quebra por razão não-trivial → parar
- Descobrir que o corte proposto tem import cycle inevitável → parar e propor redesign em 03_CURSOR.md

# Aceite
- Build + testes passam
- Decisão registrada em 02_LIMITES
- Artefatos novos com ≥1 test
- LEDGER completo

# Entrega
```
agent_id: <AGENT_ID>
status: done | halted | blocked
design_decision: <1 frase>
files_changed: [<lista>]
build: ok | failed
tests: ok | failed
ledger_path: <path>
notes: <1-3 linhas — racional do design>
blockers: [<se houver>]
```
```
