# Arquitetura: PetCare Agenda

## Estrutura alvo do repositório

```
petcare/
├── .spec/                     # engenharia agêntica (não vai para produção)
│   ├── changes/               # mudanças (uma pasta por spec)
│   │   └── archive/           # specs já executadas
│   ├── memory/                # estado atual do projeto
│   ├── shared/                # regras válidas para todas as specs
│   └── templates/             # modelos de spec
├── .claude/skills/            # skills do projeto
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/                   # App Router
│   │   ├── (paginas)/         # grupo de rotas visíveis
│   │   │   ├── tutores/
│   │   │   ├── pets/
│   │   │   └── agenda/
│   │   ├── api/
│   │   │   └── saude/route.ts # Route Handler de saúde
│   │   ├── acoes/             # Server Actions por agregado
│   │   │   ├── tutor.acoes.ts
│   │   │   ├── pet.acoes.ts
│   │   │   └── atendimento.acoes.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── dominio/               # regras de negócio puras (TS, zero framework)
│   │   ├── tutor/
│   │   ├── pet/
│   │   ├── atendimento/
│   │   └── compartilhado/     # erros, tipos e utilitários de domínio
│   ├── infra/                 # implementações de saída
│   │   ├── prisma-cliente.ts
│   │   └── repositorios/      # implementações Prisma dos contratos
│   └── ui/                    # componentes React reutilizáveis
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Responsabilidade de cada camada

| Camada | Contém | Nunca contém |
|---|---|---|
| `src/dominio` | entidades, regras, casos de uso, contratos de repositório | Prisma, Next, React, HTTP, SQL, `process.env` |
| `src/infra` | cliente Prisma, repositórios Prisma, adaptadores externos | regra de negócio |
| `src/app/acoes` | Server Actions: chamam caso de uso e devolvem resultado normalizado | regra de negócio, SQL |
| `src/app/(paginas)` | páginas, formulários, tradução de códigos de erro | regra de negócio, acesso direto ao banco |
| `src/app/api` | Route Handlers para integração externa (health, mobile futuro, webhook) | regra de negócio |
| `src/ui` | componentes de apresentação genéricos | acesso a banco, regra de negócio |

## Regras de dependência (invioláveis)

1. `src/dominio` não importa nada de `src/app`, `src/infra`, `src/ui` nem de nenhum
   pacote externo do runtime da aplicação (Prisma, React, Next, Zod).
2. `src/infra` importa `src/dominio` para implementar os contratos, e importa Prisma.
   Não importa React nem `src/app`.
3. `src/app` importa `src/dominio` (tipos, casos de uso) e `src/infra` (instâncias dos
   repositórios). O domínio não importa ninguém.
4. Toda persistência entra no domínio por interface declarada no próprio domínio; a
   implementação vive em `src/infra/repositorios`.
5. Regra de negócio nunca é reescrita em Server Action, Route Handler nem em componente.
6. Todo erro de negócio é lançado com código no padrão `AGREGADO.MOTIVO` (ex.:
   `ATENDIMENTO.HORARIO_OCUPADO`). A Server Action captura e devolve
   `{ erros: [{ codigo, campo? }] }`. A página traduz cada código para pt-BR.

## Server Actions x Route Handlers

- **Server Actions** (`src/app/acoes`) são o meio padrão para mutações vindas do próprio
  frontend. Assinatura padronizada:
  ```ts
  type Resultado<T = void> = { ok: true; dados?: T } | { ok: false; erros: ErroFormulario[] }
  ```
- **Route Handlers** (`src/app/api/*/route.ts`) só existem quando o consumo é externo
  (health, integração de mobile futuro, webhook). Não usar Route Handler para o que a
  própria página vai chamar.

## Organização por agregado

Cada agregado do domínio tem sua própria pasta em `src/dominio/<agregado>/` contendo
entidade, contrato de repositório e casos de uso. Um agregado é persistido como uma
unidade.

## Nomes

Ver `.spec/shared/convencoes-de-nomes.md`.
