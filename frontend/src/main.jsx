import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import PaginaErro from './pages/PaginaErro';

class ErrorBoundary extends React.Component {
  state = { falhou: false };
  static getDerivedStateFromError() { return { falhou: true }; }
  render() { return this.state.falhou ? <PaginaErro codigo={500} /> : this.props.children; }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </StrictMode>
);
