# Fluxos

Como as skills se encadeiam. Cada uma resolve um pedaço; o valor está na ordem.

Duas famílias convivem aqui:

- **Conjunto de engenharia** (em inglês) — do `/wayfinder` ao `/implement`, tudo apoiado
  num issue tracker.
- **Família de protótipo** (em PT-BR) — as oito skills `*-prototipo`, que respondem
  "como isso deve ficar na tela" antes de existir código.

Elas se encontram num ponto só, e é o ponto mais importante deste documento: o **ticket
de protótipo** do wayfinder.

## O caminho completo

```
ideia solta, grande demais para uma sessão
        │
        ▼
   /wayfinder ──── desenha o mapa: tickets de decisão no issue tracker
        │
        ├─ ticket de pesquisa ..... /research            (agente sozinho)
        ├─ ticket de conversa ..... /grilling + /domain-modeling  (com você)
        ├─ ticket de tarefa ....... trabalho manual que destrava a decisão
        └─ ticket de protótipo ....┐
                                   ├─ é de comportamento? → /prototype
                                   └─ é de aparência?     → família *-prototipo
        │
        ▼  (mapa fechado: não sobrou nada para decidir)
   /to-prd ────── vira PRD no issue tracker
        │
        ▼
   /to-issues ─── fatia em issues que qualquer um pega sozinho
        │
        ▼  (uma sessão limpa por issue)
   /implement ─── constrói
```

## Pré-requisito

`/setup-matt-pocock-skills` roda **uma vez por repositório**, antes de tudo. Ele grava
onde ficam as issues (GitHub, GitLab, ou arquivos markdown em `.scratch/`), o vocabulário
de etiquetas da triagem e onde moram os documentos de domínio. Sem isso, o wayfinder não
sabe onde criar o mapa e o `/to-prd` não sabe onde publicar o PRD.

## 1. Ideia grande demais → `/wayfinder`

O wayfinder é para quando o trabalho não cabe numa sessão e você ainda não enxerga o
caminho. Ele não constrói: ele transforma névoa em **tickets de decisão** no issue
tracker e resolve um por sessão, até não sobrar nada para decidir.

Duas coisas que costumam surpreender:

- **Uma decisão por sessão** (pesquisa é a exceção). Resolver três num fôlego só produz
  a terceira decisão com o raciocínio já cansado.
- **Ele planeja, não executa.** Quando bater a vontade de "só ir fazendo", esse é o
  sinal de que o mapa acabou — hora de sair para o PRD.

## 2. O ticket de protótipo — onde as duas famílias se encontram

Um ticket de protótipo existe quando a pergunta não se resolve conversando. Ele se divide
em dois, e a divisão é pelo tipo de pergunta:

| A pergunta é | Exemplo | Skill |
|---|---|---|
| Como isso deve **se comportar** | "O que acontece se o pagamento falhar no meio da fila?" | `/prototype` — código descartável que você roda e lê |
| Como isso deve **ficar** | "O cartão do pedido mostra o telefone do cliente ou não?" | família `*-prototipo` — tela clicável em HTML+JSX |

O encaixe que importa: **resolver um ticket de protótipo visual é a aprovação explícita
que o `/portar-prototipo` exige para rodar.** Ele se recusa a portar sem ela, e "legal"
ou silêncio não contam. Então o comentário de resolução do ticket é onde essa aprovação
fica registrada, com o link do protótipo como anexo do ticket.

## 3. As oito skills de protótipo em conjunto

```
        /novo-prototipo          (não existe protótipo ainda)
               │
               ▼
        /iniciar-prototipo  ◄────────────────┐   sobe o servidor e abre no browser
               │                             │   (roda de novo a cada mudança)
               ▼                             │
        você olha a tela                     │
               │                             │
     ┌─────────┼─────────┬──────────────┐    │
     ▼         ▼         ▼              ▼    │
 falta tela  está     um valor       está ok │
     │       feia    específico         │    │
     │         │      teimoso           │    │
     │         │         │              │    │
/integrar- /melhorar- /ajustar-         │    │
ao-prototipo prototipo detalhe- ────────┴────┘
     └─────────┴─────────┘  prototipo
               │
               ▼
        /auditar-prototipo   PASS/FAIL: contraste, 8 estados, i18n, sem PII no mock
               │
               ▼
        APROVAÇÃO EXPLÍCITA  ← só você dá; não se deduz de silêncio
               │
      ┌────────┴────────┐
      ▼                 ▼
/sincronizar-      /portar-prototipo → stack real
 prototipo
 (reflete na
  vitrine)
```

Como escolher entre as três do meio, que é onde a dúvida aparece:

- **`/melhorar-prototipo`** — a tela está feia, confusa ou faltando um estado. Você
  descreve o incômodo, ela decide o que mexer.
- **`/ajustar-detalhe-prototipo`** — você sabe exatamente o que quer mudar mas não
  acerta o número: "sobe um pouco… agora demais… menos". Ela monta uma ferramenta com
  sliders para você achar o valor e depois grava no código.
- **`/integrar-ao-prototipo`** — não é a mesma tela, é mais uma. Reusa os componentes e
  as cores que já existem em vez de começar do zero.

Três regras que valem em todas:

1. **`/auditar-prototipo` antes de aprovar.** Aprovar com FAIL aberto significa reproduzir
   o defeito no código de produção, onde consertar custa dez vezes mais.
2. **Cor e espaçamento só por token, nos dois temas.** Um token que só existe no tema
   claro quebra o escuro — e isso atravessa para a stack real no `/portar-prototipo`.
3. **Nada de dado pessoal nos mocks.** Protótipo vira link compartilhado.

## 4. Do protótipo aprovado para o código

O `/portar-prototipo` produz duas tabelas: token do protótipo → onde ele vive no tema da
stack, e componente do protótipo → arquivo real. O que fazer com elas depende do tamanho:

- **Cabe numa sessão** → o próprio `/portar-prototipo` implementa e fecha, verificando com
  screenshot lado a lado nos dois temas.
- **Não cabe** → pare depois do plano e leve as tabelas para o `/to-prd`. Elas viram a
  seção de decisões de implementação do PRD — o template dele já prevê inline de trecho
  vindo de protótipo quando a prosa não é precisa o bastante. Daí `/to-issues` fatia, e
  cada issue vira uma sessão de `/implement`.

Em qualquer um dos dois, o protótipo continua sendo a referência visual: a comparação
lado a lado vale por issue, não só no fim.

## 5. Quando pular o wayfinder

O wayfinder cobra um mapa, e mapa para viagem curta é desperdício. Pule quando:

- **A ideia já está clara** — vá direto para `/grilling` (ou `/grill-with-docs`, se há
  código e você quer que o aprendizado fique gravado em `CONTEXT.md`), e daí para
  `/to-prd`.
- **É só uma tela** — vá direto para `/novo-prototipo`. Protótipo não precisa de PRD por
  cima.
- **É bug ou pedido que chegou de fora** — `/triage` põe na fila, `/implement` pega.
  Issue que o `/to-issues` gerou já nasce pronta: não triagem de novo.

O próprio wayfinder avisa: se a conversa inicial não revelar névoa nenhuma, ele manda
parar e perguntar como você quer seguir.

## Regras que atravessam tudo

- **Contexto limpo por issue.** Do `/grilling` até o `/to-issues`, tudo numa janela só,
  para o PRD e as issues nascerem do mesmo raciocínio. Cada `/implement` depois começa do
  zero, lendo a issue.
- **Janela cheia não se resolve empurrando.** Use `/handoff` para fechar o que foi
  entendido num arquivo e abrir sessão nova a partir dele. `/compact` continua a mesma
  conversa; `/handoff` abre outra.
- **Decisão é sua.** `/grilling`, os tickets de conversa do wayfinder e a aprovação do
  protótipo são todos com humano na linha. Agente que responde as próprias perguntas
  quebrou o combinado.

## Nota sobre o `/ask-matt`

O `/ask-matt` é o roteador do conjunto de engenharia — pergunta a ele quando não lembrar
qual skill usar. Ele é anterior ao `/wayfinder`, ao `/grilling` e à família de protótipo,
então não cita nenhum dos três. Para o caminho atualizado, este arquivo é a referência.
