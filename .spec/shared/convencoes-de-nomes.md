# Convenções de nomes

Convenções globais de arquivos e diretórios. Podem ser referenciadas por qualquer spec.

## Regras gerais

- Arquivos e diretórios em **kebab-case**, sempre minúsculos.
- O nome indica **responsabilidade**, não implementação.
- O sufixo explicita o papel do arquivo.
- A linguagem do domínio é português (é a linguagem do negócio). Palavras de
  infraestrutura permanecem em inglês quando são termos da ferramenta.
- Não usar acento nem cedilha em nome de arquivo ou pasta.
- Arquivos exigidos pelo Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`,
  `route.ts`, `middleware.ts`, `proxy.ts`) mantêm o nome exigido pelo framework.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.

## Sufixos

| Sufixo | Papel | Onde vive |
|---|---|---|
| `.entidade.ts` | entidade de domínio com validação | `src/dominio/<agregado>/` |
| `.caso-de-uso.ts` | orquestra uma operação de negócio | `src/dominio/<agregado>/` |
| `.repositorio.ts` | contrato (interface) de persistência | `src/dominio/<agregado>/` |
| `.erro.ts` | erro de domínio com código | `src/dominio/compartilhado/` |
| `.spec.ts` | teste automatizado | ao lado do arquivo testado |
| `.prisma-repositorio.ts` | implementação Prisma do contrato | `src/infra/repositorios/` |
| `.acoes.ts` | conjunto de Server Actions de um agregado | `src/app/acoes/` |
| `.formulario.tsx` | Client Component de formulário | `src/app/(paginas)/<recurso>/` |
| `.componente.tsx` | componente React reutilizável | `src/ui/` |
| `mensagens.ts` | dicionário código → mensagem em pt-BR | `src/app/(paginas)/` |

## Exemplos aplicados

```
src/dominio/tutor/tutor.entidade.ts
src/dominio/tutor/tutor.repositorio.ts
src/dominio/tutor/salvar-tutor.caso-de-uso.ts
src/dominio/tutor/salvar-tutor.caso-de-uso.spec.ts
src/infra/repositorios/tutor.prisma-repositorio.ts
src/app/acoes/tutor.acoes.ts
src/app/(paginas)/tutores/page.tsx
src/app/(paginas)/tutores/tutor.formulario.tsx
src/app/(paginas)/mensagens.ts
```

## Nomes de pasta de mudança (spec)

`NNN-descricao-em-kebab-case/spec.md`, com `NNN` sequencial de três dígitos.
Exemplo: `.spec/changes/002-dominio-tutores-e-pets/spec.md`.

## Códigos de erro de domínio

`AGREGADO.MOTIVO`, em maiúsculas, sem acento.
Exemplos: `TUTOR.EMAIL_DUPLICADO`, `ATENDIMENTO.HORARIO_OCUPADO`.

## Server Actions

- Um arquivo por agregado (`tutor.acoes.ts`).
- Nome da função em `camelCase`, verbo no imperativo, começando com o que faz:
  `salvarTutor`, `excluirPet`, `agendarAtendimento`.
- Toda função exportada precisa do diretório `"use server"` no topo do arquivo ou
  `"use server"` na primeira linha da função.

## Regra de decisão

Se o nome ficar ambíguo, prefira a forma que deixe mais claro o que o arquivo representa,
em que camada ele vive e qual é sua responsabilidade.
