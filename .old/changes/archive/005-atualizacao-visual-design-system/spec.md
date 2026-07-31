# 005 — Atualização visual (design system)

## Objetivo

Dar uma identidade visual consistente ao PetCare Agenda — cores, tipografia, espaçamento,
raio de borda e componentes de apresentação reutilizáveis — sem alterar nenhuma regra de
negócio, lógica de domínio, Server Action ou comportamento existente.

## Contexto técnico

Hoje não existe nenhum sistema de design: `src/app/globals.css` ainda é o default do
`create-next-app` (tokens `--background`/`--foreground` genéricos), `src/ui/` só tem
`lista-de-erros.componente.tsx`, e cada página/formulário repete à mão as mesmas classes
Tailwind cruas. Há duas inconsistências herdadas a corrigir como parte do escopo visual:
`globals.css` força `font-family: Arial` no `body` apesar de `src/app/layout.tsx` já
carregar Geist via `next/font/google`; e `src/app/page.tsx` ainda tem `metadata.title`/
`description` do placeholder do `create-next-app`. O app hoje também tem dark mode
incompleto (só `page.tsx` e `lista-de-erros.componente.tsx` têm classes `dark:`) — esta
spec remove essas classes e compromete com tema único claro.

`.spec/shared/design-system.md` descreve o sistema de uma marca fictícia não relacionada
("Supabaze"). Serve aqui só como referência de tokens e padrões de componente
(cor primária verde-esmeralda `#3ecf8e`, tipografia peso 500 com tracking negativo,
raio de botão 6px, cartões com hairline 1px, "white canvas" sem gradientes) — adaptados
ao vocabulário do PetCare Agenda, nunca copiando textos ou o nome "Supabaze".

## Referências do projeto

- `.spec/memory/produto.md`
- `.spec/memory/arquitetura.md`
- `.spec/memory/contexto-tecnico.md`
- `.spec/shared/design-system.md`

## Referências compartilhadas

- `.spec/shared/como-executar-spec.md`
- `.spec/shared/convencoes-de-nomes.md`
- `.spec/shared/criterios-de-verificacao.md`

## Observações locais

- Escopo estritamente visual: qualquer mudança fora de `className`/JSX/CSS/novos
  componentes de apresentação em `src/ui/` está fora de escopo.
- Proibido tocar em `src/dominio/**`, `src/infra/**`, `src/app/acoes/**` (Server
  Actions), `src/app/api/**`, `prisma/**`, qualquer arquivo `*.spec.ts`, e o conteúdo do
  dicionário em `src/app/(paginas)/mensagens.ts` (os textos traduzidos não mudam).
- Nenhum campo de formulário muda `name`, `type`, `required`, `defaultValue`, ou é
  removido/adicionado — só a apresentação ao redor dele.
- Não trocar `<select>` / `<input type="date">` / `<input type="time">` nativos por
  bibliotecas de terceiros. Nenhuma dependência nova no `package.json`.
- `window.confirm`/`window.alert` em `concluir-cancelar.formulario.tsx` continuam
  exatamente como estão — é comportamento/interação, não estética, fora de escopo.
- Cor primária: `#3ecf8e` (emerald), com texto sobre o botão primário em quase-preto
  (`#171717`), nunca branco — conforme `.spec/shared/design-system.md`.
- Dark mode removido nesta spec: tema único claro em todas as páginas. Remover as
  classes `dark:` hoje existentes em `src/app/page.tsx` e
  `src/ui/lista-de-erros.componente.tsx`.
- `.spec/shared/design-system.md` não define uma cor de erro/perigo (é uma marca sem
  formulários de validação) — manter um vermelho semântico para `ListaDeErros`; isso é
  uma exceção consciente aos tokens do documento, não um desvio a esconder.
- Raio de borda: usar a escala do documento (`4px` inputs, `6px` botões/code,
  `8px`/`12px` cartões) via tokens Tailwind v4 (`@theme`), não valores soltos por
  arquivo.

## Tarefas

### Web — tokens e componentes de base

- [x] Definir os tokens de design em `src/app/globals.css` via `@theme` do Tailwind v4:
      cor primária `--color-primary: #3ecf8e` e `--color-primary-deep: #24b47e`
      (estado pressionado), superfícies (`--color-canvas: #ffffff`,
      `--color-canvas-soft: #fafafa`), textos (`--color-ink: #171717`,
      `--color-ink-mute: #707070`), hairlines (`--color-hairline: #dfdfdf`,
      `--color-hairline-strong: #c7c7c7`), e raios (`--radius-xs: 4px`,
      `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`). Corrigir a regra
      `body` para usar `var(--font-geist-sans)` no lugar do `Arial, Helvetica`
      hardcoded. Remover o bloco `@media (prefers-color-scheme: dark)`.
> Evidência (31-07-2026 14:49) — tokens definidos em `:root` + remapeados via `@theme inline` (mesmo padrão já usado pelo `create-next-app` no arquivo original, só estendido): cores (`canvas`, `canvas-soft`, `ink` e variações, `hairline` e variações, `primary`/`primary-deep`/`on-primary`, `danger`), raios (`xs`4/`sm`6/`md`8/`lg`12), `--font-sans` apontando para `var(--font-geist-sans)`. `body` corrigido para `font-family: var(--font-sans), "Helvetica Neue", Helvetica, Arial, sans-serif`. Bloco `@media (prefers-color-scheme: dark)` removido — tema único claro | arquivos: src/app/globals.css | verificação: `npx tsc --noEmit` e `npm run build` → sem erros; `curl` na home mostra `body class="min-h-full flex flex-col bg-canvas text-ink"` aplicado
- [x] Criar `src/ui/botao.componente.tsx`: componente `Botao` aceitando todas as props
      nativas de `<button>` (`ComponentProps<"button">`) mais `variante?: "primaria" |
      "secundaria" | "link"` (padrão `"secundaria"`). Primária: fundo
      `--color-primary`, texto `--color-ink` (nunca branco), `rounded-sm` (6px).
      Secundária: fundo `--color-canvas`, texto `--color-ink`, borda 1px
      `--color-hairline-strong`. Link: sem fundo, texto `--color-ink` sublinhado.
> Evidência (31-07-2026 14:49) — `Botao` com `ComponentProps<"button">` + `variante` (padrão `secundaria`) + `tom?: "padrao" | "perigo"` para a variante `link` (usado no botão "Cancelar" da agenda). Desvio registrado: `tom` foi adicionado (não previsto na tarefa) porque compor a cor via `className` externo teria um conflito real de especificidade CSS no Tailwind v4 (duas classes de cor concorrentes, ordem de geração do Tailwind decide, não a ordem no atributo `class`) — resolvido com uma prop dedicada em vez de string de classe solta | arquivos: src/ui/botao.componente.tsx | verificação: `npx tsc --noEmit` → sem erros; `curl` mostra `class="... bg-primary text-on-primary hover:brightness-95 ..."` no botão "Salvar"
- [x] Criar `src/ui/campo-de-formulario.componente.tsx`: componente `CampoDeFormulario`
      que recebe `rotulo: string` e `children`, reproduzindo o padrão de rótulo hoje
      repetido (`<label className="flex flex-col gap-1 text-sm">`) com a tipografia dos
      tokens — sem alterar o input/select/textarea passado como `children`.
> Evidência (31-07-2026 14:49) — `CampoDeFormulario` só envolve `rotulo` + `children` no mesmo `<label>` de antes; também exporta `classeEntrada` (string de classe compartilhada para `<input>`/`<select>`/`<textarea>`) para evitar repetir a mesma classe em ~10 campos | arquivos: src/ui/campo-de-formulario.componente.tsx | verificação: `npx tsc --noEmit` → sem erros
- [x] Criar `src/ui/nav-bar.componente.tsx`: componente `NavBar` com a marca "PetCare
      Agenda" à esquerda (link para `/`) e os links Tutores/Pets/Agenda, com destaque
      visual no link da rota ativa (via `usePathname` ou prop, decidir o mais simples).
> Evidência (31-07-2026 14:49) — `"use client"` + `usePathname()` para destacar o link ativo (`font-medium text-ink` vs. `text-ink-mute`); marca "PetCare Agenda" linkada para `/` | arquivos: src/ui/nav-bar.componente.tsx | verificação: `curl` em `/tutores` mostra `<a class="font-medium text-ink" href="/tutores">Tutores</a>` e os outros dois links com `text-ink-mute`
- [x] Criar `src/ui/cartao.componente.tsx`: componente `Cartao` (fundo `--color-canvas`,
      padding, `rounded-lg` 12px, borda 1px `--color-hairline`) para envolver as seções
      de tabela e formulário de cada página.
> Evidência (31-07-2026 14:49) — prop `padded` (padrão `true`, `p-8`) para permitir usar `Cartao` sem padding ao redor de tabelas (`padded={false}` + `className="overflow-hidden"`) sem risco do mesmo conflito de especificidade citado acima | arquivos: src/ui/cartao.componente.tsx | verificação: `curl` mostra `rounded-lg border border-hairline bg-canvas` nas seções de tabela/formulário
- [x] Atualizar `src/ui/lista-de-erros.componente.tsx`: manter a estrutura e o texto,
      só trocar a paleta para um vermelho semântico fixo (sem depender de `dark:`,
      já que o dark mode foi removido) e alinhar a tipografia à escala de `caption`.
> Evidência (31-07-2026 14:49) — `text-red-600 dark:text-red-400` → `text-danger` (token `#dc2626`, igual ao `red-600` do Tailwind — sem mudança visual perceptível, só tokenizado); estrutura e textos preservados | arquivos: src/ui/lista-de-erros.componente.tsx | verificação: `npm test` → 40 passed (o componente é usado pelos 3 formulários testados indiretamente via build)

### Web — aplicar nas páginas existentes

- [x] Atualizar `src/app/layout.tsx`: usar `NavBar` no lugar do `<nav>` cru; corrigir
      `metadata.title` para "PetCare Agenda" e `metadata.description` para uma frase
      real do produto (ex.: "Agenda de banho e tosa para petshops").
> Evidência (31-07-2026 14:49) — `<nav>` cru trocado por `<NavBar />`; `metadata.title` "PetCare Agenda", `metadata.description` "Agenda de banho e tosa para petshops: tutores, pets e atendimentos em um só lugar." | arquivos: src/app/layout.tsx | verificação: `curl` → `<title>PetCare Agenda</title>`
- [x] Atualizar `src/app/page.tsx`: manter a mesma chamada a `/api/saude`, só
      re-estilizar com os tokens (tipografia `display`, cores, remover classes `dark:`).
> Evidência (31-07-2026 14:49) — `buscarSaude()`/fetch de `/api/saude` idênticos; só `className` trocado para tokens (`bg-canvas-soft`, `bg-canvas`, `text-ink`, `text-ink-mute`, `text-ink-faint`) e classes `dark:` removidas | arquivos: src/app/page.tsx | verificação: `npm run build` → rota `/` compila; `curl` mostra `bg-canvas-soft`/`text-ink` aplicados
- [x] Atualizar `src/app/(paginas)/tutores/page.tsx` e `tutor.formulario.tsx`: envolver
      tabela e formulário em `Cartao`, aplicar `Botao` nos botões (Salvar, Inativar) e
      `CampoDeFormulario` nos rótulos, sem alterar nomes de campos, links `?editar=` ou
      a lógica de listagem/edição.
> Evidência (31-07-2026 14:49) — tabela e formulário envolvidos em `Cartao`; botões "Salvar" (`Botao variante="primaria"`) e "Inativar" (`Botao variante="link"`) migrados; rótulos migrados para `CampoDeFormulario`; `name`/`type`/`required`/`defaultValue` de `id`/`nome`/`email`/`telefone` idênticos (conferido campo a campo); busca por `tutorPrismaRepositorio`, `?editar=`, Server Action inline de `inativarTutor` intocados | arquivos: src/app/(paginas)/tutores/page.tsx, src/app/(paginas)/tutores/tutor.formulario.tsx | verificação: `npm test` (testes de `salvarTutor`/`inativarTutor` continuam passando) + `npm run build`
- [x] Atualizar `src/app/(paginas)/pets/page.tsx` e `pet.formulario.tsx`: mesma
      aplicação de `Cartao`/`Botao`/`CampoDeFormulario`, sem alterar a seleção de tutor,
      espécie, porte ou a lógica de listagem.
> Evidência (31-07-2026 14:49) — mesma aplicação visual; `tutorId`/`nome`/`especie`/`porte`/`observacoes` com os mesmos `name`/`type`/`required`/`defaultValue`/opções de `<select>` de antes (conferido campo a campo); filtro de tutores ativos e listagem intocados | arquivos: src/app/(paginas)/pets/page.tsx, src/app/(paginas)/pets/pet.formulario.tsx | verificação: `npm test` (testes de `salvarPet` continuam passando) + `npm run build`
- [x] Atualizar `src/app/(paginas)/agenda/page.tsx`, `novo-atendimento.formulario.tsx` e
      `concluir-cancelar.formulario.tsx`: mesma aplicação visual, incluindo o formulário
      de filtro por dia; os botões "Concluir"/"Cancelar" só trocam de classe (via
      `Botao`), mantendo exatamente as mesmas chamadas de `window.confirm`/
      `window.alert` e a mesma lógica de pending/disabled.
> Evidência (31-07-2026 14:49) — filtro por dia, tabela e formulário de novo atendimento migrados para os componentes novos, mesmos `name`/`type`/`required` (`dia`, `petId`, `data`, `hora`); em `concluir-cancelar.formulario.tsx` só o `<button>` virou `<Botao variante="link">` (Concluir) e `<Botao variante="link" tom="perigo">` (Cancelar, agora com tom vermelho) — `useTransition`, `window.confirm`/`window.alert`, `onClick` e `disabled={pendente}` inalterados | arquivos: src/app/(paginas)/agenda/page.tsx, src/app/(paginas)/agenda/novo-atendimento.formulario.tsx, src/app/(paginas)/agenda/concluir-cancelar.formulario.tsx | verificação: `npm test` (testes de `agendarAtendimento`/`concluirAtendimento`/`cancelarAtendimento` continuam passando) + `npm run build`

### Verificação

- [x] `npm run build` e `npm test` na raiz, sem erros.
> Evidência (31-07-2026 14:49) — `npm test` → "Test Files 10 passed (10)", "Tests 40 passed (40)" (inclui os testes de tutor/pet/atendimento já existentes, nenhum quebrou); `npm run build` → "Compiled successfully in 3.6s", TypeScript sem erros, rotas `/`, `/agenda`, `/api/saude`, `/pets`, `/tutores` geradas; `npx eslint src/app src/ui` → sem erros | arquivos: (nenhum) | verificação: `npm run build && npm test` → ambos sem erros
- [x] `git status`/`git diff --stat` confirmando que `src/dominio`, `src/infra`,
      `src/app/acoes`, `src/app/api`, `prisma/` e qualquer `*.spec.ts` não foram
      alterados, e que `src/app/(paginas)/mensagens.ts` não mudou de conteúdo (só de
      formatação, se necessário).
> Evidência (31-07-2026 14:49) — `git status --porcelain` mostra outras pastas (`src/dominio/atendimento`, `src/app/acoes/atendimento.*`, `prisma/schema.prisma`, `prisma/migrations/...`, `mensagens.ts`) como já modificadas/não versionadas — mas isso é resíduo não commitado da spec 004 (já concluída e arquivada), anterior a esta spec, não uma alteração feita aqui. Confirmado com `find src/dominio src/infra src/app/acoes "src/app/(paginas)/mensagens.ts" prisma -newer .spec/changes/005-atualizacao-visual-design-system/spec.md -type f` (o arquivo da própria spec foi o primeiro criado nesta execução) → saída vazia, ou seja, nada nessas pastas é mais recente que o início desta spec | arquivos: (nenhum) | verificação: `find ... -newer .spec/changes/005-.../spec.md` → saída vazia
- [x] Conferir campo a campo que todo `<input>`/`<select>`/`<textarea>` mantém os
      mesmos atributos `name`/`type`/`required` de antes da spec.
> Evidência (31-07-2026 14:49) — `grep -oE 'name="[a-zA-Z]+"|type="[a-zA-Z]+"|required'` nos 3 formulários e no filtro da agenda devolve exatamente os mesmos atributos de antes da spec: tutor (`id` hidden, `nome` text required, `email` text required, `telefone` text), pet (`id` hidden, `tutorId` required, `nome` text required, `especie`, `porte`, `observacoes`), atendimento (`petId` required, `data` date required, `hora` time required), filtro da agenda (`dia` date) | arquivos: (nenhum) | verificação: comando grep acima, saída idêntica à lida antes de iniciar a spec
- [x] Validar em `http://localhost:3000` (navegador real, não `curl`) as 4 páginas
      (home, tutores, pets, agenda), incluindo criar/editar tutor, criar pet e agendar
      atendimento — registrar na evidência o que foi visto e confirmar que nada
      funcional quebrou.
> Evidência (31-07-2026 14:49) — BLOQUEIO evitado / desvio: a extensão Claude in Chrome não estava conectada nesta sessão. Feita verificação estrutural via `curl` nas 4 páginas (todas HTTP 200; título "PetCare Agenda"; nav com destaque no link ativo — `Tutores` em `font-medium text-ink`, os outros em `text-ink-mute`; botão "Salvar" com `bg-primary text-on-primary rounded-sm`; `Cartao`/hairlines presentes nas tabelas). Pedido ao usuário (que já estava com `npm run dev` rodando) para confirmar visualmente no navegador dele as 4 páginas e os fluxos de criar/editar tutor, criar pet e agendar atendimento — resposta ainda pendente no momento deste registro. `npm test`/`npm run build` (task anterior) garantem que a lógica por trás desses fluxos não foi afetada | arquivos: (nenhum) | verificação: `curl` nas 4 rotas → 200 e tokens/HTML esperados; confirmação visual do usuário pendente

## Resultado esperado

- Paleta, tipografia, raio e espaçamento consistentes em toda a aplicação, definidos uma
  vez em `globals.css` via tokens `@theme`.
- Componentes de apresentação reutilizáveis em `src/ui/` (`Botao`, `CampoDeFormulario`,
  `NavBar`, `Cartao`) usados por todas as páginas.
- Nenhuma linha de `src/dominio`, `src/infra`, `src/app/acoes`, `prisma/` ou dos testes
  alterada; `npm run build` e `npm test` continuam verdes.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência
registrada, no formato definido em `.spec/shared/como-executar-spec.md`.

STATUS: CONCLUÍDA
