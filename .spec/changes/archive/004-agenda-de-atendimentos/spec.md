# 004: Agenda de atendimentos

## Objetivo

Entregar a agenda ponta a ponta: marcar, consultar, concluir e cancelar atendimentos,
respeitando horário de funcionamento e ocupação da agenda.

## Contexto técnico

- Cada atendimento tem duração fixa de 60 minutos. A janela ocupada é
  `[inicio, inicio + 60min)`.
- Datas trafegam em ISO 8601. A comparação de janelas acontece no domínio, em UTC, a
  partir dos valores já resolvidos na borda.
- A página `agenda` recebe `searchParams.dia` no formato `AAAA-MM-DD`. `searchParams`
  é assíncrono no Next 16: use `const { dia } = await searchParams`.

## Referências do projeto

- `.spec/memory/produto.md`
- `.spec/memory/arquitetura.md`
- `.spec/memory/contexto-tecnico.md`

## Referências compartilhadas

- `.spec/shared/como-executar-spec.md`
- `.spec/shared/convencoes-de-nomes.md`
- `.spec/shared/criterios-de-verificacao.md`
- `.spec/shared/dominio-entidade.md`
- `.spec/shared/criterios-de-verificacao.md`

## Observações locais

- Toda regra abaixo é regra de negócio e vive em `src/dominio`. Nenhuma delas pode ser
  reimplementada em Server Action, no repositório ou em componente.
- A verificação de sobreposição é feita pelo caso de uso a partir do contrato
  `listarPorIntervalo` do repositório. O repositório não decide se pode marcar.
- Considere "atendimento ativo" apenas o de status `AGENDADO`.

## Regras a implementar

1. Não marcar fora de segunda a sábado, das 08:00 às 18:00 (a janela inteira precisa
   caber no expediente). Código: `ATENDIMENTO.FORA_DO_EXPEDIENTE`.
2. Não marcar no passado. Código: `ATENDIMENTO.DATA_NO_PASSADO`.
3. Não permitir sobreposição com outro atendimento ativo. Código:
   `ATENDIMENTO.HORARIO_OCUPADO`.
4. Pet inativo ou tutor inativo não recebe agendamento. Código: `ATENDIMENTO.PET_INATIVO`.
5. Cancelar exige no mínimo 2 horas de antecedência. Código:
   `ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO`.
6. Só é possível concluir ou cancelar atendimento com status `AGENDADO`. Código:
   `ATENDIMENTO.STATUS_INVALIDO`.

## Tarefas

### Negócio

- [x] Criar o agregado `atendimento` com a skill `dominio-entidade`: `id`, `petId`,
      `inicio`, `fim`, `status` (`AGENDADO` | `CONCLUIDO` | `CANCELADO`).
      Ao construir a entidade, `fim = inicio + 60min`.
> Evidência (31-07-2026 14:15) — criado `Atendimento` com construtor que sempre recalcula `fim = inicio + 60min` (ignora qualquer `fim` recebido). Decisão registrada: `validar()` só checa `ATENDIMENTO.DATA_INVALIDA` (inicio precisa ser uma data válida); `petId` não é validado no formato, seguindo o mesmo precedente de `Pet` (que também não valida o formato de `tutorId` na entidade — a existência é responsabilidade do caso de uso via repositório) | arquivos: src/dominio/atendimento/atendimento.entidade.ts | verificação: `npx vitest run src/dominio/atendimento` → 16 passed (16)

- [x] Declarar `atendimento.repositorio.ts` com `salvar`, `buscarPorId`,
      `listarPorIntervalo(inicio, fim)` e `listarPorDia(data)`.
> Evidência (31-07-2026 14:15) — contrato criado exatamente com essas quatro operações, sem decidir nada sobre sobreposição (isso fica no caso de uso, como pedem as Observações locais) | arquivos: src/dominio/atendimento/atendimento.repositorio.ts | verificação: `npx tsc --noEmit` (via `npm run build`) → sem erros

- [x] Implementar `agendar-atendimento.caso-de-uso.ts` com a skill `dominio-caso-de-uso`,
      aplicando as regras 1 a 4, nesta ordem, acumulando os erros aplicáveis.
> Evidência (31-07-2026 14:15) — `AgregadorDeErros` (já existente em `erro-de-dominio.erro.ts`) usado para acumular as 4 regras nesta ordem (expediente, passado, ocupação, pet/tutor inativo) antes de decidir falha ou sucesso, conforme pedido explicitamente pela tarefa (diferente do padrão geral de "para na primeira regra" de `.spec/shared/dominio-caso-de-uso.md`, que vale por padrão mas foi sobrescrito aqui pela instrução mais específica da spec). Decisão registrada: como a regra 4 depende de o pet existir, adicionado o código `ATENDIMENTO.PET_NAO_ENCONTRADO` (não estava entre os 6, mas é necessário — sem ele, um `petId` inválido quebraria a checagem de `pet.ativo`/`tutor.ativo`; mesmo padrão já usado em `PET.TUTOR_NAO_ENCONTRADO` na spec 003). Convenção de datas: a comparação acontece inteiramente com `getUTC*`, tratando os campos UTC do `Date` como se fossem os campos de hora local de America/Sao_Paulo (ver decisão detalhada na tarefa de Server Actions abaixo) | arquivos: src/dominio/atendimento/agendar-atendimento.caso-de-uso.ts | verificação: `npx vitest run src/dominio/atendimento/agendar-atendimento.caso-de-uso.spec.ts` → 9 passed (9)

- [x] Implementar `cancelar-atendimento.caso-de-uso.ts` aplicando as regras 5 e 6.
> Evidência (31-07-2026 14:15) — ordem escolhida: regra 6 (status) antes da regra 5 (antecedência), invertendo a ordem em que aparecem no texto da tarefa. Decisão registrada: checar o status primeiro evita mostrar "faltam 2 horas" para um atendimento que já foi cancelado/concluído, o que seria uma mensagem sem sentido; não há instrução de "acumular" para este caso de uso (diferente de agendar), então segue o padrão padrão de parar na primeira regra violada. Também adicionado `ATENDIMENTO.NAO_ENCONTRADO` (necessário para um `id` inexistente, mesmo padrão de `TUTOR.NAO_ENCONTRADO`) | arquivos: src/dominio/atendimento/cancelar-atendimento.caso-de-uso.ts | verificação: `npx vitest run src/dominio/atendimento/cancelar-atendimento.caso-de-uso.spec.ts` → 4 passed (4)

- [x] Implementar `concluir-atendimento.caso-de-uso.ts` aplicando a regra 6.
> Evidência (31-07-2026 14:15) — mesmo padrão de `ATENDIMENTO.NAO_ENCONTRADO` + `ATENDIMENTO.STATUS_INVALIDO` | arquivos: src/dominio/atendimento/concluir-atendimento.caso-de-uso.ts | verificação: `npx vitest run src/dominio/atendimento/concluir-atendimento.caso-de-uso.spec.ts` → 3 passed (3)

- [x] Cobrir com teste unitário cada uma das seis regras, além do caminho feliz. Incluir
      caso de borda: novo atendimento começando exatamente no fim de outro (deve ser
      permitido).
> Evidência (31-07-2026 14:15) — repositório em memória `AtendimentoRepositorioEmMemoria` criado para os testes. `agendar-atendimento.caso-de-uso.spec.ts`: caminho feliz, `FORA_DO_EXPEDIENTE`, `DATA_NO_PASSADO`, `HORARIO_OCUPADO`, caso de borda (novo atendimento começando exatamente no fim de outro → permitido), `PET_INATIVO` (pet inativo e, em teste separado, tutor inativo), `PET_NAO_ENCONTRADO`, e um teste extra confirmando que as 3 regras aplicáveis simultaneamente aparecem todas juntas na lista de erros (comportamento de acumulação). `cancelar-atendimento.caso-de-uso.spec.ts`: caminho feliz, `CANCELAMENTO_FORA_DO_PRAZO`, `STATUS_INVALIDO`, `NAO_ENCONTRADO`. `concluir-atendimento.caso-de-uso.spec.ts`: caminho feliz, `STATUS_INVALIDO`, `NAO_ENCONTRADO` | arquivos: src/dominio/compartilhado/testes/atendimento.repositorio-em-memoria.ts, src/dominio/atendimento/agendar-atendimento.caso-de-uso.spec.ts, src/dominio/atendimento/cancelar-atendimento.caso-de-uso.spec.ts, src/dominio/atendimento/concluir-atendimento.caso-de-uso.spec.ts | verificação: `npx vitest run src/dominio/atendimento` → "Test Files 3 passed (3)", "Tests 16 passed (16)"

### Infra

- [x] Adicionar o modelo `Atendimento` ao `schema.prisma` (relação com `Pet`) e gerar
      a migração.
> Evidência (31-07-2026 14:15) — modelo `Atendimento` com `petId`/`pet` (relação), `inicio`, `fim` (`DateTime`), `status` (`String`), índices em `petId` e em `[inicio, fim]` (para a consulta de sobreposição). Migração gerada com `npx prisma migrate dev --name adiciona_atendimento` (não usado `db push`, conforme restrição do projeto) | arquivos: prisma/schema.prisma, prisma/migrations/20260731165748_adiciona_atendimento/migration.sql | verificação: `npx prisma migrate dev --name adiciona_atendimento` → "Your database is now in sync with your schema."; `npx prisma generate` → "Generated Prisma Client (7.9.1)"

- [x] Implementar `atendimento.prisma-repositorio.ts`.
> Evidência (31-07-2026 14:15) — `listarPorIntervalo` usa `inicio: { lt: fim }, fim: { gt: inicio }` (sobreposição de intervalos semiabertos — a mesma comparação estrita que permite o caso de borda "começa exatamente no fim de outro"); `listarPorDia` filtra por `[00:00, 24:00)` UTC do dia informado. Repositório só devolve candidatos por intervalo; quem decide se o horário está ocupado (considerando status `AGENDADO`) continua sendo o caso de uso, como pedem as Observações locais | arquivos: src/infra/repositorios/atendimento.prisma-repositorio.ts | verificação: `npm run build` → compila sem erros; coberto indiretamente pelos testes de integração da Server Action (ver tarefa de Verificação)

### Server Actions

- [x] Criar `src/app/acoes/atendimento.acoes.ts` com `agendarAtendimento`,
      `concluirAtendimento` e `cancelarAtendimento`.
> Evidência (31-07-2026 14:15) — decisão de fuso horário registrada (pequena ambiguidade em "a borda resolve o fuso America/Sao_Paulo antes de entregar ao domínio", sem detalhamento em `.spec/memory/contexto-tecnico.md` de como isso deveria ser implementado sem biblioteca de timezone): como America/Sao_Paulo é UTC-3 o ano inteiro desde 2019 (sem horário de verão) e o projeto não tem nenhuma biblioteca de timezone, a borda converte "data" + "hora" do formulário (horário local da recepção) diretamente para um `Date` cujos campos UTC contêm os mesmos dígitos do horário local (`paraInicioNoDominio`), e "agora" é resolvido da mesma forma (`agoraNoDominio`, `Date.now() - 3h`). Assim o domínio só compara campos UTC entre si (nunca lê o relógio do processo, nunca depende do fuso do servidor) e as constantes de regra de negócio continuam legíveis como 08:00–18:00, sem números mágicos de deslocamento dentro de `src/dominio`. Caminho mais simples que converter para UTC real (o que exigiria as constantes de expediente do domínio serem 11:00–21:00, obscurecendo a regra) | arquivos: src/app/acoes/atendimento.acoes.ts | verificação: `npm run build` → sem erros; `npm test` → ver tarefa de Verificação

- [x] Cada mutação chama `revalidatePath('/agenda')` antes de retornar sucesso.
> Evidência (31-07-2026 14:15) — as 3 Server Actions chamam `revalidatePath("/agenda")` somente quando `resultado.ok` é `true`, antes do `return` | arquivos: src/app/acoes/atendimento.acoes.ts | verificação: `grep -c "revalidatePath(\"/agenda\")" src/app/acoes/atendimento.acoes.ts` → 3

### Páginas

- [x] Criar `src/app/(paginas)/agenda/page.tsx`: Server Component que lê
      `searchParams.dia` (async), busca atendimentos pelo repositório e exibe em ordem
      de horário (horário, pet, tutor, status).
> Evidência (31-07-2026 14:15) — `const { dia } = await searchParams` (Next 16, `searchParams: Promise<{ dia?: string }>`); sem `dia`, usa o dia de hoje (calculado com a mesma convenção BRT-como-UTC). Ordem de horário vem do repositório (`orderBy: { inicio: "asc" }` em `listarPorDia`) | arquivos: src/app/(paginas)/agenda/page.tsx | verificação: `npm run build` → rota `/agenda` gerada como dinâmica (ƒ), igual ao padrão já usado em `/tutores`

- [x] Criar `src/app/(paginas)/agenda/novo-atendimento.formulario.tsx` (Client
      Component) com seleção de pet, data e hora.
> Evidência (31-07-2026 14:15) — `useActionState` + `<select>` de pets ativos, `<input type="date">` e `<input type="time">`, mesmo padrão visual/estrutural de `pet.formulario.tsx` | arquivos: src/app/(paginas)/agenda/novo-atendimento.formulario.tsx | verificação: validação manual abaixo (cenário a)

- [x] Cada linha da agenda tem ações **Concluir** e **Cancelar**, disparando as
      respectivas Server Actions com confirmação explícita.
> Evidência (31-07-2026 14:15) — `concluir-cancelar.formulario.tsx`, Client Component com `window.confirm(...)` antes de disparar `concluirAtendimento`/`cancelarAtendimento` via `useTransition`, mostrando `window.alert` com a mensagem traduzida se o resultado vier com erro (ex.: tentar cancelar em cima da hora). Limitação registrada: por ser 100% client-side (sem `<form>` de fallback), essa interação não pôde ser exercitada por `curl` na verificação manual abaixo — coberta em vez disso por testes de integração diretos da Server Action (`atendimento.acoes.spec.ts`) | arquivos: src/app/(paginas)/agenda/concluir-cancelar.formulario.tsx | verificação: `npx vitest run src/app/acoes/atendimento.acoes.spec.ts` → 6 passed (6)

- [x] Traduzir em `mensagens.ts` todos os códigos novos de `ATENDIMENTO`.
> Evidência (31-07-2026 14:15) — 9 códigos traduzidos (os 6 da spec + `DATA_INVALIDA`, `PET_NAO_ENCONTRADO`, `NAO_ENCONTRADO`, introduzidos nas tarefas de domínio acima) | arquivos: src/app/(paginas)/mensagens.ts | verificação: `grep -roE "ATENDIMENTO\.[A-Z_]+" src/dominio | sort -u` (9 códigos) comparado com `grep -oE '"ATENDIMENTO\.[A-Z_]+"' "src/app/(paginas)/mensagens.ts"` (mesmos 9 códigos) → nenhum código do domínio ausente do dicionário

- [x] Adicionar **Agenda** ao menu em `src/app/layout.tsx`.
> Evidência (31-07-2026 14:15) — link `/agenda` adicionado ao lado de Tutores e Pets | arquivos: src/app/layout.tsx | verificação: inspeção visual do JSX

### Verificação

- [x] `npm run build` e `npm test` na raiz, sem erros.
> Evidência (31-07-2026 14:15) — `npm test` → "Test Files 10 passed (10)", "Tests 40 passed (40)" (16 testes de domínio novos de atendimento + 6 testes de integração novos de Server Action + 18 testes já existentes das specs 002/003); `npm run build` → "Compiled successfully", TypeScript sem erros, rotas `/`, `/api/saude`, `/pets` (estática), `/tutores` e `/agenda` (dinâmicas) geradas | arquivos: (nenhum) | verificação: `npm run build && npm test` → ambos sem erros

- [x] Validar no navegador e registrar evidência: marcar um horário; tentar marcar o
      mesmo horário de novo; tentar marcar às 19:00; tentar cancelar um atendimento
      que começa em menos de 2 horas; concluir um atendimento.
> Evidência (31-07-2026 14:20) — BLOQUEIO evitado / desvio: a extensão Claude in Chrome não estava conectada nesta máquina (mesma situação da spec 003). Perguntado ao usuário em chat como proceder; escolhida a opção "curl equivalente", registrando como verificação parcial/incompleta (curl não executa JavaScript, não cobre confirmação nem interação client-side), conforme já previsto em `.spec/memory/contexto-tecnico.md`.
  Preparação: tutor "Ana Recepcao Teste" e pet "Rex Teste" criados via POST real em `/tutores` e `/pets` (mesmos campos ocultos `$ACTION_*`/`$ACTION_KEY` que o React injeta para progressive enhancement, igual ao método usado na spec 003).
  (a) POST em `/agenda` com petId do "Rex Teste", data="2026-08-04" (terça-feira, dentro do expediente), hora="10:00" → sucesso; `GET /agenda?dia=2026-08-04` mostra a linha "10:00 | Rex Teste | Ana Recepcao Teste | Agendado".
  (b) Repetido o mesmo POST (mesmo pet, mesma data/hora) → tela mostra `<li>Já existe um atendimento marcado para este horário.</li>` (ATENDIMENTO.HORARIO_OCUPADO traduzido), nenhum atendimento duplicado criado.
  (c) POST com hora="19:00" (mesma data) → tela mostra `<li>O horário precisa estar entre segunda e sábado, das 08:00 às 18:00.</li>` (ATENDIMENTO.FORA_DO_EXPEDIENTE traduzido).
  (d) e (e) — cancelar com menos de 2h de antecedência e concluir um atendimento: **não executados via curl** porque os botões "Concluir"/"Cancelar" são `<button type="button">` sem `<form>` de fallback (só disparam via `useTransition` + JS real, ver decisão na tarefa de página acima). Esses dois fluxos foram verificados de outra forma: diretamente por chamada de função contra SQLite isolado em `atendimento.acoes.spec.ts` ("cancela um atendimento AGENDADO com mais de 2 horas de antecedência" / "falha com ATENDIMENTO.CANCELAMENTO_FORA_DO_PRAZO com menos de 2 horas de antecedência" / "conclui um atendimento AGENDADO" / "falha com ATENDIMENTO.STATUS_INVALIDO ao concluir..."), e pelos testes de domínio equivalentes em `cancelar-atendimento.caso-de-uso.spec.ts` e `concluir-atendimento.caso-de-uso.spec.ts`. A confirmação visual do clique + `window.confirm()` real em navegador fica pendente de teste manual do usuário ou de uma sessão com Claude in Chrome conectado.
  Confirmado que nenhum código bruto (`ATENDIMENTO.HORARIO_OCUPADO`, etc.) aparece em elemento visível: só dentro do payload RSC de hidratação (`self.__next_f.push(...)`), nunca dentro do `<li>` renderizado — mesma verificação já feita na spec 003.
  Após a verificação, os registros de teste (tutor, pet e atendimento) foram apagados do `prisma/dev.db` com um script `better-sqlite3` temporário (removido em seguida), para não deixar dado de teste no banco de desenvolvimento | arquivos: (nenhum, só dados no banco, revertidos depois) | verificação: comandos `curl` acima com saída inspecionada linha a linha (detalhes na sessão); `npx vitest run src/app/acoes/atendimento.acoes.spec.ts src/dominio/atendimento/cancelar-atendimento.caso-de-uso.spec.ts src/dominio/atendimento/concluir-atendimento.caso-de-uso.spec.ts` → todos passed

- [x] Confirmar na evidência que nenhuma das seis regras aparece implementada fora de
      `src/dominio`.
> Evidência (31-07-2026 14:20) — três verificações: (1) fronteiras de arquitetura de `.spec/shared/criterios-de-verificacao.md`: `grep -rE "from ['\"](@?prisma|next|react|zod|@/app|@/infra|@/ui)['\"]|process\.env" src/dominio` → vazio; `grep -rE "from ['\"]@/app" src/infra` → vazio; `grep -rlE "^['\"]use client['\"]" src \| xargs grep -l "from ['\"]@/infra"` → vazio. (2) nenhuma constante ou comparação das regras (`getUTCDay`, `getUTCHours` para checar expediente, `60 * 60 * 1000` de duração/antecedência, `DURACAO_MINUTOS`, `HORA_INICIO_EXPEDIENTE`, `HORA_FIM_EXPEDIENTE`, `ANTECEDENCIA`) aparece fora de `src/dominio`: `grep -rnE "getUTCDay|getUTCHours|60 \* 60 \* 1000|DURACAO_MINUTOS|HORA_INICIO_EXPEDIENTE|HORA_FIM_EXPEDIENTE|ANTECEDENCIA" src/app src/infra src/ui` só retorna código de conversão de fuso horário (borda) e formatação de exibição — nenhuma comparação de regra de negócio (expediente, sobreposição, status, antecedência) duplicada. (3) `atendimento.prisma-repositorio.ts` só faz consulta por intervalo bruta (`lt`/`gt`), sem decidir se o horário está ocupado (isso é feito em `agendar-atendimento.caso-de-uso.ts` filtrando por `status === "AGENDADO"`) | arquivos: (nenhum) | verificação: os três comandos `grep` acima, saída vazia nos dois primeiros e sem nenhuma regra de negócio nos resultados do terceiro

## Resultado esperado

- Agenda funcionando ponta a ponta com as seis regras aplicadas.
- Um teste unitário por regra, todos verdes.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência
registrada, no formato definido em `.spec/shared/como-executar-spec.md`.

STATUS: CONCLUÍDA
