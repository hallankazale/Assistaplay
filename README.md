# AssistaPay

App web MVP de anúncios recompensados.

## Como testar
Abra o arquivo `index.html` no navegador.

Contas de teste:
- Usuário: user@teste.com / 1234
- Anunciante: anunciante@teste.com / 1234
- Admin: admin@teste.com / 1234

## O que já tem
- Login e cadastro
- Feed de vídeos
- Curtir, compartilhar, clicar no produto
- Validação de visualização com 80% do vídeo + pergunta
- Pontos e carteira
- Solicitação de saque Pix manual
- Painel do anunciante
- Painel admin para aprovar campanhas e saques
- Algoritmo simples por interesse/categoria
- Regra financeira: 50% recompensa, 25% plataforma, 15% reserva, 10% custos

## Observação
Esta versão usa localStorage, ou seja, salva os dados no próprio navegador. Para produção, trocar por Firebase/Supabase e criar regras de segurança.
