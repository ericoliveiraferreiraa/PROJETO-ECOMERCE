import Logo from '../components/Logo';

export default function PaginaErro({ codigo = 404 }) {
  const indisponivel = codigo === 500;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-choco-creme px-5 py-12 text-center text-choco-marrom">
      <a href="/" aria-label="Choco World, página inicial"><Logo variante="auth" /></a>
      <p className="mt-10 text-7xl font-black tracking-tight text-choco-vermelho sm:text-9xl">{codigo}</p>
      <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">{indisponivel ? 'Tivemos um problema' : 'Essa página não foi encontrada'}</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-choco-marrom/70">{indisponivel ? 'Ocorreu um erro ao carregar esta página. Tente novamente em instantes.' : 'Parece que esse caminho não existe. Vamos voltar para a loja?'}</p>
      <a href="/" className="mt-7 rounded-xl bg-choco-vermelho px-6 py-3 font-bold text-white transition hover:bg-choco-vinho">Voltar para a Choco World</a>
    </main>
  );
}
