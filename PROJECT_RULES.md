# Regras permanentes do projeto AssistaPay

Estas regras devem ser seguidas em toda alteração futura do projeto.

## Fonte oficial

- Repositório oficial: `hallankazale/Assistaplay`
- Branch oficial: `main`
- Aplicação oficial em consolidação: versão moderna em `integration/` com módulos em `src/`
- Entradas públicas oficiais na raiz: `index.html`, `app.html` e `feed.html`
- Não criar uma terceira versão paralela do aplicativo.

## Caminhos e navegação

- Preservar sempre `location.search` e `location.hash` em redirecionamentos.
- Parâmetros como `view`, `tab`, `product`, `user` e versões de cache não podem ser descartados.
- Antes de alterar um link, confirmar que o arquivo de destino existe na branch `main`.
- Links internos da versão moderna devem usar apenas caminhos compatíveis com a estrutura oficial.
- Nunca afirmar que uma rota funciona sem conferir o arquivo carregado e o destino real.

## Integridade das atualizações

- Toda atualização deve preservar funcionalidades já aprovadas.
- Não duplicar serviços, módulos, páginas ou chaves de armazenamento.
- Uma funcionalidade deve ter uma única fonte de dados.
- Não misturar dados da aplicação antiga com a moderna sem uma migração explícita.
- Antes de criar função nova, verificar se já existe implementação equivalente.

## Processo obrigatório

1. Ler os arquivos atuais antes de editar.
2. Fazer uma alteração pequena e rastreável.
3. Confirmar os caminhos afetados.
4. Informar os arquivos e o commit alterados.
5. Marcar como concluído somente após teste confirmado.

## Estado atual da consolidação

- A versão antiga da raiz e a versão moderna em `integration/` foram identificadas como aplicações diferentes.
- `app.html` e `feed.html` na raiz devem servir apenas como entradas oficiais da versão moderna.
- A consolidação da navegação, sessão, armazenamento e módulos deve ser concluída antes de novas funcionalidades grandes.
