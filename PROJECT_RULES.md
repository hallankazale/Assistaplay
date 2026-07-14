# Regras permanentes do projeto AssistaPay

Estas regras são obrigatórias em toda alteração futura do projeto. O objetivo é impedir perda de contexto, duplicação de versões, mudanças de configuração contraditórias e regressões.

## Fonte oficial

- Repositório oficial: `hallankazale/Assistaplay`
- Branch oficial de desenvolvimento e publicação: `main`
- Aplicação oficial: versão moderna em `integration/`, usando módulos em `src/`
- Entradas públicas oficiais na raiz: `index.html`, `feed.html` e `app.html`
- Não criar uma terceira versão paralela do aplicativo.
- Não voltar a desenvolver na aplicação antiga.

## Publicação no GitHub Pages

- Source do GitHub Pages: `GitHub Actions`.
- Workflow oficial: `.github/workflows/pages.yml`.
- O workflow publica o conteúdo da branch `main`.
- Ambiente de publicação: `github-pages`.
- A regra de Deployment branches and tags do ambiente `github-pages` deve permitir a branch `main`.
- Não trocar a branch autorizada sem registrar a mudança em `PROJECT_STATE.md`.
- Um commit não deve ser considerado publicado apenas porque existe na `main`; é obrigatório confirmar o deploy verde em Actions ou validar a URL pública.

## Caminhos oficiais

- `/` abre o feed por meio de `index.html`.
- `/feed.html` direciona para `integration/feed-preview.html`.
- `/app.html` direciona para `integration/app-main.html` e preserva parâmetros.
- `integration/app.html` existe apenas como redirecionamento de compatibilidade para `integration/app-main.html`.
- Preservar sempre `location.search` e `location.hash` em redirecionamentos.
- Parâmetros como `view`, `tab`, `product`, `user` e versões de cache não podem ser descartados.
- Antes de alterar um link, confirmar que o arquivo de destino existe na branch `main`.
- Links internos da versão moderna devem usar somente as entradas oficiais da raiz ou caminhos comprovadamente válidos.

## Estrutura e responsabilidades

- `integration/feed-preview.html`: entrada visual do feed.
- `integration/app-main.html`: entrada das páginas internas.
- `src/core/`: núcleo da aplicação.
- `src/modules/`: funcionalidades e telas.
- `src/styles/consolidated.css`: base visual consolidada.
- `src/styles/visual-refresh.css`: camada atual de refinamento visual.
- Cada funcionalidade deve possuir uma única implementação oficial.
- Não duplicar serviços, módulos, páginas, listeners globais ou chaves de armazenamento.
- Não misturar a base antiga com a moderna sem uma migração documentada.

## Proteção contra regressões

- Toda alteração deve preservar funcionalidades já aprovadas.
- Antes de editar, ler o arquivo atual diretamente da branch `main`.
- Nunca substituir um arquivo grande sem conhecer todas as responsabilidades dele.
- Alterações visuais não podem alterar regras de negócio, rotas, banco, pedidos, comissões ou autenticação.
- Alterações de lógica não podem substituir o design inteiro sem necessidade.
- Não afirmar que algo está pronto sem confirmar o deploy e o teste real.

## Processo obrigatório de cada mudança

1. Ler os arquivos atuais antes de editar.
2. Identificar a fonte oficial da funcionalidade.
3. Fazer uma alteração pequena e rastreável.
4. Confirmar caminhos, parâmetros e dependências afetados.
5. Registrar arquivos e commit alterados.
6. Atualizar `PROJECT_STATE.md` quando a mudança afetar arquitetura, configuração, rotas, deploy ou estado funcional.
7. Esperar o deploy da Action terminar.
8. Testar a URL pública com parâmetro de cache quando necessário.
9. Marcar como concluído somente após confirmação real.

## Registro obrigatório

Para toda alteração importante, registrar no repositório:

- data;
- objetivo;
- arquivos alterados;
- commit;
- configuração afetada;
- URL de teste;
- resultado do teste;
- pendências encontradas.

O estado atual deve ficar em `PROJECT_STATE.md`. O histórico de alterações deve ficar nos commits e, quando necessário, em um changelog futuro.

## Regra de continuidade

Antes de continuar o desenvolvimento em outra conversa ou outro dia:

1. Ler `PROJECT_RULES.md`.
2. Ler `PROJECT_STATE.md`.
3. Conferir a branch `main`.
4. Conferir o último deploy em Actions.
5. Continuar somente da próxima ação registrada.

Nenhuma configuração do GitHub deverá ser solicitada novamente ao Hallan sem primeiro consultar esses registros e verificar se ela já foi feita.