# Contexto técnico: PetCare Agenda

## Ambiente

O ambiente já está configurado com um projeto Next.js pronto para receber as specs.

- **Framework**: Next.js 16.2.12 (App Router, Turbopack padrão em `dev` e `build`)
- **React**: 19.2 (Server Components padrão; Client Components exigem `"use client"`)
- **Node.js**: 22 LTS
- **Linguagem**: TypeScript em modo `strict`
- **Persistência**: Prisma + SQLite (arquivo local em `prisma/dev.db`)
- **Estilo**: Tailwind CSS (já configurado pelo `create-next-app`)
- **Validação de borda**: Zod nos Server Actions e nos Route Handlers
- **Testes**: Vitest para o domínio; testes de Server Action rodam contra um banco
  SQLite isolado

## Scripts padrão

- `npm run dev`: sobe o servidor de desenvolvimento (Turbopack) na porta 3000
- `npm run build`: build de produção (Turbopack)
- `npm run start`: executa o build
- `npm test`: roda todos os testes
- `npm run db:migrate`: aplica migrações do Prisma
- `npm run db:studio`: abre o Prisma Studio para inspecionar dados

## Decisões já tomadas

- Toda mutação vinda da própria aplicação usa **Server Actions**. Route Handlers ficam
  reservados para integrações externas.
- Server Actions devolvem sempre o tipo `Resultado<T>`:
  ```ts
  type Resultado<T = void> =
    | { ok: true; dados?: T }
    | { ok: false; erros: { codigo: string; campo?: string }[] }
  ```
  Server Action nunca lança para o cliente: captura o `ErroDeDominio`, converte em
  lista e devolve.
- `params` e `searchParams` de páginas e Route Handlers são **assíncronos** no Next 16.
  Toda página que os usa é `async` e faz `await` antes de acessar as propriedades.
- Datas e horas trafegam em ISO 8601. A borda resolve o fuso `America/Sao_Paulo` antes
  de entregar ao domínio.
- Não usamos DTO: a entidade é convertida para objeto simples no adaptador antes de
  cruzar a fronteira da camada.
- IDs são `cuid` gerados pelo Prisma.
- Sem autenticação nesta fase do projeto.

## Restrições

- Nenhuma dependência nova pode ser adicionada em `src/dominio`. O domínio permanece
  isolado do runtime.
- Toda mudança de schema exige migração versionada. Nunca usar `prisma db push` dentro
  de uma spec.
- Não misturar Server Actions com Route Handlers para o mesmo comportamento. Escolha
  uma via e siga.
- Componentes que fazem I/O (banco, `fetch` autenticado) permanecem como Server
  Components. `"use client"` só onde há estado, evento ou API de browser.

## Revalidação e cache

- Depois de uma mutação bem-sucedida, a Server Action chama `revalidatePath` ou
  `revalidateTag` para atualizar as páginas afetadas.
- Componentes cacheáveis usam a diretiva `"use cache"` e uma `cacheTag` explícita, para
  que a invalidação seja rastreável.
