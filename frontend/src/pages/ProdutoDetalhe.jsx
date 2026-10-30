import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Imagem from '../components/Imagem';
import { api } from '../services/api';
import { adicionarAoCarrinho } from '../services/carrinho';
import { formatarPreco } from '../utils/moeda';
import PaginaErro from './PaginaErro';

export default function ProdutoDetalhe() {
  const id = window.location.pathname.split('/').filter(Boolean).at(-1);
  const [produto, setProduto] = useState(null);
  const [erro, setErro] = useState(false);
  const [aviso, setAviso] = useState('');
  const [erroCarrinho, setErroCarrinho] = useState('');
  const imagemSnack = String(produto?.imagem || '').includes('snack-');

  useEffect(() => {
    let ativo = true;
    api(`/produtos/${encodeURIComponent(id)}`)
      .then((dados) => { if (ativo) setProduto(dados); })
      .catch(() => { if (ativo) setErro(true); });
    return () => { ativo = false; };
  }, [id]);

  if (erro) return <PaginaErro codigo={404} />;

  const esgotado = produto && Number(produto.estoque) <= 0;

  return (
    <div className="min-h-screen bg-choco-creme text-choco-marrom">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <a href="/produtos" className="text-sm font-bold text-choco-vinho hover:underline">← Voltar aos produtos</a>
        {!produto ? (
          <p className="py-24 text-center">Carregando produto...</p>
        ) : (
          <article className="mt-6 grid overflow-hidden rounded-3xl bg-white shadow-lg md:grid-cols-2">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden bg-[#f8f0d3]">
              <Imagem
                src={produto.imagem}
                alt={produto.nome}
                className={`absolute inset-0 h-full w-full object-contain ${imagemSnack ? 'scale-110' : ''}`}
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-choco-vermelho">{produto.categoria || 'Choco World'}</p>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{produto.nome}</h1>
              <p className="mt-5 whitespace-pre-line text-base leading-7 text-choco-marrom/75">{produto.descricao}</p>
              <p className="mt-8 text-3xl font-extrabold text-choco-vermelho">{formatarPreco(produto.preco)}</p>
              {esgotado && <p className="mt-2 text-sm font-semibold text-choco-vermelho">Produto esgotado</p>}
              <button type="button" disabled={esgotado} onClick={() => { const adicionado = adicionarAoCarrinho(produto); setAviso(adicionado ? 'Produto adicionado ao carrinho.' : ''); setErroCarrinho(adicionado ? '' : 'Não foi possível adicionar. Entre na sua conta e confira o estoque disponível.'); }} className="mt-7 min-h-12 rounded-xl bg-choco-vermelho px-6 py-3 font-bold text-white transition hover:bg-choco-vinho disabled:cursor-not-allowed disabled:opacity-50">
                {esgotado ? 'Esgotado' : 'Adicionar ao carrinho'}
              </button>
              {aviso && <p role="status" className="mt-3 text-sm font-semibold text-green-700">{aviso} <a href="/carrinho" className="underline">Ver carrinho</a></p>}
              {erroCarrinho && <p role="alert" className="mt-3 text-sm font-semibold text-choco-vermelho">{erroCarrinho}</p>}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
