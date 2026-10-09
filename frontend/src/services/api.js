const API_URL = 'http://localhost:4000';

export function getToken() {
  return localStorage.getItem('token');
}

export function salvarToken(token) {
  localStorage.setItem('token', token);
}

export function sair() {
  localStorage.removeItem('token');
}

// Funcao unica para falar com a API.
// autenticado: true manda o token no header Authorization.
export async function api(caminho, { metodo = 'GET', corpo, autenticado = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (autenticado) headers.Authorization = `Bearer ${getToken()}`;

  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Erro na requisicao');
  return dados;
}
