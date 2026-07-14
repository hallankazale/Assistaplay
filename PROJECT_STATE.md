# Estado atual do projeto AssistaPay

Última atualização: 14/07/2026

Este arquivo é o mapa vivo do projeto. Deve ser lido antes de qualquer nova alteração e atualizado sempre que houver mudança de arquitetura, rotas, deploy, configuração ou estado funcional.

## Configuração confirmada

- Repositório: `hallankazale/Assistaplay`
- Branch oficial: `main`
- GitHub Pages Source: `GitHub Actions`
- Workflow: `.github/workflows/pages.yml`
- Ambiente: `github-pages`
- Regra de deployment do ambiente: branch `main` autorizada
- URL pública: `https://hallankazale.github.io/Assistaplay/`
- O deploy voltou a funcionar após remover a autorização antiga da branch `refactor/estrutura-profissional-v2` e permitir `main`.

## Entradas oficiais

- `index.html` → abre `feed.html`
- `feed.html` → abre `integration/feed-preview.html`
- `app.html` → abre `integration/app-main.html` preservando query string e hash
- `integration/app.html` → redirecionamento de compatibilidade para `integration/app-main.html`

Parâmetros obrigatórios a preservar: `view`, `tab`, `product`, `user` e parâmetros de cache/versionamento.

## Arquivos principais ativos

### Núcleo

- `src/core/config.js`
- `src/core/storage.js`
- `src/core/permissions.js`
- `src/core/auth.js`
- `src/core/migrations.js`
- `src/core/database.js`
- `src/core/events.js`
- `src/core/features.js`
- `src/core/router.js`
- `src/core/engine.js`
- `src/core/logger.js`

### Entradas e interface

- `integration/feed-preview.html`
- `integration/app-main.html`
- `src/modules/feed/feed.ui.js`
- `src/modules/navigation/pages.ui.js`
- `src/modules/navigation/bottom-nav.js`
- `src/modules/profile/profile.ui.js`
- `src/modules/seller/seller-commerce.ui.js`
- `src/modules/checkout/checkout.ui.js`
- `src/modules/commerce/commerce-sync.js`

### Estilos

- `src/styles/consolidated.css`: base visual consolidada
- `src/styles/color-refresh.css`: camada de cores anterior
- `src/styles/design-system.css`: tokens oficiais, tipografia, espaçamento, superfícies, botões e componentes-base
- `src/styles/feed-premium.css`: aplicação visual exclusiva do feed; não altera lógica

## Estado funcional confirmado

- O feed oficial abre pela URL principal.
- O deploy automático funciona pela branch `main`.
- O feed carrega e a navegação básica funciona.
- A lógica do feed permaneceu congelada durante a criação do Design System.

## Entrega visual atual — Design System + Feed

Data: 14/07/2026

Objetivo:

- criar o Design System oficial;
- aplicar a primeira entrega somente ao feed;
- preservar rotas, armazenamento, autenticação e lógica do feed.

Arquivos criados:

- `src/styles/design-system.css`
- `src/styles/feed-premium.css`

Arquivo alterado:

- `integration/feed-preview.html`

Commits:

- `a609184ab31cbafa5de01dc389d00447169e5962` — Design System
- `e7cd950e2b2505ac9891c15954aecbadc7fd0fe8` — visual premium do feed
- `0ea5fbbd7980f72b07368d420652ed8bcab793a4` — conexão dos estilos à entrada oficial

URL de teste:

- `https://hallankazale.github.io/Assistaplay/?v=0ea5fbbd`

Status:

- aguardando deploy verde e validação visual do Hallan;
- não declarar a etapa concluída antes do teste real.

O que deve ser validado:

- vídeo ocupa corretamente a área útil;
- barra inferior permanece fixa e legível;
- botão central possui gradiente;
- nome, descrição e produto ficam legíveis;
- botões laterais não poluem a tela;
- rolagem e reprodução continuam funcionando;
- links Pesquisar, Criar, Mensagens e Perfil permanecem corretos.

## Estado funcional ainda não validado por completo

- Design System no feed
- Perfil completo
- Centro do Vendedor unificado
- Pedidos
- Comissões
- Produtos
- Minha Vitrine
- Marketplace
- Checkout completo
- Mensagens
- Notificações
- Carteira
- Stories em todas as áreas

Essas áreas não devem ser declaradas concluídas até teste real na URL pública.

## Problemas já identificados e resolvidos

1. Existiam duas aplicações paralelas: raiz antiga e versão moderna em `integration/`.
2. Atualizações eram feitas em arquivos que não eram os publicados.
3. O GitHub Pages usava GitHub Actions, mas o ambiente `github-pages` bloqueava a branch `main`.
4. A regra antiga autorizava somente `refactor/estrutura-profissional-v2`.
5. A branch `main` foi autorizada e o deploy passou a concluir com sucesso.
6. A página principal foi ajustada para abrir o feed.
7. O CSS consolidado era mínimo; foram adicionadas camadas visuais sem alterar a lógica.

## Regra de design a partir deste ponto

A lógica recuperada deve permanecer congelada enquanto o novo Design System é reconstruído.

Não alterar durante a fase visual:

- armazenamento;
- autenticação;
- pedidos;
- comissões;
- estoque;
- rotas;
- sincronização comercial;
- estrutura do GitHub Pages.

Ordem da fase visual:

1. Design System + Feed
2. Perfil
3. Marketplace
4. Centro do Vendedor
5. Checkout
6. Mensagens, notificações e carteira

Cada etapa deve ser testada antes da próxima.

## Próxima ação registrada

Aguardar o deploy do commit `0ea5fbbd7980f72b07368d420652ed8bcab793a4` e validar a URL pública.

Somente após aprovação do feed:

- registrar o resultado do teste;
- aplicar o Design System ao perfil, sem alterar lógica.

## Checklist antes de qualquer próxima mudança

- [x] Leu `PROJECT_RULES.md`
- [x] Leu `PROJECT_STATE.md`
- [x] Confirmou branch `main`
- [x] Confirmou arquivos oficiais
- [ ] Confirmou deploy verde desta entrega
- [x] Definiu alteração pequena
- [x] Preservou parâmetros e rotas
- [x] Registrou commits e URL de teste
