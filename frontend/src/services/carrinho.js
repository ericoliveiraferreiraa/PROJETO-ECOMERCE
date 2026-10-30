
const CHAVE = 'carrinho';

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

  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
  } catch {
    return [];
  }
}

export function sincronizarEstoqueDoCarrinho(produtos) {
  const produtosPorId = new Map(
    produtos.map((produto) => [String(produto.id_produto), produto])
  );

  const itens = lerCarrinho().map((item) => {
    const produto = produtosPorId.get(String(item.id_produto));
    const estoque = Math.max(0, Number(produto?.estoque || 0));

    return {
      ...item,
      estoque,
      quantidade:
        estoque > 0
          ? Math.min(Number(item.quantidade) || 1, estoque)
          : 0,
    };
  });

  salvar(itens);
  return itens;
}

function salvar(itens) {
  if (!clienteLogado()) {
    localStorage.removeItem(CHAVE);
    window.dispatchEvent(new Event('carrinho:atualizado'));
    return;
  }

  localStorage.setItem(CHAVE, JSON.stringify(itens));
  window.dispatchEvent(new Event('carrinho:atualizado'));
}

export function adicionarAoCarrinho(produto, quantidade = 1) {
  if (!clienteLogado()) return false;

  const itens = lerCarrinho();
  const existente = itens.find(
    (item) => item.id_produto === produto.id_produto
  );
  const estoqueInformado =
    produto.estoque !== null && produto.estoque !== undefined;
  const estoque = estoqueInformado ? Number(produto.estoque) : null;
  const quantidadeSolicitada = Number(quantidade);
  const quantidadeAtual = Number(existente?.quantidade || 0);

  if (
    !Number.isInteger(quantidadeSolicitada) ||
    quantidadeSolicitada < 1 ||
    (estoqueInformado && (!Number.isInteger(estoque) || estoque < 1)) ||
    (estoqueInformado && quantidadeAtual + quantidadeSolicitada > estoque)
  ) {
    return false;
  }

  if (existente) {
    existente.quantidade = quantidadeAtual + quantidadeSolicitada;
    if (estoqueInformado) existente.estoque = estoque;
  } else {
    itens.push({
      id_produto: produto.id_produto,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem ?? null,
      quantidade: quantidadeSolicitada,
      ...(estoqueInformado ? { estoque } : {}),
    });
  }

  salvar(itens);
  return true;
}

export function atualizarQuantidade(idProduto, quantidade) {
  const itens = lerCarrinho().map((item) => {
    if (item.id_produto !== idProduto) return item;

    const estoque = Number(item.estoque);
    const temLimite =
      item.estoque !== null &&
      item.estoque !== undefined &&
      Number.isFinite(estoque);
    const solicitada = Number(quantidade);
    const segura = Number.isInteger(solicitada) ? solicitada : 1;

    return {
      ...item,
      quantidade: temLimite
        ? estoque <= 0
          ? 0
          : Math.max(1, Math.min(segura, estoque))
        : Math.max(1, segura),
    };
  });

  salvar(itens);
}

export function removerDoCarrinho(idProduto) {
  salvar(
    lerCarrinho().filter((item) => item.id_produto !== idProduto)
  );
}

export function limparCarrinho() {
  localStorage.removeItem(CHAVE);
  window.dispatchEvent(new Event('carrinho:atualizado'));
}

export function totalItensCarrinho() {
  return lerCarrinho().reduce(
    (total, item) => total + item.quantidade,
    0
  );
}
