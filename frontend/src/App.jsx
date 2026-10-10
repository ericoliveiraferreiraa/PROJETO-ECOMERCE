
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import MinhaConta from './pages/MinhaConta';
import MeusPedidos from './pages/MeusPedidos';

export default function App() {
  const caminho = window.location.pathname;

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

    case '/admin/login':
      return <AuthPage tipo="admin" />;

    case '/admin':
      return <AdminDashboard />;

    case '/minha-conta':
      return <MinhaConta />;

    case '/meus-pedidos':
      return <MeusPedidos />;

    default:
      return <Home />;
  }
}