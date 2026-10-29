<<<<<<< HEAD

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

import { encerrarSessao } from './services/sessao';

const TEMPO_INATIVIDADE = 15 * 60 * 1000; // 15 minutos

export default function App() {
  const caminho = window.location.pathname;

  useEffect(() => {
    // O temporizador é exclusivo da sessão do cliente.
    const token = localStorage.getItem('token');
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (!token || tipoUsuario !== 'cliente') {
      return;
    }

    let temporizador;

    function encerrarPorInatividade() {
      // Remove token e tipoUsuario, mas preserva o carrinho.
      encerrarSessao();

      // Se estiver em uma página exclusiva do cliente,
      // volta para o login.
      const paginasPrivadas = [
        '/minha-conta',
        '/meus-pedidos',
      ];

=======
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
>>>>>>> pagamento
      if (paginasPrivadas.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    function reiniciarTemporizador() {
      clearTimeout(temporizador);
<<<<<<< HEAD

      temporizador = setTimeout(
        encerrarPorInatividade,
        TEMPO_INATIVIDADE
      );
    }

    // Atividades que renovam os 15 minutos.
    const eventos = [
      'pointerdown',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart',
    ];

    eventos.forEach((evento) => {
      window.addEventListener(evento, reiniciarTemporizador, {
        passive: true,
      });
    });

    // Começa a contar a partir da abertura da aplicação.
=======
      temporizador = setTimeout(encerrarPorInatividade, TEMPO_INATIVIDADE);
    }

    const eventos = ['pointerdown', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    eventos.forEach((evento) => {
      window.addEventListener(evento, reiniciarTemporizador, { passive: true });
    });
>>>>>>> pagamento
    reiniciarTemporizador();

    return () => {
      clearTimeout(temporizador);
<<<<<<< HEAD

      eventos.forEach((evento) => {
        window.removeEventListener(evento, reiniciarTemporizador);
      });
=======
      eventos.forEach((evento) => window.removeEventListener(evento, reiniciarTemporizador));
>>>>>>> pagamento
    };
  }, [caminho]);

  switch (caminho) {
<<<<<<< HEAD
    case '/':
      return <Home />;

    case '/produtos':
      return <Produtos />;

    case '/carrinho':
      return <Carrinho />;

    case '/cadastro':
      return <AuthPage tipo="cadastro" />;

    case '/login':
      return <AuthPage tipo="login" />;

    case '/admin/login':
      return <AuthPage tipo="admin" />;

    case '/admin':
      return <AdminDashboard />;

    case '/minha-conta':
      return <MinhaConta />;

    case '/meus-pedidos':
      return <MeusPedidos />;

    case '/sobre-nos':
  return <SobreNos />;

case '/contato':
  return <Contato />;

case '/ticket-premiado':
  return <TicketPremiado />;  

    default:
      return <Home />;
  }
}
=======
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
>>>>>>> pagamento
