# Arquitetura e roadmap do AssistaPay

## Estado atual

O protótipo funcional utiliza HTML, CSS, JavaScript e armazenamento local do navegador. Essa versão é válida para demonstração e validação da experiência, mas não deve processar dinheiro real nem dados sensíveis em produção.

## Estrutura planejada

```text
AssistaPay/
├── docs/
├── frontend/
│   ├── src/
│   │   ├── core/
│   │   ├── components/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── feed/
│   │   │   ├── shop/
│   │   │   ├── checkout/
│   │   │   ├── wallet/
│   │   │   ├── affiliates/
│   │   │   ├── advertiser/
│   │   │   └── admin/
│   │   └── styles/
├── backend/
│   ├── auth/
│   ├── users/
│   ├── media/
│   ├── campaigns/
│   ├── products/
│   ├── orders/
│   ├── payments/
│   ├── wallet/
│   ├── affiliates/
│   ├── recommendations/
│   └── audit/
├── database/
├── tests/
└── .github/workflows/
```

## Regra de migração

O protótipo atual continuará funcionando durante a reorganização. Os módulos serão extraídos um de cada vez. Cada extração deverá manter os mesmos seletores, fluxos e chaves de armazenamento até existir uma migração explícita.

## Fases

### Fase 1 — Proteção da base
- documentação permanente;
- branch de desenvolvimento;
- checklist de regressão;
- changelog e versionamento;
- preservação da versão funcional atual.

### Fase 2 — Design idêntico aos protótipos
- tela inicial;
- feed;
- Shop;
- carteira;
- afiliados;
- painel do anunciante;
- painel administrativo.

### Fase 3 — Modularização do frontend
- separar estado, armazenamento e interface;
- criar componentes reutilizáveis;
- criar rotas por perfil;
- eliminar dependências globais desnecessárias.

### Fase 4 — Backend real
- autenticação segura;
- banco de dados;
- armazenamento de vídeos e imagens;
- permissões por usuário e anunciante;
- registros financeiros imutáveis;
- antifraude e auditoria.

### Fase 5 — Marketplace operacional
- pedidos;
- estoque;
- checkout;
- pagamentos;
- repasses;
- comissões de afiliados;
- cancelamentos, devoluções e suporte.

### Fase 6 — Algoritmo
- eventos de visualização e retenção;
- perfil de interesses;
- recomendação por relevância;
- diversidade de conteúdo;
- limites para não repetir anúncios;
- painel de transparência e preferências.

### Fase 7 — Escala e produção
- testes automatizados;
- observabilidade;
- backups;
- proteção contra abuso;
- termos, privacidade e conformidade legal;
- publicação web e aplicativo Android.

## Fluxo de desenvolvimento

1. criar issue;
2. criar branch específica;
3. alterar apenas o módulo necessário;
4. executar regressão;
5. abrir pull request;
6. revisar diferenças;
7. aprovar e mesclar;
8. criar versão de lançamento.