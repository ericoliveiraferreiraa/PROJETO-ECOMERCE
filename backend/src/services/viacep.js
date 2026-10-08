// Consulta de CEP no ViaCEP (gratuito, sem chave de acesso).
async function consultarCep(cepBruto) {
  // aceita "01001-000" ou "01001000": tira tudo que nao for numero
  const cep = String(cepBruto || '').replace(/\D/g, '');

  if (cep.length !== 8) {
    throw erroHttp(400, 'CEP invalido: informe 8 digitos.');
  }

  let resposta;
  try {
    resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000), // desiste depois de 5 segundos
    });
  } catch (err) {
    throw erroHttp(502, 'Servico de consulta de CEP indisponivel. Tente novamente.');
  }

  if (!resposta.ok) {
    throw erroHttp(502, 'Servico de consulta de CEP indisponivel. Tente novamente.');
  }

  let dados;
  try {
    dados = await resposta.json();
  } catch (err) {
    throw erroHttp(502, 'Resposta invalida do servico de CEP.');
  }

  if (dados.erro) {
    throw erroHttp(404, 'CEP nao encontrado.');
  }

  return {
    cep,
    logradouro: dados.logradouro || '',
    bairro: dados.bairro || '',
    cidade: dados.localidade,
    estado: dados.uf,
  };
}

function erroHttp(status, mensagem) {
  const err = new Error(mensagem);
  err.status = status;
  return err;
}

module.exports = { consultarCep };