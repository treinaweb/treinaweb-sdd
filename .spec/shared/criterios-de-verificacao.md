# Critérios de verificação

Estes critérios valem para toda spec, mesmo que ela não os repita. São as verificações
que garantem que a execução chegou do outro lado com o resultado certo.

## 1. Portões automáticos (obrigatórios em toda spec)

Ao final de qualquer spec, execute na raiz do projeto e registre a saída na evidência:

```bash
npm run build
npm test
```

A spec não pode ser marcada como concluída com build quebrado ou teste falhando.
`npm run build` no Next.js 16 usa Turbopack. Se aparecer aviso de configuração incompatível
com Turbopack (por exemplo, uma configuração de webpack customizada), corrija e registre.

## 2. Fronteiras de arquitetura

- `src/dominio` não pode importar nada de `src/app`, `src/infra`, `src/ui`, nem de
  `prisma`, `@prisma/client`, `next`, `react`, `zod`, `process.env`, nem fazer I/O.
  Verificação (deve retornar vazio):
  ```bash
  grep -rE "from ['\"](@?prisma|next|react|zod|@/app|@/infra|@/ui)['\"]|process\.env" src/dominio
  ```
- `src/infra` pode importar `src/dominio` e Prisma, e não pode importar `src/app`.
  Verificação (deve retornar vazio):
  ```bash
  grep -rE "from ['\"]@/app" src/infra
  ```
- Regra de negócio não aparece em Server Action, Route Handler nem em componente. A
  Server Action valida o formato da entrada (Zod), chama o caso de uso, captura o
  `ErroDeDominio` e devolve `Resultado`. Nada além disso.
- Nenhuma interface de repositório declarada no domínio pode ser alterada para acomodar
  uma necessidade da UI ou da infra. Se a necessidade existir, ela vira adaptação no
  adaptador.

## 3. Erros e retorno de Server Action

- Todo erro de negócio carrega código no padrão `AGREGADO.MOTIVO`.
- Toda Server Action retorna `Resultado<T>` e nunca lança para o cliente.
- Todo código de erro novo do domínio precisa ter tradução em `src/app/(paginas)/mensagens.ts`.
  Verificação: nenhum código presente no domínio pode estar ausente do dicionário.

## 4. Testes

- Todo caso de uso novo tem teste unitário cobrindo o caminho feliz e cada regra de
  negócio que ele aplica.
- Toda Server Action nova tem ao menos um teste de sucesso e um de erro (chamada direta
  da função, não via HTTP), usando um banco SQLite isolado.
- Testes de domínio usam repositórios em memória, nunca banco.

## 5. Cliente x Servidor

- Componentes com `"use client"` só existem quando há estado, evento ou API de browser.
- Server Components não podem importar módulos marcados como cliente-apenas.
- Nenhum Client Component importa `src/infra` (o banco fica no servidor).
  Verificação (deve retornar vazio):
  ```bash
  grep -rlE "^['\"]use client['\"]" src | xargs grep -l "from ['\"]@/infra" 2>/dev/null
  ```

## 6. Revalidação

- Toda Server Action que altera dados exibidos em alguma página chama
  `revalidatePath` ou `revalidateTag` correspondente antes de retornar sucesso.
- Toda página cacheada com `"use cache"` declara ao menos uma `cacheTag`.

## 7. Verificação manual (quando a spec pedir)

Quando a tarefa pedir validação no navegador, registre na evidência o cenário testado,
o que foi digitado e o que apareceu na tela.

## 8. O que fazer quando um critério falha

Corrija e registre a correção na evidência da tarefa correspondente. Se não for possível
corrigir dentro do escopo da spec, marque `BLOQUEIO:` e pare.

Não desative teste, não use `as any`, não relaxe o `strict` do TypeScript, não silencie
regra do ESLint sem justificativa explícita na evidência.
