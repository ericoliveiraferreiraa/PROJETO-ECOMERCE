
const CHAVE = 'carrinho';

<<<<<<< HEAD
export function lerCarrinho() {
=======
function clienteLogado() {
  return Boolean(
    localStorage.getItem('token') &&
    localStorage.getItem('tipoUsuario') === 'cliente'
  );
}

export function lerCarrinho() {
  if (!clienteLogado()) {
    localStorage.removeItem(CHAVE);
    return [];
  }

>>>>>>> pagamento
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
  } catch {
    return [];
  }
}

function salvar(itens) {
<<<<<<< HEAD
=======
  if (!clienteLogado()) {
    localStorage.removeItem(CHAVE);
    window.dispatchEvent(new Event('carrinho:atualizado'));
    return;
  }

>>>>>>> pagamento
  localStorage.setItem(CHAVE, JSON.stringify(itens));
  window.dispatchEvent(new Event('carrinho:atualizado'));
}

export function adicionarAoCarrinho(produto, quantidade = 1) {
<<<<<<< HEAD
=======
  if (!clienteLogado()) return false;

>>>>>>> pagamento
  const itens = lerCarrinho();
  const existente = itens.find(
    (item) => item.id_produto === produto.id_produto
  );

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    itens.push({
      id_produto: produto.id_produto,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem ?? null,
      quantidade,
    });
  }

  salvar(itens);
<<<<<<< HEAD
=======
  return true;
>>>>>>> pagamento
}

export function atualizarQuantidade(idProduto, quantidade) {
  const itens = lerCarrinho().map((item) =>
    item.id_produto === idProduto
      ? { ...item, quantidade: Math.max(1, quantidade) }
      : item
  );

  salvar(itens);
}

export function removerDoCarrinho(idProduto) {
  salvar(
    lerCarrinho().filter((item) => item.id_produto !== idProduto)
  );
}

export function limparCarrinho() {
<<<<<<< HEAD
  salvar([]);
=======
  localStorage.removeItem(CHAVE);
  window.dispatchEvent(new Event('carrinho:atualizado'));
>>>>>>> pagamento
}

export function totalItensCarrinho() {
  return lerCarrinho().reduce(
    (total, item) => total + item.quantidade,
    0
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> pagamento
