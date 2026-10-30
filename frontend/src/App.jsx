
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
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import PaginaErro from './pages/PaginaErro';
import RecuperarSenha from './pages/RecuperarSenha';

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

      if (paginasPrivadas.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    function reiniciarTemporizador() {
      clearTimeout(temporizador);

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
    reiniciarTemporizador();

    return () => {
      clearTimeout(temporizador);

      eventos.forEach((evento) => {
        window.removeEventListener(evento, reiniciarTemporizador);
      });
    };
  }, [caminho]);

  switch (caminho) {
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

    case '/recuperar-senha':
    case '/redefinir-senha':
      return <RecuperarSenha />;

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

    case '/erro':
      return <PaginaErro codigo={500} />;

    default:
      if (caminho.startsWith('/produto/')) return <ProdutoDetalhe />;
      return <PaginaErro codigo={404} />;
  }
}
