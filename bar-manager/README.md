# Medida — Gestão de Bar (protótipo de frontend)

Painel para controlar bebidas, dosagens e custo do bar. Este é o **frontend puro**, sem backend — os dados ficam salvos no `localStorage` do navegador só para a tela não nascer vazia enquanto você desenvolve. A conexão com o Firebase (Authentication + Firestore + Hosting) fica para a próxima etapa, como combinado.

## Estrutura do projeto

```
bar-manager/
├── index.html          → tela de login (visual pronto, sem autenticação real ainda)
├── dashboard.html       → aplicação principal (sidebar + abas)
├── css/
│   ├── tokens.css       → paleta de cores, tipografia, variáveis globais
│   ├── login.css        → estilos exclusivos da tela de login
│   └── app.css          → sidebar, tabelas, cards, modais, etc.
└── js/
    ├── storage.js        → camada de dados (hoje: localStorage / amanhã: Firestore)
    ├── login.js           → lógica do formulário de login
    ├── app.js             → sidebar retrátil, navegação entre abas, modais, toasts
    ├── usuarios.js        → CRUD da aba Cadastros → Usuários
    └── bebidas.js         → CRUD da aba Cadastros → Bebidas (com cálculo de custo)
```

## Como rodar no VS Code

1. Abra a pasta `bar-manager` no VS Code.
2. Instale a extensão **Live Server** (Ritwick Dey).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.
4. Faça login com qualquer e-mail/senha (é só um protótipo visual) para cair no `dashboard.html`.

Nenhuma instalação de dependências é necessária — é HTML/CSS/JS puro, o que também facilita o deploy futuro no **Firebase Hosting** (que serve arquivos estáticos diretamente, sem etapa de build).

## O que já funciona

- **Sidebar retrátil** com animação de abrir/fechar e sub-menus em acordeão (aba **Cadastros** com as sub-abas **Usuários** e **Bebidas**, como pedido).
- **Cadastro de Usuários**: nome, e-mail, cargo (**Operador** / **Admin Master**) e status — pronto para plugar no Firebase Authentication + Firestore depois.
- **Cadastro de Bebidas** com cálculo automático de custo e lucro:
  - `custo por ml = preço de compra ÷ volume da embalagem`
  - `custo por dose = custo por ml × dose padrão (ml)`
  - `lucro por dose = preço de venda da dose − custo por dose`
  - `lucro por ml = lucro por dose ÷ dose padrão (ml)`
  - `margem = lucro por dose ÷ preço de venda da dose × 100`
  - Esses valores são recalculados **em tempo real** enquanto você digita no formulário, e também aparecem na listagem. O preço de venda é opcional — sem ele, as colunas de lucro/margem ficam em branco (`—`).
- Busca, edição e exclusão (com confirmação) nas duas tabelas.
- Tela de **Visão geral** com indicadores (bebidas cadastradas, usuários, custo médio por dose, valor total em estoque, lucro médio por dose).

## Próxima etapa: conectar ao Firebase

Quando for a hora de integrar:

1. Criar um projeto no [Firebase Console](https://console.firebase.google.com/) (plano gratuito **Spark** cobre esse uso).
2. Ativar **Authentication** (e-mail/senha) e criar as regras de acesso por cargo (Operador vs Admin Master).
3. Ativar **Firestore** e migrar as coleções `usuarios` e `bebidas` — as funções em `js/storage.js` já estão isoladas exatamente para isso: troque o conteúdo de cada função (`getUsuarios`, `saveUsuario`, `getBebidas`, `saveBebida`, etc.) por chamadas ao Firestore, mantendo a mesma assinatura, e o resto do app continua funcionando sem alterações.
4. Rodar `firebase init hosting` e `firebase deploy` para publicar gratuitamente.

Qualquer um desses passos, posso te ajudar a implementar quando você quiser seguir para essa parte.
