<<<<<<< HEAD
import Logo from './Logo';
import { InstagramIcon, FacebookIcon, TikTokIcon } from './icons';

const LINKS = [
  { rotulo: 'Sobre Nós', href: '/sobre-nos' },
  { rotulo: 'Contato', href: '/contato' },
  
];

// TODO: troque o "#" pelo endereco real de cada rede social

const REDES = [
  { rotulo: 'Instagram', href: '#', Icone: InstagramIcon },
=======
import { InstagramIcon, FacebookIcon, TikTokIcon } from './icons';

const LINKS_LOJA = [
  { rotulo: 'Produtos', href: '/produtos' },
  { rotulo: 'Carrinho', href: '/carrinho' },
  { rotulo: 'Ticket Premiado', href: '/ticket-premiado' },
];

const REDES = [
  { rotulo: 'Instagram', href: 'https://www.instagram.com/worldchoco93/', Icone: InstagramIcon },
>>>>>>> pagamento
  { rotulo: 'Facebook', href: '#', Icone: FacebookIcon },
  { rotulo: 'TikTok', href: '#', Icone: TikTokIcon },
];

const FAIXA = ['bg-amber-500', 'bg-sky-400', 'bg-purple-500', 'bg-red-500', 'bg-green-500', 'bg-pink-500'];

export default function Footer() {
  return (
    <footer className="bg-choco-vinho text-white">
<<<<<<< HEAD
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex justify-center md:justify-start">
  
</div>

        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            {LINKS.map((link) => (
=======
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-9 sm:px-6 md:grid-cols-3 md:items-center md:gap-8">
        <div className="text-center">
          <p className="text-xl font-extrabold tracking-wide">Choco World</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/75">
            Chocolates e momentos especiais para deixar o seu dia mais doce.
          </p>
        </div>

        <nav aria-label="Explore a loja" className="border-t border-white/15 pt-6 text-center md:border-0 md:pt-0">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/70">Explore a loja</h2>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {LINKS_LOJA.map((link) => (
>>>>>>> pagamento
              <li key={link.href}>
                <a href={link.href} className="underline-offset-4 hover:underline">
                  {link.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

<<<<<<< HEAD
        <div className="text-center md:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest">Siga nossas redes</p>
          <ul className="mt-2 flex justify-center gap-4 md:justify-end">
          
        {REDES.map(({ rotulo, href, Icone }) => (
          <li key={rotulo}>
            <a
              href={href}
              aria-label={rotulo}
              title={rotulo}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <Icone width={22} height={22} />
            </a>
          </li>
        ))}
          
=======
        <div className="border-t border-white/15 pt-6 text-center md:border-0 md:pt-0">
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Siga nossas redes</h2>
          <ul className="mt-3 flex justify-center gap-4">
            {REDES.map(({ rotulo, href, Icone }) => (
              <li key={rotulo}>
                <a
                  href={href}
                  aria-label={rotulo}
                  title={rotulo}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Icone width={22} height={22} />
                </a>
              </li>
            ))}
>>>>>>> pagamento
          </ul>
        </div>
      </div>

<<<<<<< HEAD
      <p className="pb-4 text-center text-[11px] text-white/70">
=======
      <p className="border-t border-white/15 px-4 py-4 text-center text-[11px] text-white/70">
>>>>>>> pagamento
        © {new Date().getFullYear()} Choco World. Todos os direitos reservados.
      </p>

      <div className="flex h-1.5" aria-hidden="true">
        {FAIXA.map((cor) => (
          <div key={cor} className={`flex-1 ${cor}`} />
        ))}
      </div>
    </footer>
  );
}
