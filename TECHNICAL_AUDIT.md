# Auditoria técnica do AssistaPay

Data da auditoria: 2026-07-14

## Objetivo

Consolidar o AssistaPay em uma única aplicação oficial, evitar versões paralelas, preservar parâmetros de navegação e impedir novas alterações em arquivos ou diretórios incorretos.

## Fonte oficial

- Repositório: `hallankazale/Assistaplay`
- Branch: `main`
- Entradas públicas oficiais:
  - `index.html`
  - `app.html`
  - `feed.html`
- Base moderna em consolidação:
  - `integration/app-main.html`
  - módulos esperados em `src/`

## Diagnóstico confirmado

### 1. Existem duas aplicações diferentes

- Aplicação antiga na raiz: `index.html`, `app.js`, `style.css`.
- Aplicação moderna em `integration/`, com referências para módulos em `src/`.
- As duas usam estruturas e bancos locais diferentes.
- Funcionalidades de uma versão não aparecem automaticamente na outra.

### 2. A entrada moderna está incompleta

`integration/app-main.html` referencia vários arquivos essenciais que não existem atualmente na branch `main`.

Arquivos críticos confirmados como ausentes:

- `src/core/engine.js`
- `src/modules/feed/feed.ui.js`
- `src/modules/navigation/pages.ui.js`

Consequência: a interface moderna pode abrir, mas partes centrais não carregam ou caem na tela de erro de consolidação.

### 3. Alguns módulos novos existem isoladamente

Exemplo confirmado:

- `src/modules/seller/seller-commerce.ui.js`

Esse módulo existe, mas depende de outros módulos e serviços ausentes. Por isso, sua presença no repositório não garante funcionamento da tela completa.

### 4. O armazenamento está fragmentado

Aplicação antiga:

- `assistapay_db_v3_shop`

Aplicação moderna e módulos recentes:

- `ap:seller-products`
- `ap:orders`
- `ap:commissions`
- `ap:profile`
- outras chaves `ap:*`

Enquanto não houver migração explícita, dados salvos em uma versão não serão reconhecidos pela outra.

## Status por área

Legenda:

- ✅ Confirmado no código atual
- ⚠️ Existe parcialmente, mas depende de arquivos ausentes ou ainda não foi validado
- ❌ Bloqueado ou quebrado

### Estrutura e carregamento

- ✅ Repositório e branch oficiais definidos.
- ✅ Regras permanentes registradas em `PROJECT_RULES.md`.
- ✅ `app.html` preserva `location.search` e `location.hash`.
- ⚠️ `index.html` e `app.html` apontam para a versão moderna.
- ❌ Núcleo moderno incompleto por falta de arquivos essenciais.
- ❌ Não existe teste automatizado confiável cobrindo o GitHub Pages publicado.

### Feed

- ⚠️ Estrutura visual e módulos foram planejados e parcialmente criados.
- ❌ `src/modules/feed/feed.ui.js` está ausente.
- ❌ Feed moderno não pode ser considerado funcional até o módulo oficial ser restaurado e testado.

### Navegação e páginas

- ⚠️ `integration/app-main.html` possui roteamento por `view`.
- ❌ `src/modules/navigation/pages.ui.js` está ausente.
- ❌ Rotas padrão e páginas genéricas não podem ser consideradas funcionais.
- ⚠️ Parâmetros `view`, `tab`, `product` e `user` estão previstos, mas precisam ser testados após a restauração dos módulos.

### Sessão e autenticação

- ⚠️ A versão moderna referencia módulos de sessão e autenticação.
- ❌ O núcleo que inicia e registra módulos não está disponível de forma completa.
- ❌ Login moderno ainda não foi consolidado.

### Perfil, busca, mensagens e notificações

- ⚠️ Arquivos são referenciados por `integration/app-main.html`.
- ❌ Funcionamento não confirmado porque o núcleo moderno está incompleto.

### Stories

- ⚠️ Existem implementações recentes de `StoryService` e avatar com arco.
- ❌ Não considerar concluído.
- ❌ Deve ficar fora da prioridade até a base carregar corretamente.

### Shop, vitrine e afiliados

- ⚠️ Existem módulos e telas parciais.
- ❌ Não há fluxo ponta a ponta validado na aplicação oficial.
- ❌ Dados ainda estão distribuídos em chaves diferentes.

### Checkout

- ⚠️ Existe módulo de checkout referenciado.
- ❌ Não há teste ponta a ponta confirmado na aplicação oficial.
- ❌ Pedido, estoque e comissão não devem ser considerados sincronizados até a consolidação do banco.

### Centro do vendedor

- ✅ `src/modules/seller/seller-commerce.ui.js` existe.
- ⚠️ Possui produtos, pedidos e comissões em armazenamento local próprio.
- ❌ Ainda depende da aplicação moderna incompleta.
- ❌ Atalhos e abas ainda precisam ser testados na entrada oficial após a restauração do núcleo.

## Plano obrigatório de recuperação

### Fase 1 — Restaurar o núcleo moderno

- [ ] Localizar no histórico do Git a última versão válida de `src/core/engine.js`.
- [ ] Restaurar `src/core/engine.js` na `main`.
- [ ] Localizar e restaurar `src/modules/feed/feed.ui.js`.
- [ ] Localizar e restaurar `src/modules/navigation/pages.ui.js`.
- [ ] Verificar todos os arquivos CSS e JS referenciados por `integration/app-main.html`.
- [ ] Remover ou substituir referências para arquivos inexistentes.
- [ ] Confirmar que a aplicação abre sem erros de JavaScript.

### Fase 2 — Consolidar entrada e sessão

- [ ] Definir uma única tela oficial de login.
- [ ] Ligar login, sessão e logout à aplicação moderna.
- [ ] Preservar parâmetros após autenticação.
- [ ] Confirmar redirecionamento correto para feed, perfil e painel do vendedor.

### Fase 3 — Unificar armazenamento

- [ ] Definir um único esquema de dados.
- [ ] Criar serviço central de armazenamento.
- [ ] Migrar dados úteis de `assistapay_db_v3_shop` para o esquema moderno.
- [ ] Unificar produtos, pedidos, afiliados, comissões, perfil, carrinho e stories.
- [ ] Remover leituras duplicadas de várias chaves para a mesma função.

### Fase 4 — Validar tela por tela

- [ ] Feed.
- [ ] Perfil.
- [ ] Busca.
- [ ] Mensagens.
- [ ] Notificações.
- [ ] Criar publicação.
- [ ] Shop.
- [ ] Produto.
- [ ] Minha Vitrine.
- [ ] Centro do Vendedor.
- [ ] Minhas Vendas.
- [ ] Minhas Comissões.
- [ ] Checkout.
- [ ] Pedidos do comprador.
- [ ] Carteira.

### Fase 5 — Teste ponta a ponta do marketplace

- [ ] Vendedor cadastra produto.
- [ ] Produto aparece no Shop.
- [ ] Usuário se afilia.
- [ ] Produto aparece na vitrine.
- [ ] Afiliado vincula produto a uma publicação.
- [ ] Comprador finaliza pedido.
- [ ] Estoque é reduzido uma única vez.
- [ ] Pedido aparece para vendedor e comprador.
- [ ] Comissão fica pendente.
- [ ] Comissão é liberada somente após entrega.

## Ordem de prioridade

1. Restaurar arquivos essenciais ausentes.
2. Fazer a aplicação moderna abrir sem erros.
3. Consolidar sessão e navegação.
4. Unificar armazenamento.
5. Validar marketplace de ponta a ponta.
6. Somente depois retomar stories e melhorias visuais.

## Regra de conclusão

Nenhum item deste checklist será marcado como concluído apenas porque um commit foi criado. A conclusão exige:

1. arquivo presente na `main`;
2. dependências resolvidas;
3. rota correta;
4. teste manual na URL oficial;
5. confirmação do Hallan.
