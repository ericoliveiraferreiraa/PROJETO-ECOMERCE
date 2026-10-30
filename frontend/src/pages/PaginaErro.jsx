import Logo from '../components/Logo';

export default function PaginaErro({ codigo = 404 }) {
  const indisponivel = Number(codigo) === 500;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-choco-creme px-5 py-12 text-center text-choco-marrom">
      <a href="/" aria-label="Choco World, página inicial">
        <Logo variante="auth" />
      </a>

      <p className="mt-10 text-7xl font-black tracking-tight text-choco-vermelho sm:text-9xl">
        {indisponivel ? '500' : '404'}
      </p>
      <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
        {indisponivel ? 'Tivemos um problema' : 'Esta página não foi encontrada'}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-choco-marrom/70">
        {indisponivel
          ? 'Ocorreu um erro interno ao carregar esta página. Tente novamente em instantes ou volte para a loja.'
          : 'Parece que este endereço não existe. Confira o link ou volte para a loja.'}
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        {indisponivel && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-choco-vermelho px-6 py-3 font-bold text-choco-vermelho transition hover:bg-choco-vermelho/5"
          >
            Tentar novamente
          </button>
        )}
        <a
          href="/"
          className="rounded-xl bg-choco-vermelho px-6 py-3 font-bold text-white transition hover:bg-choco-vinho"
        >
          Voltar para a Choco World
        </a>
      </div>
    </main>
  );
}
