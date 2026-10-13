
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Imagem from '../components/Imagem';


const IMG_FABRICA = '/banner-fabrica.jpg';
const IMG_TICKET = '/banner-ticket-premiado.jpg';
const IMG_FILANTROPIA = '/banner-filantropia.jpg';


export default function SobreNos() {
  return (
    <div className="min-h-screen bg-choco-creme font-sans text-choco-marrom">
      <Navbar />

      <main>
        <section className="bg-choco-vinho text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-choco-dourado">
                Sobre nós
              </p>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
                Uma história doce, cheia de magia
              </h1>

              <p className="mt-5 leading-relaxed text-white/90">
                A Choco World nasceu de um sonho: transformar o chocolate
                em uma experiência capaz de despertar a imaginação, criar
                lembranças e aproximar pessoas.
              </p>

              <p className="mt-3 leading-relaxed text-white/90">
                Inspirados pelo encanto das fábricas fantásticas, criamos
                um universo de sabores, surpresas e histórias. Aqui, cada
                chocolate é um convite para descobrir algo especial.
              </p>

              <p className="mt-5 font-semibold italic text-choco-dourado">
                Seja bem-vindo à nossa fábrica de sonhos!
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/15 shadow-xl">
              <Imagem
                src={IMG_FABRICA}
                alt="Ilustração da fábrica fantástica da Choco World"
                rotulo="Imagem da fábrica mágica"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-choco-pessego/50 bg-white shadow-sm">
            <Imagem
              src={IMG_TICKET}
              alt="Ticket dourado da campanha Choco World"
              rotulo="Imagem do Ticket Premiado"
              className="aspect-[16/9] w-full object-cover"
            />

            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-choco-vermelho">
                Uma surpresa especial
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                Ticket Premiado
              </h2>

              <p className="mt-3 leading-relaxed text-choco-marrom/80">
                Imagine abrir uma embalagem e encontrar um ticket dourado!
                A proposta da campanha é levar ainda mais fantasia à
                experiência de comprar nossos chocolates.
              </p>

              <a
                href="/ticket-premiado"
                className="mt-5 inline-flex rounded-lg bg-choco-vermelho px-5 py-3 text-sm font-bold text-white transition hover:bg-choco-vinho"
              >
                Conheça a campanha
              </a>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-choco-pessego/50 bg-white shadow-sm">
            <Imagem
              src={IMG_FILANTROPIA}
              alt="Ilustração sobre solidariedade e educação"
              rotulo="Imagem da filantropia"
              className="aspect-[16/9] w-full object-cover"
            />

            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-choco-vermelho">
                Mais que chocolate
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                Fazer o bem faz parte da história
              </h2>

              <p className="mt-3 leading-relaxed text-choco-marrom/80">
                A proposta social da Choco World contempla duas frentes:
                apoio a instituições de caridade e investimento em educação
                e ensino, cada uma com objetivos próprios.
              </p>

              <a
                href="#nosso-impacto"
                className="mt-5 inline-flex rounded-lg border border-choco-vermelho px-5 py-3 text-sm font-bold text-choco-vermelho transition hover:bg-choco-vermelho hover:text-white"
              >
                Conheça nosso propósito
              </a>
            </div>
          </article>
        </section>

        <section
          id="nosso-impacto"
          className="bg-[#f6e5d5] px-4 py-14 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <header className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-choco-vermelho">
                Nosso propósito
              </p>

              <h2 className="mt-3 text-3xl font-extrabold">
                Uma ideia que vai além do sabor
              </h2>

              <p className="mt-4 leading-relaxed text-choco-marrom/80">
                Nosso conceito de impacto social é dividido em duas frentes
                complementares, com propósitos e resultados distintos.
              </p>
            </header>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl bg-white p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl">
                  ♥
                </div>

                <h3 className="mt-4 text-xl font-extrabold">
                  Instituições de caridade
                </h3>

                <p className="mt-3 leading-relaxed text-choco-marrom/80">
                  A primeira frente é voltada ao apoio de instituições e
                  iniciativas que atendem pessoas em situação de
                  vulnerabilidade e promovem dignidade e acolhimento.
                </p>
              </article>

              <article className="rounded-2xl bg-white p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl">
                  ✦
                </div>

                <h3 className="mt-4 text-xl font-extrabold">
                  Educação e ensino
                </h3>

                <p className="mt-3 leading-relaxed text-choco-marrom/80">
                  A segunda frente é dedicada a projetos educacionais,
                  aprendizagem e iniciativas que ampliem as oportunidades
                  de desenvolvimento.
                </p>
              </article>
            </div>

            <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-choco-marrom/70">
              O percentual de 3% e sua distribuição deverão ser divulgados
              como compromisso efetivo somente após a definição e
              formalização da política de investimento social.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
