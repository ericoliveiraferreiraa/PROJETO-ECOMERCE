import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import Imagem from '../components/Imagem';
import CarrosselProdutos from '../components/CarrosselProdutos';
import { ArrowRightIcon } from '../components/icons';
import { api } from '../services/api';
import { adicionarAoCarrinho } from '../services/carrinho';

// ============================================================
// IMAGENS: coloque os arquivos em src/assets/ e troque o null.
// Exemplo:
//   import imgHero from '../assets/hero.png';
//   const IMG_HERO = imgHero;
// ============================================================
const IMG_HERO = null;
const IMG_HISTORIA = null;

// Produtos de exemplo: so aparecem se a API estiver fora do ar,
// para voce conseguir ver o layout mesmo sem o back-end rodando.
const PRODUTOS_EXEMPLO = [
  { id_produto: 'exemplo-1', nome: 'Chocolate ao Leite', descricao: '100g', preco: 1290, imagem: null },
  { id_produto: 'exemplo-2', nome: 'Chocolate 70%', descricao: '100g', preco: 1490, imagem: null },
  { id_produto: 'exemplo-3', nome: 'Caramelo Salgado', descricao: '100g', preco: 1390, imagem: null },
  { id_produto: 'exemplo-4', nome: 'Cookies & Cream', descricao: '100g', preco: 1390, imagem: null },
];

// Contorno "rasgado" da borda de papel da secao Historia
const PAPEL_RASGADO =
  'polygon(0% 8%, 6% 2%, 12% 7%, 19% 1%, 27% 6%, 35% 0%, 44% 5%, 52% 1%, 61% 6%, 70% 0%, 79% 5%, 88% 1%, 100% 6%, 99% 30%, 100% 55%, 98% 80%, 100% 100%, 90% 96%, 80% 100%, 70% 95%, 60% 100%, 50% 96%, 40% 100%, 30% 95%, 20% 100%, 10% 96%, 0% 100%, 2% 70%, 0% 40%)';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let cancelado = false;

    // A API ainda nao tem o campo "destaque": usamos os 8 primeiros da lista.
    api('/produtos')
      .then((lista) => {
        if (!cancelado) setProdutos(lista.slice(0, 8));
      })
      .catch(() => {
        if (!cancelado) setErro(true);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const lista = erro ? PRODUTOS_EXEMPLO : produtos;

  return (
    <div className="min-h-screen bg-choco-creme font-sans text-choco-marrom">
      <Navbar />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="bg-gradient-to-b from-choco-vinho to-choco-vinho-claro text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-28 lg:pt-14">
            <div>
              <Logo variante="hero" />
              <h1 className="mt-8 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
                O mundo do chocolate, doces e snacks em um só lugar!
              </h1>
              <p className="mt-4 max-w-lg text-lg font-semibold leading-snug">
                Sabor, variedade e qualidade para todas as idades. E o melhor, você também faz o bem!
              </p>
              <a
                href="/produtos"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-choco-marrom shadow-md transition-colors hover:bg-choco-creme"
              >
                Ver produtos
                <ArrowRightIcon width={16} height={16} />
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <Imagem
                src={IMG_HERO}
                alt="Chocolates variados da Choco World"
                rotulo="Imagem principal (hero)"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ---------- Produtos em destaque ---------- */}
        {/* margem negativa: a secao sobe e cobre a base do hero, com cantos arredondados */}
        <section className="-mt-12 rounded-t-[2.5rem] bg-choco-creme px-4 pb-16 pt-14 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <header className="text-center">
              <h2 className="text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">Produtos em destaque</h2>
              <p className="mt-1 text-sm text-choco-marrom/70">Os mais queridos pelos nossos clientes</p>
              <div className="mx-auto mt-2 h-0.5 w-10 bg-choco-vermelho" aria-hidden="true" />
            </header>

            <div className="mt-10">
              {erro && (
                <p role="status" className="mb-4 text-center text-xs font-medium text-choco-vermelho">
                  Não foi possível carregar os produtos da API. Mostrando exemplos.
                </p>
              )}

              {carregando && <p className="py-16 text-center text-sm">Carregando produtos...</p>}

              {!carregando && lista.length === 0 && (
                <p className="py-16 text-center text-sm">Ainda não há produtos cadastrados.</p>
              )}

              {!carregando && lista.length > 0 && (
                <CarrosselProdutos produtos={lista} onAdicionar={adicionarAoCarrinho} />
              )}
            </div>

            <div className="mt-10 text-center">
              <a
                href="/produtos"
                className="inline-flex items-center gap-2 rounded-full border border-choco-vermelho px-6 py-2 text-xs font-bold uppercase tracking-wide text-choco-vermelho transition-colors hover:bg-choco-vermelho hover:text-white"
              >
                Ver todos os produtos
                <ArrowRightIcon width={14} height={14} />
              </a>
            </div>
          </div>
        </section>

        {/* ---------- Nossa historia ---------- */}
        <section className="bg-choco-pessego">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-wide">História nossa</h2>
              {/* Contraste baixo (branco sobre pessego). Para ficar mais legivel, troque
                  "text-white" por "text-choco-marrom". */}
              <p className="mt-4 max-w-md text-xl font-bold leading-snug text-white sm:text-2xl">
                Mais que chocolates, espalhamos felicidade e fazemos a diferença!
              </p>
              <a
                href="/sobre-nos"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-choco-vermelho px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-choco-vinho"
              >
                Saiba mais
                <ArrowRightIcon width={16} height={16} />
              </a>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 rotate-2 bg-white" style={{ clipPath: PAPEL_RASGADO }} aria-hidden="true" />
              <div className="relative p-6">
                <Imagem
                  src={IMG_HISTORIA}
                  alt="Chocolate em formato de coração sobre papel"
                  rotulo="Imagem da história"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
