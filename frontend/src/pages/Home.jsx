
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Imagem from '../components/Imagem';
import CarrosselProdutos from '../components/CarrosselProdutos';
import { ArrowRightIcon } from '../components/icons';
import { api } from '../services/api';
import { adicionarAoCarrinho } from '../services/carrinho';


const IMG_HERO = '/6364bab4-5da3-451a-87d8-8ba9888c94c0.jpg';
const IMG_HISTORIA = '/banner.jpg';

const PRODUTOS_EXEMPLO = [
  {
    id_produto: 'exemplo-1',
    nome: 'Chocolate ao Leite',
    descricao: '100g',
    preco: 1290,
    imagem: 'barra-ao-leite.jpeg',
  },
  {
    id_produto: 'exemplo-2',
    nome: 'Chocolate 70%',
    descricao: '100g',
    preco: 1490,
    imagem: 'barra-70-cacau.jpeg',
  },
  {
    id_produto: 'exemplo-3',
    nome: 'Caramelo Salgado',
    descricao: '100g',
    preco: 1390,
    imagem: 'barra-caramelo-salgado.jpeg',
  },
  {
    id_produto: 'exemplo-4',
    nome: 'Chocolate 85% NOIR',
    descricao: '100g',
    preco: 1390,
    imagem: 'barra-85-noir.jpeg',
  },
];

const BANNERS_HOME = [
  {
    imagem: '/banner-sobrenos.jpg',
    alt: 'Conheça a história da Choco World',
    titulo: 'Muito mais que chocolate',
    descricao:
      'Conheça nossa história, nossos valores e o mundo de sabores da Choco World.',
    botao: 'Conheça nossa história',
    link: '/sobre-nos',
  },
  {
    imagem: '/banner-ticket-premiado.jpg',
    alt: 'Banner do Ticket Premiado Choco World',
    titulo: 'Uma surpresa pode estar esperando',
    descricao:
      'Descubra a proposta do Ticket Premiado e conheça essa ideia especial.',
    botao: 'Conhecer o Ticket Premiado',
    link: '/ticket-premiado',
  },
  {
    imagem: '/banner-filantropia.jpg',
    alt: 'Iniciativa de filantropia da Choco World',
    titulo: 'Chocolate que espalha felicidade',
    descricao:
      'Conheça nossa proposta de impacto social e como queremos fazer a diferença.',
    botao: 'Conheça nossa iniciativa',
    link: '/sobre-nos',
  },
];

const PAPEL_RASGADO =
  'polygon(0% 8%, 6% 2%, 12% 7%, 19% 1%, 27% 6%, 35% 0%, 44% 5%, 52% 1%, 61% 6%, 70% 0%, 79% 5%, 88% 1%, 100% 6%, 99% 30%, 100% 55%, 98% 80%, 100% 100%, 90% 96%, 80% 100%, 70% 95%, 60% 100%, 50% 96%, 40% 100%, 30% 95%, 20% 100%, 10% 96%, 0% 100%, 2% 70%, 0% 40%)';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [bannerAtual, setBannerAtual] = useState(0);

  useEffect(() => {
    let cancelado = false;

    api('/produtos')
      .then((lista) => {
        if (!cancelado) {
          setProdutos(lista.slice(0, 8));
        }
      })
      .catch(() => {
        if (!cancelado) {
          setErro(true);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCarregando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setBannerAtual((atual) => (atual + 1) % BANNERS_HOME.length);
    }, 6000);

    return () => window.clearInterval(intervalo);
  }, []);

  function bannerAnterior() {
    setBannerAtual(
      (atual) =>
        (atual - 1 + BANNERS_HOME.length) % BANNERS_HOME.length
    );
  }

  function proximoBanner() {
    setBannerAtual((atual) => (atual + 1) % BANNERS_HOME.length);
  }

  const lista = erro ? PRODUTOS_EXEMPLO : produtos;
  const banner = BANNERS_HOME[bannerAtual];

  return (
    <div className="min-h-screen bg-choco-creme font-sans text-choco-marrom">
      <Navbar />

      <main>
        {/* Hero principal */}
        <section className="bg-gradient-to-b from-choco-vinho to-choco-vinho-claro text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-28 lg:pt-14">
            <div>
    
              <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
                O mundo do chocolate, doces e snacks em um só lugar!
              </h1>

              <p className="mt-4 max-w-lg text-lg font-semibold leading-snug">
                Sabor, variedade e qualidade para todas as idades. E o
                melhor, você também faz o bem!
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
                rotulo="Imagem principal"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Carrossel institucional */}
        <section
          aria-label="Destaques da Choco World"
          className="bg-choco-creme px-4 pb-8 pt-8 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-2xl bg-choco-vinho shadow-lg">
              <div className="grid min-h-[320px] items-stretch md:grid-cols-2">
                <div className="flex flex-col items-start justify-center p-7 text-white sm:p-10 lg:p-12">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-choco-dourado">
                    Descubra a Choco World
                  </p>

                  <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                    {banner.titulo}
                  </h2>

                  <p className="mt-4 max-w-lg leading-relaxed text-white/85">
                    {banner.descricao}
                  </p>

                  <a
                    href={banner.link}
                    className="mt-7 inline-flex items-center gap-2 rounded-lg bg-choco-creme px-5 py-3 text-sm font-bold text-choco-vinho transition hover:bg-white"
                  >
                    {banner.botao}
                    <ArrowRightIcon width={16} height={16} />
                  </a>
                </div>

                <div className="relative min-h-[220px] bg-white/10">
                  <Imagem
                    key={banner.imagem}
                    src={banner.imagem}
                    alt={banner.alt}
                    rotulo="Banner da Choco World"
                    className="h-full min-h-[220px] w-full object-cover md:absolute md:inset-0"
                  />

                  <button
                    type="button"
                    onClick={bannerAnterior}
                    aria-label="Banner anterior"
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-choco-vinho shadow transition hover:bg-white"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={proximoBanner}
                    aria-label="Próximo banner"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-choco-vinho shadow transition hover:bg-white"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {BANNERS_HOME.map((item, indice) => (
                <button
                  key={item.imagem}
                  type="button"
                  onClick={() => setBannerAtual(indice)}
                  aria-label={`Mostrar banner ${indice + 1}: ${item.titulo}`}
                  aria-current={bannerAtual === indice ? 'true' : undefined}
                  className={`h-2.5 rounded-full transition-all ${
                    bannerAtual === indice
                      ? 'w-8 bg-choco-vinho'
                      : 'w-2.5 bg-choco-pessego hover:bg-choco-vermelho'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Produtos em destaque */}
        <section className="rounded-t-[2.5rem] bg-choco-creme px-4 pb-16 pt-14 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <header className="text-center">
              <h2 className="text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
                Produtos em destaque
              </h2>

              <p className="mt-1 text-sm text-choco-marrom/70">
                Os mais queridos pelos nossos clientes
              </p>

              <div
                className="mx-auto mt-2 h-0.5 w-10 bg-choco-vermelho"
                aria-hidden="true"
              />
            </header>

            <div className="mt-10">
              {erro && (
                <p
                  role="status"
                  className="mb-4 text-center text-xs font-medium text-choco-vermelho"
                >
                  Não foi possível carregar os produtos da API. Mostrando
                  exemplos.
                </p>
              )}

              {carregando && (
                <p className="py-16 text-center text-sm">
                  Carregando produtos...
                </p>
              )}

              {!carregando && lista.length === 0 && (
                <p className="py-16 text-center text-sm">
                  Ainda não há produtos cadastrados.
                </p>
              )}

              {!carregando && lista.length > 0 && (
                <CarrosselProdutos
                  produtos={lista}
                  onAdicionar={adicionarAoCarrinho}
                />
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

        {/* Nossa história */}
        <section className="bg-choco-pessego">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-wide">
                Nossa história
              </h2>

              <p className="mt-4 max-w-md text-xl font-bold leading-snug text-choco-marrom sm:text-2xl">
                Mais que chocolates, espalhamos felicidade e fazemos a
                diferença!
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
              <div
                className="absolute inset-0 rotate-2 bg-white"
                style={{ clipPath: PAPEL_RASGADO }}
                aria-hidden="true"
              />

              <div className="relative p-6">
                <Imagem
                  src={IMG_HISTORIA}
                  alt="Banner sobre a história da Choco World"
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
