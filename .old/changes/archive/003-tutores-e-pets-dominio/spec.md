# 003: Tutores e pets do domínio à página

## Objetivo

Persistir tutores e pets no SQLite, expor as operações por Server Actions e entregar
as páginas de cadastro no App Router.

## Contexto técnico

- Server Actions retornam `Resultado<T>` e nunca lançam para o cliente. Sucesso:
  `{ ok: true, dados? }`. Erro: `{ ok: false, erros: [{ codigo, campo? }] }`.
- Validação de formato entra na Server Action via Zod. Validação de regra permanece no
  domínio. A Server Action captura `ErroDeDominio` e converte na lista de erros.
- Página de listagem é Server Component: chama o repositório direto do lado do servidor.
- Formulário é Client Component com `useActionState` consumindo a Server Action.
- Depois de sucesso, a Server Action chama `revalidatePath` das páginas afetadas.

## Referências do projeto

- `.spec/memory/arquitetura.md`
- `.spec/memory/contexto-tecnico.md`

## Referências compartilhadas

- `.spec/shared/como-executar-spec.md`
- `.spec/shared/convencoes-de-nomes.md`
- `.spec/shared/dominio-caso-de-uso.md`
- `.spec/shared/dominio-entidade.md`
- `.spec/shared/criterios-de-verificacao.md`


## Observações locais

- Nenhuma regra de negócio pode ser escrita em Server Action nem em componente.
- As interfaces de repositório definidas em `src/dominio` não podem ser alteradas. Se
  o adaptador Prisma precisar de algo a mais, resolva dentro do adaptador.
- Formulário nunca importa nada de `src/infra`. Consulta de listagem acontece só no
  Server Component da página.
- Código de erro sem tradução em `mensagens.ts` deve aparecer cru na tela, de propósito,
  para o problema ficar visível.

## Tarefas

### Infra

- [x] Adicionar os modelos `Tutor` e `Pet` ao `schema.prisma`, com `email` único em
      `Tutor` e relação `Pet.tutorId → Tutor.id`.
> Evidência (30-07-2026 18:48) — modelos `Tutor` (id cuid, nome, email @unique, telefone?, ativo) e `Pet` (id cuid, tutorId + relação `@relation` para Tutor, nome, especie, porte, observacoes?, ativo, índice em tutorId) | arquivos: prisma/schema.prisma | verificação: `npx prisma generate` → "Generated Prisma Client (7.9.1)" sem erros
- [x] Gerar e aplicar a migração `tutores-e-pets`.
> Evidência (30-07-2026 18:48) — `npx prisma migrate dev --name tutores-e-pets` criou e aplicou `prisma/migrations/20260730212800_tutores_e_pets/migration.sql` (CREATE TABLE Tutor, Pet, índice único em email, índice em tutorId, FK Pet→Tutor) | arquivos: prisma/migrations/20260730212800_tutores_e_pets/migration.sql, prisma/dev.db | verificação: saída do comando → "Your database is now in sync with your schema."
- [x] Implementar `tutor.prisma-repositorio.ts` e `pet.prisma-repositorio.ts` em
      `src/infra/repositorios/`, respeitando os contratos do domínio.
> Evidência (30-07-2026 18:48) — cada repositório implementa a interface do domínio (`TutorRepositorio`/`PetRepositorio`) sem alterá-la; mapeia registro Prisma ↔ entidade (`telefone`/`observacoes` `null`↔`undefined`); `salvar` faz `create` quando `id` ausente e `update` quando presente | arquivos: src/infra/repositorios/tutor.prisma-repositorio.ts, src/infra/repositorios/pet.prisma-repositorio.ts | verificação: `npx tsc --noEmit` → sem erros

### Server Actions

- [x] Criar `src/app/acoes/tutor.acoes.ts` com a skill `server-actions-next`, expondo
      `salvarTutor` e `inativarTutor`.
> Evidência (30-07-2026 18:48) — BLOQUEIO evitado / desvio registrado: a skill `server-actions-next` citada na spec não existe instalada neste projeto (`.claude/skills/`, `.agents/skills/` e a listagem de skills disponíveis só contêm skills do Prisma e utilitários gerais). Implementado à mão seguindo `.spec/memory/contexto-tecnico.md` e `.spec/shared/criterios-de-verificacao.md`: `salvarTutor(estadoAnterior, formData)` compatível com `useActionState` (assina `Promise<Resultado<void>>`), coerção de `FormData` via Zod (apenas shape/strings — o formato de negócio como e-mail e nome completo continua exclusivamente no `validar()` do domínio, para não duplicar regra), chama `SalvarTutorCasoDeUso`/`InativarTutorCasoDeUso` com `tutorPrismaRepositorio`, e `revalidatePath` só em caso de sucesso | arquivos: src/app/acoes/tutor.acoes.ts | verificação: `npx tsc --noEmit` e `npx eslint src/app` → sem erros
- [x] Criar `src/app/acoes/pet.acoes.ts` com `salvarPet`, além de uma função de leitura
      `listarPetsDoTutor(tutorId)`.
> Evidência (30-07-2026 18:48) — mesmo desvio da tarefa anterior (skill inexistente, implementado à mão). `salvarPet` segue o mesmo padrão de `tutor.acoes.ts`; `especie`/`porte` chegam como `string` do FormData e recebem uma asserção de tipo só para satisfazer o union do domínio — o valor real é validado por `Pet.validar()` (`PET.ESPECIE_INVALIDA`/`PET.PORTE_INVALIDO`). `listarPetsDoTutor` foi criado conforme pedido, mas nenhuma das páginas desta spec o consome (a listagem de `/pets` é uma tabela plana com todos os pets); fica disponível para uso futuro | arquivos: src/app/acoes/pet.acoes.ts | verificação: `npx tsc --noEmit` e `npx eslint src/app` → sem erros
- [x] Cada mutação bem-sucedida chama `revalidatePath` das páginas afetadas
      (`/tutores` e/ou `/pets`).
> Evidência (30-07-2026 18:48) — `salvarTutor`/`inativarTutor` chamam `revalidatePath("/tutores")`; `salvarPet` chama `revalidatePath("/pets")`; todas só quando `resultado.ok` | arquivos: src/app/acoes/tutor.acoes.ts, src/app/acoes/pet.acoes.ts | verificação: leitura manual do código
- [x] Listar na evidência todos os códigos de erro que as Server Actions podem retornar
      hoje para os agregados tutor e pet.
> Evidência (30-07-2026 18:48) — códigos possíveis hoje: `TUTOR.NOME_INVALIDO`, `TUTOR.EMAIL_INVALIDO`, `TUTOR.TELEFONE_INVALIDO`, `TUTOR.EMAIL_DUPLICADO`, `TUTOR.NAO_ENCONTRADO`, `PET.NOME_INVALIDO`, `PET.ESPECIE_INVALIDA`, `PET.PORTE_INVALIDO`, `PET.TUTOR_NAO_ENCONTRADO`, `PET.TUTOR_INATIVO` (todos definidos no domínio na spec 002) | arquivos: (nenhum) | verificação: leitura de src/dominio/tutor/tutor.entidade.ts, src/dominio/tutor/*.caso-de-uso.ts, src/dominio/pet/pet.entidade.ts, src/dominio/pet/salvar-pet.caso-de-uso.ts

### Páginas

- [x] Criar `src/app/(paginas)/mensagens.ts` com a tradução em pt-BR de cada código
      listado na tarefa anterior.
> Evidência (30-07-2026 18:48) — dicionário `Record<string,string>` com os 10 códigos; `traduzirCodigoDeErro` devolve o próprio código quando não encontrado no dicionário (código cru na tela de propósito, por design) | arquivos: src/app/(paginas)/mensagens.ts | verificação: `npx tsc --noEmit` → sem erros
- [x] Criar `src/app/(paginas)/tutores/page.tsx` com a skill `pagina-crud-next`:
      listagem com nome, e-mail, telefone e situação, mais formulário de criação e edição.
> Evidência (30-07-2026 18:48) — BLOQUEIO evitado / desvio: skill `pagina-crud-next` também não existe instalada; página implementada à mão como Server Component `async`, lendo `tutorPrismaRepositorio.listar()` direto (sem Server Action) e `searchParams` assíncrono (`?editar=<id>`) para alternar entre criação e edição, conforme padrão de `params`/`searchParams` assíncronos do Next 16 documentado em `.spec/memory/contexto-tecnico.md` | arquivos: src/app/(paginas)/tutores/page.tsx | verificação: `npx tsc --noEmit`, `npx eslint` → sem erros; verificação manual abaixo
- [x] Criar `src/app/(paginas)/tutores/tutor.formulario.tsx` como Client Component
      usando `useActionState`, exibindo todos os erros retornados de uma vez.
> Evidência (30-07-2026 18:48) — `"use client"`, `useActionState(salvarTutor, {ok:true})`, todos os erros do array `erros` traduzidos e renderizados juntos via `src/ui/lista-de-erros.componente.tsx` | arquivos: src/app/(paginas)/tutores/tutor.formulario.tsx, src/ui/lista-de-erros.componente.tsx | verificação: verificação manual abaixo (cenário c mostra os 2 erros simultâneos)
- [x] Criar `src/app/(paginas)/pets/page.tsx` com a skill `pagina-crud-next`: listagem
      com nome, espécie, porte e tutor, mais formulário com seleção do tutor.
> Evidência (30-07-2026 18:48) — mesmo desvio (skill inexistente). Server Component `async` que lê `petPrismaRepositorio.listar()` e `tutorPrismaRepositorio.listar()` em paralelo e monta o nome do tutor por `Map`; select de tutor no formulário restrito a tutores ativos (decisão registrada: evita o usuário cair em `PET.TUTOR_INATIVO` desnecessariamente, já que um tutor inativo nunca é uma opção válida) | arquivos: src/app/(paginas)/pets/page.tsx | verificação: `npx tsc --noEmit`, `npx eslint` → sem erros; verificação manual abaixo
- [x] Criar `src/app/(paginas)/pets/pet.formulario.tsx` seguindo o mesmo padrão.
> Evidência (30-07-2026 18:48) — Client Component com `useActionState(salvarPet, {ok:true})`, campos tutor (select), nome, espécie (select), porte (select), observações; erros exibidos com `ListaDeErros` | arquivos: src/app/(paginas)/pets/pet.formulario.tsx | verificação: verificação manual abaixo (cenário d)
- [x] Atualizar `src/app/layout.tsx` para incluir navegação com **Tutores** e **Pets**.
> Evidência (30-07-2026 18:48) — `<nav>` com links para `/tutores` e `/pets` adicionado no `RootLayout`, antes de `{children}` | arquivos: src/app/layout.tsx | verificação: HTML de resposta de `/tutores` contém `<nav ...><a href="/tutores">Tutores</a><a href="/pets">Pets</a></nav>`

### Testes

- [x] Testes de integração para `salvarTutor` e `salvarPet` (um sucesso e um erro cada),
      chamando as Server Actions diretamente contra um banco SQLite isolado.
> Evidência (30-07-2026 18:48) — helper `src/infra/testes/banco-de-teste-isolado.ts` cria um arquivo SQLite novo em `os.tmpdir()`, roda `npx prisma migrate deploy` apontando `DATABASE_URL` para ele (migração já versionada, sem `db push`) e desconecta/limpa ao final. `tutor.acoes.spec.ts`: sucesso ao salvar + `TUTOR.EMAIL_DUPLICADO` ao repetir e-mail. `pet.acoes.spec.ts`: sucesso ao salvar pet de um tutor existente/ativo + `PET.TUTOR_NAO_ENCONTRADO` com tutor inexistente. Desvio registrado: `revalidatePath` (de `next/cache`) lança fora do contexto de requisição do Next.js quando a Server Action é chamada diretamente fora de uma requisição real; mockado com `vi.mock("next/cache", ...)` nos dois arquivos de teste, já que o propósito do teste é persistência e mapeamento de erro do domínio, não o mecanismo de revalidação em si. Também foi necessário adicionar `resolve.alias "@"` em `vitest.config.ts` (Vitest não lê `tsconfig.json` `paths` sozinho) | arquivos: src/infra/testes/banco-de-teste-isolado.ts, src/app/acoes/tutor.acoes.spec.ts, src/app/acoes/pet.acoes.spec.ts, vitest.config.ts | verificação: `npm test` → "Test Files 6 passed (6)", "Tests 18 passed (18)"

### Verificação

- [x] `npm run build` e `npm test` na raiz, sem erros.
> Evidência (30-07-2026 18:48) — `npm test` → "Test Files 6 passed (6)", "Tests 18 passed (18)"; `npm run build` → "Compiled successfully in 3.1s", TypeScript sem erros, rotas `/`, `/api/saude`, `/pets` (estática), `/tutores` (dinâmica, por causa do `searchParams`) geradas | arquivos: (nenhum) | verificação: `npm run build && npm test` → ambos sem erros
- [x] Validar em `http://localhost:3000` e registrar evidência com o que foi digitado e
      o que apareceu: (a) cadastrar tutor válido; (b) e-mail repetido; (c) nome
      incompleto e e-mail inválido ao mesmo tempo; (d) cadastrar pet escolhendo um tutor.
> Evidência (30-07-2026 18:48) — BLOQUEIO evitado / desvio: a extensão Claude in Chrome não estava conectada nesta máquina, então a validação não foi feita clicando na UI; o usuário optou (pergunta feita e respondida em chat) por validação equivalente via `curl`, submetendo os formulários reais renderizados pelo servidor (`npm run dev`), incluindo os campos ocultos `$ACTION_*`/`$ACTION_KEY` que o React injeta para progressive enhancement de Server Actions sem JS — ou seja, o mesmo caminho HTTP que o navegador percorreria com JS desabilitado.
  (a) POST em `/tutores` com nome="Ana Souza Teste", email="ana.souza.teste@exemplo.com", telefone="11988887777" → resposta e GET seguinte mostram a linha da tabela com Nome/E-mail/Telefone corretos e Situação "Ativo".
  (b) POST em `/tutores` com nome="Outro Tutor" e o mesmo e-mail acima → tela mostra `<li>Já existe um tutor cadastrado com este e-mail.</li>` (mensagem traduzida, sem tutor duplicado criado).
  (c) POST em `/tutores` com nome="SoNome" (uma palavra) e email="nao-e-email" → tela mostra as duas mensagens juntas: "Informe o nome completo do tutor (nome e sobrenome)." e "Informe um e-mail em formato válido.".
  (d) GET `/pets` mostra "Ana Souza Teste" no `<select>` de tutores; POST com tutorId desse tutor, nome="Rex", especie="CACHORRO", porte="M", observacoes="Vacinado" → tabela mostra a linha Rex / Cachorro / M / Ana Souza Teste.
  Após a verificação, os registros de teste (tutor e pet) foram apagados do `prisma/dev.db` para não deixar dado de teste no banco de desenvolvimento | arquivos: (nenhum, só dados no banco, revertidos depois) | verificação: comandos `curl` acima, saída manual inspecionada linha a linha (detalhes na sessão)
- [x] Confirmar que nenhum código de erro apareceu cru na tela.
> Evidência (30-07-2026 18:48) — nos cenários (b) e (c), o código (`TUTOR.EMAIL_DUPLICADO`, `TUTOR.NOME_INVALIDO`, `TUTOR.EMAIL_INVALIDO`) só aparece dentro do payload RSC de hidratação (`self.__next_f.push(...)`, necessário para o Client Component receber o estado), nunca dentro de um elemento visível (`<li>`); o `<li>` renderizado contém exclusivamente a tradução em pt-BR | arquivos: (nenhum) | verificação: inspeção do HTML de resposta — `<li>` só com texto traduzido, código cru presente apenas dentro de `<script>`
- [x] Confirmar que `src/dominio` não foi alterado (`git status` na evidência).
> Evidência (30-07-2026 18:48) — nenhum arquivo em `src/dominio` foi criado, editado ou removido durante a execução desta spec (003): as duas únicas entradas de `src/dominio` como `M` no `git status` (`compartilhado/index.ts`, `index.ts`) são resíduo da spec 002 (já concluída e evidenciada em `.spec/changes/archive/002-dominio-de-tutores-e-pets/spec.md`), não commitado entre as specs; confirmado com `find src/dominio -newer prisma/schema.prisma` (schema.prisma foi o primeiro arquivo tocado nesta spec) → nenhum resultado, ou seja, nada em `src/dominio` é mais recente que o início da spec 003 | arquivos: (nenhum) | verificação: `find src/dominio -newer prisma/schema.prisma -type f` → saída vazia; `git status --porcelain -- src/dominio` → só `compartilhado/index.ts` e `index.ts`, ambos de origem na spec 002

## Correção pós-conclusão (30-07-2026)

> Adendo (30-07-2026 19:20) — o usuário testou de fato num navegador real (`npm run dev`
> próprio) e reportou `Uncaught Error: Only plain objects... Classes or null prototypes
> are not supported` ao cadastrar tutor com nome inválido. Causa: `Tutor.validar()` (e as
> demais regras do domínio) constrói os erros com `new ErroDeDominio(...)` — instâncias de
> classe — que atravessavam a Server Action sem conversão e chegavam cruas ao
> `useActionState` do Client Component; o protocolo Flight do React só aceita objetos
> simples nessa fronteira. A verificação manual registrada acima (item "Validar em
> http://localhost:3000...") foi feita via `curl`, que nunca executa o JavaScript do
> cliente — por isso não pegou esse erro, que só existe na hidratação em um navegador
> real. Correção: `src/app/acoes/resultado-serializavel.ts` (função
> `paraResultadoSerializavel`) converte `erros` para objetos simples `{codigo, campo?}`
> antes de cada Server Action (`salvarTutor`, `inativarTutor`, `salvarPet`) devolver o
> `Resultado` ao cliente. Adicionada asserção de regressão (`Object.getPrototypeOf(erro)
> === Object.prototype`) nos testes de falha de `tutor.acoes.spec.ts` e
> `pet.acoes.spec.ts` | arquivos: src/app/acoes/resultado-serializavel.ts,
> src/app/acoes/tutor.acoes.ts, src/app/acoes/pet.acoes.ts,
> src/app/acoes/tutor.acoes.spec.ts, src/app/acoes/pet.acoes.spec.ts | verificação:
> `npm test` → 18 passed; `npx tsc --noEmit` e `npx eslint src/app` → sem erros; `npm run
> build` → compila sem erros; confirmação em navegador real pendente de retorno do
> usuário

## Resultado esperado

- Tutores e pets persistidos em SQLite, com migração versionada.
- Erros de domínio chegando à tela como mensagem em português, a partir de código estável.
- Nenhuma regra de negócio duplicada em Server Action ou em componente.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência
registrada, no formato definido em `.spec/shared/como-executar-spec.md`.

STATUS: CONCLUÍDA
