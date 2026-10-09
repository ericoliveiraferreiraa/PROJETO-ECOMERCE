
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';

export default function App() {
  const caminho = window.location.pathname;

  switch (caminho) {
    case '/cadastro':
      return <AuthPage tipo="cadastro" />;

    case '/login':
      return <AuthPage tipo="login" />;

    case '/admin/login':
      return <AuthPage tipo="admin" />;

    case '/admin':
      return <AdminDashboard />;

    default:
      return <Home />;
  }
}