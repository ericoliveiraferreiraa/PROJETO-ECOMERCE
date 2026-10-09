// variante: 'navbar' (vermelha, pequena), 'rodape' (branca, pequena) ou 'hero' (grande, CHOCO branco e WORLD dourado)
const ESTILOS = {
  navbar: {
    escala: 'text-2xl',
    choco: 'text-choco-vermelho',
    world: 'text-choco-vermelho text-[0.5em] tracking-[0.2em]',
  },
  rodape: {
    escala: 'text-2xl',
    choco: 'text-white',
    world: 'text-white text-[0.5em] tracking-[0.2em]',
  },
  hero: {
    escala: 'text-5xl sm:text-6xl',
    choco: 'text-white',
    world: 'text-choco-dourado',
  },
};

export default function Logo({ variante = 'navbar' }) {
  const estilo = ESTILOS[variante];

  return (
    <span className={`inline-flex flex-col font-extrabold leading-[0.95] ${estilo.escala}`}>
      <span className={estilo.choco}>CHOCO</span>
      <span className={estilo.world}>WORLD</span>
    </span>
  );
}
