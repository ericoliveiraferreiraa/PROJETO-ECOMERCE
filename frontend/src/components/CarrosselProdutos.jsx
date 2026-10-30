
import { useCallback, useEffect, useRef, useState } from 'react';
import CardProduto from './CardProduto';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const SETA =
  'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-choco-marrom shadow-md ring-1 ring-black/10 transition-colors hover:bg-choco-vermelho hover:text-white disabled:pointer-events-none disabled:opacity-0 md:h-10 md:w-10';

export default function CarrosselProdutos({
  produtos = [],
  onAdicionar,
}) {
  const trilho = useRef(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  const atualizarSetas = useCallback(() => {
    const elemento = trilho.current;

    if (!elemento) return;

    setPodeVoltar(elemento.scrollLeft > 4);

    setPodeAvancar(
      elemento.scrollLeft + elemento.clientWidth <
        elemento.scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    const elemento = trilho.current;

    atualizarSetas();

    window.addEventListener('resize', atualizarSetas);

    let observador;

    if (elemento && 'ResizeObserver' in window) {
      observador = new ResizeObserver(atualizarSetas);
      observador.observe(elemento);
    }

    return () => {
      window.removeEventListener('resize', atualizarSetas);
      observador?.disconnect();
    };
  }, [produtos, atualizarSetas]);

  function rolar(direcao) {
    const elemento = trilho.current;

    if (!elemento) return;

    const reduzirMovimento = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    elemento.scrollBy({
      left: direcao * elemento.clientWidth,
      behavior: reduzirMovimento ? 'auto' : 'smooth',
    });
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => rolar(-1)}
        disabled={!podeVoltar}
        aria-label="Produtos anteriores"
        className={`${SETA} left-1 md:-left-2 lg:-left-5`}
      >
        <ChevronLeftIcon width={20} height={20} />
      </button>

      <div
        ref={trilho}
        onScroll={atualizarSetas}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Produtos em destaque"
        tabIndex={0}
        className="flex items-stretch gap-6 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {produtos.map((produto) => (
          <div
            key={produto.id_produto}
            className="min-w-0 shrink-0 basis-[78%] snap-start sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_4.5rem)/4)]"
          >
            <div className="flex w-full">
              <CardProduto
                produto={produto}
                onAdicionar={onAdicionar}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => rolar(1)}
        disabled={!podeAvancar}
        aria-label="Próximos produtos"
        className={`${SETA} right-1 md:-right-2 lg:-right-5`}
      >
        <ChevronRightIcon width={20} height={20} />
      </button>
    </div>
  );
}
