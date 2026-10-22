import { useEffect } from 'react';

import Home from './pages/Home';
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import MinhaConta from './pages/MinhaConta';
import MeusPedidos from './pages/MeusPedidos';
import SobreNos from './pages/SobreNos';
import Contato from './pages/Contato';
import TicketPremiado from './pages/TicketPremiado';
import Checkout from './pages/Checkout';
import RetornoPagamento from './pages/RetornoPagamento';
import { encerrarSessao } from './services/sessao';

const TEMPO_INATIVIDADE = 15 * 60 * 1000;

export default function App() {
  const caminho = window.location.pathname;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    if (!token || tipoUsuario !== 'cliente') return;

    let temporizador;

    function encerrarPorInatividade() {
      encerrarSessao();
      const paginasPrivadas = ['/minha-conta', '/meus-pedidos', '/checkout'];
      if (paginasPrivadas.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    function reiniciarTemporizador() {
      clearTimeout(temporizador);
      temporizador = setTimeout(encerrarPorInatividade, TEMPO_INATIVIDADE);
    }

    const eventos = ['pointerdown', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    eventos.forEach((evento) => {
      window.addEventListener(evento, reiniciarTemporizador, { passive: true });
    });
    reiniciarTemporizador();

    return () => {
      clearTimeout(temporizador);
      eventos.forEach((evento) => window.removeEventListener(evento, reiniciarTemporizador));
    };
  }, [caminho]);

  switch (caminho) {
    case '/': return <Home />;
    case '/produtos': return <Produtos />;
    case '/carrinho': return <Carrinho />;
    case '/cadastro': return <AuthPage tipo="cadastro" />;
    case '/login': return <AuthPage tipo="login" />;
    case '/admin/login': return <AuthPage tipo="admin" />;
    case '/admin': return <AdminDashboard />;
    case '/minha-conta': return <MinhaConta />;
    case '/meus-pedidos': return <MeusPedidos />;
    case '/sobre-nos': return <SobreNos />;
    case '/contato': return <Contato />;
    case '/ticket-premiado': return <TicketPremiado />;
    case '/checkout': return <Checkout />;
    case '/pagamento/sucesso': return <RetornoPagamento tipo="sucesso" />;
    case '/pagamento/pendente': return <RetornoPagamento tipo="pendente" />;
    case '/pagamento/falha': return <RetornoPagamento tipo="falha" />;
    default: return <Home />;
  }
}
