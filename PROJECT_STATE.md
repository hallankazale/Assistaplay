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

Parâmetros obrigatórios a preservar:

- `view`
- `tab`
- `product`
- `user`
- parâmetros de cache/versionamento

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
- `src/styles/visual-refresh.css`: camada de cores e refinamento atual

## Estado funcional confirmado

- O feed oficial abre pela URL principal.
- O deploy automático voltou a funcionar pela branch `main`.
- O feed carrega e a navegação básica funciona.
- O visual voltou parcialmente após a camada `visual-refresh.css`.
- Ainda falta reconstruir o design completo que existia antes.

## Estado funcional ainda não validado por completo

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
7. O CSS consolidado era mínimo; foi adicionada a camada `visual-refresh.css`.

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

A fase visual deverá trabalhar por camadas e em pequenas entregas:

1. Design System
2. Feed
3. Perfil
4. Marketplace
5. Centro do Vendedor
6. Checkout
7. Mensagens, notificações e carteira

Cada etapa deve ser testada antes da próxima.

## Próxima ação registrada

Criar o Design System oficial sem substituir a lógica atual.

Primeira entrega visual:

- definir tokens de cor;
- tipografia;
- espaçamento;
- botões;
- cartões;
- navegação inferior;
- ícones e estados;
- aplicar primeiro somente ao feed;
- publicar e validar antes de alterar o perfil.

## Últimos commits de documentação

- `9d1c9cf4606e62132209e43be986aadbbd701431` — reforço das regras permanentes
- commit deste arquivo — registro do estado atual

## Checklist antes de qualquer próxima mudança

- [ ] Leu `PROJECT_RULES.md`
- [ ] Leu `PROJECT_STATE.md`
- [ ] Confirmou branch `main`
- [ ] Confirmou arquivos oficiais
- [ ] Confirmou último deploy
- [ ] Definiu alteração pequena
- [ ] Preservou parâmetros e rotas
- [ ] Registrou commit e teste
