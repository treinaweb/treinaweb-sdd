## 1. Tokens de cor do tema escuro

- [x] 1.1 Em `src/app/globals.css`, adicionar bloco `[data-theme="dark"]` espelhando cada variável hoje definida em `:root` (`--color-canvas`, `--color-canvas-soft`, `--color-ink`, `--color-ink-secondary`, `--color-ink-mute`, `--color-ink-mute-2`, `--color-ink-faint`, `--color-hairline`, `--color-hairline-strong`, `--color-hairline-cool`, `--color-primary`, `--color-primary-deep`, `--color-on-primary`, `--color-danger`) com valores escuros equivalentes (ex.: canvas próximo de `--color-canvas-night` do design system antigo, `#1c1c1c`/`#202020`).
- [x] 1.2 Configurar `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` no `globals.css` para reaproveitar o mesmo atributo `data-theme` que o script de anti-flash escreve.
- [x] 1.3 Conferir visualmente (ou via grep) que nenhum token de `:root` ficou sem par em `[data-theme="dark"]`.

## 2. Aplicação sem flash de tema

- [x] 2.1 Em `src/app/layout.tsx`, adicionar `data-theme="light"` e `suppressHydrationWarning` na tag `<html>`.
- [x] 2.2 Adicionar `<script>` inline (`dangerouslySetInnerHTML`) no `<head>` que lê `localStorage.getItem("theme")` dentro de `try/catch`, resolve `"system"` via `window.matchMedia("(prefers-color-scheme: dark)")` e escreve o atributo `data-theme` resultante em `document.documentElement` antes da primeira pintura, seguindo o padrão de `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`.
- [x] 2.3 Verificar que o `<script>` não dispara o warning de dev do React sobre `<script>` renderizado (usar `type="text/javascript"` no server / `type="text/plain"` no client, conforme o guia).

## 3. Componente alternador de tema

- [x] 3.1 Criar `src/ui/alternador-de-tema.componente.tsx` (`"use client"`) com três opções: claro, escuro, sistema.
- [x] 3.2 Inicializar o estado do componente com `useState` de inicialização preguiçosa lendo `localStorage.getItem("theme")`, para começar sincronizado com o que o script inline já aplicou no DOM.
- [x] 3.3 Ao trocar de opção: gravar a escolha em `localStorage` sob a chave `theme` e aplicar `data-theme` em `document.documentElement` imediatamente (sem esperar re-render de servidor).
- [x] 3.4 Quando a opção ativa for "sistema", registrar um listener em `window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ...)` que reaplica o tema resolvido em tempo real; remover o listener ao trocar para uma opção fixa ou ao desmontar o componente.
- [x] 3.5 Garantir que os três controles são operáveis por teclado (foco visível, `role`/`aria-label` adequados para leitor de tela).

## 4. Integração na navegação

- [x] 4.1 Adicionar `AlternadorDeTema` em `src/ui/nav-bar.componente.tsx`, junto aos itens de navegação existentes.
- [x] 4.2 Revisar `src/ui/botao.componente.tsx`, `cartao.componente.tsx`, `campo-de-formulario.componente.tsx` e `lista-de-erros.componente.tsx` para confirmar que usam apenas classes ligadas aos tokens `--color-*` (nenhuma cor fixa fora do tema).

## 5. Verificação manual

- [x] 5.1 No navegador (Claude in Chrome ou usuário), testar: primeira visita sem preferência salva reflete `prefers-color-scheme` do SO.
- [x] 5.2 Testar troca manual para "Escuro" e para "Claro", confirmando aplicação imediata em toda a página.
- [x] 5.3 Testar F5 com "Escuro" salvo: confirmar que não há flash de tema claro antes da pintura em tema escuro.
- [x] 5.4 Testar navegação entre páginas (`/tutores`, `/pets`, `/agenda`) mantendo o tema escolhido.
- [x] 5.5 Com "Sistema" ativo, alternar o tema do SO (ou via DevTools) e confirmar que a página reage sem reload.
- [x] 5.6 Registrar no relatório de verificação que o teste foi feito em navegador real (não apenas `curl`), conforme restrição em `contexto-tecnico.md`. Verificado manualmente pelo usuário em 2026-07-31: troca de tema, F5 sem flash, navegação entre páginas e reação a `prefers-color-scheme` funcionaram como esperado.
