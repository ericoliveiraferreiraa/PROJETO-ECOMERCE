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

// Função única para comunicação com a API.
// Aceita method/body e também metodo/corpo para compatibilidade.
export async function api(caminho, opcoes = {}) {
const metodo = opcoes.method ?? opcoes.metodo ?? 'GET';
const corpo = opcoes.body ?? opcoes.corpo;
const autenticado = opcoes.autenticado ?? false;

const headers = {};

if (corpo !== undefined && corpo !== null) {
headers['Content-Type'] = 'application/json';
}

if (autenticado) {
const token = getToken();


if (token) {
  headers.Authorization = `Bearer ${token}`;
}


}

const resposta = await fetch(`${API_URL}${caminho}`, {
method: metodo,
headers,
body: corpo !== undefined && corpo !== null
? JSON.stringify(corpo)
: undefined,
});

const dados = await resposta.json().catch(() => ({}));

if (!resposta.ok) {
throw new Error(
dados.erro || `Erro na requisição (${resposta.status})`
);
}

return dados;
}
