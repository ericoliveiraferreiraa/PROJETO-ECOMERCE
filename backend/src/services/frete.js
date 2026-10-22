
const CEP_ORIGEM = '06401-134';

const FRETES = {
  local: 1290,
  regional: 1990,
  demais: 2490,
};

function calcularFrete(cepDestino) {
  const cep = String(cepDestino || '').replace(/\D/g, '');

  if (!/^\d{8}$/.test(cep)) {
    const erro = new Error('CEP de destino inválido.');
    erro.statusCode = 400;
    throw erro;
  }

  const prefixo = Number(cep.slice(0, 2));

  let valor;

  if (prefixo === 6) {
    valor = FRETES.local;
  } else if (prefixo >= 1 && prefixo <= 5) {
    valor = FRETES.regional;
  } else if (prefixo >= 7 && prefixo <= 9) {
    valor = FRETES.regional;
  } else {
    valor = FRETES.demais;
  }

  return {
    cep_origem: CEP_ORIGEM,
    cep_destino: cep,
    valor_frete: valor,
    valor_formatado: (valor / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
  };
}

module.exports = { calcularFrete };
