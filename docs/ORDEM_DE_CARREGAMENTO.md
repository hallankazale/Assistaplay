# Ordem segura de carregamento

A nova arquitetura deve ser carregada nesta ordem, antes do `app.js` legado:

```html
<script src="src/core/config.js"></script>
<script src="src/core/storage.js"></script>
<script src="src/core/permissions.js"></script>
<script src="src/core/auth.js"></script>
<script src="src/core/migrations.js"></script>
<script src="src/core/database.js"></script>
<script src="src/core/events.js"></script>
<script src="src/core/features.js"></script>
<script src="src/core/router.js"></script>
<script src="src/core/engine.js"></script>
<script src="src/core/logger.js"></script>
<script src="src/adapters/legacy-auth-adapter.js"></script>
<script src="src/adapters/legacy-navigation-adapter.js"></script>
<script src="src/bootstrap.js"></script>
<script>
  window.AssistaPay.bootstrap.startCompatibilityMode();
</script>
<script src="app.js"></script>
```

## Regra de segurança

Inicialmente, os adaptadores devem permanecer apenas disponíveis, sem chamar `start()`. Isso impede eventos duplicados enquanto o `app.js` ainda controla autenticação e navegação.

A ativação deve ocorrer por etapas:

1. carregar os módulos passivamente;
2. validar login de usuário, anunciante e administrador;
3. ativar o adaptador de autenticação em branch separada;
4. remover apenas a lógica equivalente do `app.js`;
5. executar regressão;
6. ativar o adaptador de navegação;
7. executar nova regressão.

Nunca ativar os dois adaptadores e remover o código antigo no mesmo commit.