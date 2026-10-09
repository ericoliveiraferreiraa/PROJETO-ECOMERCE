// Carrinho guardado no navegador (localStorage). A API nao tem rota de carrinho:
// os itens so viram pedido no checkout, quando a lista e enviada em POST /pedidos.
const CHAVE = 'carrinho';

export function lerCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
  } catch {
    return [];
  }
}

function salvar(itens) {
  localStorage.setItem(CHAVE, JSON.stringify(itens));
  // avisa o resto da pagina (ex: o numero no icone do carrinho da Navbar)
  window.dispatchEvent(new Event('carrinho:atualizado'));
}

export function adicionarAoCarrinho(produto, quantidade = 1) {
  const itens = lerCarrinho();
  const existente = itens.find((item) => item.id_produto === produto.id_produto);

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
}

export function totalItensCarrinho() {
  return lerCarrinho().reduce((total, item) => total + item.quantidade, 0);
}
