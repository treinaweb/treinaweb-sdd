## Purpose

Permite que o usuário escolha entre tema claro, escuro ou seguir o sistema operacional, com a preferência aplicada de forma consistente em toda a navegação do PetCare Agenda e sem flash visual na carga da página.

## ADDED Requirements

### Requirement: Alternância de tema
O sistema SHALL fornecer um controle visível na navegação principal que permite ao usuário alternar entre os temas claro, escuro e sistema.

#### Scenario: Usuário troca para tema escuro
- **WHEN** o usuário abre o alternador de tema e seleciona "Escuro"
- **THEN** a interface inteira passa a usar os tokens de cor do tema escuro imediatamente, sem recarregar a página

#### Scenario: Usuário troca para tema claro
- **WHEN** o usuário seleciona "Claro" no alternador de tema
- **THEN** a interface inteira volta a usar os tokens de cor do tema claro imediatamente

#### Scenario: Usuário seleciona "Sistema"
- **WHEN** o usuário seleciona a opção "Sistema" no alternador de tema
- **THEN** o tema aplicado passa a seguir a preferência `prefers-color-scheme` do sistema operacional, e continua acompanhando mudanças nela enquanto a opção "Sistema" estiver ativa

### Requirement: Persistência da preferência de tema
O sistema SHALL lembrar a última escolha de tema do usuário entre recarregamentos de página e navegações dentro do app.

#### Scenario: Preferência sobrevive a recarregar a página
- **WHEN** o usuário escolhe "Escuro" e recarrega a página
- **THEN** a página carrega já no tema escuro

#### Scenario: Preferência sobrevive à navegação entre páginas
- **WHEN** o usuário escolhe um tema em uma página e navega para outra página do app
- **THEN** o tema escolhido permanece aplicado na nova página

### Requirement: Carregamento sem flash de tema incorreto
O sistema SHALL aplicar o tema salvo (ou o tema do sistema, na ausência de preferência salva) antes da primeira pintura da página, evitando qualquer flash visível do tema contrário.

#### Scenario: Recarga completa com tema escuro salvo
- **WHEN** um usuário com tema escuro salvo recarrega a página (F5) ou abre um link direto para qualquer rota do app
- **THEN** a página é renderizada diretamente em tema escuro, sem nenhum quadro visível em tema claro antes disso

### Requirement: Fallback seguro sem preferência salva
O sistema SHALL exibir o tema claro por padrão quando não houver preferência salva e não for possível detectar a preferência do sistema (por exemplo, `localStorage` bloqueado pelo navegador).

#### Scenario: Primeira visita sem preferência do sistema detectável
- **WHEN** um usuário visita o app pela primeira vez e o navegador não expõe `prefers-color-scheme` nem permite leitura de `localStorage`
- **THEN** o app é exibido no tema claro padrão, sem erros no console

### Requirement: Contraste consistente em todos os componentes
O sistema SHALL garantir que todo componente de UI reutilizável (`botao`, `cartao`, `campo-de-formulario`, `lista-de-erros`, `nav-bar`) permaneça legível e com contraste adequado em ambos os temas.

#### Scenario: Componentes renderizam corretamente em tema escuro
- **WHEN** qualquer página do app é renderizada em tema escuro
- **THEN** nenhum componente de `src/ui` exibe texto, fundo ou borda com uma cor fixa do tema claro — todos usam os tokens de cor do tema ativo
