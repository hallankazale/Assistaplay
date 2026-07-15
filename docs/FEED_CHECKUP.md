# Check-up do Feed AssistaPay

Data: 14/07/2026

## Corrigido nesta revisão

- Comentário não abre mais Mensagens.
- Comentários agora abrem em painel próprio do post.
- Comentários são persistidos em `ap:feed-comments`.
- Contador de comentários é atualizado após o envio.
- Salvamento duplicado foi removido da entrada oficial.
- A única fonte de salvos no feed passou a ser `profileFavorites`.
- Curtir continua persistido em `ap:feed-likes`.
- Compartilhar usa compartilhamento nativo e tenta copiar o link quando necessário.
- Botão de produto preserva o parâmetro `product` no checkout.
- Botões Criar, Pesquisar, Mensagens e Perfil usam as entradas oficiais.
- Mídia vazia mantém uma tela de fallback em vez de ficar preta.
- Cache dos módulos do feed foi versionado na entrada oficial.

## Arquivos oficiais desta revisão

- `src/modules/feed/feed.ui.js`
- `src/modules/feed/feed-comments.js`
- `src/styles/feed-comments.css`
- `integration/feed-preview.html`

## Pontos que ainda exigem validação visual no celular

- Altura do painel de comentários com teclado aberto.
- Compartilhamento em navegadores sem `navigator.share`.
- Reprodução automática após fechar comentários.
- Posicionamento da coluna de ações em aparelhos com tela pequena.
- Filtro real da aba `Seguindo`; nesta revisão ela apenas possui estado visual e não altera a lista.

A etapa não deve ser marcada como aprovada antes do teste na URL pública.