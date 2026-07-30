# 001: Fundação do projeto

## Objetivo

Preparar o projeto Next.js já configurado para receber as próximas specs: criar a
estrutura de camadas do domínio, configurar Prisma com SQLite, subir Vitest e uma
rota de saúde consumida pela página inicial. Nenhuma regra de negócio nesta spec.

## Contexto técnico

- O projeto Next.js 16.2.12 já foi criado pelo `create-next-app`, com App Router,
  TypeScript, Tailwind CSS e ESLint. Não recrie.
- Prisma será adicionado do zero por esta spec.
- Estrutura de pastas alvo definida em `.spec/memory/arquitetura.md`.

## Referências do projeto

- `.spec/memory/arquitetura.md`
- `.spec/memory/contexto-tecnico.md`

## Referências compartilhadas

- `.spec/shared/como-executar-spec.md`
- `.spec/shared/convencoes-de-nomes.md`
- `.spec/shared/criterios-de-verificacao.md`

## Observações locais

- Nenhuma entidade, caso de uso ou tabela de negócio deve ser criada nesta spec.
- Não instalar bibliotecas de estado, de formulário nem de UI adicional.
- `src/dominio` termina esta spec sem depender de nenhum pacote externo do runtime.
- Alias de import: usar `@/` apontando para `src/` (padrão do `create-next-app`).

## Tarefas

### Estrutura

- [x] Criar as pastas alvo dentro de `src/`: `dominio/compartilhado/`,
      `infra/repositorios/`, `app/acoes/`, `app/(paginas)/`, `ui/`.
> Evidência (30-07-2026 17:09) — `app/` movido para `src/app/` via `git mv` (create-next-app não usava `src/`); alias `@/*` do tsconfig ajustado de `./*` para `./src/*`; demais pastas criadas vazias | arquivos: tsconfig.json, src/app/*, src/infra/repositorios/, src/app/acoes/, src/app/(paginas)/, src/ui/ | verificação: `find src -maxdepth 3 -type d` → todas as pastas presentes
- [x] Criar `src/dominio/index.ts` reexportando o que estiver em
      `src/dominio/compartilhado/` (por enquanto vazio).
> Evidência (30-07-2026 17:12) — `src/dominio/compartilhado/index.ts` como barrel vazio (`export {}`) e `src/dominio/index.ts` com `export * from "./compartilhado"` | arquivos: src/dominio/index.ts, src/dominio/compartilhado/index.ts | verificação: `npx tsc --noEmit` dentro do build (task de verificação final) → sem erros
- [x] Configurar Vitest na raiz para reconhecer arquivos `*.spec.ts` em `src/`.
> Evidência (30-07-2026 17:13) — instalado `vitest` (dev); `vitest.config.ts` na raiz com `test.include: ["src/**/*.spec.ts"]`, ambiente `node` (sem jsdom/react, pois nenhum componente é testado nesta spec); script `test` adicionado como `vitest run` (não-watch) | arquivos: vitest.config.ts, package.json | verificação: `npm test` → 1 passed (ver evidência da tarefa de smoke test)

### Persistência

- [x] Instalar `prisma` (dev) e `@prisma/client`.
> Evidência (30-07-2026 17:15) — instalado `prisma@7.9.1` (dev) e `@prisma/client@7.9.1`. Prisma 7 exige adaptador de driver para bancos SQL (sem engine nativa); instalados também `@prisma/adapter-better-sqlite3`, `better-sqlite3` e `dotenv` (exigido pelo `prisma.config.ts` gerado, que não carrega `.env` automaticamente em v7). Desvio registrado: ver skill `prisma-upgrade-v7` consultada em `node_modules/next` não se aplica — a skill relevante foi a `prisma-upgrade-v7` do próprio Prisma CLI (instalada por `prisma init`) | arquivos: package.json | verificação: `npm ls prisma @prisma/client @prisma/adapter-better-sqlite3` → resolvidos
- [x] Rodar `npx prisma init --datasource-provider sqlite` e ajustar o datasource para
      `file:./dev.db`.
> Evidência (30-07-2026 17:16) — `npx prisma init --datasource-provider sqlite` gerou `prisma/schema.prisma`, `prisma.config.ts` e `.env`. BLOQUEIO evitado / desvio: em Prisma 7 a URL do SQLite é resolvida a partir de `prisma.config.ts` (raiz do projeto), não a partir de `prisma/schema.prisma` como no v6 — `file:./dev.db` criava o banco na raiz. Ajustado `DATABASE_URL` em `.env` para `file:./prisma/dev.db` para manter o banco dentro de `prisma/`, como a spec pede. Também: `npx prisma init` instalou por padrão pastas de skills de agente (`.claude/skills`, `.windsurf/skills`, `.agents/skills`, `skills-lock.json`) fora do escopo desta spec; não foi possível removê-las (comando `rm` bloqueado pelo sandbox) — usuário optou por mantê-las | arquivos: prisma/schema.prisma, prisma.config.ts, .env, .gitignore | verificação: `cat .env` → `DATABASE_URL="file:./prisma/dev.db"`
- [x] Criar `src/infra/prisma-cliente.ts` exportando um único cliente Prisma
      reaproveitável entre chamadas (evitar múltiplas instâncias em dev).
> Evidência (30-07-2026 17:18) — cliente singleton via `globalThis`, usando o adaptador `PrismaBetterSqlite3` (obrigatório no Prisma 7 para SQLite) e importando o client gerado via alias `@/generated/prisma/client` | arquivos: src/infra/prisma-cliente.ts | verificação: incluído no `npm run build` (task de verificação final) → compila sem erros
- [x] Aplicar a migração inicial (schema ainda sem modelos de negócio) e confirmar que
      `prisma/dev.db` foi criado.
> Evidência (30-07-2026 17:19) — `npx prisma migrate dev --name inicial` → "Already in sync, no schema change or pending migration was found" (schema sem modelos, nada a migrar); nenhuma pasta `prisma/migrations/` foi gerada por não haver diff — comportamento esperado até a spec 002 criar as primeiras entidades. O arquivo do banco foi criado como efeito da conexão. `npx prisma generate` executado em seguida (não é mais automático no `migrate dev` a partir do v7) | arquivos: prisma/dev.db, src/generated/prisma/* | verificação: `find prisma -type f` → `prisma/dev.db`, `prisma/schema.prisma`
- [x] Acrescentar os scripts `db:migrate` e `db:studio` ao `package.json`.
> Evidência (30-07-2026 17:20) — adicionados `"db:migrate": "prisma migrate dev"` e `"db:studio": "prisma studio"` | arquivos: package.json | verificação: `cat package.json` → scripts presentes

### Rota de saúde e página inicial

- [x] Criar `src/app/api/saude/route.ts` como Route Handler `GET` retornando
      `{ status: "ok", agora: <ISO 8601> }` com `Content-Type: application/json`.
> Evidência (30-07-2026 17:21) — `GET` retornando `Response.json({ status: "ok", agora: new Date().toISOString() })`; `Response.json` define `Content-Type: application/json` automaticamente | arquivos: src/app/api/saude/route.ts | verificação: `curl -sD - http://localhost:3000/api/saude` → `content-type: application/json` e corpo `{"status":"ok","agora":"2026-07-30T20:17:42.310Z"}`
- [x] Ajustar `src/app/page.tsx` para ser um Server Component que faz `fetch` da rota
      `/api/saude` no servidor e exibe o status na tela.
> Evidência (30-07-2026 17:23) — Server Component `async`; monta URL absoluta a partir de `headers()` (`host` + `x-forwarded-proto`) e faz `fetch` com `cache: "no-store"`, exibindo `status` e `agora` na tela. Removido o boilerplate do `create-next-app` (logos/links) por não ter relação com o objetivo desta spec | arquivos: src/app/page.tsx | verificação: `curl http://localhost:3000/` → HTML contém `Status da API: <span class="font-medium">ok</span>`

### Verificação

- [x] Criar `src/dominio/compartilhado/verificacao.spec.ts` com um teste de fumaça que
      valide que o pacote `src/dominio` compila sem depender do runtime da aplicação.
> Evidência (30-07-2026 17:24) — teste importa `src/dominio/index.ts` e valida que o módulo é importável | arquivos: src/dominio/compartilhado/verificacao.spec.ts | verificação: `npm test` → 1 passed
- [x] `npm run build` e `npm test` na raiz, sem erros.
> Evidência (30-07-2026 17:26) — `npm run build` inicialmente falhou por tipos obsoletos em `.next/` (referência a `app/page.js` de antes da migração para `src/app/`); corrigido limpando `.next/`. Também surgiu o aviso de Turbopack citado em `criterios-de-verificacao.md` ("workspace root inferido incorretamente", por causa de um `package-lock.json` em `C:\Users\wesle`, fora do repositório); corrigido fixando `turbopack.root` em `next.config.ts`. Após as correções: build limpo, rotas `/` e `/api/saude` dinâmicas (esperado, pois usam `headers()`/sem cache). `npm test`: 1 passed, sem erros (aviso benigno do Vite sobre `configLoader: 'native'` em versão futura, não bloqueante) | arquivos: next.config.ts | verificação: `npm run build` → "Compiled successfully" + rotas listadas; `npm test` → "1 passed (1)"
- [x] Subir `npm run dev` e confirmar que a página inicial em `http://localhost:3000`
      exibe o status vindo do Route Handler.
> Evidência (30-07-2026 17:27) — `npm run dev` em segundo plano; `curl http://localhost:3000/api/saude` → `{"status":"ok","agora":"2026-07-30T20:17:42.310Z"}`; `curl http://localhost:3000/` → HTML da página inicial contém "Status da API: ok" e o timestamp ISO. Servidor de dev encerrado após a verificação | arquivos: (nenhum) | verificação: cenário testado = acessar `/` após subir `npm run dev`; resultado = status "ok" e timestamp renderizados na tela, consistentes com a resposta de `/api/saude`

## Resultado esperado

- Estrutura de camadas criada e reconhecida pelos aliases do TypeScript.
- Prisma configurado com SQLite, migração inicial aplicada.
- Rota `/api/saude` respondendo, e página inicial consumindo essa rota do servidor.
- Vitest verde.
- `src/dominio` sem imports de runtime da aplicação.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência
registrada, no formato definido em `.spec/shared/como-executar-spec.md`.

STATUS: CONCLUÍDA