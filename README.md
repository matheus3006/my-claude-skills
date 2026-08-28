# my-claude-skills

Coleção pessoal de [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) para Claude Code.
**47 skills.**

As skills não são avulsas — elas se encadeiam. [**FLUXOS.md**](FLUXOS.md) mostra o caminho de uma ideia solta
até o código: mapa de decisões, protótipo, PRD, issues.

## Instalação

Copie a pasta da skill desejada para `~/.claude/skills/` (uso global) ou para `.claude/skills/` dentro de um projeto:

```bash
git clone https://github.com/matheus3006/my-claude-skills.git
cp -R my-claude-skills/<skill> ~/.claude/skills/
```

As oito skills `*-prototipo` compartilham arquivos de apoio que ficam fora de `skills/`.
Copie a pasta `prototipo-html/` junto:

```bash
cp -R my-claude-skills/prototipo-html ~/.claude/
```

Sem ela as skills apontam para um caminho que não existe na sua máquina.

O conjunto de engenharia em inglês (de `ask-matt` a `implement`) espera um issue tracker
configurado. Rode `/setup-matt-pocock-skills` uma vez no repositório antes do primeiro uso.

## Skills

| Skill | Descrição |
|---|---|
| [`adaptive-communication`](adaptive-communication/) | Use when detecting ambiguous user intent, hedging language, open-ended framing, personal context before requests, or when unsure whether user wants explorati… |
| [`ajustar-detalhe-prototipo`](ajustar-detalhe-prototipo/) | Constrói uma ferramenta interativa com sliders, arrasto e guias visuais para o usuário escolher ele mesmo valores visuais exatos — posição, espaçamento, tamanh… |
| [`almaflow-att-docs`](almaflow-att-docs/) | Sincroniza docs_almaFlow com decisoes de negocio e divergencias entre implementacao, MVP_Fila_Virtual.md e Arquitetura_Fila_Virtual.md. Use quando citar alma… |
| [`almaflow-figma-component`](almaflow-figma-component/) | Use ao criar ou editar ComponentSets/Components na library `almaFlow` do Figma do AlMaFlow (file `ef4cdtGuwgovAERD3kMhHg`, Components page `10:5`) via `use_f… |
| [`ask-matt`](ask-matt/) | Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo. |
| [`auditar-prototipo`](auditar-prototipo/) | Audita um protótipo HTML+JSX contra o checklist de qualidade e devolve um relatório PASS/FAIL por item — ordem de carregamento, cache-bust, tokens, 8 estados v… |
| [`bencium-controlled-ux-designer`](bencium-controlled-ux-designer/) | Expert UI/UX design guidance for unique, accessible interfaces. Use for visual decisions, colors, typography, layouts. Always ask before making design decisi… |
| [`bencium-impact-designer`](bencium-impact-designer/) | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or appli… |
| [`bencium-innovative-ux-designer`](bencium-innovative-ux-designer/) | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or appli… |
| [`caveman`](caveman/) | > Ultra-compressed communication mode. Cuts token usage ~75% by dropping filler, articles, and pleasantries while keeping full technical accuracy. Use when u… |
| [`codebase-design`](codebase-design/) | Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a s… |
| [`design-audit`](design-audit/) | > Premium UI/UX design audit and refinement skill. Conducts systematic visual audits of existing apps and produces phased, implementation-ready design plans.… |
| [`diagnose`](diagnose/) | Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test. Use when user… |
| [`diagnosing-bugs`](diagnosing-bugs/) | Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow. |
| [`domain-modeling`](domain-modeling/) | Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, … |
| [`emil-design-eng`](emil-design-eng/) | This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. |
| [`figma_guide`](figma_guide/) | Guia completo para trabalhar com Figma via MCP `use_figma`. Cobre limitações de execução síncrona, carregamento de fontes, armadilhas de auto-layout, bugs in… |
| [`fix_figma`](fix_figma/) | Audit a Figma frame URL for structural errors (overlaps, out-of-bounds, text overflow, broken layouts) and apply a UX-justified fix. Uses /ui-ux-pro-max, /be… |
| [`grill-me`](grill-me/) | A relentless interview to sharpen a plan or design. |
| [`grill-with-docs`](grill-with-docs/) | A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go. |
| [`grilling`](grilling/) | Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases. |
| [`handoff`](handoff/) | Compact the current conversation into a handoff document for another agent to pick up. |
| [`human-architect-mindset`](human-architect-mindset/) | Systematic architectural thinking for irreplaceable human capabilities - domain modeling, systems thinking, constraint navigation, and AI-aware problem decom… |
| [`implement`](implement/) | Implement a piece of work based on a PRD or set of issues. |
| [`improve-codebase-architecture`](improve-codebase-architecture/) | Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. |
| [`iniciar-prototipo`](iniciar-prototipo/) | Sobe o servidor HTTP local de um protótipo HTML+JSX e abre no browser. Use quando o usuário pedir para rodar, servir, abrir, subir ou ver o protótipo, ou quand… |
| [`integrar-ao-prototipo`](integrar-ao-prototipo/) | Adiciona uma tela, fluxo ou funcionalidade nova a um protótipo HTML+JSX que já existe, reusando os primitivos e tokens dele. Use quando o usuário pedir para in… |
| [`melhorar-prototipo`](melhorar-prototipo/) | Refina uma tela que já está no protótipo HTML+JSX — hierarquia visual, espaçamento, tipografia, microcopy, paleta, estados faltando, acessibilidade. Use quando… |
| [`multi-agent`](multi-agent/) | Orquestra tarefas decomponíveis em múltiplos agentes paralelos combinando Codex CLI (gpt-5.4 high) para trabalho mecânico, Sonnet 4.6 via Bash launcher (buck… |
| [`novo-prototipo`](novo-prototipo/) | Cria um protótipo HTML+JSX do zero (React 18 + Babel standalone, zero build step) quando ainda não existe protótipo para a tela ou fluxo. Use ao iniciar uma te… |
| [`portar-prototipo`](portar-prototipo/) | Traduz um protótipo HTML+JSX aprovado para a stack real do projeto — mapeia componente para arquivo, token do protótipo para o tema da stack, e gera o plano de… |
| [`prototype`](prototype/) | Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a … |
| [`research`](research/) | Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, … |
| [`resolving-merge-conflicts`](resolving-merge-conflicts/) | Use when you need to resolve an in-progress git merge/rebase conflict. |
| [`setup-matt-pocock-skills`](setup-matt-pocock-skills/) | Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the oth… |
| [`sincronizar-prototipo`](sincronizar-prototipo/) | Reflete uma tela já aprovada no protótipo consolidado (vitrine) para evitar drift, faz o bump do cache-bust em todos os scripts e revalida a ordem de carregame… |
| [`tdd`](tdd/) | Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests. |
| [`teach`](teach/) | Teach the user a new skill or concept, within this workspace. |
| [`to-issues`](to-issues/) | Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. |
| [`to-prd`](to-prd/) | Turn the current conversation into a PRD and publish it to the project issue tracker — no interview, just synthesis of what you've already discussed. |
| [`triage`](triage/) | Move issues and external PRs through a state machine of triage roles — categorise, verify, grill if needed, and write agent-ready briefs. |
| [`ui-typography`](ui-typography/) | > Professional typography rules for UI design, web applications, software interfaces, and all screen-based text. Enforces timeless typographic correctness th… |
| [`ui-ux-pro-max`](ui-ux-pro-max/) | UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart ty… |
| [`wayfinder`](wayfinder/) | Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time un… |
| [`write-a-skill`](write-a-skill/) | Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill. |
| [`writing-great-skills`](writing-great-skills/) | Reference for writing and editing skills well — the vocabulary and principles that make a skill predictable. |
| [`zoom-out`](zoom-out/) | Tell the agent to zoom out and give broader context or a higher-level perspective. Use when you're unfamiliar with a section of code or need to understand ho… |

## Família de protótipo

Oito skills que cobrem o ciclo de vida de um protótipo HTML+JSX (React 18 + Babel via CDN,
sem build step). O protótipo faz o papel do Figma: é a fonte de verdade visual antes de
escrever código na stack real.

| Quando usar | Skill |
|---|---|
| Ainda não existe protótipo para a tela | [`novo-prototipo`](novo-prototipo/) |
| Rodar o protótipo e abrir no browser | [`iniciar-prototipo`](iniciar-prototipo/) |
| Somar uma tela ou fluxo ao que já existe | [`integrar-ao-prototipo`](integrar-ao-prototipo/) |
| A tela está feia, confusa ou faltando estado | [`melhorar-prototipo`](melhorar-prototipo/) |
| Acertar um valor específico de posição ou espaçamento | [`ajustar-detalhe-prototipo`](ajustar-detalhe-prototipo/) |
| Verificar contra o checklist antes de aprovar | [`auditar-prototipo`](auditar-prototipo/) |
| Refletir a tela aprovada no protótipo consolidado | [`sincronizar-prototipo`](sincronizar-prototipo/) |
| Traduzir o protótipo aprovado para a stack real | [`portar-prototipo`](portar-prototipo/) |

Arquivos de apoio, compartilhados pelas oito:

- [`prototipo-html/references/convencoes.md`](prototipo-html/references/convencoes.md) — o contrato: estrutura de pastas, ordem de carregamento, regra de tokens
- [`prototipo-html/references/checklist-qualidade.md`](prototipo-html/references/checklist-qualidade.md) — o roteiro da auditoria
- [`prototipo-html/references/deteccao-projeto.md`](prototipo-html/references/deteccao-projeto.md) — como descobrir a stack e a paleta do projeto
- [`prototipo-html/template/`](prototipo-html/template/) — o scaffold que `novo-prototipo` copia
