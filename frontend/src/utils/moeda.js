// O banco guarda o preco em centavos (800 = R$ 8,00).
export function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
