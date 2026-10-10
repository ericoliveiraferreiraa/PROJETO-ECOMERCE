
import { api, getToken, sair as removerToken } from './api';

const EVENTO_SESSAO = 'sessao:atualizada';

export function avisarSessaoAtualizada() {
  window.dispatchEvent(new Event(EVENTO_SESSAO));
}

export function ouvirSessaoAtualizada(callback) {
  window.addEventListener(EVENTO_SESSAO, callback);

  return () => {
    window.removeEventListener(EVENTO_SESSAO, callback);
  };
}

export async function buscarUsuarioLogado() {
  const token = getToken();
  const tipo = localStorage.getItem('tipoUsuario');

  if (!token || tipo !== 'cliente') {
    return null;
  }

  try {
    return await api('/clientes/me', { autenticado: true });
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  removerToken();
  localStorage.removeItem('tipoUsuario');
  avisarSessaoAtualizada();
}