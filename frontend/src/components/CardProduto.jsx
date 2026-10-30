import Imagem from './Imagem';
import { CartIcon } from './icons';
import { formatarPreco } from '../utils/moeda';

export default function CardProduto({ produto, onAdicionar }) {
  const esgotado = produto.estoque === 0;

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-choco-vermelho/30">
      {/* Área de imagem com proporção fixa */}
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#f7efe4]"
      >
        <Imagem
          src={produto.imagem}
          alt={produto.nome}
          rotulo="Imagem do produto"
          className="absolute inset-0 h-full w-full rounded-lg object-contain p-3 transition duration-500 group-hover:scale-105"
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

      <div className="mt-auto flex items-center justify-between border-t border-black/10 px-1 pt-3">
        <span className="text-lg font-extrabold text-choco-vermelho sm:text-xl">{formatarPreco(produto.preco)}</span>
        <button
          type="button"
          onClick={() => onAdicionar(produto)}
          disabled={esgotado}
          aria-label={
            esgotado
              ? `${produto.nome} esgotado`
              : `Adicionar ${produto.nome} ao carrinho`
          }
          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-choco-vermelho px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-choco-vinho disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4 sm:text-xs"
        >
          <CartIcon width={14} height={14} />
          <span>Adicionar</span>
        </button>
      </div>
    </article>
  );
}
