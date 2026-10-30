// Em desenvolvimento, o Vite encaminha /api para o backend local.
// Isso mantém as chamadas de API no mesmo domínio quando o frontend é
// acessado por um túnel público.
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
if (resposta.status >= 500) {
  window.location.assign('/500');
}

throw new Error(
dados.erro || `Erro na requisição (${resposta.status})`
);
}

return dados;
}
