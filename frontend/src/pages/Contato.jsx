
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Imagem from '../components/Imagem';
import { InstagramIcon, FacebookIcon, TikTokIcon } from '../components/icons';

const IMG_CONTATO = '/banner-fabrica.jpg';

export default function Contato() {
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: '',
  });

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  function enviarMensagem(evento) {
    evento.preventDefault();

    // O formulário ainda não está conectado ao backend.
    window.alert(
      'O formulário visual está pronto, mas o envio precisa ser conectado ao backend.'
    );
  }

  return (
    <div className="min-h-screen bg-choco-creme font-sans text-choco-marrom">
      <Navbar />

      <main>
        <section className="bg-choco-vinho text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-9 sm:px-6 md:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-choco-dourado">
                Estamos aqui para ajudar
              </p>

              <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
                Fale Conosco
              </h1>

              <p className="mt-3 max-w-lg text-white/85">
                Tire suas dúvidas, envie sugestões ou converse com a
                equipe Choco World.
              </p>
            </div>

            <div className="hidden overflow-hidden rounded-xl md:block">
              <Imagem
                src={IMG_CONTATO}
                alt="Banner da fábrica de chocolates Choco World"
                rotulo="Imagem da fábrica"
                className="h-44 w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="-mt-3 grid gap-8 rounded-2xl bg-white p-5 shadow-xl sm:p-8 md:grid-cols-[0.85fr_1.15fr] md:p-10">
            <aside>
              <h2 className="text-xl font-extrabold">
                Entre em contato
              </h2>

              <div className="mt-6 space-y-6">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl text-choco-vermelho">
                    ✉
                  </span>

                  <div>
                    <h3 className="font-bold">E-mail</h3>
                    <p className="mt-1 text-sm text-choco-marrom/70">
                      contato@chocoworld.com.br
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl text-choco-vermelho">
                    ☎
                  </span>

                  <div>
                    <h3 className="font-bold">Telefone</h3>
                    <p className="mt-1 text-sm text-choco-marrom/70">
                      (11) 98765-4321
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl text-choco-vermelho">
                    ◷
                  </span>

                  <div>
                    <h3 className="font-bold">
                      Horário de atendimento
                    </h3>
                    <p className="mt-1 text-sm text-choco-marrom/70">
                      Segunda a sexta
                      <br />
                      das 9h às 18h
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 border-t border-choco-pessego/50 pt-5">
                <h3 className="text-sm font-bold">Redes sociais</h3>
                <div className="mt-3 flex gap-3">
                  {[
                    { nome: 'Instagram', Icone: InstagramIcon },
                    { nome: 'Facebook', Icone: FacebookIcon },
                    { nome: 'TikTok', Icone: TikTokIcon },
                  ].map(({ nome, Icone }) => (
                    <a
                      key={nome}
                      href="#"
                      aria-label={nome}
                      title={nome}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-choco-vermelho transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-choco-vermelho"
                    >
                      <Icone width={22} height={22} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl">
                <Imagem
                  src={IMG_CONTATO}
                  alt="Fábrica de chocolates da Choco World"
                  rotulo="Imagem da fábrica"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            </aside>

            <div className="rounded-xl border border-choco-pessego/40 bg-[#fcfaf7] p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold text-choco-vinho">
                Envie sua mensagem
              </h2>

              <form
                onSubmit={enviarMensagem}
                className="mt-5 space-y-4"
              >
                <div>
                  <label
                    htmlFor="nome"
                    className="mb-1 block text-sm font-medium"
                  >
                    Nome *
                  </label>

                  <input
                    id="nome"
                    name="nome"
                    value={formulario.nome}
                    onChange={atualizarCampo}
                    required
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    className="w-full rounded-lg border border-choco-pessego/70 bg-white px-3 py-2.5 text-sm outline-none focus:border-choco-vermelho focus:ring-2 focus:ring-choco-vermelho/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium"
                  >
                    E-mail *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formulario.email}
                    onChange={atualizarCampo}
                    required
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    className="w-full rounded-lg border border-choco-pessego/70 bg-white px-3 py-2.5 text-sm outline-none focus:border-choco-vermelho focus:ring-2 focus:ring-choco-vermelho/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="assunto"
                    className="mb-1 block text-sm font-medium"
                  >
                    Assunto *
                  </label>

                  <select
                    id="assunto"
                    name="assunto"
                    value={formulario.assunto}
                    onChange={atualizarCampo}
                    required
                    className="w-full rounded-lg border border-choco-pessego/70 bg-white px-3 py-2.5 text-sm outline-none focus:border-choco-vermelho focus:ring-2 focus:ring-choco-vermelho/15"
                  >
                    <option value="">Selecione o assunto</option>
                    <option value="pedido">Dúvidas sobre pedidos</option>
                    <option value="produto">Produtos</option>
                    <option value="ticket">Ticket Premiado</option>
                    <option value="parceria">Parcerias e doações</option>
                    <option value="outro">Outro assunto</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mensagem"
                    className="mb-1 block text-sm font-medium"
                  >
                    Mensagem *
                  </label>

                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formulario.mensagem}
                    onChange={atualizarCampo}
                    required
                    rows={5}
                    placeholder="Digite sua mensagem..."
                    className="w-full resize-y rounded-lg border border-choco-pessego/70 bg-white px-3 py-2.5 text-sm outline-none focus:border-choco-vermelho focus:ring-2 focus:ring-choco-vermelho/15"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-choco-vinho px-5 py-3 text-sm font-bold text-white transition hover:bg-choco-vermelho"
                >
                  Enviar mensagem ↗
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
