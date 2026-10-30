import { useEffect, useState } from 'react';
import Imagem from './Imagem';
import { CartIcon } from './icons';
import { formatarPreco } from '../utils/moeda';
import { lerCarrinho } from '../services/carrinho';

export default function CardProduto({ produto, onAdicionar }) {
  const [quantidadeNoCarrinho, setQuantidadeNoCarrinho] = useState(0);
  const estoque = Number(produto.estoque);
  const estoqueDefinido =
    produto.estoque !== null &&
    produto.estoque !== undefined &&
    Number.isFinite(estoque);
  const esgotado = estoqueDefinido && estoque <= 0;
  const limiteAtingido =
    estoqueDefinido && quantidadeNoCarrinho >= estoque;
  const imagemSnack = String(produto.imagem || '').includes('snack-');

  useEffect(() => {
    function atualizarQuantidadeNoCarrinho() {
      const item = lerCarrinho().find(
        (produtoCarrinho) =>
          String(produtoCarrinho.id_produto) === String(produto.id_produto)
      );
      setQuantidadeNoCarrinho(Number(item?.quantidade || 0));
    }

    atualizarQuantidadeNoCarrinho();
    window.addEventListener('carrinho:atualizado', atualizarQuantidadeNoCarrinho);
    return () =>
      window.removeEventListener('carrinho:atualizado', atualizarQuantidadeNoCarrinho);
  }, [produto.id_produto]);

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-choco-vermelho/30">
      {/* Área de imagem com proporção fixa */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#f8f0d3]">
        <Imagem
          src={produto.imagem}
          alt={produto.nome}
          rotulo="Imagem do produto"
          className={`absolute inset-0 h-full w-full object-contain transition duration-500 ${imagemSnack ? 'scale-110 group-hover:scale-[1.15]' : 'group-hover:scale-105'}`}
        />
        <a href={`/produto/${produto.id_produto}`} className="absolute inset-0" aria-label={`Ver detalhes de ${produto.nome}`} />
      </div>

      <div className="mt-3 mb-3 px-1">
        <a href={`/produto/${produto.id_produto}`} className="truncate text-sm font-bold text-choco-marrom hover:text-choco-vinho" title={produto.nome}>
          {produto.nome}
        </a>

        {esgotado ? (
          <p className="text-xs font-semibold text-choco-vermelho">
            Esgotado
          </p>
        ) : (
          <p className="truncate text-xs text-neutral-500">
            {produto.descricao}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-col items-stretch gap-2 border-t border-black/10 px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg font-extrabold text-choco-vermelho sm:text-xl">{formatarPreco(produto.preco)}</span>
        <button
          type="button"
          onClick={() => onAdicionar(produto)}
          disabled={esgotado || limiteAtingido}
          aria-label={
            esgotado
              ? `${produto.nome} esgotado`
              : limiteAtingido
                ? `Estoque disponível de ${produto.nome} já está no carrinho`
                : `Adicionar ${produto.nome} ao carrinho`
          }
          className="flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-choco-vermelho px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-choco-vinho disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:gap-2 sm:px-4 sm:text-xs"
        >
          <CartIcon width={14} height={14} />
          <span>
            {esgotado ? 'Esgotado' : limiteAtingido ? 'No limite' : 'Adicionar'}
          </span>
        </button>
      </div>
    </article>
  );
}
