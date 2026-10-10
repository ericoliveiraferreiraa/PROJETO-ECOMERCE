
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { SearchIcon, UserIcon, CartIcon } from './icons';
import { totalItensCarrinho } from '../services/carrinho';
import {
  buscarUsuarioLogado,
  encerrarSessao,
  ouvirSessaoAtualizada,
} from '../services/sessao';

const LINKS = [
  { rotulo: 'Produtos', href: '/produtos' },
  { rotulo: 'Sobre Nós', href: '/sobre-nos' },
  { rotulo: 'Contato', href: '/contato' },
];

export default function Navbar() {
  const [itens, setItens] = useState(totalItensCarrinho);
  const [usuario, setUsuario] = useState(null);
  const [menuConta, setMenuConta] = useState(false);

  useEffect(() => {
    const atualizarCarrinho = () => setItens(totalItensCarrinho());

    window.addEventListener('carrinho:atualizado', atualizarCarrinho);
    window.addEventListener('storage', atualizarCarrinho);

    return () => {
      window.removeEventListener('carrinho:atualizado', atualizarCarrinho);
      window.removeEventListener('storage', atualizarCarrinho);
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarUsuario() {
      const dados = await buscarUsuarioLogado();

      if (ativo) {
        setUsuario(dados);
      }
    }

    carregarUsuario();

    const pararDeOuvir = ouvirSessaoAtualizada(carregarUsuario);

    function atualizarAoMudarArmazenamento(evento) {
      if (
        evento.key === 'token' ||
        evento.key === 'tipoUsuario'
      ) {
        carregarUsuario();
      }
    }

    window.addEventListener('storage', atualizarAoMudarArmazenamento);

    return () => {
      ativo = false;
      pararDeOuvir();
      window.removeEventListener('storage', atualizarAoMudarArmazenamento);
    };
  }, []);

  function sairDaConta() {
    encerrarSessao();
    setUsuario(null);
    setMenuConta(false);
    window.location.href = '/';
  }

  return (
    <header className="bg-choco-creme">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6"
      >
        <a href="/" aria-label="Choco World, página inicial">
          <Logo variante="navbar" />
        </a>

        <ul className="order-last flex w-full justify-center gap-8 text-sm font-medium text-choco-marrom sm:order-none sm:w-auto">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="underline-offset-4 hover:underline"
              >
                {link.rotulo}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 text-choco-marrom">
          <a
            href="/produtos"
            aria-label="Buscar produtos"
            className="p-1"
          >
            <SearchIcon width={18} height={18} />
          </a>

          {usuario ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuConta(!menuConta)}
                aria-expanded={menuConta}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/70"
              >
                <UserIcon width={18} height={18} />
                <span className="max-w-28 truncate text-sm font-semibold">
                  Olá, {usuario.nome?.split(' ')[0] || 'cliente'}
                </span>
                <span aria-hidden="true">⌄</span>
              </button>

              {menuConta && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-choco-pessego/50 bg-white p-2 shadow-lg">
                  <p className="truncate px-3 py-2 text-xs text-neutral-500">
                    {usuario.email}
                  </p>

                  <a
                    href="/minha-conta"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-choco-creme"
                  >
                    Minha conta
                  </a>

                  <a
                    href="/meus-pedidos"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-choco-creme"
                  >
                    Meus pedidos
                  </a>

                  <button
                    type="button"
                    onClick={sairDaConta}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-choco-vermelho hover:bg-red-50"
                  >
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              aria-label="Entrar na minha conta"
              title="Entrar na minha conta"
              className="flex items-center gap-1 p-1 hover:text-choco-vermelho"
            >
              <UserIcon width={18} height={18} />
              <span className="hidden text-sm sm:inline">Entrar</span>
            </a>
          )}

          <a
            href="/carrinho"
            aria-label={`Carrinho, ${itens} ${itens === 1 ? 'item' : 'itens'}`}
            className="relative p-1"
          >
            <CartIcon width={18} height={18} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-choco-vermelho px-1 text-[10px] font-bold leading-none text-white">
              {itens}
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}