
import { useState } from 'react';
import { api, salvarToken } from '../services/api';
import { avisarSessaoAtualizada } from '../services/sessao';

const campo =
  'mt-1 w-full rounded-xl border border-choco-pessego/70 bg-white px-4 py-3 text-choco-marrom outline-none placeholder:text-choco-marrom/50 focus:border-choco-vinho focus:ring-2 focus:ring-choco-vinho/15';

const label = 'block text-sm font-semibold text-choco-marrom';

export default function AuthPage({ tipo = 'login' }) {
  const cadastro = tipo === 'cadastro';
  const admin = tipo === 'admin';

  const [dados, setDados] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  function atualizar(evento) {
    setDados({
      ...dados,
      [evento.target.name]: evento.target.value,
    });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setSucesso('');

    if (cadastro && dados.senha !== dados.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      if (cadastro) {
        await api('/clientes', {
          metodo: 'POST',
          corpo: {
            nome: dados.nome.trim(),
            cpf: dados.cpf.replace(/\D/g, ''),
            email: dados.email.trim(),
            telefone: dados.telefone.replace(/\D/g, ''),
            senha: dados.senha,
          },
        });

        setSucesso('Cadastro realizado! Agora você já pode entrar.');
        setDados({
          nome: '',
          cpf: '',
          telefone: '',
          email: '',
          senha: '',
          confirmarSenha: '',
        });
        return;
      }

      const rota = admin
        ? '/administradores/login'
        : '/clientes/login';

      const resposta = await api(rota, {
        metodo: 'POST',
        corpo: {
          email: dados.email.trim(),
          senha: dados.senha,
        },
      });

      salvarToken(resposta.token);
        localStorage.setItem('tipoUsuario', admin ? 'admin' : 'cliente');

        avisarSessaoAtualizada();

        window.location.href = admin ? '/admin' : '/';
    } catch (erroApi) {
      setErro(erroApi.message || 'Não foi possível concluir a operação.');
    } finally {
      setCarregando(false);
    }
  }

  const titulo = cadastro
    ? 'Crie sua conta'
    : admin
      ? 'Área administrativa'
      : 'Bem-vindo de volta!';

  return (
    <main className="flex min-h-screen flex-col bg-choco-creme text-choco-marrom">
      <header className="flex items-center justify-between border-b border-choco-pessego/50 bg-white px-5 py-4 sm:px-10">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-choco-vinho text-xl text-white">
            🍫
          </span>
          <span className="text-xl font-extrabold">
            Choco<span className="text-choco-vinho">World</span>
          </span>
        </a>

        <a
          href="/"
          className="text-sm font-semibold transition hover:text-choco-vermelho"
        >
          Voltar à loja
        </a>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-choco-pessego/50 bg-white shadow-xl shadow-choco-marrom/10 lg:grid-cols-2">
          <aside className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-choco-vinho p-7 text-white sm:p-10 lg:min-h-full">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[30px] border-white/10" />
            <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-choco-vinho-claro/50" />

            <div className="relative">
              <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                {admin ? 'Acesso restrito' : 'Um mundo de sabores'}
              </span>

              <h1 className="mt-6 max-w-sm text-3xl font-extrabold leading-tight sm:text-4xl">
                {admin
                  ? 'Gerencie sua loja com tranquilidade.'
                  : cadastro
                    ? 'Seu próximo chocolate favorito começa aqui.'
                    : 'Pequenos momentos, grandes sabores.'}
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/85 sm:text-base">
                {admin
                  ? 'Entre com sua conta administrativa para acessar o painel.'
                  : 'Acesse sua conta, acompanhe seus pedidos e descubra novos chocolates.'}
              </p>
            </div>

            <p className="relative mt-8 text-xs text-white/75">
              Choco World · Feito para quem ama chocolate.
            </p>
          </aside>

          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-sm font-bold tracking-wide text-choco-vermelho">
              {admin ? 'ADMINISTRAÇÃO' : 'CHOCOLATE É FELICIDADE'}
            </p>

            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {titulo}
            </h2>

            <p className="mt-2 mb-7 text-sm leading-6 text-choco-marrom/70">
              {cadastro
                ? 'Preencha os campos abaixo para criar sua conta.'
                : 'Informe seu e-mail e sua senha para continuar.'}
            </p>

            {erro && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {erro}
              </p>
            )}

            {sucesso && (
              <p
                role="status"
                className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                {sucesso}{' '}
                <a href="/login" className="font-bold underline">
                  Fazer login
                </a>
              </p>
            )}

            <form onSubmit={enviar} className="space-y-4">
              {cadastro && (
                <>
                  <div>
                    <label className={label} htmlFor="nome">
                      Nome completo
                    </label>
                    <input
                      className={campo}
                      id="nome"
                      name="nome"
                      value={dados.nome}
                      onChange={atualizar}
                      autoComplete="name"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="cpf">CPF</label>
                      <input
                        className={campo}
                        id="cpf"
                        name="cpf"
                        value={dados.cpf}
                        onChange={atualizar}
                        inputMode="numeric"
                        placeholder="Seu CPF"
                        required
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="telefone">Telefone</label>
                      <input
                        className={campo}
                        id="telefone"
                        name="telefone"
                        value={dados.telefone}
                        onChange={atualizar}
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="DDD + número"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className={label} htmlFor="email">E-mail</label>
                <input
                  className={campo}
                  id="email"
                  name="email"
                  type="email"
                  value={dados.email}
                  onChange={atualizar}
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className={label} htmlFor="senha">Senha</label>
                <input
                  className={campo}
                  id="senha"
                  name="senha"
                  type="password"
                  value={dados.senha}
                  onChange={atualizar}
                  autoComplete={cadastro ? 'new-password' : 'current-password'}
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              {cadastro && (
                <div>
                  <label className={label} htmlFor="confirmarSenha">
                    Confirmar senha
                  </label>
                  <input
                    className={campo}
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    value={dados.confirmarSenha}
                    onChange={atualizar}
                    autoComplete="new-password"
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="mt-2 w-full rounded-xl bg-choco-vinho px-5 py-3 font-bold text-white transition hover:bg-choco-vinho-claro focus:outline-none focus:ring-2 focus:ring-choco-vinho focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando
                  ? 'Aguarde...'
                  : cadastro
                    ? 'Criar minha conta'
                    : admin
                      ? 'Entrar no painel'
                      : 'Entrar na minha conta'}
              </button>
            </form>

            {!admin && (
              <div className="mt-6 text-center text-sm text-choco-marrom/75">
                {cadastro ? (
                  <p>
                    Já tem uma conta?{' '}
                    <a href="/login" className="font-bold text-choco-vinho hover:underline">
                      Faça login
                    </a>
                  </p>
                ) : (
                  <p>
                    Ainda não tem conta?{' '}
                    <a href="/cadastro" className="font-bold text-choco-vinho hover:underline">
                      Cadastre-se
                    </a>
                  </p>
                )}
              </div>
            )}

            {admin && (
              <p className="mt-6 text-center text-xs text-choco-marrom/60">
                Área exclusiva para administradores autorizados.
              </p>
            )}
          </div>
        </div>
      </section>

      <footer className="px-4 pb-5 text-center text-xs text-choco-marrom/60">
        © {new Date().getFullYear()} Choco World · Todos os direitos reservados.
      </footer>
    </main>
  );
}