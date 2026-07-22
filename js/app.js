// app.js
// -----------------------------------------------------------------
// Estrutura geral do painel: sidebar retrátil, navegação entre
// abas/sub-abas e utilitários (modal, toast, confirmação) usados
// pelos módulos usuarios.js e bebidas.js.
// -----------------------------------------------------------------

const appRoot = document.getElementById('appRoot');

/* ---------------- Sidebar: recolher / expandir ---------------- */
const sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.addEventListener('click', () => {
  appRoot.classList.toggle('collapsed');
  localStorage.setItem('medida_sidebar_collapsed', appRoot.classList.contains('collapsed'));
});
if (localStorage.getItem('medida_sidebar_collapsed') === 'true') {
  appRoot.classList.add('collapsed');
}

/* ---------------- Sidebar: menu mobile ---------------- */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
function syncMobileButton() {
  mobileMenuBtn.style.display = window.innerWidth <= 780 ? 'flex' : 'none';
}
syncMobileButton();
window.addEventListener('resize', syncMobileButton);
mobileMenuBtn.addEventListener('click', () => appRoot.classList.toggle('mobile-open'));

/* ---------------- Sub-menu "Cadastros" ---------------- */
const cadastrosParent = document.getElementById('cadastrosParent');
const cadastrosSub = document.getElementById('cadastrosSub');
cadastrosParent.addEventListener('click', () => {
  const isOpen = cadastrosSub.classList.toggle('open');
  cadastrosParent.setAttribute('aria-expanded', isOpen);
});

/* ---------------- Roteamento de views ---------------- */
const TITLES = {
  dashboard: { title: 'Visão geral', crumb: 'MEDIDA / VISÃO GERAL' },
  usuarios: { title: 'Usuários', crumb: 'MEDIDA / CADASTROS / USUÁRIOS' },
  bebidas: { title: 'Bebidas', crumb: 'MEDIDA / CADASTROS / BEBIDAS' },
};

function goToView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name)?.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-target="${name}"]`)?.classList.add('active');

  const meta = TITLES[name];
  if (meta) {
    document.getElementById('pageTitle').textContent = meta.title;
    document.getElementById('crumbs').textContent = meta.crumb;
  }

  if (name === 'dashboard') updateDashboardStats();
  appRoot.classList.remove('mobile-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link[data-target]').forEach(link => {
  link.addEventListener('click', () => goToView(link.dataset.target));
});

/* ---------------- Modal helpers ---------------- */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
});
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal(backdrop.id);
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
  }
});

/* ---------------- Toast ---------------- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------------- Confirmação de exclusão ---------------- */
let confirmCallback = null;
function askConfirm(text, onConfirm) {
  document.getElementById('confirmText').textContent = text;
  confirmCallback = onConfirm;
  openModal('modalConfirm');
}
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  closeModal('modalConfirm');
});

/* ---------------- Formatação ---------------- */
function formatBRL(n) {
  return (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ---------------- Estatísticas do dashboard ---------------- */
function updateDashboardStats() {
  const bebidas = DB.getBebidas();
  const usuarios = DB.getUsuarios();

  document.getElementById('statBebidas').textContent = bebidas.length;
  document.getElementById('statUsuarios').textContent = usuarios.length;

  const custos = bebidas.map(b => (b.preco / b.volume) * b.dose).filter(v => !isNaN(v) && isFinite(v));
  const custoMedio = custos.length ? custos.reduce((a, b) => a + b, 0) / custos.length : 0;
  document.getElementById('statCustoMedio').textContent = formatBRL(custoMedio);

  const valorEstoque = bebidas.reduce((acc, b) => acc + (Number(b.preco) || 0), 0);
  document.getElementById('statValorEstoque').textContent = formatBRL(valorEstoque);

  const lucros = bebidas
    .filter(b => Number(b.precoVenda) > 0)
    .map(b => Number(b.precoVenda) - (b.preco / b.volume) * b.dose)
    .filter(v => !isNaN(v) && isFinite(v));
  const lucroMedio = lucros.length ? lucros.reduce((a, b) => a + b, 0) / lucros.length : 0;
  document.getElementById('statLucroMedio').textContent = formatBRL(lucroMedio);
}

updateDashboardStats();
