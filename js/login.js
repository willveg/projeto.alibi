// login.js
// -----------------------------------------------------------------
// Neste momento não há autenticação real: qualquer e-mail/senha
// preenchidos levam ao painel. Quando o Firebase for conectado,
// troque o bloco abaixo por firebase.auth().signInWithEmailAndPassword(...)
// e só redirecione em caso de sucesso.
// -----------------------------------------------------------------

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!email || !senha) return;

  // Placeholder de sessão local, apenas para a demonstração de frontend.
  localStorage.setItem('medida_session', JSON.stringify({ email, logadoEm: Date.now() }));

  window.location.href = 'dashboard.html';
});
