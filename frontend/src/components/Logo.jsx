export default function Logo({ variante = 'navbar' }) {
  const tamanhos = {
    navbar: 'w-28 sm:w-36',
    rodape: 'w-28 sm:w-32',
    hero: 'w-20 sm:w-24',
  };

  return (
    <img
      src="/logo-choco-world.png"
      alt="Choco World"
      className={`block h-auto max-w-full object-contain ${
        tamanhos[variante] || tamanhos.navbar
      }`}
    />
  );
}