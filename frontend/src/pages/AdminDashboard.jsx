import { useEffect, useState } from 'react';
import { api, sair } from '../services/api';
import { formatarPreco } from '../utils/moeda';

const SECOES = [
  { id: 'dashboard', nome: 'Dashboard', icone: '📊' },
  { id: 'produtos', nome: 'Produtos', icone: '🍫' },
  { id: 'cadastrar', nome: 'Cadastrar produto', icone: '➕' },
  { id: 'categorias', nome: 'Categorias', icone: '🏷️' },
  { id: 'pedidos', nome: 'Pedidos', icone: '🛍️' },
  { id: 'estoque', nome: 'Estoque', icone: '📦' },
];

const STATUS = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  em_separacao: 'Em separação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

function formatarData(data) {
  if (!data) return '—';
  const convertida = new Date(data);
  if (Number.isNaN(convertida.getTime())) return data;
  return convertida.toLocaleDateString('pt-BR');
}

function formatarDia(data) {
  if (!data) return '—';
  const convertida = new Date(`${data}T12:00:00`);
  if (Number.isNaN(convertida.getTime())) return data;
  return convertida.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatarQuantidade(valor) {
  return Number(valor ?? 0).toLocaleString('pt-BR');
}

function AdminDashboard() {
  const [secaoAtiva, setSecaoAtiva] = useState('dashboard');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erroProdutos, setErroProdutos] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [formulario, setFormulario] = useState({
    nome: '', descricao: '', preco: '', imagem: '', id_categoria: '', quantidade_estoque: '0',
  });
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [mensagemProduto, setMensagemProduto] = useState('');
  const [erroFormulario, setErroFormulario] = useState('');
  const [produtoEmAcao, setProdutoEmAcao] = useState(null);
  const [buscaPedido, setBuscaPedido] = useState('');
  const [produtoEditando, setProdutoEditando] = useState(null);

  // Estados específicos da aba Categorias
  const [categoriasAdmin, setCategoriasAdmin] = useState([]);
  const [carregandoCategoriasAdmin, setCarregandoCategoriasAdmin] = useState(false);
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [categoriaEmAcao, setCategoriaEmAcao] = useState(null);
  const [mensagemCategoria, setMensagemCategoria] = useState('');
  const [erroCategoria, setErroCategoria] = useState('');
  const [formCategoria, setFormCategoria] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    carregarDashboard();
    carregarProdutosECategorias();
  }, []);

  useEffect(() => {
    if (secaoAtiva === 'categorias') carregarCategoriasAdmin();
  }, [secaoAtiva]);

  async function carregarDashboard() {
    setCarregando(true);
    setErro('');
    try {
      const resposta = await api('/dashboard', { autenticado: true });
      setDados(resposta);
    } catch (erroApi) {
      setErro(erroApi.message || 'Não foi possível carregar o dashboard.');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarProdutosECategorias() {
    setCarregandoProdutos(true);
    setErroProdutos('');
    try {
      const [listaProdutos, listaCategorias] = await Promise.all([
        api('/produtos/admin/listar', { autenticado: true }),
        api('/categorias'),
      ]);
      setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
      setCategorias(Array.isArray(listaCategorias) ? listaCategorias : []);
    } catch (erroApi) {
      setErroProdutos(erroApi.message || 'Não foi possível carregar os produtos.');
    } finally {
      setCarregandoProdutos(false);
    }
  }

  async function carregarCategoriasAdmin() {
    setCarregandoCategoriasAdmin(true);
    setErroCategoria('');
    try {
      const resposta = await api('/categorias/admin/listar', { autenticado: true });
      setCategoriasAdmin(Array.isArray(resposta) ? resposta : []);
    } catch (erroApi) {
      setErroCategoria(erroApi.message || 'Não foi possível carregar as categorias.');
    } finally {
      setCarregandoCategoriasAdmin(false);
    }
  }

  function iniciarEdicao(produto) {
    setProdutoEditando(produto.id_produto);
    setFormulario({
      nome: produto.nome ?? '',
      descricao: produto.descricao ?? '',
      preco: (Number(produto.preco ?? 0) / 100).toFixed(2),
      imagem: produto.imagem ?? '',
      id_categoria: String(produto.id_categoria ?? ''),
      quantidade_estoque: String(produto.estoque ?? 0),
    });
    setErroFormulario('');
    setMensagemProduto('');
    setSecaoAtiva('cadastrar');
  }

  function limparFormularioProduto() {
    setProdutoEditando(null);
    setFormulario({ nome: '', descricao: '', preco: '', imagem: '', id_categoria: '', quantidade_estoque: '0' });
    setErroFormulario('');
    setMensagemProduto('');
  }

  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  async function cadastrarProduto(evento) {
    evento.preventDefault();
    setMensagemProduto('');
    setErroFormulario('');

    if (!formulario.nome.trim()) return setErroFormulario('Informe o nome do produto.');
    if (!formulario.preco || !Number.isFinite(Number(formulario.preco)) || Number(formulario.preco) <= 0) {
      return setErroFormulario('Informe um preço válido.');
    }
    if (!formulario.id_categoria) return setErroFormulario('Selecione uma categoria.');

    const editando = produtoEditando !== null;
    const quantidade = Number(formulario.quantidade_estoque);
    if (!editando && (formulario.quantidade_estoque === '' || !Number.isInteger(quantidade) || quantidade < 0)) {
      return setErroFormulario('Informe uma quantidade de estoque válida (número inteiro igual ou maior que zero).');
    }

    setSalvandoProduto(true);
    try {
      const corpo = {
        nome: formulario.nome.trim(),
        descricao: formulario.descricao.trim(),
        preco: Math.round(Number(formulario.preco) * 100),
        imagem: formulario.imagem.trim() || null,
        id_categoria: Number(formulario.id_categoria),
      };
      if (!editando) corpo.quantidade_estoque = quantidade;

      await api(editando ? `/produtos/${produtoEditando}` : '/produtos', {
        method: editando ? 'PATCH' : 'POST',
        autenticado: true,
        body: corpo,
      });

      setMensagemProduto(editando ? 'Produto atualizado com sucesso! 🍫' : 'Produto cadastrado com sucesso! 🍫');
      setProdutoEditando(null);
      setFormulario({ nome: '', descricao: '', preco: '', imagem: '', id_categoria: '', quantidade_estoque: '0' });
      await carregarProdutosECategorias();
      setSecaoAtiva('produtos');
    } catch (erroApi) {
      setErroFormulario(erroApi.message || (editando ? 'Não foi possível atualizar o produto.' : 'Não foi possível cadastrar o produto.'));
    } finally {
      setSalvandoProduto(false);
    }
  }

  async function inativarProduto(produto) {
    if (!window.confirm(`Deseja realmente inativar o produto "${produto.nome}"?`)) return;
    setProdutoEmAcao(produto.id_produto);
    setMensagemProduto('');
    setErroProdutos('');
    try {
      await api(`/produtos/${produto.id_produto}/inativar`, { method: 'PATCH', autenticado: true });
      setMensagemProduto(`Produto "${produto.nome}" inativado com sucesso.`);
      await carregarProdutosECategorias();
    } catch (erroApi) {
      setErroProdutos(erroApi.message || 'Não foi possível inativar o produto.');
    } finally {
      setProdutoEmAcao(null);
    }
  }

  async function cadastrarCategoria(evento) {
    evento.preventDefault();
    setMensagemCategoria('');
    setErroCategoria('');
    const nome = formCategoria.nome.trim();
    if (!nome) {
      setErroCategoria('Informe o nome da categoria.');
      return;
    }
    setSalvandoCategoria(true);
    try {
      await api('/categorias', {
        method: 'POST', autenticado: true,
        body: { nome, descricao: formCategoria.descricao.trim() || null },
      });
      setMensagemCategoria('Categoria cadastrada com sucesso!');
      setFormCategoria({ nome: '', descricao: '' });
      await carregarCategoriasAdmin();
      await carregarProdutosECategorias();
    } catch (erroApi) {
      setErroCategoria(erroApi.message || 'Não foi possível cadastrar a categoria.');
    } finally {
      setSalvandoCategoria(false);
    }
  }

  async function alterarStatusCategoria(categoria) {
    const ativa = Number(categoria.ativo) === 1;
    const acao = ativa ? 'inativar' : 'ativar';
    if (!window.confirm(`Deseja realmente ${acao} a categoria "${categoria.nome}"?`)) return;
    setCategoriaEmAcao(categoria.id_categoria);
    setMensagemCategoria('');
    setErroCategoria('');
    try {
      await api(`/categorias/${categoria.id_categoria}/${acao}`, { method: 'PATCH', autenticado: true });
      setMensagemCategoria(`Categoria "${categoria.nome}" ${ativa ? 'inativada' : 'ativada'} com sucesso.`);
      await carregarCategoriasAdmin();
      await carregarProdutosECategorias();
    } catch (erroApi) {
      setErroCategoria(erroApi.message || `Não foi possível ${acao} a categoria.`);
    } finally {
      setCategoriaEmAcao(null);
    }
  }

  function fazerLogout() {
    sair();
    localStorage.removeItem('tipoUsuario');
    window.location.href = '/';
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const correspondeBusca = produto.nome?.toLowerCase().includes(buscaProduto.toLowerCase());
    const ativo = Number(produto.ativo) === 1;
    const correspondeStatus = filtroStatus === 'todos' || (filtroStatus === 'ativos' && ativo) || (filtroStatus === 'inativos' && !ativo);
    return correspondeBusca && correspondeStatus;
  });
  const produtosAtivos = produtos.filter((produto) => Number(produto.ativo) === 1);
  const pedidos = Array.isArray(dados?.pedidosRecentes) ? dados.pedidosRecentes : Array.isArray(dados?.pedidos) ? dados.pedidos : [];
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const pesquisa = buscaPedido.toLowerCase();
    return String(pedido.id_pedido ?? '').includes(pesquisa)
      || String(pedido.nome_cliente ?? pedido.cliente ?? '').toLowerCase().includes(pesquisa)
      || String(pedido.status ?? '').toLowerCase().includes(pesquisa);
  });
  const vendas7dias = Array.isArray(dados?.vendas7dias) ? dados.vendas7dias : [];
  const maiorVenda = Math.max(1, ...vendas7dias.map((item) => Number(item.total ?? 0)));
  const totalEstoque = produtosAtivos.reduce((total, produto) => total + Number(produto.estoque ?? 0), 0);
  const produtosEstoqueBaixo = produtosAtivos.filter((produto) => Number(produto.estoque ?? 0) <= 5);
  const secaoSelecionada = SECOES.find((secao) => secao.id === secaoAtiva);
  const classesBotao = 'rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="min-h-screen bg-[#faf6ef] text-stone-800">
      <header className="bg-[#40251d] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Choco World</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">Painel administrativo</h1>
            <p className="mt-1 text-sm text-amber-100/80">Gerencie sua loja de chocolates</p>
          </div>
          <button type="button" onClick={fazerLogout} className="shrink-0 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold transition hover:bg-white/10">Sair</button>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-amber-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3" aria-label="Navegação administrativa">
            {SECOES.map((secao) => {
              const selecionada = secaoAtiva === secao.id;
              return (
                <button key={secao.id} type="button" aria-pressed={selecionada} onClick={() => setSecaoAtiva(secao.id)} className={`${classesBotao} flex shrink-0 items-center gap-2 ${selecionada ? 'bg-[#75452f] text-white shadow-md' : 'bg-stone-50 text-stone-700 hover:bg-amber-50 hover:text-[#75452f]'}`}>
                  <span aria-hidden="true">{secao.icone}</span><span>{secao.nome}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p className="text-sm font-semibold text-amber-800">ÁREA ADMINISTRATIVA</p>
          <h2 className="mt-1 text-2xl font-bold text-[#40251d] sm:text-3xl">{secaoSelecionada?.icone} {secaoSelecionada?.nome}</h2>
        </div>

        {/* DASHBOARD */}
        {secaoAtiva === 'dashboard' && (
          <section className="space-y-7">
            {carregando ? <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-stone-500">Carregando indicadores...</p></div> : erro ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5"><p className="font-semibold text-red-700">{erro}</p><button type="button" onClick={carregarDashboard} className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Tentar novamente</button></div>
            ) : <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-stone-500">Total de pedidos</p><span className="text-2xl">🛍️</span></div><p className="mt-4 text-3xl font-bold text-[#40251d]">{formatarQuantidade(dados?.totais?.pedidos)}</p><p className="mt-2 text-sm text-stone-500">Pedidos registrados</p></div>
                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-stone-500">Clientes cadastrados</p><span className="text-2xl">👥</span></div><p className="mt-4 text-3xl font-bold text-[#40251d]">{formatarQuantidade(dados?.totais?.clientes)}</p><p className="mt-2 text-sm text-stone-500">Clientes na plataforma</p></div>
                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-stone-500">Vendas do mês</p><span className="text-2xl">💰</span></div><p className="mt-4 text-3xl font-bold text-[#75452f]">{formatarPreco(dados?.totais?.vendasMes ?? 0)}</p><p className="mt-2 text-sm text-stone-500">Total de vendas no período</p></div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6"><h3 className="text-lg font-bold text-[#40251d]">Vendas dos últimos 7 dias</h3><p className="mt-1 text-sm text-stone-500">Acompanhe o desempenho diário da loja.</p></div>
                {vendas7dias.length === 0 ? <p className="py-8 text-center text-sm text-stone-500">Não há dados de vendas para exibir.</p> : <div className="flex h-64 items-end gap-3 overflow-x-auto border-b border-stone-200 pb-2">{vendas7dias.map((item, indice) => { const total = Number(item.total ?? 0); const altura = total > 0 ? Math.max((total / maiorVenda) * 100, 5) : 2; return <div key={item.data ?? indice} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="max-w-full truncate text-center text-xs font-semibold text-stone-600">{formatarPreco(total)}</span><div className="w-full max-w-16 rounded-t-lg bg-amber-700 transition-all duration-300 hover:bg-amber-600" style={{ height: `${altura}%` }} title={`${formatarDia(item.data)}: ${formatarPreco(total)}`} /><span className="text-xs text-stone-500">{formatarDia(item.data)}</span></div>; })}</div>}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#40251d] p-6 text-white"><div><h3 className="font-bold">Gerencie sua loja</h3><p className="mt-1 text-sm text-amber-100/80">Acesse rapidamente os recursos administrativos.</p></div><button type="button" onClick={() => setSecaoAtiva('cadastrar')} className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-[#40251d] transition hover:bg-amber-300">+ Cadastrar produto</button></div>
            </>}
          </section>
        )}

        {/* PRODUTOS */}
        {secaoAtiva === 'produtos' && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm md:flex-row md:items-end">
              <div className="flex-1"><label htmlFor="buscaProduto" className="mb-2 block text-sm font-semibold text-stone-700">Buscar produto</label><input id="buscaProduto" type="search" value={buscaProduto} onChange={(e) => setBuscaProduto(e.target.value)} placeholder="Digite o nome do chocolate..." className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div>
              <div className="w-full md:w-52"><label htmlFor="filtroStatus" className="mb-2 block text-sm font-semibold text-stone-700">Situação</label><select id="filtroStatus" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700"><option value="todos">Todos os produtos</option><option value="ativos">Somente ativos</option><option value="inativos">Somente inativos</option></select></div>
              <button type="button" onClick={() => setSecaoAtiva('cadastrar')} className="rounded-xl bg-[#75452f] px-5 py-3 font-semibold text-white transition hover:bg-[#593423]">+ Novo produto</button>
            </div>
            {mensagemProduto && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">{mensagemProduto}</div>}
            {erroProdutos && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erroProdutos}</div>}
            {carregandoProdutos ? <div className="rounded-2xl bg-white p-8 text-center shadow-sm">Carregando produtos...</div> : <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
              <div className="border-b border-amber-100 px-5 py-4"><h3 className="font-bold text-[#40251d]">Produtos cadastrados</h3><p className="mt-1 text-sm text-stone-500">{produtosFiltrados.length} produto(s) encontrado(s)</p></div>
              {produtosFiltrados.length === 0 ? <p className="p-8 text-center text-stone-500">Nenhum produto encontrado.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left text-sm"><thead className="bg-[#f7efe4] text-stone-700"><tr><th className="px-5 py-4 font-semibold">Produto</th><th className="px-5 py-4 font-semibold">Categoria</th><th className="px-5 py-4 font-semibold">Preço</th><th className="px-5 py-4 font-semibold">Estoque</th><th className="px-5 py-4 font-semibold">Situação</th><th className="px-5 py-4 font-semibold">Ação</th></tr></thead><tbody className="divide-y divide-stone-100">{produtosFiltrados.map((produto) => { const ativo = Number(produto.ativo) === 1; return <tr key={produto.id_produto} className="transition hover:bg-amber-50/50"><td className="px-5 py-4"><div className="flex items-center gap-3">{produto.imagem ? <img src={produto.imagem} alt={produto.nome} className="h-12 w-12 rounded-lg border border-stone-100 bg-stone-50 object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-xl">🍫</div>}<div><p className="font-semibold text-stone-800">{produto.nome}</p><p className="mt-1 text-xs text-stone-500">Código: {produto.id_produto}</p></div></div></td><td className="px-5 py-4">{produto.categoria || '—'}</td><td className="px-5 py-4 font-semibold text-[#75452f]">{formatarPreco(produto.preco)}</td><td className="px-5 py-4">{formatarQuantidade(produto.estoque)}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${ativo ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'}`}>{ativo ? 'Ativo' : 'Inativo'}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => iniciarEdicao(produto)} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-50">Editar</button>{ativo ? <button type="button" disabled={produtoEmAcao === produto.id_produto} onClick={() => inativarProduto(produto)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50">{produtoEmAcao === produto.id_produto ? 'Aguarde...' : 'Inativar'}</button> : null}</div></td></tr>; })}</tbody></table></div>}
            </div>}
          </section>
        )}

        {/* CADASTRAR PRODUTO */}
        {secaoAtiva === 'cadastrar' && (
          <section className="mx-auto max-w-3xl"><div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-8"><div className="mb-7"><h3 className="text-xl font-bold text-[#40251d]">{produtoEditando !== null ? 'Editar produto' : 'Adicionar um novo chocolate'}</h3><p className="mt-2 text-sm text-stone-500">{produtoEditando !== null ? 'Altere os dados desejados e salve as alterações. O estoque não é modificado nesta tela.' : 'Preencha as informações abaixo para cadastrar o produto na loja.'}</p></div>
            {mensagemProduto && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">{mensagemProduto}</div>}{erroFormulario && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erroFormulario}</div>}
            <form onSubmit={cadastrarProduto} className="space-y-5">
              <div><label htmlFor="nome" className="mb-2 block text-sm font-semibold">Nome do produto *</label><input id="nome" name="nome" value={formulario.nome} onChange={alterarCampo} required maxLength={150} placeholder="Ex.: Chocolate ao leite 90g" className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div>
              <div><label htmlFor="descricao" className="mb-2 block text-sm font-semibold">Descrição</label><textarea id="descricao" name="descricao" value={formulario.descricao} onChange={alterarCampo} rows={4} maxLength={2000} placeholder="Descreva o chocolate, seus ingredientes e diferenciais..." className="w-full resize-y rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div>
              <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="preco" className="mb-2 block text-sm font-semibold">Preço em reais (R$) *</label><input id="preco" name="preco" type="number" min="0.01" step="0.01" value={formulario.preco} onChange={alterarCampo} required placeholder="Ex.: 12,90" className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div>{produtoEditando === null && <div><label htmlFor="quantidade_estoque" className="mb-2 block text-sm font-semibold">Quantidade em estoque *</label><input id="quantidade_estoque" name="quantidade_estoque" type="number" min="0" step="1" value={formulario.quantidade_estoque} onChange={alterarCampo} required className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div>}</div>
              <div><label htmlFor="id_categoria" className="mb-2 block text-sm font-semibold">Categoria *</label><select id="id_categoria" name="id_categoria" value={formulario.id_categoria} onChange={alterarCampo} required className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"><option value="">Selecione uma categoria</option>{categorias.map((categoria) => <option key={categoria.id_categoria} value={categoria.id_categoria}>{categoria.nome_categoria ?? categoria.nome ?? categoria.categoria}</option>)}</select>{categorias.length === 0 && <p className="mt-2 text-xs text-amber-800">Não foi possível identificar categorias. Confira se existem categorias cadastradas no banco de dados.</p>}</div>
              <div><label htmlFor="imagem" className="mb-2 block text-sm font-semibold">Caminho da imagem</label><input id="imagem" name="imagem" value={formulario.imagem} onChange={alterarCampo} placeholder="Ex.: /barra-ao-leite.jpeg" className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /><p className="mt-2 text-xs text-stone-500">Para imagens na pasta public do frontend, informe o caminho começando com /. Ex.: /barra-ao-leite.jpeg</p></div>
              {formulario.imagem.trim() && <div className="rounded-xl border border-stone-100 bg-stone-50 p-4"><p className="mb-3 text-sm font-semibold text-stone-700">Pré-visualização</p><img src={formulario.imagem} alt="Pré-visualização do produto" className="h-40 w-40 rounded-xl border border-stone-200 bg-white object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = 'block'; }} /></div>}
              <div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row"><button type="submit" disabled={salvandoProduto} className="flex-1 rounded-xl bg-[#75452f] px-5 py-3 font-bold text-white transition hover:bg-[#593423] disabled:cursor-not-allowed disabled:opacity-60">{salvandoProduto ? 'Salvando...' : produtoEditando !== null ? 'Salvar alterações' : 'Cadastrar produto'}</button><button type="button" onClick={limparFormularioProduto} className="rounded-xl border border-stone-200 px-5 py-3 font-semibold text-stone-700 transition hover:bg-stone-50">Limpar formulário</button></div>
            </form>
          </div></section>
        )}

        {/* CATEGORIAS */}
        {secaoAtiva === 'categorias' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-7">
              <h3 className="text-lg font-bold text-[#40251d]">Cadastrar categoria</h3><p className="mt-1 text-sm text-stone-500">Organize os chocolates da loja por categorias.</p>
              {mensagemCategoria && <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{mensagemCategoria}</div>}{erroCategoria && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erroCategoria}</div>}
              <form onSubmit={cadastrarCategoria} className="mt-6 space-y-4"><div><label htmlFor="nomeCategoria" className="mb-2 block text-sm font-semibold">Nome da categoria *</label><input id="nomeCategoria" value={formCategoria.nome} onChange={(e) => setFormCategoria((anterior) => ({ ...anterior, nome: e.target.value }))} maxLength={100} required placeholder="Ex.: Chocolates amargos" className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div><div><label htmlFor="descricaoCategoria" className="mb-2 block text-sm font-semibold">Descrição</label><textarea id="descricaoCategoria" value={formCategoria.descricao} onChange={(e) => setFormCategoria((anterior) => ({ ...anterior, descricao: e.target.value }))} rows={3} placeholder="Descreva esta categoria..." className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div><button type="submit" disabled={salvandoCategoria} className="rounded-xl bg-[#75452f] px-5 py-3 font-semibold text-white transition hover:bg-[#593423] disabled:opacity-50">{salvandoCategoria ? 'Cadastrando...' : '+ Cadastrar categoria'}</button></form>
            </div>
            <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 px-5 py-4"><div><h3 className="font-bold text-[#40251d]">Categorias cadastradas</h3><p className="mt-1 text-sm text-stone-500">{categoriasAdmin.length} categoria(s)</p></div><button type="button" onClick={carregarCategoriasAdmin} disabled={carregandoCategoriasAdmin} className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-semibold text-[#75452f] hover:bg-amber-50 disabled:opacity-50">Atualizar lista</button></div>
              {carregandoCategoriasAdmin ? <p className="p-8 text-center text-stone-500">Carregando categorias...</p> : categoriasAdmin.length === 0 ? <p className="p-8 text-center text-stone-500">Nenhuma categoria encontrada.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#f7efe4] text-stone-700"><tr><th className="px-5 py-4 font-semibold">Categoria</th><th className="px-5 py-4 font-semibold">Descrição</th><th className="px-5 py-4 font-semibold">Situação</th><th className="px-5 py-4 font-semibold">Ação</th></tr></thead><tbody className="divide-y divide-stone-100">{categoriasAdmin.map((categoria) => { const ativa = Number(categoria.ativo) === 1; const emAcao = categoriaEmAcao === categoria.id_categoria; return <tr key={categoria.id_categoria} className="hover:bg-amber-50/50"><td className="px-5 py-4 font-semibold text-stone-800">{categoria.nome}</td><td className="max-w-sm px-5 py-4 text-stone-600">{categoria.descricao || '—'}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${ativa ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'}`}>{ativa ? 'Ativa' : 'Inativa'}</span></td><td className="px-5 py-4"><button type="button" disabled={emAcao} onClick={() => alterarStatusCategoria(categoria)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${ativa ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>{emAcao ? 'Aguarde...' : ativa ? 'Inativar' : 'Ativar'}</button></td></tr>; })}</tbody></table></div>}
            </div>
          </section>
        )}

        {/* PEDIDOS */}
        {secaoAtiva === 'pedidos' && (
          <section className="space-y-5"><div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm"><label htmlFor="buscaPedido" className="mb-2 block text-sm font-semibold text-stone-700">Buscar pedido</label><input id="buscaPedido" type="search" value={buscaPedido} onChange={(e) => setBuscaPedido(e.target.value)} placeholder="Digite o número, cliente ou status..." className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100" /></div>
            {carregando ? <div className="rounded-2xl bg-white p-8 text-center shadow-sm">Carregando pedidos...</div> : erro ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{erro}</div> : <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"><div className="border-b border-amber-100 px-5 py-4"><h3 className="font-bold text-[#40251d]">Pedidos recentes</h3><p className="mt-1 text-sm text-stone-500">{pedidosFiltrados.length} pedido(s) encontrado(s)</p></div>{pedidosFiltrados.length === 0 ? <p className="p-8 text-center text-stone-500">Nenhum pedido disponível para exibir.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#f7efe4] text-stone-700"><tr><th className="px-5 py-4 font-semibold">Pedido</th><th className="px-5 py-4 font-semibold">Cliente</th><th className="px-5 py-4 font-semibold">Data</th><th className="px-5 py-4 font-semibold">Valor</th><th className="px-5 py-4 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{pedidosFiltrados.map((pedido, indice) => <tr key={pedido.id_pedido ?? indice} className="transition hover:bg-amber-50/50"><td className="px-5 py-4 font-semibold">#{pedido.id_pedido ?? '—'}</td><td className="px-5 py-4">{pedido.nome_cliente ?? pedido.cliente ?? 'Cliente'}</td><td className="px-5 py-4">{formatarData(pedido.data_pedido ?? pedido.created_at)}</td><td className="px-5 py-4 font-semibold text-[#75452f]">{formatarPreco(pedido.total ?? pedido.valor_total ?? 0)}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">{STATUS[pedido.status] ?? pedido.status ?? 'Não informado'}</span></td></tr>)}</tbody></table></div>}</div>}
          </section>
        )}

        {/* ESTOQUE */}
        {secaoAtiva === 'estoque' && (
          <section className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-stone-500">Unidades em estoque</p><p className="mt-3 text-3xl font-bold text-[#40251d]">{carregandoProdutos ? '...' : formatarQuantidade(totalEstoque)}</p><p className="mt-2 text-sm text-stone-500">Soma das unidades dos produtos ativos</p></div><div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-stone-500">Produtos com estoque baixo</p><p className="mt-3 text-3xl font-bold text-red-700">{carregandoProdutos ? '...' : formatarQuantidade(produtosEstoqueBaixo.length)}</p><p className="mt-2 text-sm text-stone-500">Produtos ativos com 5 unidades ou menos</p></div></div>
            {erroProdutos && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erroProdutos}</div>}
            <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 px-5 py-4"><div><h3 className="font-bold text-[#40251d]">Controle de estoque</h3><p className="mt-1 text-sm text-stone-500">Produtos que precisam de reposição aparecem destacados.</p></div><button type="button" onClick={carregarProdutosECategorias} disabled={carregandoProdutos} className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-semibold text-[#75452f] transition hover:bg-amber-50">Atualizar</button></div>
              {carregandoProdutos ? <p className="p-8 text-center text-stone-500">Carregando estoque...</p> : produtosAtivos.length === 0 ? <p className="p-8 text-center text-stone-500">Não há produtos ativos para exibir.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-[#f7efe4] text-stone-700"><tr><th className="px-5 py-4 font-semibold">Produto</th><th className="px-5 py-4 font-semibold">Categoria</th><th className="px-5 py-4 font-semibold">Quantidade</th><th className="px-5 py-4 font-semibold">Situação</th></tr></thead><tbody className="divide-y divide-stone-100">{produtosAtivos.map((produto) => { const quantidade = Number(produto.estoque ?? 0); const baixo = quantidade <= 5; return <tr key={produto.id_produto} className={`transition ${baixo ? 'bg-red-50/70' : 'hover:bg-amber-50/50'}`}><td className="px-5 py-4 font-semibold text-stone-800">{produto.nome}</td><td className="px-5 py-4">{produto.categoria || '—'}</td><td className={`px-5 py-4 font-bold ${baixo ? 'text-red-700' : 'text-stone-800'}`}>{formatarQuantidade(quantidade)} unidade(s)</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${baixo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{baixo ? 'Estoque baixo' : 'Estoque adequado'}</span></td></tr>; })}</tbody></table></div>}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-12 border-t border-amber-100 bg-white"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-sm text-stone-500 sm:flex-row sm:px-6 lg:px-8"><p className="font-semibold text-[#75452f]">🍫 Choco World</p><p>Painel administrativo</p></div></footer>
    </div>
  );
}

export default AdminDashboard;
