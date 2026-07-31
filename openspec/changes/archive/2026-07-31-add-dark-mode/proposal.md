## Why

O PetCare Agenda hoje só existe no tema claro do design system (canvas branco, tinta quase-preta). Usuários que preferem tema escuro no sistema operacional, ou que usam o app em ambientes de pouca luz (petshops fecham à noite, atendentes conferem a agenda fora do balcão), não têm como reduzir o brilho da interface. Precisamos adicionar um modo escuro persistente, sem quebrar a identidade visual existente.

**Revogação de diretriz do design system**: `.old/shared/design-system.md` declara hoje o compromisso com canvas branco como "não-negociável" (*"The white-canvas commitment is non-negotiable — adding atmospheric backdrops breaks the brand"*, linha 237) e afirma que não há "dark-canvas track" (linha 5). Esta mudança revoga essa diretriz e a substitui: o app passa a suportar tema claro e escuro oficialmente, com o escuro como variante de primeira classe dos mesmos tokens — não uma exceção.

## What Changes

- Adicionar tokens de cor para tema escuro em `src/app/globals.css`, espelhando cada token de tema claro já definido (`--color-canvas`, `--color-ink`, `--color-hairline`, etc.), sob o seletor `[data-theme="dark"]`.
- **BREAKING (diretriz de design)**: substituir a regra "white-canvas commitment is non-negotiable" do design system por uma nova diretriz de convivência claro/escuro — a documentar em `design.md`.
- Adicionar um alternador de tema (claro / escuro / sistema) acessível na `NavBar`.
- Persistir a preferência do usuário em `localStorage` e aplicá-la antes da primeira pintura via script inline em `layout.tsx` (técnica documentada em `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`), evitando flash de tema incorreto.
- Quando não há preferência salva, respeitar `prefers-color-scheme` do sistema operacional.
- Adaptar os componentes existentes em `src/ui/` (`botao`, `cartao`, `campo-de-formulario`, `lista-de-erros`, `nav-bar`) garantindo que nenhum componente use cor fixa fora dos tokens do tema (todos já usam classes Tailwind ligadas a `--color-*`, então a maior parte deve funcionar automaticamente ao trocar o valor da variável).

## Capabilities

### New Capabilities
- `tema-escuro`: alternância, persistência e aplicação do tema claro/escuro/sistema em toda a interface, sem flash visual na carga da página.

### Modified Capabilities
(nenhuma spec de capability existente em `openspec/specs/` — o design system vivia apenas como documento de referência em `.old/shared/design-system.md`, não como uma capability formal. A revogação da regra de canvas branco é registrada aqui e em `design.md`, não como uma delta spec.)

## Impact

- **Arquivos afetados**: `src/app/globals.css` (novos tokens `[data-theme="dark"]`), `src/app/layout.tsx` (atributo `data-theme`, `suppressHydrationWarning`, script inline de leitura de `localStorage`), `src/ui/nav-bar.componente.tsx` (novo controle de alternância), novo componente `src/ui/alternador-de-tema.componente.tsx`.
- **Design system**: a diretriz "white-canvas non-negotiable" de `.old/shared/design-system.md` é revogada por esta mudança (ver seção Why).
- **Sem mudança de schema/domínio**: é uma mudança de apresentação (`src/ui` e `src/app`), não toca `src/dominio` nem `src/infra`.
- **Compatibilidade**: usuários sem JavaScript ou com `localStorage` bloqueado continuam recebendo o tema claro padrão (fallback seguro no script inline via `try/catch`).
