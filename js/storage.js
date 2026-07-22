// storage.js
// -----------------------------------------------------------------
// Camada de dados. Hoje tudo é salvo em localStorage para o
// protótipo funcionar sem backend. Quando o Firebase entrar,
// cada função aqui deve virar uma chamada ao Firestore
// (ex.: db.collection('bebidas').get() / .add() / .update() / .delete()),
// mantendo a mesma assinatura para não precisar tocar no restante do app.
// -----------------------------------------------------------------

const DB = {
  KEYS: { usuarios: 'medida_usuarios', bebidas: 'medida_bebidas' },

  _read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erro ao ler storage', key, e);
      return [];
    }
  },
  _write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  _uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // ---------- Usuários ----------
  getUsuarios() { return this._read(this.KEYS.usuarios); },
  saveUsuario(usuario) {
    const list = this.getUsuarios();
    if (usuario.id) {
      const i = list.findIndex(u => u.id === usuario.id);
      if (i > -1) list[i] = usuario;
    } else {
      usuario.id = this._uid();
      list.push(usuario);
    }
    this._write(this.KEYS.usuarios, list);
    return usuario;
  },
  deleteUsuario(id) {
    this._write(this.KEYS.usuarios, this.getUsuarios().filter(u => u.id !== id));
  },

  // ---------- Bebidas ----------
  getBebidas() { return this._read(this.KEYS.bebidas); },
  saveBebida(bebida) {
    const list = this.getBebidas();
    if (bebida.id) {
      const i = list.findIndex(b => b.id === bebida.id);
      if (i > -1) list[i] = bebida;
    } else {
      bebida.id = this._uid();
      list.push(bebida);
    }
    this._write(this.KEYS.bebidas, list);
    return bebida;
  },
  deleteBebida(id) {
    this._write(this.KEYS.bebidas, this.getBebidas().filter(b => b.id !== id));
  },

  // ---------- Seed (apenas na primeira vez, para o painel não nascer vazio) ----------
  seedIfEmpty() {
    if (this.getUsuarios().length === 0) {
      this._write(this.KEYS.usuarios, [
        { id: this._uid(), nome: 'Camila Souza', email: 'camila@bar.com', cargo: 'Admin Master', status: 'Ativo' },
        { id: this._uid(), nome: 'Rafael Lima', email: 'rafael@bar.com', cargo: 'Operador', status: 'Ativo' },
      ]);
    }
    if (this.getBebidas().length === 0) {
      this._write(this.KEYS.bebidas, [
        { id: this._uid(), nome: 'Vodka Nacional', categoria: 'Destilado', volume: 1000, preco: 45.90, dose: 50, precoVenda: 18.00 },
        { id: this._uid(), nome: 'Gin London Dry', categoria: 'Destilado', volume: 750, preco: 89.90, dose: 40, precoVenda: 28.00 },
        { id: this._uid(), nome: 'Chopp Pilsen (barril)', categoria: 'Cerveja', volume: 30000, preco: 420.00, dose: 300, precoVenda: 14.00 },
      ]);
    }
  }
};

DB.seedIfEmpty();
