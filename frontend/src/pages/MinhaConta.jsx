import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MinhaConta() {
  const [cliente, setCliente] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [avisoSenha, setAvisoSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  useEffect(() => {
    api('/clientes/me', { autenticado: true })
      .then(setCliente)
      .catch((error) => setErro(error.message || 'Não foi possível carregar seus dados.'))
      .finally(() => setCarregando(false));
  }, []);

  async function atualizarSenha(evento) {
    evento.preventDefault();
    setErroSenha('');
    setAvisoSenha('');
    try {
      const resposta = await api('/clientes/senha', { method: 'PATCH', autenticado: true, body: { senhaAtual, novaSenha } });
      setAvisoSenha(resposta.mensagem);
      setSenhaAtual('');
      setNovaSenha('');
    } catch (error) {
      setErroSenha(error.message || 'Não foi possível atualizar a senha.');
    }
  }

  const dataCadastro = cliente?.data_cadastro ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR') : 'Não informado';

  return (
    <div className="min-h-screen bg-choco-creme text-choco-marrom">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-choco-vinho">Minha conta</p>
        <h1 className="mt-2 text-3xl font-extrabold">Meus dados</h1>
        <p className="mt-2 text-neutral-600">Consulte e atualize os dados da sua conta Choco World.</p>
        {carregando && <p className="mt-8">Carregando seus dados...</p>}
        {erro && <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{erro}<p className="mt-2 text-sm">Confira se você está conectado à sua conta.</p></div>}
        {cliente && <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <div className="flex items-center gap-4 border-b border-neutral-100 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-choco-vinho text-2xl font-bold text-white">{cliente.nome?.charAt(0).toUpperCase()}</div>
            <div><h2 className="text-xl font-bold">{cliente.nome}</h2><p className="text-sm text-neutral-500">Cliente Choco World</p></div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Campo label="Nome completo" valor={cliente.nome} /><Campo label="E-mail" valor={cliente.email} /><Campo label="CPF" valor={cliente.cpf} /><Campo label="Telefone" valor={cliente.telefone} /><Campo label="Data de cadastro" valor={dataCadastro} />
          </div>
          <a href="/meus-pedidos" className="mt-8 inline-flex items-center justify-center rounded-xl bg-choco-vinho px-5 py-3 font-bold text-white transition hover:bg-choco-vinho-claro">Consultar meus pedidos</a>
        </section>}
        {cliente && <section className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <h2 className="text-xl font-bold">Redefinir senha</h2>
          <p className="mt-1 text-sm text-neutral-600">Confirme sua senha atual para cadastrar uma nova.</p>
          {erroSenha && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erroSenha}</p>}
          {avisoSenha && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{avisoSenha}</p>}
          <form onSubmit={atualizarSenha} className="mt-4 space-y-3">
            <label className="block text-sm font-semibold">Senha atual<input required type="password" autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className="mt-1 w-full rounded-lg border border-choco-pessego/70 px-3 py-2.5" /></label>
            <label className="block text-sm font-semibold">Nova senha<input required minLength={8} type="password" autoComplete="new-password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="mt-1 w-full rounded-lg border border-choco-pessego/70 px-3 py-2.5" /></label>
            <button className="rounded-xl bg-choco-vermelho px-5 py-3 font-bold text-white hover:bg-choco-vinho">Salvar nova senha</button>
          </form>
        </section>}
      </main>
      <Footer />
    </div>
  );
}

function Campo({ label, valor }) {
  return <div><p className="text-sm text-neutral-500">{label}</p><p className="mt-1 break-words font-semibold">{valor || 'Não informado'}</p></div>;
}
