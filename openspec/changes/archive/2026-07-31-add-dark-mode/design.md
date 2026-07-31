## Context

Os tokens de cor já são variáveis CSS em `src/app/globals.css`, mapeadas para o Tailwind v4 via `@theme inline` (`--color-canvas`, `--color-ink`, `--color-hairline`, etc.). Todos os componentes em `src/ui/` já consomem essas classes utilitárias (`bg-canvas`, `text-ink`, `border-hairline`...) em vez de valores fixos — não há cor hard-coded fora de `globals.css`. Isso significa que trocar o *valor* das variáveis por tema é suficiente para propagar a mudança; não é necessário reescrever os componentes, só o container das variáveis.

Next.js 16 documenta explicitamente o padrão para tema sem flash em `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`: atributo `data-theme` na tag `<html>`, `suppressHydrationWarning`, e um `<script>` inline (via `dangerouslySetInnerHTML`) no `<head>` que roda de forma síncrona durante o parsing do HTML, antes da primeira pintura. Esse é o único mecanismo que evita o flash tanto na carga inicial quanto no F5 — `useEffect` roda tarde demais e causa flash; ler `cookies()` no servidor exigiria uma escrita de cookie a cada troca de tema e ainda não cobre a preferência de sistema no primeiro carregamento sem JS anterior.

Ver `proposal.md` (seção Why) para a motivação e a decisão de revogar a diretriz "white-canvas non-negotiable" do design system anterior.

## Goals / Non-Goals

**Goals:**
- Zero flash de tema incorreto em qualquer tipo de navegação (carga direta, F5, link externo).
- Reutilizar os tokens de cor existentes sem introduzir um segundo sistema de cores paralelo.
- Alternador de tema utilizável por teclado e leitor de tela.
- Preferência de tema sobrevive a recarregamento e não depende de estado de servidor (sem autenticação no projeto, ver `contexto-tecnico.md`).

**Non-Goals:**
- Temas customizáveis pelo usuário (paletas além de claro/escuro) — fora de escopo.
- Sincronizar a preferência de tema entre dispositivos (exigiria conta de usuário; não há autenticação no projeto).
- Modo escuro nas páginas de marketing/landing — o app não tem hoje páginas de marketing separadas do produto; se surgirem no futuro, decisão fica para essa mudança futura.

## Decisions

### 1. Atributo `data-theme` no `<html>` + variáveis CSS por seletor de atributo
Espelhar `--color-*` sob `[data-theme="dark"]` em `globals.css`, do mesmo jeito que o guia do Next 16 recomenda. Alternativa considerada: usar a classe `dark:` utilitária padrão do Tailwind (baseada em `prefers-color-scheme` via media query). Rejeitada porque o Tailwind `dark:` puro não suporta alternância manual persistida sem também configurar um seletor customizado — e como já precisamos do atributo `data-theme` para a técnica anti-flash do Next, configuramos o Tailwind (`@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`) para reaproveitar o mesmo atributo em vez de manter dois mecanismos.

### 2. `localStorage` como fonte de verdade da preferência, script inline como aplicador
A preferência do usuário (`"light" | "dark" | "system"`) fica em `localStorage` sob a chave `theme`. Um script inline no `<head>` de `layout.tsx` lê essa chave (com `try/catch` para navegadores que bloqueiam `localStorage`), resolve `"system"` via `window.matchMedia("(prefers-color-scheme: dark)")`, e escreve `data-theme` no `<html>` antes da primeira pintura. Alternativa considerada: cookie + leitura em `cookies()` no server component do `layout.tsx`. Rejeitada porque exigiria uma Server Action ou Route Handler só para gravar o cookie a cada troca de tema (visível ao usuário como um pequeno delay), enquanto a leitura de `localStorage` no cliente é instantânea; e o projet já não usa cookies para nenhum outro estado (ver `contexto-tecnico.md` — "Sem autenticação nesta fase").

### 3. Componente `AlternadorDeTema` como Client Component isolado
Novo `src/ui/alternador-de-tema.componente.tsx`, `"use client"`, com três opções (claro/escuro/sistema). Ao trocar, grava em `localStorage` e aplica `data-theme` diretamente no `document.documentElement` (sem esperar re-render de servidor). Usa `useState` com inicializador preguiçoso lendo `localStorage`, seguindo o mesmo padrão do guia oficial para manter o estado React sincronizado com o que o script inline já aplicou no DOM (evita hydration mismatch).

### 4. Segue mudando "sistema" em tempo real
Enquanto a opção "Sistema" estiver ativa, o componente registra um listener em `window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ...)` para reagir a mudanças no SO sem exigir reload. O listener é removido quando o usuário escolhe um tema fixo.

## Risks / Trade-offs

- **[Risco] Script inline bloqueado por CSP restritivo** → Mitigação: o projeto não tem CSP configurado hoje (verificado em `next.config.ts`); se um CSP for adicionado depois, será necessário nonce, documentado no próprio guia do Next.
- **[Risco] Esquecer de espelhar um token novo no tema escuro no futuro** (ex.: alguém adiciona `--color-warning` só no bloco `:root`) → Mitigação: o requirement "Contraste consistente" cobre isso como comportamento observável; revisão de PR deve conferir que todo novo token em `:root` tem par em `[data-theme="dark"]`.
- **[Trade-off] Sem sincronização entre abas abertas simultaneamente** — trocar o tema em uma aba não atualiza outras abas já abertas até que sejam recarregadas ou re-focadas. Aceitável para este projeto (uso interno de petshop, não múltiplas abas simultâneas do mesmo usuário como padrão de uso).

## Migration Plan

Mudança aditiva de apresentação, sem migração de dados. Passos de entrega:
1. Adicionar tokens escuros e `@custom-variant dark` em `globals.css`.
2. Adicionar `data-theme="light"` + `suppressHydrationWarning` + script inline em `layout.tsx`.
3. Criar `AlternadorDeTema` e integrá-lo em `NavBar`.
4. Verificação manual em navegador real (Claude in Chrome ou usuário) cobrindo: primeira visita, troca manual, F5 com tema escuro salvo, mudança de `prefers-color-scheme` do SO com "Sistema" ativo.

Rollback: reverter os três arquivos (`globals.css`, `layout.tsx`, `nav-bar.componente.tsx`) e remover `alternador-de-tema.componente.tsx` — nenhuma migração de schema ou dado persistido no servidor está envolvida.
