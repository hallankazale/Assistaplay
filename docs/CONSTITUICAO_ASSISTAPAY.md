# Constituição do AssistaPay

Este documento estabelece as regras permanentes do projeto AssistaPay.

## 1. Preservação obrigatória

- Nenhuma atualização pode remover uma função existente sem decisão registrada.
- Toda melhoria anterior deve continuar disponível após novas alterações.
- Mudanças devem ser feitas em branch separada e revisadas antes de chegar à `main`.
- A versão funcional anterior deve permanecer recuperável pelo histórico do Git.

## 2. Referência visual

- As Imagens 1 a 10 são a especificação visual oficial do produto.
- Cada módulo deve ser implementado de forma progressiva até alcançar o padrão visual aprovado.
- Mudanças de design não podem quebrar regras de negócio, permissões ou dados.

## 3. Arquitetura modular

O sistema será dividido em módulos independentes:

- autenticação e perfis;
- feed de vídeos;
- algoritmo e recomendações;
- Shop e produtos;
- carrinho e checkout;
- carteira e recompensas;
- programa de afiliados;
- painel do anunciante;
- painel administrativo;
- antifraude, segurança e auditoria.

## 4. Perfis e permissões

- Usuário comum acessa feed, Shop, compras, carteira, perfil e afiliados autorizados.
- Anunciante acessa sua loja, produtos, campanhas, pedidos, relatórios e saldo.
- Uma conta pode possuir os papéis de usuário e anunciante simultaneamente.
- Administrador possui área separada e protegida.
- Nenhuma pessoa pode visualizar ou alterar dados privados de outra conta.

## 5. Regra financeira

- O app nunca pode pagar recompensas sem receita ou reserva correspondente.
- Toda campanha deve reservar previamente o valor destinado aos usuários.
- Saldos disponíveis, pendentes e bloqueados devem permanecer separados.
- Saques suspeitos devem passar por revisão antifraude.

## 6. Qualidade de entrega

Antes de qualquer versão:

1. executar testes de regressão;
2. conferir responsividade no celular;
3. verificar os três tipos de acesso;
4. atualizar o changelog;
5. atualizar o número da versão;
6. documentar alterações e riscos.

## 7. Segurança

- Nunca salvar senhas em texto puro na produção.
- Nunca colocar chaves secretas no frontend ou no GitHub.
- Dados financeiros e pessoais devem ser protegidos por regras no backend.
- Ações administrativas e financeiras devem gerar registros de auditoria.

## 8. Crescimento sustentável

Toda função deve ser planejada para crescer sem comprometer segurança, desempenho ou sustentabilidade financeira.