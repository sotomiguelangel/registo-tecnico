# Configuração e diagnóstico da API

## O que este repositório publica

Este repositório publica apenas o frontend. O único ficheiro Apps Script versionado,
`14_PerformanceStability.gs`, contém helpers e **não** contém `doGet`, `doPost` nem
o dispatcher das ações (`login`, `saveBatch`, `bootstrap`, etc.). Portanto, uma
alteração neste repositório não publica nem atualiza o backend Google Sheets.

O frontend exige uma URL de Web App no formato:

```text
https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
```

O frontend usa o deployment configurado no repositório; não aceita overrides por
`window.__APP_CONFIG__.API_URL` nem por `localStorage`. URLs de editor (`/edit`),
login, `/dev` e páginas HTML são rejeitadas antes de qualquer pedido.

O backend completo está versionado em `backend-apps-script.gs`; copie o conteúdo
integral desse ficheiro para o projeto Apps Script antes de criar a implementação.

Para tickets, o backend Apps Script usa exatamente o mesmo catálogo do frontend:
`Canalização`, `Portas/Fechaduras`, `Acabamentos/Decoração`,
`Climatização`, `Casa de Banho`, `Outros`, `Elétrico`, `Cortinados`,
`Cozinha/Equipamento`, `Amenities/Acessórios`, `Mobiliário`,
`Pintura Preventiva`, `Limpeza/Manutenção Geral`, `Equipamento` e `Minibar`.

## Procedimento de publicação

1. Abra a folha Google Sheets usada pela aplicação e **Extensões → Apps Script**.
2. Importe o projeto completo do backend, incluindo o dispatcher `doGet`/`doPost`,
   validação de token/categoria e a ação `saveBatch`.
3. Execute **Implementar → Nova implementação → Aplicação Web**.
4. Selecione execução como o proprietário e acesso **Qualquer utilizador** (ou
   publique uma política CORS/autenticação equivalente).
5. Copie o URL terminado em `/exec`, atualize a constante de configuração nos
   ficheiros `js/config.js` e `js/runtime-config.js`, e recarregue sem cache.
6. Verifique a implementação com um pedido GET/POST de `health` ou `login`.
   Uma resposta válida deve ter `Content-Type: application/json` e um objeto JSON
   com `ok`. 404, HTML, login Google ou `ok: false` são falhas e não são tratados
   como sucesso.

Durante a investigação, o deployment atualmente configurado respondeu HTTP 200
com JSON `{"ok":false,"code":"BAD_REQUEST","error":"Ação ausente"}`. Isso prova
que essa URL `/exec` está acessível neste momento, mas não prova que o código
Apps Script correto esteja publicado. Um 404 HTML em produção indica URL de
deployment errada, deployment removido ou uma página de autenticação/proxy; a
correção é publicar/selecionar a versão correta no Apps Script, não alterar o
resultado para sucesso.
