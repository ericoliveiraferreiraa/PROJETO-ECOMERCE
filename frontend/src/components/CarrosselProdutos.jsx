import { useCallback, useEffect, useRef, useState } from 'react';
import CardProduto from './CardProduto';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

// Cores pastel que se repetem nos cards, como no layout do Figma
const FUNDOS = ['#FDECEC', '#F1F1F1', '#FFF8E0', '#E8F1FC'];

const SETA =
  'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-choco-marrom shadow-md ring-1 ring-black/10 transition-colors hover:bg-choco-vermelho hover:text-white disabled:pointer-events-none disabled:opacity-0 md:flex';

export default function CarrosselProdutos({ produtos, onAdicionar }) {
  const trilho = useRef(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  // liga/desliga as setas conforme a posicao da rolagem
  const atualizarSetas = useCallback(() => {
    const el = trilho.current;
    if (!el) return;
    setPodeVoltar(el.scrollLeft > 4);
    setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    atualizarSetas();
    window.addEventListener('resize', atualizarSetas);
    return () => window.removeEventListener('resize', atualizarSetas);
  }, [produtos, atualizarSetas]);

  function rolar(direcao) {
    const el = trilho.current;
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direcao * el.clientWidth, behavior: reduzirMovimento ? 'auto' : 'smooth' });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => rolar(-1)}
        disabled={!podeVoltar}
        aria-label="Produtos anteriores"
        className={`${SETA} -left-2 lg:-left-5`}
      >
        <ChevronLeftIcon width={20} height={20} />
      </button>

      {/* Os cards ficam lado a lado e a rolagem "encaixa" de card em card (snap) */}
      <div
        ref={trilho}
        onScroll={atualizarSetas}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Produtos em destaque"
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {produtos.map((produto, i) => (
          <div
            key={produto.id_produto}
            className="shrink-0 basis-[78%] snap-start sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_4.5rem)/4)]"
          >
            <CardProduto produto={produto} fundo={FUNDOS[i % FUNDOS.length]} onAdicionar={onAdicionar} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => rolar(1)}
        disabled={!podeAvancar}
        aria-label="Próximos produtos"
        className={`${SETA} -right-2 lg:-right-5`}
      >
        <ChevronRightIcon width={20} height={20} />
      </button>
    </div>
  );
}
