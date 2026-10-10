import Logo from './Logo';
import { InstagramIcon, FacebookIcon, TikTokIcon } from './icons';

const LINKS = [
  { rotulo: 'Sobre Nós', href: '/sobre-nos' },
  { rotulo: 'Contato', href: '/contato' },
  
];

// TODO: troque o "#" pelo endereco real de cada rede social

const REDES = [
  { rotulo: 'Instagram', href: '#', Icone: InstagramIcon },
  { rotulo: 'Facebook', href: '#', Icone: FacebookIcon },
  { rotulo: 'TikTok', href: '#', Icone: TikTokIcon },
];

const FAIXA = ['bg-amber-500', 'bg-sky-400', 'bg-purple-500', 'bg-red-500', 'bg-green-500', 'bg-pink-500'];

export default function Footer() {
  return (
    <footer className="bg-choco-vinho text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <Logo variante="rodape" />
        </div>

        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="underline-offset-4 hover:underline">
                  {link.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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
          
          </ul>
        </div>
      </div>

      <p className="pb-4 text-center text-[11px] text-white/70">
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
