import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatarPreco } from '../utils/moeda';

export default function MeusPedidos() {
const [pedidos, setPedidos] = useState([]);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState('');
const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

useEffect(() => {
async function carregarPedidos() {
try {
const dados = await api('/pedidos', {
autenticado: true,
});


    setPedidos(Array.isArray(dados) ? dados : []);
  } catch (error) {
    setErro(error.message || 'Não foi possível carregar os pedidos.');
  } finally {
    setCarregando(false);
  }
}

carregarPedidos();


}, []);

async function verDetalhes(idPedido) {
setPedidoSelecionado(null);
setCarregandoDetalhes(true);
setErro('');


try {
  const dados = await api(`/pedidos/${idPedido}`, {
    autenticado: true,
  });

  setPedidoSelecionado(dados);
} catch (error) {
  setErro(error.message || 'Não foi possível carregar os detalhes.');
} finally {
  setCarregandoDetalhes(false);
}


}

function formatarData(data) {
if (!data) return 'Data não informada';


const dataConvertida = new Date(data);

if (Number.isNaN(dataConvertida.getTime())) {
  return data;
}

return dataConvertida.toLocaleString('pt-BR');


}

function formatarStatus(status) {
const nomes = {
aguardando_pagamento: 'Aguardando pagamento',
pago: 'Pago',
em_separacao: 'Em separação',
enviado: 'Enviado',
entregue: 'Entregue',
cancelado: 'Cancelado',
};


return nomes[status] || status;


}

return ( <div className="min-h-screen bg-choco-creme text-choco-marrom"> <Navbar />


  <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <a
      href="/minha-conta"
      className="text-sm font-semibold text-choco-vinho hover:underline"
    >
      ← Voltar para minha conta
    </a>

    <h1 className="mt-4 text-3xl font-extrabold">
      Meus pedidos
    </h1>

    <p className="mt-2 text-neutral-600">
      Acompanhe suas compras realizadas na Choco World.
    </p>

    {carregando && (
      <p className="mt-8">Carregando seu histórico...</p>
    )}

    {erro && (
      <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
        {erro}
      </p>
    )}

    {!carregando && !erro && pedidos.length === 0 && (
      <section className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="text-4xl">🍫</div>

        <h2 className="mt-4 text-xl font-bold">
          Você ainda não tem pedidos
        </h2>

        <p className="mt-2 text-neutral-600">
          Quando fizer sua primeira compra, ela aparecerá aqui.
        </p>

        <a
          href="/produtos"
          className="mt-5 inline-flex rounded-xl bg-choco-vinho px-5 py-3 font-bold text-white hover:bg-choco-vinho-claro"
        >
          Explorar produtos
        </a>
      </section>
    )}

    <div className="mt-8 space-y-4">
      {pedidos.map((pedido) => (
        <article
          key={pedido.id_pedido}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-neutral-500">
                Pedido #{pedido.id_pedido}
              </p>

              <p className="mt-1 font-semibold">
                {formatarData(pedido.data_pedido)}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-neutral-500">
                Valor total
              </p>

              <p className="text-xl font-extrabold text-choco-vinho">
                {formatarPreco(pedido.valor_total)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
              {formatarStatus(pedido.status)}
            </span>

            <button
              type="button"
              onClick={() => verDetalhes(pedido.id_pedido)}
              className="font-bold text-choco-vinho hover:underline"
            >
              Ver detalhes →
            </button>
          </div>
        </article>
      ))}
    </div>

    {carregandoDetalhes && (
      <p className="mt-6">Carregando detalhes do pedido...</p>
    )}

    {pedidoSelecionado && (
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">
            Pedido #{pedidoSelecionado.id_pedido}
          </h2>

          <button
            type="button"
            onClick={() => setPedidoSelecionado(null)}
            className="text-sm font-semibold text-choco-vinho hover:underline"
          >
            Fechar detalhes
          </button>
        </div>

        <p className="mt-2 text-sm text-neutral-500">
          {formatarData(pedidoSelecionado.data_pedido)}
        </p>

        <div className="mt-5 divide-y divide-neutral-100">
          {pedidoSelecionado.itens?.map((item, indice) => (
            <div
              key={`${item.id_produto}-${indice}`}
              className="flex items-start justify-between gap-4 py-4"
            >
              <div>
                <p className="font-semibold">{item.produto}</p>

                <p className="mt-1 text-sm text-neutral-500">
                  Quantidade: {item.quantidade} ×{' '}
                  {formatarPreco(item.preco_unitario)}
                </p>
              </div>

              <p className="shrink-0 font-bold">
                {formatarPreco(item.subtotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4">
          <span className="font-semibold">Total do pedido</span>

          <span className="text-lg font-extrabold text-choco-vinho">
            {formatarPreco(pedidoSelecionado.valor_total)}
          </span>
        </div>
      </section>
    )}
  </main>

  <Footer />
</div>
);
}
