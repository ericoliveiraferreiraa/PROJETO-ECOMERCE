import Imagem from './Imagem';
import { CartIcon } from './icons';
import { formatarPreco } from '../utils/moeda';

export default function CardProduto({ produto, fundo, onAdicionar }) {
  const esgotado = produto.estoque === 0;

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      {/* Área de imagem com proporção fixa */}
      <div
        className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl"
        style={{ backgroundColor: fundo }}
      >
        <Imagem
          src={produto.imagem}
          alt={produto.nome}
          rotulo="Imagem do produto"
          className="absolute inset-0 h-full w-full object-contain p-3"
        />
      </div>

      {/* Informações do produto */}
      <div className="mt-3 min-w-0 flex-1 px-1">
        <h3
          className="truncate text-sm font-bold text-choco-marrom"
          title={produto.nome}
        >
          {produto.nome}
        </h3>

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

      {/* Preço e botão sempre na parte inferior */}
      <div className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t border-black/10 px-1 pt-3">
        <span className="truncate text-sm font-extrabold text-choco-vermelho">
          {formatarPreco(produto.preco)}
        </span>

        <button
          type="button"
          onClick={() => onAdicionar(produto)}
          disabled={esgotado}
          aria-label={
            esgotado
              ? `${produto.nome} esgotado`
              : `Adicionar ${produto.nome} ao carrinho`
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-choco-marrom transition-colors hover:bg-choco-vermelho hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CartIcon width={14} height={14} />
        </button>
      </div>
    </article>
  );
}
