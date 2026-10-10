
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatarPreco } from '../utils/moeda';
import {
  lerCarrinho,
  atualizarQuantidade,
  removerDoCarrinho,
} from '../services/carrinho';

export default function Carrinho() {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    function sincronizar() {
      setItens(lerCarrinho());
    }

    sincronizar();
    window.addEventListener('carrinho:atualizado', sincronizar);

    return () => {
      window.removeEventListener('carrinho:atualizado', sincronizar);
    };
  }, []);

  const subtotal = itens.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );

  // Frete ilustrativo fixo por enquanto; será calculado pelo CEP no checkout.
  const frete = itens.length > 0 ? 1290 : 0;
  const total = subtotal + frete;

  function alterarQuantidade(item, quantidade) {
    atualizarQuantidade(item.id_produto, quantidade);
    setItens(lerCarrinho());
  }

  function remover(item) {
    removerDoCarrinho(item.id_produto);
    setItens(lerCarrinho());
  }

  return (
    <div className="flex min-h-screen flex-col bg-choco-creme text-choco-marrom">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm text-neutral-500">
            <a href="/" className="hover:text-choco-vermelho">Home</a>
            {' / '}Carrinho
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">Seu Carrinho</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Revise os produtos e continue sua compra.
          </p>
        </div>

        {itens.length === 0 ? (
          <section className="rounded-2xl border border-choco-pessego/40 bg-white px-6 py-16 text-center">
            <div className="text-5xl" aria-hidden="true">🛒</div>
            <h2 className="mt-5 text-xl font-extrabold">
              Seu carrinho está vazio
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Que tal encontrar seu próximo chocolate favorito?
            </p>
            <a
              href="/produtos"
              className="mt-6 inline-flex rounded-lg bg-choco-vinho px-6 py-3 text-sm font-bold text-white transition hover:bg-choco-vinho-claro"
            >
              Ver produtos
            </a>
            <div>
              <a
                href="/"
                className="mt-4 inline-block text-sm font-semibold text-choco-vinho underline"
              >
                Voltar à Home
              </a>
            </div>
          </section>
        ) : (
          <>
            <section className="overflow-hidden rounded-2xl border border-choco-pessego/40 bg-white">
              <div className="hidden grid-cols-[minmax(0,1fr)_110px_140px_110px_35px] gap-4 border-b border-neutral-100 bg-white px-5 py-4 text-xs font-bold uppercase tracking-wide text-neutral-500 md:grid">
                <span>Produto</span>
                <span>Preço</span>
                <span>Quantidade</span>
                <span className="text-right">Subtotal</span>
                <span />
              </div>

              <div className="divide-y divide-neutral-100">
                {itens.map((item) => (
                  <article
                    key={item.id_produto}
                    className="grid grid-cols-1 items-center gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_110px_140px_110px_35px] md:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-choco-creme p-2">
                        {item.imagem ? (
                          <img
                            src={item.imagem}
                            alt={item.nome}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-3xl" aria-hidden="true">🍫</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold">{item.nome}</h2>
                        <p className="mt-1 text-xs text-neutral-500">
                          Produto Choco World
                        </p>
                        <button
                          type="button"
                          onClick={() => remover(item)}
                          className="mt-2 text-xs font-semibold text-choco-vermelho hover:underline md:hidden"
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="mr-2 text-xs text-neutral-500 md:hidden">
                        Preço:
                      </span>
                      {formatarPreco(item.preco)}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500 md:hidden">
                        Quantidade:
                      </span>
                      <div className="inline-flex items-center rounded-lg border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(item, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                          aria-label={`Diminuir quantidade de ${item.nome}`}
                          className="px-3 py-2 hover:bg-choco-creme disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm">
                          {item.quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(item, item.quantidade + 1)}
                          aria-label={`Aumentar quantidade de ${item.nome}`}
                          className="px-3 py-2 hover:bg-choco-creme"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-sm font-extrabold md:text-right">
                      <span className="mr-2 text-xs font-normal text-neutral-500 md:hidden">
                        Subtotal:
                      </span>
                      {formatarPreco(item.preco * item.quantidade)}
                    </div>

                    <button
                      type="button"
                      onClick={() => remover(item)}
                      aria-label={`Remover ${item.nome} do carrinho`}
                      className="hidden rounded-lg p-2 text-choco-vermelho hover:bg-red-50 md:block"
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <div className="mt-6 flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <a
                  href="/produtos"
                  className="rounded-lg border border-choco-pessego px-5 py-3 text-sm font-bold transition hover:bg-white"
                >
                  ← Continuar comprando
                </a>
                <a
                  href="/"
                  className="rounded-lg px-5 py-3 text-sm font-bold text-choco-vinho hover:underline"
                >
                  Voltar à Home
                </a>
              </div>

              <section className="w-full rounded-2xl border border-choco-pessego/40 bg-white p-5 sm:max-w-sm">
                <h2 className="text-lg font-extrabold">Resumo do pedido</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Subtotal</span>
                    <span>{formatarPreco(subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Frete estimado</span>
                    <span>{formatarPreco(frete)}</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    O frete é ilustrativo e será ajustado no checkout.
                  </p>
                  <div className="border-t border-neutral-100 pt-4">
                    <div className="flex justify-between gap-4 text-base font-extrabold">
                      <span>Total</span>
                      <span className="text-choco-vinho">
                        {formatarPreco(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/checkout';
                  }}
                  className="mt-6 w-full rounded-lg bg-choco-vinho px-5 py-3 text-sm font-bold text-white transition hover:bg-choco-vinho-claro"
                >
                  Finalizar compra →
                </button>
              </section>
            </div>

            <section className="mt-10 grid gap-4 border-t border-choco-pessego/40 py-8 text-center sm:grid-cols-3">
              <div>
                <p className="font-bold">Pagamento seguro</p>
                <p className="mt-1 text-xs text-neutral-500">Checkout protegido</p>
              </div>
              <div>
                <p className="font-bold">Seus dados protegidos</p>
                <p className="mt-1 text-xs text-neutral-500">Privacidade e segurança</p>
              </div>
              <div>
                <p className="font-bold">Entrega garantida</p>
                <p className="mt-1 text-xs text-neutral-500">Consulte as condições no checkout</p>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}