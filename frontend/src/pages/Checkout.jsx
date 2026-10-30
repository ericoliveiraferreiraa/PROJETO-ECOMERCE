
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, getToken } from '../services/api';
import {
  lerCarrinho,
  limparCarrinho,
} from '../services/carrinho';

const CEP_ORIGEM = '06401-134';

function formatarPreco(valor) {
  return (Number(valor || 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function normalizarLista(resposta, chaves = []) {
  if (Array.isArray(resposta)) return resposta;

  for (const chave of chaves) {
    if (Array.isArray(resposta?.[chave])) {
      return resposta[chave];
    }
  }

  return [];
}

function normalizarEndereco(endereco) {
  return {
    ...endereco,
    cep: String(endereco?.cep || '').replace(/\D/g, ''),
    logradouro:
      endereco?.logradouro || endereco?.street || '',
    bairro: endereco?.bairro || endereco?.neighborhood || '',
    cidade:
      endereco?.cidade ||
      endereco?.localidade ||
      endereco?.city ||
      '',
    estado: endereco?.estado || endereco?.uf || '',
  };
}

export default function Checkout() {
  const [itens, setItens] = useState(() => lerCarrinho());
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [iniciandoPagamento, setIniciandoPagamento] = useState(false);
  const [enderecos, setEnderecos] = useState([]);
  const [idEndereco, setIdEndereco] = useState('');
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const [criandoEndereco, setCriandoEndereco] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const token = getToken();

  const subtotal = useMemo(
    () =>
      itens.reduce(
        (total, item) =>
          total +
          Number(item.preco || 0) * Number(item.quantidade || 0),
        0
      ),
    [itens]
  );

  const enderecoSelecionado = useMemo(
    () =>
      enderecos.find(
        (item) =>
          String(item.id_endereco) === String(idEndereco)
      ),
    [enderecos, idEndereco]
  );

  const valorFreteEstimado = useMemo(() => {
    const cep = String(enderecoSelecionado?.cep || '').replace(/\D/g, '');

    if (!/^\d{8}$/.test(cep)) return null;

    const prefixo = Number(cep.slice(0, 2));
    if (prefixo === 6) return 1290;
    if ((prefixo >= 1 && prefixo <= 5) || (prefixo >= 7 && prefixo <= 9)) {
      return 1990;
    }
    return 2490;
  }, [enderecoSelecionado]);

  const totalEstimado = subtotal + (valorFreteEstimado ?? 0);

  const carregarEnderecos = useCallback(async () => {
    try {
      const resposta = await api('/enderecos', {
        autenticado: true,
      });

      const lista = normalizarLista(resposta, ['enderecos', 'dados'])
        .map(normalizarEndereco);

      setEnderecos(lista);

      setIdEndereco((atual) => {
        if (
          atual &&
          lista.some(
            (item) => String(item.id_endereco) === String(atual)
          )
        ) {
          return atual;
        }

        return lista.length ? String(lista[0].id_endereco) : '';
      });
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar seus endereços.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    carregarEnderecos();
  }, [token, carregarEnderecos]);

  useEffect(() => {
    function atualizarCarrinho() {
      setItens(lerCarrinho());
    }

    window.addEventListener('carrinho:atualizado', atualizarCarrinho);

    return () => {
      window.removeEventListener(
        'carrinho:atualizado',
        atualizarCarrinho
      );
    };
  }, []);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setEndereco((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  async function consultarCep() {
    const cepLimpo = endereco.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      setErro('Informe um CEP válido com 8 números.');
      return;
    }

    setErro('');
    setMensagem('');
    setConsultandoCep(true);

    try {
      const resposta = await api(`/enderecos/cep/${cepLimpo}`, {
        autenticado: true,
      });

      const dados = normalizarEndereco(
        resposta?.endereco || resposta?.dados || resposta
      );

      if (dados.erro) {
        throw new Error('CEP não encontrado.');
      }

      setEndereco((atual) => ({
        ...atual,
        cep: cepLimpo,
        logradouro: dados.logradouro || atual.logradouro,
        bairro: dados.bairro || atual.bairro,
        cidade: dados.cidade || atual.cidade,
        estado: dados.estado || atual.estado,
      }));

      setMensagem(
        'CEP consultado. Confira o endereço e informe o número.'
      );
    } catch (error) {
      setErro(error.message || 'Não foi possível consultar o CEP.');
    } finally {
      setConsultandoCep(false);
    }
  }

  async function salvarNovoEndereco(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');

    const cepLimpo = endereco.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      setErro('Informe um CEP válido com 8 números.');
      return;
    }

    if (!endereco.numero.trim()) {
      setErro('Informe o número do endereço.');
      return;
    }

    setSalvandoEndereco(true);

    try {
      const resposta = await api('/enderecos', {
        method: 'POST',
        autenticado: true,
        body: {
          cep: cepLimpo,
          logradouro: endereco.logradouro.trim(),
          numero: endereco.numero.trim(),
          complemento: endereco.complemento.trim(),
          bairro: endereco.bairro.trim(),
        },
      });

      const novoEndereco =
        resposta?.endereco ||
        resposta?.dados ||
        resposta;

      await carregarEnderecos();

      if (novoEndereco?.id_endereco) {
        setIdEndereco(String(novoEndereco.id_endereco));
      }

      setCriandoEndereco(false);
      setMensagem('Endereço salvo com sucesso.');
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o endereço.');
    } finally {
      setSalvandoEndereco(false);
    }
  }


async function continuarParaPagamento() {
  setErro('');
  setMensagem('');

  if (!itens.length) {
    setErro('Seu carrinho está vazio.');
    return;
  }

  if (!idEndereco || !enderecoSelecionado) {
    setErro('Selecione um endereço de entrega.');
    return;
  }

  setIniciandoPagamento(true);

  try {
    // Cria o pedido somente uma vez nesta sessão da tela.
    let pedido = pedidoCriado;

    if (!pedido) {
      pedido = await api('/pedidos', {
        method: 'POST',
        autenticado: true,
        body: {
          id_endereco: Number(idEndereco),
          itens: itens.map((item) => ({
            id_produto: Number(item.id_produto),
            quantidade: Number(item.quantidade),
          })),
        },
      });

      if (!pedido?.id_pedido) {
        throw new Error('O servidor não retornou o número do pedido.');
      }

      setPedidoCriado(pedido);
    }

    // Solicita ao backend a preferência do Mercado Pago.
    const pagamento = await api(
      `/pedidos/${pedido.id_pedido}/pagamento`,
      {
        method: 'POST',
        autenticado: true,
        body: {},
      }
    );

    if (!pagamento?.url_checkout) {
      throw new Error(
        'O servidor não retornou a URL do Mercado Pago.'
      );
    }

    // O carrinho permanece salvo até confirmarmos o pagamento.
    window.location.href = pagamento.url_checkout;
  } catch (error) {
    setErro(
      error.message ||
        'Não foi possível iniciar o pagamento. Tente novamente.'
    );
  } finally {
    setIniciandoPagamento(false);
  }
}


  if (!token) return null;

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-8 text-[#401522] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <a
          href="/carrinho"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7b293c] hover:underline"
        >
          <span aria-hidden="true">←</span>
          Voltar ao carrinho
        </a>

        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#a66b45]">
            Choco World
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Finalizar compra
          </h1>
          <p className="mt-2 text-sm text-[#775d5d]">
            Confira a entrega e os produtos do seu pedido.
          </p>
        </header>

        <nav
          aria-label="Etapas da compra"
          className="mb-8 grid grid-cols-3 gap-2"
        >
          {[
            ['1', 'Endereço', true],
            ['2', 'Pagamento', false],
            ['3', 'Conclusão', false],
          ].map(([numero, titulo, ativo]) => (
            <div
              key={numero}
              className={`rounded-xl border p-3 text-center ${
                ativo
                  ? 'border-[#702538] bg-[#702538] text-white'
                  : 'border-[#eadbd0] bg-white text-[#8d7771]'
              }`}
            >
              <span className="block text-xs font-bold">ETAPA {numero}</span>
              <span className="mt-1 block text-sm font-semibold">
                {titulo}
              </span>
            </div>
          ))}
        </nav>

        {erro && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {erro}
          </div>
        )}

        {mensagem && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {mensagem}
          </div>
        )}

        {!itens.length ? (
          <section className="rounded-2xl border border-[#eadbd0] bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Seu carrinho está vazio</h2>
            <p className="mt-2 text-[#775d5d]">
              Adicione seus chocolates favoritos para continuar.
            </p>
            <a
              href="/produtos"
              className="mt-5 inline-flex rounded-xl bg-[#702538] px-6 py-3 font-bold text-white hover:bg-[#551b2b]"
            >
              Ver produtos
            </a>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
            <section className="space-y-6">
              <div className="rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      Endereço de entrega
                    </h2>
                    <p className="mt-1 text-sm text-[#775d5d]">
                      Escolha onde deseja receber seu pedido.
                    </p>
                  </div>

                  {!criandoEndereco && (
                    <button
                      type="button"
                      onClick={() => {
                        setErro('');
                        setMensagem('');
                        setEndereco({
                          cep: '',
                          logradouro: '',
                          numero: '',
                          complemento: '',
                          bairro: '',
                          cidade: '',
                          estado: '',
                        });
                        setCriandoEndereco(true);
                      }}
                      className="rounded-lg border border-[#702538] px-4 py-2 text-sm font-bold text-[#702538] hover:bg-[#fff4f0]"
                    >
                      + Novo endereço
                    </button>
                  )}
                </div>

                {carregando ? (
                  <p className="py-5 text-sm text-[#775d5d]">
                    Carregando seus endereços...
                  </p>
                ) : (
                  <>
                    {!criandoEndereco && enderecos.length > 0 && (
                      <div className="space-y-3">
                        {enderecos.map((item) => (
                          <label
                            key={item.id_endereco}
                            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                              String(item.id_endereco) === String(idEndereco)
                                ? 'border-[#702538] bg-[#fff6f0]'
                                : 'border-[#eadbd0] hover:border-[#b88c7b]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="endereco"
                              value={item.id_endereco}
                              checked={
                                String(item.id_endereco) === String(idEndereco)
                              }
                              onChange={(evento) =>
                                setIdEndereco(evento.target.value)
                              }
                              className="mt-1 accent-[#702538]"
                            />
                            <span className="text-sm">
                              <strong className="block">
                                {item.logradouro}, {item.numero}
                              </strong>
                              {item.complemento && (
                                <span className="block">
                                  {item.complemento}
                                </span>
                              )}
                              <span className="block text-[#775d5d]">
                                {item.bairro} — {item.cidade}/{item.estado}
                              </span>
                              <span className="block text-[#775d5d]">
                                CEP: {item.cep}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {!criandoEndereco && enderecos.length === 0 && (
                      <div className="rounded-xl bg-[#fff6f0] p-4 text-sm">
                        Você ainda não tem endereço cadastrado. Adicione um
                        endereço para continuar.
                      </div>
                    )}

                    {criandoEndereco && (
                      <form
                        onSubmit={salvarNovoEndereco}
                        className="space-y-4"
                      >
                        <div>
                          <label
                            htmlFor="cep"
                            className="mb-1 block text-sm font-semibold"
                          >
                            CEP
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="cep"
                              name="cep"
                              value={endereco.cep}
                              onChange={alterarCampo}
                              placeholder="00000-000"
                              inputMode="numeric"
                              maxLength={9}
                              required
                              className="min-w-0 flex-1 rounded-xl border border-[#decac0] px-3 py-3 outline-none focus:border-[#702538]"
                            />
                            <button
                              type="button"
                              onClick={consultarCep}
                              disabled={consultandoCep}
                              className="rounded-xl bg-[#f1e4d9] px-4 py-3 text-sm font-bold text-[#702538] disabled:opacity-60"
                            >
                              {consultandoCep ? 'Buscando...' : 'Consultar'}
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label
                              htmlFor="logradouro"
                              className="mb-1 block text-sm font-semibold"
                            >
                              Rua / Avenida
                            </label>
                            <input
                              id="logradouro"
                              name="logradouro"
                              value={endereco.logradouro}
                              onChange={alterarCampo}
                              required
                              className="w-full rounded-xl border border-[#decac0] px-3 py-3 outline-none focus:border-[#702538]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="numero"
                              className="mb-1 block text-sm font-semibold"
                            >
                              Número
                            </label>
                            <input
                              id="numero"
                              name="numero"
                              value={endereco.numero}
                              onChange={alterarCampo}
                              required
                              className="w-full rounded-xl border border-[#decac0] px-3 py-3 outline-none focus:border-[#702538]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="complemento"
                              className="mb-1 block text-sm font-semibold"
                            >
                              Complemento (opcional)
                            </label>
                            <input
                              id="complemento"
                              name="complemento"
                              value={endereco.complemento}
                              onChange={alterarCampo}
                              className="w-full rounded-xl border border-[#decac0] px-3 py-3 outline-none focus:border-[#702538]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="bairro"
                              className="mb-1 block text-sm font-semibold"
                            >
                              Bairro
                            </label>
                            <input
                              id="bairro"
                              name="bairro"
                              value={endereco.bairro}
                              onChange={alterarCampo}
                              required
                              className="w-full rounded-xl border border-[#decac0] px-3 py-3 outline-none focus:border-[#702538]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="cidade"
                              className="mb-1 block text-sm font-semibold"
                            >
                              Cidade
                            </label>
                            <input
                              id="cidade"
                              name="cidade"
                              value={endereco.cidade}
                              readOnly
                              className="w-full rounded-xl border border-[#eadbd0] bg-[#faf6f1] px-3 py-3"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="estado"
                              className="mb-1 block text-sm font-semibold"
                            >
                              Estado
                            </label>
                            <input
                              id="estado"
                              name="estado"
                              value={endereco.estado}
                              readOnly
                              className="w-full rounded-xl border border-[#eadbd0] bg-[#faf6f1] px-3 py-3"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={salvandoEndereco}
                            className="rounded-xl bg-[#702538] px-5 py-3 font-bold text-white hover:bg-[#551b2b] disabled:opacity-60"
                          >
                            {salvandoEndereco
                              ? 'Salvando...'
                              : 'Salvar endereço'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCriandoEndereco(false);
                              setErro('');
                              setMensagem('');
                            }}
                            className="rounded-xl border border-[#decac0] px-5 py-3 font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold">Pagamento</h2>
                <p className="mt-2 text-sm leading-6 text-[#775d5d]">
                  Na próxima etapa, você será direcionado ao ambiente seguro
                  do Mercado Pago para escolher uma das formas de pagamento
                  disponíveis para sua conta e para o pedido.
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#fff6f0] p-4">
                  <span className="text-2xl" aria-hidden="true">🔒</span>
                  <p className="text-sm">
                    Os dados de pagamento serão tratados pelo Mercado Pago,
                    não armazenados no carrinho do navegador.
                  </p>
                </div>
              </div>
            </section>

            <aside className="rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">Resumo do pedido</h2>

              <div className="mt-5 space-y-4">
                {itens.map((item) => (
                  <div
                    key={item.id_produto}
                    className="flex items-start gap-3"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff6f0]">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt={item.nome}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl" aria-hidden="true">🍫</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.nome}</p>
                      <p className="mt-1 text-sm text-[#775d5d]">
                        Quantidade: {item.quantidade}
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {formatarPreco(
                          Number(item.preco || 0) *
                            Number(item.quantidade || 0)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-dashed border-[#decac0]" />

              <div className="mb-5 rounded-xl border-2 border-[#702538] bg-[#fff6f0] p-4">
                <div className="flex items-center gap-3">
                  <span
                    role="checkbox"
                    aria-checked="true"
                    aria-label="SEDEX selecionado"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#702538] bg-[#702538] text-sm font-bold text-white"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="font-bold text-[#702538]">SEDEX</p>
                    <p className="mt-1 text-xs text-[#775d5d]">
                      Tipo de envio selecionado
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#775d5d]">Subtotal</span>
                  <strong>
                    {formatarPreco(
                      pedidoCriado?.subtotal_produtos ?? subtotal
                    )}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#775d5d]">Frete</span>
                  <strong>
                    {pedidoCriado
                      ? formatarPreco(pedidoCriado.valor_frete)
                      : valorFreteEstimado !== null
                        ? formatarPreco(valorFreteEstimado)
                        : 'Selecione um endereço válido'}
                  </strong>
                </div>
              </div>

              <div className="my-5 border-t border-[#eadbd0]" />

              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">
                  {pedidoCriado ? 'Total do pedido' : 'Total estimado'}
                </span>
                <strong className="text-xl">
                  {formatarPreco(
                    pedidoCriado?.valor_total ?? totalEstimado
                  )}
                </strong>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#775d5d]">
                {pedidoCriado
                  ? `Pedido #${pedidoCriado.id_pedido} — ${pedidoCriado.status}. Continue para abrir o Mercado Pago.`
                  : 'Frete estimado conforme o CEP. O valor definitivo é validado ao criar o pedido.'}
              </p>

              <button
                type="button"
                onClick={continuarParaPagamento}
                disabled={
                  carregando ||
                  salvandoEndereco ||
                  criandoEndereco ||
                  iniciandoPagamento ||
                  !itens.length
                }
                className="mt-6 w-full rounded-xl bg-[#702538] px-5 py-4 font-bold text-white transition hover:bg-[#551b2b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {iniciandoPagamento
                  ? 'Preparando pagamento...'
                  : pedidoCriado
                    ? 'Continuar para o Mercado Pago'
                    : 'Criar pedido e continuar'}
              </button>

              <p className="mt-3 text-center text-xs text-[#775d5d]">
                Origem de referência para o frete: CEP {CEP_ORIGEM}
              </p>

              {!pedidoCriado && (
                <button
                  type="button"
                  onClick={() => {
                    limparCarrinho();
                    setItens([]);
                  }}
                  className="mt-4 w-full text-sm text-[#8d7771] underline hover:text-[#702538]"
                >
                  Limpar carrinho
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
