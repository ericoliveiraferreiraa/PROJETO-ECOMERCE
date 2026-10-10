
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CardProduto from '../components/CardProduto';
import { api } from '../services/api';
import { adicionarAoCarrinho } from '../services/carrinho';

const EXEMPLOS = [
  { id_produto: 'exemplo-1', nome: 'Chocolate ao Leite', descricao: '100g', preco: 1290, categoria: 'Chocolates', marca: 'Choco World', estoque: 20, imagem: '/barra-ao-leite.jpeg' },
  { id_produto: 'exemplo-2', nome: 'Chocolate 70%', descricao: '100g', preco: 1490, categoria: 'Chocolates', marca: 'Choco World', estoque: 20, imagem: '/barra-70-cacau.jpeg' },
  { id_produto: 'exemplo-3', nome: 'Caramelo Salgado', descricao: '100g', preco: 1390, categoria: 'Doces', marca: 'Choco World', estoque: 20, imagem: '/barra-caramelo-salgado.jpeg' },
  { id_produto: 'exemplo-4', nome: 'Chocolate 85% NOIR', descricao: '100g', preco: 1390, categoria: 'Chocolates', marca: 'Choco World', estoque: 20, imagem: '/barra-85-noir.jpeg' },
];

const FUNDOS = ['#fce7e7', '#f4eee9', '#fff3d6', '#e5efff', '#e4f6ed'];

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [marca, setMarca] = useState('Todas');
  const [ordem, setOrdem] = useState('popular');
  const [precoMax, setPrecoMax] = useState(10000);
  const [erro, setErro] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api('/produtos')
      .then((dados) => {
        const lista = Array.isArray(dados) ? dados : dados.produtos || [];
        setProdutos(lista);
      })
      .catch(() => {
        setProdutos(EXEMPLOS);
        setErro(true);
      });
  }, []);

  const categorias = useMemo(
    () => [...new Set(produtos.map((p) => p.categoria).filter(Boolean))],
    [produtos]
  );

  const marcas = useMemo(
    () => [...new Set(produtos.map((p) => p.marca).filter(Boolean))],
    [produtos]
  );

  const filtrados = useMemo(() => {
    const lista = produtos.filter((p) => {
      const nome = (p.nome || '').toLowerCase();
      const correspondeBusca = nome.includes(busca.toLowerCase());
      const correspondeCategoria =
        categoria === 'Todas' || p.categoria === categoria;
      const correspondeMarca = marca === 'Todas' || p.marca === marca;
      const correspondePreco = Number(p.preco) <= precoMax;

      return (
        correspondeBusca &&
        correspondeCategoria &&
        correspondeMarca &&
        correspondePreco
      );
    });

    if (ordem === 'menor') lista.sort((a, b) => a.preco - b.preco);
    if (ordem === 'maior') lista.sort((a, b) => b.preco - a.preco);
    if (ordem === 'nome') {
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }

    return lista;
  }, [produtos, busca, categoria, marca, precoMax, ordem]);

  function adicionar(produto) {
    adicionarAoCarrinho(produto);
    setAviso(`${produto.nome} adicionado ao carrinho!`);
    window.setTimeout(() => setAviso(''), 2500);
  }

  return (
    <div className="min-h-screen bg-choco-creme text-choco-marrom">
      <Navbar />

      <header className="bg-gradient-to-r from-choco-vinho to-choco-vinho-claro px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-white/80">
            <a href="/" className="underline underline-offset-4">Home</a>
            {' / '}Produtos
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">Nossos Produtos</h1>
          <p className="mt-2 text-sm text-white/85">
            Chocolates, doces e snacks nacionais e internacionais
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos"
            className="min-w-0 flex-1 rounded-xl border border-choco-pessego/60 bg-white px-4 py-3 text-sm outline-none focus:border-choco-vinho"
          />

          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            aria-label="Ordenar produtos"
            className="rounded-xl border border-choco-pessego/60 bg-white px-4 py-3 text-sm"
          >
            <option value="popular">Ordenar: padrão</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
            <option value="nome">Nome: A–Z</option>
          </select>
        </div>

        {erro && (
          <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Não foi possível carregar os produtos da API. Exibindo exemplos.
          </p>
        )}

        {aviso && (
          <p role="status" className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {aviso}{' '}
            <a href="/carrinho" className="font-bold underline">
              Ver carrinho
            </a>
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-choco-pessego/40 bg-white p-5">
            <h2 className="font-extrabold">Filtros</h2>

            <label className="mt-5 block text-sm font-bold">Categorias</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white p-2 text-sm"
            >
              <option value="Todas">Todas as categorias</option>
              {categorias.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-bold">Marcas</label>
            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white p-2 text-sm"
            >
              <option value="Todas">Todas as marcas</option>
              {marcas.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-bold">
              Preço máximo
            </label>
            <p className="mt-1 text-sm text-neutral-600">
              R$ {(precoMax / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </p>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={precoMax}
              onChange={(e) => setPrecoMax(Number(e.target.value))}
              className="mt-3 w-full accent-choco-vinho"
              aria-label="Preço máximo"
            />

            <button
              type="button"
              onClick={() => {
                setBusca('');
                setCategoria('Todas');
                setMarca('Todas');
                setPrecoMax(10000);
                setOrdem('popular');
              }}
              className="mt-5 text-sm font-bold text-choco-vermelho underline"
            >
              Limpar filtros
            </button>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                {filtrados.length} produto(s) encontrado(s)
              </p>
              <a
                href="/"
                className="rounded-lg border border-choco-vinho px-4 py-2 text-sm font-bold text-choco-vinho transition hover:bg-choco-vinho hover:text-white"
              >
                ← Voltar à Home
              </a>
            </div>

            {filtrados.length === 0 ? (
              <div className="rounded-2xl border border-choco-pessego/40 bg-white p-10 text-center">
                <p className="font-bold">Nenhum produto encontrado.</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Experimente alterar a busca ou os filtros.
                </p>
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