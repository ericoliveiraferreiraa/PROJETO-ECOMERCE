
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Imagem from '../components/Imagem';

const IMG_TICKET = '/banner-ticket-premiado.png';

export default function TicketPremiado() {
  return (
    <div className="min-h-screen bg-choco-creme font-sans text-choco-marrom">
      <Navbar />

      <main>
        <section className="bg-choco-vinho text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-choco-dourado">
                Uma surpresa pode estar esperando
              </p>

              <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
                Ticket Premiado
              </h1>

              <p className="mt-5 leading-relaxed text-white/90">
                Imagine encontrar um ticket dourado em uma embalagem
                especial da Choco World. Uma ideia inspirada na magia
                das grandes histórias de chocolate.
              </p>

              <a
                href="#como-funciona"
                className="mt-7 inline-flex rounded-lg bg-choco-creme px-6 py-3 font-bold text-choco-vinho transition hover:bg-white"
              >
                Descubra a ideia
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <Imagem
                src={IMG_TICKET}
                alt="Ticket premiado da Choco World"
                rotulo="Banner do Ticket Premiado"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="mx-auto max-w-5xl px-4 py-14 sm:px-6"
        >
          <h2 className="text-center text-3xl font-extrabold">
            Como funcionaria?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-choco-marrom/80">
            A proposta é criar campanhas especiais com tickets físicos
            associados a experiências e surpresas da marca. Os detalhes
            dependerão do regulamento de cada campanha.
          </p>

          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            <article className="rounded-2xl border border-choco-pessego/50 bg-white p-6">
              <span className="text-3xl">🍫</span>

              <h3 className="mt-4 font-extrabold">
                1. Escolha seus chocolates
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-choco-marrom/75">
                Explore os produtos da Choco World.
              </p>
            </article>

            <article className="rounded-2xl border border-choco-pessego/50 bg-white p-6">
              <span className="text-3xl">🎟️</span>

              <h3 className="mt-4 font-extrabold">
                2. Descubra a surpresa
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-choco-marrom/75">
                Em uma campanha futura, embalagens selecionadas poderão
                participar conforme as regras divulgadas.
              </p>
            </article>

            <article className="rounded-2xl border border-choco-pessego/50 bg-white p-6">
              <span className="text-3xl">✨</span>

              <h3 className="mt-4 font-extrabold">
                3. Consulte as regras
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-choco-marrom/75">
                Os critérios de participação, os prêmios e os prazos
                deverão constar no regulamento oficial.
              </p>
            </article>
          </div>

          <div className="mt-9 rounded-2xl border border-choco-dourado/60 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-extrabold">
              Regulamento da campanha
            </h2>

            <p className="mt-3 leading-relaxed text-choco-marrom/80">
              Esta página apresenta o conceito visual do Ticket Premiado.
              A campanha ainda precisa ter suas condições, período de
              participação, critérios de premiação e procedimento de
              resgate formalizados antes de ser anunciada como ativa.
            </p>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/produtos"
              className="inline-flex rounded-lg bg-choco-vermelho px-6 py-3 font-bold text-white transition hover:bg-choco-vinho"
            >
              Conhecer os produtos
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
