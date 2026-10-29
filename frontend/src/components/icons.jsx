// Icones no estilo Feather (licenca MIT), como SVG puro: nao precisa instalar biblioteca.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

export function SearchIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function UserIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function CartIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <svg {...base} {...props}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg {...base} {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
<<<<<<< HEAD
    <svg {...base} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
=======
    <svg {...base} {...props} fill="currentColor" fillRule="evenodd" stroke="none">
      <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Z" />
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
      <circle cx="17.5" cy="6.5" r="1.25" />
>>>>>>> pagamento
    </svg>
  );
}

export function FacebookIcon(props) {
  return (
<<<<<<< HEAD
    <svg {...base} {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
=======
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M13.5 24V13.1h3.7l.6-4.2h-4.3V6.2c0-1.2.4-2.1 2.2-2.1H18V.3C17.6.2 16.3 0 14.8 0c-3.1 0-5.2 1.9-5.2 5.4v3H6v4.7h3.6V24h3.9Z" />
>>>>>>> pagamento
    </svg>
  );
}

<<<<<<< HEAD
// Feather nao tem o logo do TikTok: uso a nota musical como aproximacao.
export function TikTokIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
=======
export function TikTokIcon(props) {
  return (
    <svg {...base} {...props} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path fill="#25F4EE" d="M12.7 3h3.1c.2 1.7 1.2 3.1 2.8 3.8.7.3 1.4.5 2.2.5v3.2a9 9 0 0 1-5-1.5v6.3a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.9 2.8V3Z" transform="translate(-1 -1)" />
      <path fill="#FE2C55" d="M12.7 3h3.1c.2 1.7 1.2 3.1 2.8 3.8.7.3 1.4.5 2.2.5v3.2a9 9 0 0 1-5-1.5v6.3a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.9 2.8V3Z" transform="translate(1 1)" />
      <path d="M12.7 3h3.1c.2 1.7 1.2 3.1 2.8 3.8.7.3 1.4.5 2.2.5v3.2a9 9 0 0 1-5-1.5v6.3a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.9 2.8V3Z" />
>>>>>>> pagamento
    </svg>
  );
}
