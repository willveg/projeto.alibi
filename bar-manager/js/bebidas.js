// bebidas.js
// -----------------------------------------------------------------
// CRUD de bebidas + cálculo automático de custo. A regra é sempre:
//   custoPorMl   = preçoDeCompra / volumeDaEmbalagem(ml)
//   custoPorDose = custoPorMl * doseUsada(ml)
// Isso roda tanto no formulário (em tempo real, enquanto o usuário
// digita) quanto na tabela (a partir dos dados salvos).
// Quando o Firebase entrar, troque DB.getBebidas()/saveBebida() por
// leituras/escritas no Firestore, mantendo essas fórmulas.
// -----------------------------------------------------------------

const wrapBebidas = document.getElementById('bebidasTableWrap');
let bebidasFiltro = '';

function custoPorMl(b) {
  const v = Number(b.volume);
  return v > 0 ? Number(b.preco) / v : 0;
}
function custoPorDose(b) {
  return custoPorMl(b) * Number(b.dose || 0);
}
function dosesPorGarrafa(b) {
  return b.dose > 0 ? Math.floor(b.volume / b.dose) : 0;
}
function lucroPorDose(b) {
  return Number(b.precoVenda || 0) - custoPorDose(b);
}
function lucroPorMl(b) {
  const dose = Number(b.dose || 0);
  return dose > 0 ? lucroPorDose(b) / dose : 0;
}
function margemPercent(b) {
  const venda = Number(b.precoVenda || 0);
  return venda > 0 ? (lucroPorDose(b) / venda) * 100 : 0;
}

function categoriaBadgeClass(cat) {
  if (cat === 'Destilado') return 'badge-brass';
  if (cat === 'Cerveja') return 'badge-olive';
  return 'badge-muted';
}

function renderBebidas() {
  const bebidas = DB.getBebidas()
    .filter(b => (b.nome + b.categoria).toLowerCase().includes(bebidasFiltro.toLowerCase()));

  if (bebidas.length === 0) {
    wrapBebidas.innerHTML = `
      <div class="empty-state">
        <svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8l-1.2 7.5a1 1 0 0 0 .35.95L18 12.8a2 2 0 0 1 .7 1.9l-.8 5.2a1 1 0 0 1-1 .85H7.1a1 1 0 0 1-1-.85l-.8-5.2a2 2 0 0 1 .7-1.9l2.85-2.35a1 1 0 0 0 .35-.95L8 2Z"/></svg>
        <h3>Nenhuma bebida cadastrada</h3>
        <p>Cadastre uma bebida informando volume e preço de compra para calcular o custo por dose automaticamente.</p>
      </div>`;
    return;
  }

  wrapBebidas.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Bebida</th><th>Categoria</th><th>Volume</th><th>Preço compra</th>
          <th>Custo / ml</th><th>Dose</th><th>Custo / dose</th><th>Venda / dose</th>
          <th>Lucro / dose</th><th>Margem</th><th class="actions-th">Ações</th>
        </tr>
      </thead>
      <tbody>
        ${bebidas.map(b => `
          <tr>
            <td>${b.nome}</td>
            <td><span class="badge ${categoriaBadgeClass(b.categoria)}">${b.categoria}</span></td>
            <td class="num">${Number(b.volume).toLocaleString('pt-BR')} ml</td>
            <td class="num">${formatBRL(b.preco)}</td>
            <td class="num" style="color:var(--brass-strong)">${custoPorMl(b).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
            <td class="num">${b.dose} ml</td>
            <td class="num" style="color:var(--brass-strong)">${formatBRL(custoPorDose(b))}</td>
            <td class="num">${b.precoVenda ? formatBRL(b.precoVenda) : '—'}</td>
            <td class="num" style="color:var(--olive)">${b.precoVenda ? formatBRL(lucroPorDose(b)) : '—'}</td>
            <td class="num" style="color:var(--olive)">${b.precoVenda ? margemPercent(b).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%' : '—'}</td>
            <td class="actions">
              <button class="icon-btn" data-edit="${b.id}" aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button class="icon-btn" data-delete="${b.id}" aria-label="Excluir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
              </button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  wrapBebidas.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openBebidaModal(b.dataset.edit)));
  wrapBebidas.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => {
    const item = DB.getBebidas().find(x => x.id === b.dataset.delete);
    askConfirm(`Excluir a bebida "${item.nome}"? Essa ação não pode ser desfeita.`, () => {
      DB.deleteBebida(item.id);
      renderBebidas();
      updateDashboardStats();
      showToast('Bebida excluída');
    });
  }));
}

/* ---------------- Cálculo em tempo real no formulário ---------------- */
function updateCalcBox() {
  const volume = Number(document.getElementById('bebidaVolume').value) || 0;
  const preco = Number(document.getElementById('bebidaPreco').value) || 0;
  const dose = Number(document.getElementById('bebidaDose').value) || 0;
  const precoVenda = Number(document.getElementById('bebidaPrecoVenda').value) || 0;

  const mlCost = volume > 0 ? preco / volume : 0;
  const doseCost = mlCost * dose;
  const doses = dose > 0 ? Math.floor(volume / dose) : 0;

  const doseLucro = precoVenda - doseCost;
  const mlLucro = dose > 0 ? doseLucro / dose : 0;
  const margem = precoVenda > 0 ? (doseLucro / precoVenda) * 100 : 0;

  document.getElementById('calcPorMl').textContent = mlCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 });
  document.getElementById('calcPorDose').textContent = formatBRL(doseCost);
  document.getElementById('calcDosesPorGarrafa').textContent = doses;

  document.getElementById('calcLucroPorMl').textContent = mlLucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 });
  document.getElementById('calcLucroPorDose').textContent = formatBRL(doseLucro);
  document.getElementById('calcMargem').textContent = margem.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
}
['bebidaVolume', 'bebidaPreco', 'bebidaDose', 'bebidaPrecoVenda'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateCalcBox);
});

function openBebidaModal(id) {
  const form = document.getElementById('formBebida');
  form.reset();
  document.getElementById('bebidaId').value = '';

  if (id) {
    const b = DB.getBebidas().find(x => x.id === id);
    document.getElementById('modalBebidaTitle').textContent = 'Editar bebida';
    document.getElementById('bebidaId').value = b.id;
    document.getElementById('bebidaNome').value = b.nome;
    document.getElementById('bebidaCategoria').value = b.categoria;
    document.getElementById('bebidaVolume').value = b.volume;
    document.getElementById('bebidaPreco').value = b.preco;
    document.getElementById('bebidaDose').value = b.dose;
    document.getElementById('bebidaPrecoVenda').value = b.precoVenda || '';
  } else {
    document.getElementById('modalBebidaTitle').textContent = 'Nova bebida';
  }
  updateCalcBox();
  openModal('modalBebida');
}

document.getElementById('btnNovaBebida').addEventListener('click', () => openBebidaModal(null));

document.getElementById('formBebida').addEventListener('submit', (e) => {
  e.preventDefault();
  const bebida = {
    id: document.getElementById('bebidaId').value || null,
    nome: document.getElementById('bebidaNome').value.trim(),
    categoria: document.getElementById('bebidaCategoria').value,
    volume: Number(document.getElementById('bebidaVolume').value),
    preco: Number(document.getElementById('bebidaPreco').value),
    dose: Number(document.getElementById('bebidaDose').value),
    precoVenda: Number(document.getElementById('bebidaPrecoVenda').value) || 0,
  };
  DB.saveBebida(bebida);
  closeModal('modalBebida');
  renderBebidas();
  updateDashboardStats();
  showToast('Bebida salva com sucesso');
});

document.getElementById('searchBebidas').addEventListener('input', (e) => {
  bebidasFiltro = e.target.value;
  renderBebidas();
});

renderBebidas();
