import { useEffect, useState } from 'react';
import { api, getToken } from '../services/api';
import { limparCarrinho } from '../services/carrinho';

const CONFIG = {
  sucesso: {
    titulo: 'Pagamento enviado para confirmação',
    texto: 'Estamos consultando o estado do pedido no Choco World.',
  },
  pendente: {
    titulo: 'Pagamento pendente',
    texto: 'O Mercado Pago ainda não confirmou a aprovação. Consulte seus pedidos novamente mais tarde.',
  },
  falha: {
    titulo: 'Pagamento não concluído',
    texto: 'O pagamento não foi concluído. Você pode voltar aos seus pedidos ou tentar novamente.',
  },
};

export default function RetornoPagamento({ tipo }) {
  const [estado, setEstado] = useState('consultando');
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function consultarPedido() {
      const token = getToken();
      const pedidoId = new URLSearchParams(window.location.search).get('pedido_id');

      if (!token) {
        setErro('Entre na sua conta do Choco World para consultar este pedido.');
        setEstado('erro');
        return;
      }
      if (!pedidoId || !/^\d+$/.test(pedidoId)) {
        setErro('Não encontramos o número do pedido no endereço de retorno.');
        setEstado('erro');
        return;
      }

      try {
        const dados = await api(`/pedidos/${pedidoId}`, { autenticado: true });
        if (!ativo) return;
        setPedido(dados);

        if (dados.status === 'pago') {
          limparCarrinho();
          setEstado('aprovado');
        } else if (tipo === 'pendente') {
          setEstado('pendente');
        } else if (tipo === 'falha') {
          setEstado('falha');
        } else {
          setEstado('aguardando_confirmacao');
        }
      } catch (e) {
        if (!ativo) return;
        setErro(e.message || 'Não foi possível consultar o pedido.');
        setEstado('erro');
      }
    }

    consultarPedido();
    return () => { ativo = false; };
  }, [tipo]);

  const config = CONFIG[tipo] || CONFIG.sucesso;
  const total = pedido
    ? (Number(pedido.valor_total || 0) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : null;

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-12 text-[#401522]">
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#eadbd0] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a66b45]">Choco World</p>
        <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
          {estado === 'aprovado' ? 'Pagamento confirmado!' : config.titulo}
        </h1>
        <p className="mt-3 leading-6 text-[#775d5d]">
          {estado === 'aprovado'
            ? 'O backend confirmou que o pedido está pago.'
            : estado === 'consultando'
              ? 'Consultando o pedido...'
              : estado === 'aguardando_confirmacao'
                ? 'O pedido ainda está aguardando confirmação no sistema. A página de retorno, sozinha, não confirma o pagamento.'
                : estado === 'erro'
                  ? erro
                  : config.texto}
        </p>

        {pedido && (
          <div className="mt-6 rounded-xl bg-[#fff6f0] p-4 text-sm">
            <p><strong>Pedido:</strong> #{pedido.id_pedido}</p>
            <p className="mt-1"><strong>Status no sistema:</strong> {pedido.status}</p>
            <p className="mt-1"><strong>Total:</strong> {total}</p>
          </div>
        )}

        {estado === 'aguardando_confirmacao' && (
          <p className="mt-4 text-sm text-[#775d5d]">
            A confirmação automática via notificação do Mercado Pago ainda precisa ser implementada para atualizar o pedido no banco.
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <a href="/meus-pedidos" className="rounded-xl bg-[#702538] px-5 py-3 font-bold text-white hover:bg-[#551b2b]">
            Ver meus pedidos
          </a>
          <a href="/produtos" className="rounded-xl border border-[#decac0] px-5 py-3 font-semibold text-[#702538] hover:bg-[#fff6f0]">
            Voltar às compras
          </a>
        </div>
      </section>
    </main>
  );
}
