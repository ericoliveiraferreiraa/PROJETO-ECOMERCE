
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CardProduto from '../components/CardProduto';
import { api } from '../services/api';
import { adicionarAoCarrinho } from '../services/carrinho';

const EXEMPLOS = [
  {
    id_produto: 'exemplo-1',
    nome: 'Chocolate ao Leite',
    descricao: '100g',
    preco: 1290,
    categoria: 'Chocolates',
    marca: 'Choco World',
    estoque: 20,
    imagem: '/barra-ao-leite.jpeg',
  },
  {
    id_produto: 'exemplo-2',
    nome: 'Chocolate 70%',
    descricao: '100g',
    preco: 1490,
    categoria: 'Chocolates',
    marca: 'Choco World',
    estoque: 20,
    imagem: '/barra-70-cacau.jpeg',
  },
  {
    id_produto: 'exemplo-3',
    nome: 'Caramelo Salgado',
    descricao: '100g',
    preco: 1390,
    categoria: 'Doces',
    marca: 'Choco World',
    estoque: 20,
    imagem: '/barra-caramelo-salgado.jpeg',
  },
  {
    id_produto: 'exemplo-4',
    nome: 'Chocolate 85% NOIR',
    descricao: '100g',
    preco: 1390,
    categoria: 'Chocolates',
    marca: 'Choco World',
    estoque: 20,
    imagem: '/barra-85-noir.jpeg',
  },
];

const FUNDOS = [
  '#fce7e7',
  '#f4eee9',
  '#fff3d6',
  '#e5efff',
  '#e4f6ed',
];

// Padroniza textos para pesquisa sem diferença de acentos.
function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function obterCategoria(produto) {
  const categoria = produto.categoria;

  if (typeof categoria === 'string') return categoria;
  if (categoria && typeof categoria === 'object') {
    return categoria.nome ?? categoria.nome_categoria ?? '';
  }

  return produto.nome_categoria ?? '';
}

function obterMarca(produto) {
  const marca = produto.marca;

  if (typeof marca === 'string') return marca;
  if (marca && typeof marca === 'object') {
    return marca.nome ?? marca.nome_marca ?? '';
  }

  return produto.nome_marca ?? '';
}

function obterPreco(produto) {
  const preco = Number(produto.preco);
  return Number.isFinite(preco) && preco >= 0 ? preco : 0;
}

function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [marca, setMarca] = useState('Todas');
  const [ordem, setOrdem] = useState('padrao');
  const [precoMax, setPrecoMax] = useState(null);

  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarProdutos() {
      try {
        const dados = await api('/produtos');

        const lista = Array.isArray(dados)
          ? dados
          : Array.isArray(dados?.produtos)
            ? dados.produtos
            : [];

        if (ativo) {
          setProdutos(lista);
          setErro(false);
        }
      } catch {
        if (ativo) {
          setProdutos(EXEMPLOS);
          setErro(true);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarProdutos();

    return () => {
      ativo = false;
    };
  }, []);

  // Calcula os filtros a partir dos dados disponíveis.
  const categorias = useMemo(
    () => [
      ...new Set(
        produtos.map(obterCategoria).filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [produtos]
  );

  const marcas = useMemo(
    () => [
      ...new Set(
        produtos.map(obterMarca).filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [produtos]
  );

  // Os preços são armazenados em centavos.
  const limitePreco = useMemo(() => {
    const maiorPreco = Math.max(
      0,
      ...produtos.map(obterPreco)
    );

    // Arredonda para cima em intervalos de R$ 10.
    return Math.max(
      1000,
      Math.ceil(maiorPreco / 1000) * 1000
    );
  }, [produtos]);

  const precoSelecionado = Math.min(
    precoMax ?? limitePreco,
    limitePreco
  );

  const filtrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    const lista = produtos.filter((produto) => {
      const textoProduto = normalizarTexto([
        produto.nome,
        produto.descricao,
        obterCategoria(produto),
        obterMarca(produto),
      ].join(' '));

      const correspondeBusca =
        !termo || textoProduto.includes(termo);

      const correspondeCategoria =
        categoria === 'Todas' ||
        obterCategoria(produto) === categoria;

      const correspondeMarca =
        marca === 'Todas' ||
        obterMarca(produto) === marca;

      const correspondePreco =
        obterPreco(produto) <= precoSelecionado;

      return (
        correspondeBusca &&
        correspondeCategoria &&
        correspondeMarca &&
        correspondePreco
      );
    });

    // Ordena uma cópia da lista filtrada.
    if (ordem === 'menor') {
      lista.sort((a, b) => obterPreco(a) - obterPreco(b));
    }

    if (ordem === 'maior') {
      lista.sort((a, b) => obterPreco(b) - obterPreco(a));
    }

    if (ordem === 'nome') {
      lista.sort((a, b) =>
        String(a.nome ?? '').localeCompare(
          String(b.nome ?? ''),
          'pt-BR'
        )
      );
    }

    return lista;
  }, [
    produtos,
    busca,
    categoria,
    marca,
    precoSelecionado,
    ordem,
  ]);

  function limparFiltros() {
    setBusca('');
    setCategoria('Todas');
    setMarca('Todas');
    setPrecoMax(null);
    setOrdem('padrao');
  }

  function adicionar(produto) {
    if (!adicionarAoCarrinho(produto)) return false;

    setAviso(`${produto.nome} adicionado ao carrinho!`);

    window.setTimeout(() => setAviso(''), 2500);
    return true;
  }

  return (
    <div className="min-h-screen bg-choco-creme text-choco-marrom">
      <Navbar />

      <header className="bg-gradient-to-r from-choco-vinho to-choco-vinho-claro px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-white/80">
            <a href="/" className="underline underline-offset-4">
              Home
            </a>
            {' / '}Produtos
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">
            Nossos Produtos
          </h1>

          <p className="mt-2 text-sm text-white/85">
            Chocolates, doces e snacks nacionais e internacionais
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar chocolate, marca ou categoria..."
            aria-label="Buscar produtos"
            className="min-w-0 flex-1 rounded-xl border border-choco-pessego/60 bg-white px-4 py-3 text-sm outline-none focus:border-choco-vinho focus:ring-2 focus:ring-choco-vinho/15"
          />

          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            aria-label="Ordenar produtos"
            className="rounded-xl border border-choco-pessego/60 bg-white px-4 py-3 text-sm"
          >
            <option value="padrao">Ordem padrão</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
            <option value="nome">Nome: A–Z</option>
          </select>
        </div>

        {erro && (
          <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Não foi possível carregar os produtos da API.
            Estamos exibindo produtos de exemplo.
          </p>
        )}

        {aviso && (
          <p
            role="status"
            aria-live="polite"
            className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-800"
          >
            {aviso}{' '}
            <a href="/carrinho" className="font-bold underline">
              Ver carrinho
            </a>
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-choco-pessego/40 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-extrabold">Filtros</h2>

              <button
                type="button"
                onClick={limparFiltros}
                className="text-xs font-bold text-choco-vinho underline"
              >
                Limpar
              </button>
            </div>

            <label
              htmlFor="filtro-categoria"
              className="mt-5 block text-sm font-bold"
            >
              Categorias
            </label>

            <select
              id="filtro-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white p-2 text-sm"
            >
              <option value="Todas">Todas as categorias</option>

              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label
              htmlFor="filtro-marca"
              className="mt-5 block text-sm font-bold"
            >
              Marcas
            </label>

            <select
              id="filtro-marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white p-2 text-sm"
            >
              <option value="Todas">Todas as marcas</option>

              {marcas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label
              htmlFor="filtro-preco"
              className="mt-5 block text-sm font-bold"
            >
              Preço máximo
            </label>

            <p className="mt-1 text-sm text-neutral-600">
              {formatarPreco(precoSelecionado)}
            </p>

            <input
              id="filtro-preco"
              type="range"
              min="0"
              max={limitePreco}
              step="100"
              value={precoSelecionado}
              onChange={(e) => setPrecoMax(Number(e.target.value))}
              className="mt-3 w-full accent-choco-vinho"
              aria-label="Preço máximo em reais"
            />

            <div className="flex justify-between text-xs text-neutral-500">
              <span>R$ 0,00</span>
              <span>{formatarPreco(limitePreco)}</span>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-600" aria-live="polite">
                {carregando
                  ? 'Carregando produtos...'
                  : `${filtrados.length} produto(s) encontrado(s)`}
              </p>

              <a
                href="/"
                className="rounded-lg border border-choco-vinho px-4 py-2 text-sm font-bold text-choco-vinho transition hover:bg-choco-vinho hover:text-white"
              >
                ← Voltar à Home
              </a>
            </div>

            {carregando ? (
              <div className="rounded-2xl border border-choco-pessego/40 bg-white p-10 text-center">
                <p className="font-semibold">
                  Carregando nossos chocolates...
                </p>
              </div>
            ) : filtrados.length === 0 ? (
              <div className="rounded-2xl border border-choco-pessego/40 bg-white p-10 text-center">
                <p className="font-bold">
                  Nenhum produto encontrado.
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                  Experimente alterar a busca ou os filtros.
                </p>

                <button
                  type="button"
                  onClick={limparFiltros}
                  className="mt-5 rounded-xl bg-choco-vinho px-5 py-3 text-sm font-bold text-white transition hover:bg-choco-vinho-claro"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtrados.map((produto, index) => (
                  <CardProduto
                    key={produto.id_produto}
                    produto={produto}
                    fundo={FUNDOS[index % FUNDOS.length]}
                    onAdicionar={adicionar}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
