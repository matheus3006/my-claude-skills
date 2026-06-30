# my-claude-skills

Coleção pessoal de [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) para Claude Code.
**30 skills.**

## Instalação

Copie a pasta da skill desejada para `~/.claude/skills/` (uso global) ou para `.claude/skills/` dentro de um projeto:

```bash
git clone https://github.com/matheus3006/my-claude-skills.git
cp -R my-claude-skills/<skill> ~/.claude/skills/
```

## Skills

| Skill | Descrição |
|---|---|
| [`adaptive-communication`](adaptive-communication/) | Use when detecting ambiguous user intent, hedging language, open-ended framing, personal context before requests, or when unsure whether user wants explorati… |
| [`almaflow-att-docs`](almaflow-att-docs/) | Sincroniza docs_almaFlow com decisoes de negocio e divergencias entre implementacao, MVP_Fila_Virtual.md e Arquitetura_Fila_Virtual.md. Use quando citar alma… |
| [`almaflow-figma-component`](almaflow-figma-component/) | Use ao criar ou editar ComponentSets/Components na library `almaFlow` do Figma do AlMaFlow (file `ef4cdtGuwgovAERD3kMhHg`, Components page `10:5`) via `use_f… |
| [`bencium-controlled-ux-designer`](bencium-controlled-ux-designer/) | Expert UI/UX design guidance for unique, accessible interfaces. Use for visual decisions, colors, typography, layouts. Always ask before making design decisi… |
| [`bencium-impact-designer`](bencium-impact-designer/) | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or appli… |
| [`bencium-innovative-ux-designer`](bencium-innovative-ux-designer/) | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or appli… |
| [`caveman`](caveman/) | > Ultra-compressed communication mode. Cuts token usage ~75% by dropping filler, articles, and pleasantries while keeping full technical accuracy. Use when u… |
| [`design-audit`](design-audit/) | > Premium UI/UX design audit and refinement skill. Conducts systematic visual audits of existing apps and produces phased, implementation-ready design plans.… |
| [`diagnose`](diagnose/) | Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test. Use when user… |
| [`emil-design-eng`](emil-design-eng/) | This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. |
| [`figma_guide`](figma_guide/) | Guia completo para trabalhar com Figma via MCP `use_figma`. Cobre limitações de execução síncrona, carregamento de fontes, armadilhas de auto-layout, bugs in… |
| [`fix_figma`](fix_figma/) | Audit a Figma frame URL for structural errors (overlaps, out-of-bounds, text overflow, broken layouts) and apply a UX-justified fix. Uses /ui-ux-pro-max, /be… |
| [`grill-me`](grill-me/) | Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants t… |
| [`grill-with-docs`](grill-with-docs/) | Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as de… |
| [`handoff`](handoff/) | Compact the current conversation into a handoff document for another agent to pick up. argument-hint: "What will the next session be used for?" |
| [`human-architect-mindset`](human-architect-mindset/) | Systematic architectural thinking for irreplaceable human capabilities - domain modeling, systems thinking, constraint navigation, and AI-aware problem decom… |
| [`improve-codebase-architecture`](improve-codebase-architecture/) | Find deepening opportunities in a codebase, informed by the domain language in CONTEXT.md and the decisions in docs/adr/. Use when the user wants to improve… |
| [`multi-agent`](multi-agent/) | Orquestra tarefas decomponíveis em múltiplos agentes paralelos combinando Codex CLI (gpt-5.4 high) para trabalho mecânico, Sonnet 4.6 via Bash launcher (buck… |
| [`prototype`](prototype/) | Build a throwaway prototype to flesh out a design before committing to it. Routes between two branches — a runnable terminal app for state/business-logic que… |
| [`setup-matt-pocock-skills`](setup-matt-pocock-skills/) | Sets up an `## Agent skills` block in AGENTS.md/CLAUDE.md and `docs/agents/` so the engineering skills know this repo's issue tracker (GitHub or local markdo… |
| [`tdd`](tdd/) | Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integ… |
| [`teach`](teach/) | Teach the user a new skill or concept, within this workspace. disable-model-invocation: true argument-hint: "What would you like to learn about?" |
| [`to-issues`](to-issues/) | Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to conve… |
| [`to-prd`](to-prd/) | Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context. |
| [`triage`](triage/) | Triage issues through a state machine driven by triage roles. Use when user wants to create an issue, triage issues, review incoming bugs or feature requests… |
| [`ui-typography`](ui-typography/) | > Professional typography rules for UI design, web applications, software interfaces, and all screen-based text. Enforces timeless typographic correctness th… |
| [`ui-ux-pro-max`](ui-ux-pro-max/) | UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart ty… |
| [`visual-tuning-prototype`](visual-tuning-prototype/) | Use when a stakeholder keeps requesting precise visual layout changes — "make the logo lower", "put the email near the center", an exact gap/size — that you… |
| [`write-a-skill`](write-a-skill/) | Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill. |
| [`zoom-out`](zoom-out/) | Tell the agent to zoom out and give broader context or a higher-level perspective. Use when you're unfamiliar with a section of code or need to understand ho… |
