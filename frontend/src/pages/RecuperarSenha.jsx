import { useState } from 'react';
import Logo from '../components/Logo';
import { api } from '../services/api';

const campo = 'mt-1 w-full rounded-xl border border-choco-pessego/70 bg-white px-4 py-3 text-choco-marrom outline-none focus:border-choco-vinho focus:ring-2 focus:ring-choco-vinho/15';

export default function RecuperarSenha() {
  const [dados, setDados] = useState({ email: '', novaSenha: '', confirmarSenha: '' });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function atualizar(evento) {
    setDados((atual) => ({ ...atual, [evento.target.name]: evento.target.value }));
  }

  async function redefinir(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    if (dados.novaSenha !== dados.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await api('/clientes/redefinir-senha', {
        method: 'POST',
        body: {
          email: dados.email.trim(),
          novaSenha: dados.novaSenha,
        },
      });
      setMensagem(resposta.mensagem);
      setDados({ email: '', novaSenha: '', confirmarSenha: '' });
    } catch (error) {
      setErro(error.message || 'Não foi possível redefinir a senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-choco-creme text-choco-marrom">
      <header className="flex items-center justify-between border-b border-choco-pessego/50 bg-white px-5 py-3 sm:px-10">
        <a href="/" aria-label="Choco World, página inicial"><Logo variante="auth" /></a>
        <a href="/login" className="text-sm font-semibold hover:text-choco-vermelho">Voltar ao login</a>
      </header>
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-lg rounded-3xl border border-choco-pessego/50 bg-white p-6 shadow-xl sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wide text-choco-vermelho">Acesso à sua conta</p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Redefinir senha</h1>
          <p className="mt-3 text-sm leading-6 text-choco-marrom/70">Informe o e-mail cadastrado e escolha uma nova senha.</p>

          {erro && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{erro}</p>}
          {mensagem && <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{mensagem} <a href="/login" className="font-bold underline">Ir para o login</a></p>}

          <form onSubmit={redefinir} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold" htmlFor="email-recuperacao">E-mail cadastrado<input id="email-recuperacao" name="email" className={campo} type="email" autoComplete="email" required value={dados.email} onChange={atualizar} placeholder="voce@exemplo.com" /></label>
            <label className="block text-sm font-semibold" htmlFor="nova-senha">Nova senha<input id="nova-senha" name="novaSenha" className={campo} type="password" minLength={8} autoComplete="new-password" required value={dados.novaSenha} onChange={atualizar} /></label>
            <label className="block text-sm font-semibold" htmlFor="confirmar-senha">Confirme a nova senha<input id="confirmar-senha" name="confirmarSenha" className={campo} type="password" minLength={8} autoComplete="new-password" required value={dados.confirmarSenha} onChange={atualizar} /></label>
            <button disabled={carregando} className="w-full rounded-xl bg-choco-vermelho px-5 py-3 font-bold text-white transition hover:bg-choco-vinho disabled:opacity-60">{carregando ? 'Salvando...' : 'Salvar nova senha'}</button>
          </form>
        </div>
      </section>
      <footer className="px-4 pb-5 text-center text-xs text-choco-marrom/60">© {new Date().getFullYear()} Choco World</footer>
    </main>
  );
}
