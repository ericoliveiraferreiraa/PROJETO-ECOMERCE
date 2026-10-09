import { useEffect, useState } from 'react';
import Logo from './Logo';
import { SearchIcon, UserIcon, CartIcon } from './icons';
import { totalItensCarrinho } from '../services/carrinho';

const LINKS = [
  { rotulo: 'Produtos', href: '/produtos' },
  { rotulo: 'Sobre Nós', href: '/sobre-nos' },
  { rotulo: 'Contato', href: '/contato' },
];

export default function Navbar() {
  const [itens, setItens] = useState(totalItensCarrinho);

  // atualiza o numero do carrinho quando algo e adicionado (nesta ou em outra aba)
  useEffect(() => {
    const atualizar = () => setItens(totalItensCarrinho());
    window.addEventListener('carrinho:atualizado', atualizar);
    window.addEventListener('storage', atualizar);
    return () => {
      window.removeEventListener('carrinho:atualizado', atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  return (
    <header className="bg-choco-creme">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6"
      >
        <a href="/" aria-label="Choco World, página inicial">
          <Logo variante="navbar" />
        </a>

        {/* No celular os links descem para uma segunda linha */}
        <ul className="order-last flex w-full justify-center gap-8 text-sm font-medium text-choco-marrom sm:order-none sm:w-auto">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="underline-offset-4 hover:underline">
                {link.rotulo}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 text-choco-marrom">
          <a href="/produtos" aria-label="Buscar produtos" className="p-1">
            <SearchIcon width={18} height={18} />
          </a>
          <a href="/login" aria-label="Minha conta" className="p-1">
            <UserIcon width={18} height={18} />
          </a>
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
