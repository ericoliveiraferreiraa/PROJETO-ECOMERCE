import Imagem from './Imagem';
import { CartIcon } from './icons';
import { formatarPreco } from '../utils/moeda';

// fundo: cor pastel da area da imagem (vem do carrossel)
export default function CardProduto({ produto, fundo, onAdicionar }) {
  const esgotado = produto.estoque === 0;

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <div
        className="flex aspect-[4/5] items-center justify-center rounded-xl p-3"
        style={{ backgroundColor: fundo }}
      >
        <Imagem
          src={produto.imagem}
          alt={produto.nome}
          rotulo="Imagem do produto"
          className="max-h-full w-full rounded-lg object-contain"
        />
      </div>

      <div className="mt-3 px-1">
        <h3 className="truncate text-sm font-bold text-choco-marrom" title={produto.nome}>
          {produto.nome}
        </h3>
        {esgotado ? (
          <p className="text-xs font-semibold text-choco-vermelho">Esgotado</p>
        ) : (
          <p className="truncate text-xs text-neutral-500">{produto.descricao}</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/10 px-1 pt-3">
        <span className="text-sm font-extrabold text-choco-vermelho">{formatarPreco(produto.preco)}</span>
        <button
          type="button"
          onClick={() => onAdicionar(produto)}
          disabled={esgotado}
          aria-label={esgotado ? `${produto.nome} esgotado` : `Adicionar ${produto.nome} ao carrinho`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-choco-marrom transition-colors hover:bg-choco-vermelho hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-neutral-100 disabled:hover:text-choco-marrom"
        >
          <CartIcon width={14} height={14} />
        </button>
      </div>
    </article>
  );
}
