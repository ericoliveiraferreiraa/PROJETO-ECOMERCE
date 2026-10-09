
import { useEffect, useState } from 'react';
import { api, sair } from '../services/api';
import { formatarPreco } from '../utils/moeda';

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

  const dataValida = new Date(data.replace(' ', 'T'));

  if (Number.isNaN(dataValida.getTime())) return data;

  return dataValida.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarDia(dia) {
  const data = new Date(`${dia}T12:00:00`);

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export default function AdminDashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const resposta = await api('/dashboard', {
          autenticado: true,
        });

        setDados(resposta);
      } catch (erroApi) {
        setErro(erroApi.message || 'Não foi possível carregar o dashboard.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  function encerrarSessao() {
    sair();
    window.location.href = '/';
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-stone-50 p-8 text-stone-700">
        Carregando dashboard...
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-stone-50 p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-bold text-red-700">
            Não foi possível carregar o dashboard
          </h1>

          <p className="mt-3 text-stone-600">{erro}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-amber-800 px-4 py-2 font-semibold text-white hover:bg-amber-900"
          >
            Tentar novamente
          </button>

          <button
            onClick={encerrarSessao}
            className="ml-3 mt-5 rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100"
          >
            Voltar à loja
          </button>
        </div>
      </main>
    );
  }

  const { totais, variacoes, vendas7dias, pedidosRecentes } = dados;

  const maiorVenda = Math.max(
    1,
    ...vendas7dias.map((item) => item.total)
  );

  function exibirVariacao(valor) {
    if (valor === null || valor === undefined) return '—';

    return `${valor > 0 ? '+' : ''}${valor}%`;
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
              Choco World
            </p>

            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              Painel administrativo
            </h1>

            <p className="mt-1 text-sm text-stone-500">
              Acompanhe os resultados da sua loja.
            </p>
          </div>

          <button
            onClick={encerrarSessao}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">Visão geral</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-stone-500">Total de pedidos</p>

              <p className="mt-3 text-3xl font-bold">
                {totais.pedidos}
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Variação mensal: {exibirVariacao(variacoes.pedidos)}
              </p>
            </article>

            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-stone-500">Total de clientes</p>

              <p className="mt-3 text-3xl font-bold">
                {totais.clientes}
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Variação mensal: {exibirVariacao(variacoes.clientes)}
              </p>
            </article>

            <article className="rounded-2xl border border-amber-200 bg-amber-900 p-5 text-white shadow-sm">
              <p className="text-sm text-amber-100">Vendas do mês</p>

              <p className="mt-3 text-3xl font-bold">
                {formatarPreco(totais.vendasMes)}
              </p>

              <p className="mt-2 text-sm text-amber-100">
                Variação mensal: {exibirVariacao(variacoes.vendasMes)}
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Vendas dos últimos 7 dias</h2>

            <p className="mt-1 text-sm text-stone-500">
              Valores de pedidos com status pago.
            </p>
          </div>

          <div className="flex h-64 items-end gap-2 sm:gap-4">
            {vendas7dias.map((item) => (
              <div
                key={item.dia}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="max-w-full truncate text-center text-xs text-stone-600">
                  {formatarPreco(item.total)}
                </span>

                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    title={`${formatarDia(item.dia)}: ${formatarPreco(item.total)}`}
                    className={`w-full max-w-12 rounded-t-md ${
                      item.total > 0 ? 'bg-amber-800' : 'bg-stone-200'
                    }`}
                    style={{
                      height: `${item.total > 0 ? Math.max(6, (item.total / maiorVenda) * 100) : 3}%`,
                    }}
                  />
                </div>

                <span className="text-xs text-stone-500">
                  {formatarDia(item.dia)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 p-5 md:p-7">
            <h2 className="text-lg font-bold">Pedidos recentes</h2>

            <p className="mt-1 text-sm text-stone-500">
              Os últimos pedidos registrados na loja.
            </p>
          </div>

          {pedidosRecentes.length === 0 ? (
            <p className="p-6 text-stone-500">
              Nenhum pedido cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Pedido</th>
                    <th className="px-5 py-4 font-semibold">Cliente</th>
                    <th className="px-5 py-4 font-semibold">Data</th>
                    <th className="px-5 py-4 font-semibold">Valor</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {pedidosRecentes.map((pedido) => (
                    <tr
                      key={pedido.id_pedido}
                      className="hover:bg-stone-50"
                    >
                      <td className="px-5 py-4 font-semibold">
                        #{pedido.id_pedido}
                      </td>

                      <td className="px-5 py-4">{pedido.cliente}</td>

                      <td className="px-5 py-4 text-stone-500">
                        {formatarData(pedido.data_pedido)}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatarPreco(pedido.valor_total)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                          {STATUS[pedido.status] || pedido.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}