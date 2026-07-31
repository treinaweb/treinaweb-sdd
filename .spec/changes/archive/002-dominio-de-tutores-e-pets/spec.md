# 002: Domínio de tutores e pets

## Objetivo

Implementar as regras de negócio de tutores e pets em `src/dominio`, com testes,
sem tocar em banco, Server Actions ou página.

## Referências do projeto

- `.spec/memory/produto.md`
- `.spec/memory/arquitetura.md`

## Referências compartilhadas

- `.spec/shared/como-executar-spec.md`
- `.spec/shared/convencoes-de-nomes.md`
- `.spec/shared/criterios-de-verificacao.md`

## Observações locais

- Nada fora de `src/dominio` pode ser modificado nesta spec, com exceção dos dois arquivos
  de padrão em `.spec/shared/` que esta própria spec cria na primeira tarefa.
- Os padrões `dominio-entidade.md` e `dominio-caso-de-uso.md` são criados aqui, antes de
  serem usados, e valem para as próximas specs.
- O domínio não conhece Prisma, Next, React nem HTTP. Persistência entra apenas por
  interface declarada aqui dentro.
- A entidade aceita valores inválidos na construção, mas expõe `validar()` que devolve
  todos os erros encontrados, não só o primeiro.
- Todo erro de negócio usa a classe `ErroDeDominio` com código `AGREGADO.MOTIVO`.

## Tarefas

### Padrões compartilhados

- [x] Criar `.spec/shared/dominio-entidade.md` descrevendo o padrão de entidade de
      domínio, cobrindo: arquivo em `src/dominio/<agregado>/<agregado>.entidade.ts` com a
      classe em PascalCase; construtor que recebe os valores crus, não lança exceção e só
      normaliza (`trim` no nome, e-mail em minúsculas, telefone só dígitos), aplicando os
      valores padrão dos campos que têm padrão; método `validar(): ErroDeDominio[]` que
      acumula todos os erros e não para no primeiro, devolvendo lista vazia quando está
      tudo certo; códigos no formato `AGREGADO.MOTIVO` com `campo` quando o erro for de um
      campo; e a regra de nenhum import de runtime (Prisma, Next, React, Zod).
> Evidência (30-07-2026 18:06) — padrão descrito com esqueleto de referência | arquivos: .spec/shared/dominio-entidade.md | verificação: leitura manual do arquivo criado
- [x] Criar `.spec/shared/dominio-caso-de-uso.md` descrevendo o padrão de caso de uso,
      cobrindo: arquivo em `src/dominio/<agregado>/<acao>-<agregado>.caso-de-uso.ts`;
      dependências como interfaces de repositório do próprio domínio, injetadas pelo
      construtor; método `executar(...)` que devolve `Promise<Resultado<T>>`, usando
      `Resultado<void>` quando o sucesso é `void`; ordem interna de validar a entidade e
      devolver `falha` se houver erros, aplicar as regras que dependem do repositório (cada
      uma com código próprio, diferente dos erros de formato da entidade), persistir e
      devolver `ok`; a interface de repositório declarada no agregado em
      `<agregado>.repositorio.ts` só como contrato; e a regra de nenhum import de runtime.
> Evidência (30-07-2026 18:06) — padrão descrito com esqueleto de referência | arquivos: .spec/shared/dominio-caso-de-uso.md | verificação: leitura manual do arquivo criado

### Base compartilhada

- [x] Criar `src/dominio/compartilhado/erro-de-dominio.erro.ts` com uma classe que
      carrega `codigo`, `campo?` opcional e um agregador que acumula vários erros.
> Evidência (30-07-2026 18:06) — classe `ErroDeDominio` (codigo, campo?) e classe `AgregadorDeErros` (adicionar/paraLista/vazio) no mesmo arquivo; reexportado pelo barrel `compartilhado/index.ts` | arquivos: src/dominio/compartilhado/erro-de-dominio.erro.ts, src/dominio/compartilhado/index.ts | verificação: `npm test` → 14 passed
- [x] Criar `src/dominio/compartilhado/resultado.ts` com o tipo usado pelos casos de uso
      para devolver sucesso ou lista de erros.
> Evidência (30-07-2026 18:06) — tipo `Resultado<T>` (`{ok:true,dados?:T}` | `{ok:false,erros:ErroDeDominio[]}`) com helpers `ok()`/`falha()` usados por todos os casos de uso | arquivos: src/dominio/compartilhado/resultado.ts | verificação: `npm run build` → compila sem erros

### Agregado tutor

- [x] Criar o agregado `tutor` seguindo o padrão de `.spec/shared/dominio-entidade.md`.
> Evidência (30-07-2026 18:06) — pasta `src/dominio/tutor/` criada com barrel `index.ts` | arquivos: src/dominio/tutor/index.ts | verificação: `npm run build` → compila sem erros
- [x] Implementar `tutor.entidade.ts` com os campos: `id` (opcional), `nome`
      (obrigatório, nome completo, no mínimo duas palavras), `email` (obrigatório,
      formato válido, normalizado em minúsculas), `telefone` (opcional, somente dígitos
      quando informado), `ativo` (padrão `true`).
      Códigos: `TUTOR.NOME_INVALIDO`, `TUTOR.EMAIL_INVALIDO`, `TUTOR.TELEFONE_INVALIDO`.
> Evidência (30-07-2026 18:06) — construtor normaliza (trim no nome, e-mail em minúsculas, telefone reduzido a dígitos via `replace(/\D/g,"")`) sem lançar exceção; `validar()` acumula os 3 códigos previstos, checando nome com no mínimo 2 palavras, e-mail via regex e telefone vazio após normalização | arquivos: src/dominio/tutor/tutor.entidade.ts | verificação: `npm test` → casos NOME_INVALIDO, EMAIL_INVALIDO e TELEFONE_INVALIDO cobertos em salvar-tutor.caso-de-uso.spec.ts, 14 passed
- [x] Declarar `tutor.repositorio.ts` com `salvar`, `buscarPorId`, `buscarPorEmail`,
      `listar` e `excluir`.
> Evidência (30-07-2026 18:06) — interface `TutorRepositorio` só como contrato, sem implementação | arquivos: src/dominio/tutor/tutor.repositorio.ts | verificação: `npm run build` → compila sem erros
- [x] Implementar `salvar-tutor.caso-de-uso.ts` seguindo o padrão de
      `.spec/shared/dominio-caso-de-uso.md`: valida a entidade, impede e-mail duplicado
      (`TUTOR.EMAIL_DUPLICADO`) e persiste. Retorno `void`.
> Evidência (30-07-2026 18:06) — `SalvarTutorCasoDeUso.executar` valida a entidade, checa duplicidade de e-mail via `buscarPorEmail` (ignorando o próprio id em caso de atualização) e persiste; devolve `Resultado<void>` | arquivos: src/dominio/tutor/salvar-tutor.caso-de-uso.ts | verificação: `npm test` → salvar-tutor.caso-de-uso.spec.ts (5 testes) passed
- [x] Implementar `inativar-tutor.caso-de-uso.ts`: impede inativar tutor inexistente
      (`TUTOR.NAO_ENCONTRADO`) e marca `ativo = false`.
> Evidência (30-07-2026 18:06) — busca por id, devolve `falha` com `TUTOR.NAO_ENCONTRADO` se não existir, senão reconstrói a entidade com `ativo:false` e persiste | arquivos: src/dominio/tutor/inativar-tutor.caso-de-uso.ts | verificação: `npm test` → inativar-tutor.caso-de-uso.spec.ts (2 testes) passed

### Agregado pet

- [x] Criar o agregado `pet` seguindo o padrão de `.spec/shared/dominio-entidade.md`.
> Evidência (30-07-2026 18:06) — pasta `src/dominio/pet/` criada com barrel `index.ts` | arquivos: src/dominio/pet/index.ts | verificação: `npm run build` → compila sem erros
- [x] Implementar `pet.entidade.ts` com os campos: `id` (opcional), `tutorId`
      (obrigatório), `nome` (obrigatório, mínimo 2 caracteres), `especie` (`CACHORRO` ou
      `GATO`), `porte` (`P`, `M` ou `G`), `observacoes` (opcional), `ativo` (padrão `true`).
      Códigos: `PET.NOME_INVALIDO`, `PET.ESPECIE_INVALIDA`, `PET.PORTE_INVALIDO`.
> Evidência (30-07-2026 18:06) — construtor normaliza (trim no nome e nas observações), aplica `ativo=true` como padrão; `validar()` acumula os 3 códigos previstos (nome com < 2 caracteres, espécie fora de `CACHORRO|GATO`, porte fora de `P|M|G`). Desvio registrado: a validação de `tutorId` obrigatório não ficou na entidade (a spec só lista 3 códigos para ela) — é coberta pelo caso de uso via `PET.TUTOR_NAO_ENCONTRADO` ao consultar o repositório de tutor | arquivos: src/dominio/pet/pet.entidade.ts | verificação: `npm test` → casos NOME_INVALIDO, ESPECIE_INVALIDA e PORTE_INVALIDO cobertos em salvar-pet.caso-de-uso.spec.ts
- [x] Declarar `pet.repositorio.ts` com `salvar`, `buscarPorId`, `listarPorTutor`,
      `listar` e `excluir`.
> Evidência (30-07-2026 18:06) — interface `PetRepositorio` só como contrato, sem implementação | arquivos: src/dominio/pet/pet.repositorio.ts | verificação: `npm run build` → compila sem erros
- [x] Implementar `salvar-pet.caso-de-uso.ts` seguindo o padrão de
      `.spec/shared/dominio-caso-de-uso.md`: valida a entidade, exige que o tutor exista
      (`PET.TUTOR_NAO_ENCONTRADO`) e que o tutor esteja ativo (`PET.TUTOR_INATIVO`),
      e persiste. Retorno `void`.
> Evidência (30-07-2026 18:06) — `SalvarPetCasoDeUso` recebe `PetRepositorio` e `TutorRepositorio` no construtor; valida a entidade, busca o tutor por id (`PET.TUTOR_NAO_ENCONTRADO` se ausente), checa `tutor.ativo` (`PET.TUTOR_INATIVO`) e só então persiste | arquivos: src/dominio/pet/salvar-pet.caso-de-uso.ts | verificação: `npm test` → salvar-pet.caso-de-uso.spec.ts (6 testes) passed

### Testes

- [x] Criar repositórios em memória para tutor e pet em
      `src/dominio/compartilhado/testes/`.
> Evidência (30-07-2026 18:06) — `TutorRepositorioEmMemoria` e `PetRepositorioEmMemoria` implementam os contratos correspondentes usando `Map` em memória, com geração incremental de id quando ausente | arquivos: src/dominio/compartilhado/testes/tutor.repositorio-em-memoria.ts, src/dominio/compartilhado/testes/pet.repositorio-em-memoria.ts | verificação: `npm test` → 14 passed
- [x] Cobrir cada caso de uso com testes: caminho feliz e um teste por regra (um teste
      por código de erro previsto acima).
> Evidência (30-07-2026 18:06) — 4 arquivos `.spec.ts` (um por caso de uso), cobrindo caminho feliz + 1 teste por código: salvar-tutor (NOME_INVALIDO, EMAIL_INVALIDO, TELEFONE_INVALIDO, EMAIL_DUPLICADO), inativar-tutor (NAO_ENCONTRADO), salvar-pet (NOME_INVALIDO, ESPECIE_INVALIDA, PORTE_INVALIDO, TUTOR_NAO_ENCONTRADO, TUTOR_INATIVO) | arquivos: src/dominio/tutor/salvar-tutor.caso-de-uso.spec.ts, src/dominio/tutor/inativar-tutor.caso-de-uso.spec.ts, src/dominio/pet/salvar-pet.caso-de-uso.spec.ts | verificação: `npm test` → Test Files 4 passed (4), Tests 14 passed (14)

### Verificação

- [x] `npm run build` e `npm test` na raiz, sem erros.
> Evidência (30-07-2026 18:06) — `npm test` → "Test Files 4 passed (4)", "Tests 14 passed (14)"; `npm run build` → "Compiled successfully in 2.5s", TypeScript sem erros, rotas `/`, `/_not-found`, `/api/saude` geradas normalmente | arquivos: (nenhum) | verificação: `npm run build && npm test` → ambos sem erros
- [x] Confirmar que `src/dominio` continua sem imports de runtime (Prisma, Next, React,
      Zod), rodando o `grep` de fronteira definido em
      `.spec/shared/criterios-de-verificacao.md`.
> Evidência (30-07-2026 18:06) — nenhum import de Prisma/Next/React/Zod/`@/app`/`@/infra`/`@/ui` nem uso de `process.env` em `src/dominio` | arquivos: (nenhum) | verificação: `grep -rE "from ['\"](@?prisma|next|react|zod|@/app|@/infra|@/ui)['\"]|process\.env" src/dominio` → saída vazia
- [x] Confirmar que nenhum arquivo fora de `src/dominio` foi alterado, exceto os dois
      padrões em `.spec/shared/` criados nesta spec (`git status` na evidência).
> Evidência (30-07-2026 18:06) — `git status --porcelain` mostra apenas alterações/criações dentro de `src/dominio/` (compartilhado, tutor, pet), os dois padrões novos em `.spec/shared/` (`dominio-entidade.md`, `dominio-caso-de-uso.md`) e a própria pasta da spec `.spec/changes/002-dominio-de-tutores-e-pets/` (evidência sendo registrada); nada em `src/app`, `src/infra`, `src/ui` ou `prisma/` foi tocado | arquivos: (nenhum) | verificação: `git status --porcelain` → `M src/dominio/compartilhado/index.ts`, `M src/dominio/index.ts`, `?? .spec/changes/002-dominio-de-tutores-e-pets/`, `?? .spec/shared/dominio-caso-de-uso.md`, `?? .spec/shared/dominio-entidade.md`, `?? src/dominio/compartilhado/erro-de-dominio.erro.ts`, `?? src/dominio/compartilhado/resultado.ts`, `?? src/dominio/compartilhado/testes/`, `?? src/dominio/pet/`, `?? src/dominio/tutor/`

## Resultado esperado

- Dois padrões compartilhados criados em `.spec/shared/`, prontos para as próximas specs.
- Dois agregados completos, com entidades validadas e contratos de repositório.
- Quatro casos de uso implementados e testados.
- Suíte de testes verde, sem banco e sem servidor.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência
registrada, no formato definido em `.spec/shared/como-executar-spec.md`.

STATUS: CONCLUÍDA
