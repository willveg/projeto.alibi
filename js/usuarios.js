// usuarios.js
// -----------------------------------------------------------------
// CRUD de usuários. Hoje persiste em localStorage via DB (storage.js).
// Quando o Firebase entrar: cadastro real ficará em Firebase Auth
// (e-mail/senha) + Firestore (nome, cargo, status), e este módulo
// passa a chamar essas APIs em vez de DB.getUsuarios()/saveUsuario().
// -----------------------------------------------------------------

const wrapUsuarios = document.getElementById('usuariosTableWrap');
let usuariosFiltro = '';

function cargoBadge(cargo) {
  return cargo === 'Admin Master'
    ? `<span class="badge badge-brass">${cargo}</span>`
    : `<span class="badge badge-olive">${cargo}</span>`;
}
function statusBadge(status) {
  return status === 'Ativo'
    ? `<span class="badge badge-olive">Ativo</span>`
    : `<span class="badge badge-muted">Inativo</span>`;
}

function renderUsuarios() {
  const usuarios = DB.getUsuarios()
    .filter(u => (u.nome + u.email).toLowerCase().includes(usuariosFiltro.toLowerCase()));

  if (usuarios.length === 0) {
    wrapUsuarios.innerHTML = `
      <div class="empty-state">
        <svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        <h3>Nenhum usuário encontrado</h3>
        <p>Cadastre operadores e administradores para liberar o acesso ao painel.</p>
      </div>`;
    return;
  }

  wrapUsuarios.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nome</th><th>E-mail</th><th>Cargo</th><th>Status</th><th class="actions-th">Ações</th>
        </tr>
      </thead>
      <tbody>
        ${usuarios.map(u => `
          <tr>
            <td>${u.nome}</td>
            <td class="num" style="color:var(--ink-muted)">${u.email}</td>
            <td>${cargoBadge(u.cargo)}</td>
            <td>${statusBadge(u.status)}</td>
            <td class="actions">
              <button class="icon-btn" data-edit="${u.id}" aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button class="icon-btn" data-delete="${u.id}" aria-label="Excluir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
              </button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  wrapUsuarios.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openUsuarioModal(b.dataset.edit)));
  wrapUsuarios.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => {
    const u = DB.getUsuarios().find(x => x.id === b.dataset.delete);
    askConfirm(`Excluir o usuário "${u.nome}"? Essa ação não pode ser desfeita.`, () => {
      DB.deleteUsuario(u.id);
      renderUsuarios();
      updateDashboardStats();
      showToast('Usuário excluído');
    });
  }));
}

function openUsuarioModal(id) {
  const form = document.getElementById('formUsuario');
  form.reset();
  document.getElementById('usuarioId').value = '';

  if (id) {
    const u = DB.getUsuarios().find(x => x.id === id);
    document.getElementById('modalUsuarioTitle').textContent = 'Editar usuário';
    document.getElementById('usuarioId').value = u.id;
    document.getElementById('usuarioNome').value = u.nome;
    document.getElementById('usuarioEmail').value = u.email;
    document.getElementById('usuarioCargo').value = u.cargo;
    document.getElementById('usuarioStatus').value = u.status;
  } else {
    document.getElementById('modalUsuarioTitle').textContent = 'Novo usuário';
  }
  openModal('modalUsuario');
}

document.getElementById('btnNovoUsuario').addEventListener('click', () => openUsuarioModal(null));

document.getElementById('formUsuario').addEventListener('submit', (e) => {
  e.preventDefault();
  const usuario = {
    id: document.getElementById('usuarioId').value || null,
    nome: document.getElementById('usuarioNome').value.trim(),
    email: document.getElementById('usuarioEmail').value.trim(),
    cargo: document.getElementById('usuarioCargo').value,
    status: document.getElementById('usuarioStatus').value,
  };
  DB.saveUsuario(usuario);
  closeModal('modalUsuario');
  renderUsuarios();
  updateDashboardStats();
  showToast('Usuário salvo com sucesso');
});

document.getElementById('searchUsuarios').addEventListener('input', (e) => {
  usuariosFiltro = e.target.value;
  renderUsuarios();
});

renderUsuarios();
