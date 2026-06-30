---
name: almaflow-att-docs
description: Sincroniza docs_almaFlow com decisoes de negocio e divergencias entre implementacao, MVP_Fila_Virtual.md e Arquitetura_Fila_Virtual.md. Use quando citar almaFlow_att_docs ou AlMaFlow.
---

# AlmaFlow Att Docs

## Objetivo

Garantir que toda decisao de negocio ou divergencia encontrada na implementacao seja refletida nos documentos oficiais do AlMaFlow:

- `/Users/matheus/AlmaSoftwareHouse/AlMaFlow/docs_almaFlow/MVP_Fila_Virtual.md`
- `/Users/matheus/AlmaSoftwareHouse/AlMaFlow/docs_almaFlow/Arquitetura_Fila_Virtual.md`

## Workflow Obrigatorio

1. Entender a decisao ou divergencia.
   - Extrair a regra nova, mudanca de escopo, comportamento operacional, metrica, fluxo, permissao, entidade, API ou risco.
   - Se a decisao nao for bloqueante, assumir o caminho mais convencional e registrar a assuncao em 1 linha.

2. Ler os documentos oficiais antes de editar.
   - Abrir os dois arquivos acima.
   - Identificar onde a decisao deve entrar no MVP e onde deve entrar na arquitetura.
   - Procurar termos conflitantes com `rg` antes de alterar.

3. Validar contra a implementacao quando houver codigo.
   - Usar `rg --files`, `rg`, `git diff` e arquivos locais relevantes.
   - Comparar comportamento implementado vs. comportamento documentado.
   - Se o codigo divergir da decisao de negocio, documentar a decisao correta e sinalizar o risco de implementacao defasada.

4. Atualizar os documentos.
   - Em `MVP_Fila_Virtual.md`, atualizar escopo, decisoes-chave, personas, fluxos, modelo alto nivel, telas, metricas, hipoteses, roadmap, proximos passos ou perguntas.
   - Em `Arquitetura_Fila_Virtual.md`, atualizar principios, ADRs, modulos, schema, APIs, WebSocket, auth, testes, decomposicao AI-ready, riscos, proximos passos ou perguntas.
   - Evitar duplicacao. Se uma regra aparece em ambos, manter linguagem de produto no MVP e contrato tecnico na arquitetura.

5. Fazer checagem de consistencia.
   - Rodar `rg` para termos antigos/conflitantes.
   - Conferir que os dois documentos contam a mesma historia.
   - Conferir `git diff --stat` e `git status --short`.

## Regras de Escrita

- Responder e escrever em PT-BR.
- Ser direto, sem preambulo.
- Preservar o estilo existente dos documentos.
- Usar caminho completo sempre que citar arquivo.
- Nao criar ADR separado a menos que o usuario peca ou o repo ja tenha pasta ADR ativa.
- Nao fazer staging/commit sem pedido explicito.
- Usar `apply_patch` para edicoes manuais.

## Saida Esperada

Responder com:

1. `CHECKLIST`: arquivos alterados e validacoes feitas.
2. `DIFF / PATCH / PROPOSTA OBJETIVA`: resumo objetivo do que entrou nos docs.
3. `RISCOS`: somente divergencias, assumptions ou pendencias acionaveis.
4. `PERGUNTAS`: apenas se algo bloquear a atualizacao.
