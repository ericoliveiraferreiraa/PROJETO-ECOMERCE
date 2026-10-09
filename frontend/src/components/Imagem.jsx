// Mostra a imagem se existir. Sem imagem, mostra uma caixa tracejada
// para voce ver onde ela vai ficar na tela.
export default function Imagem({ src, alt, className = '', rotulo = 'Imagem' }) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={className} />;
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex min-h-[6rem] items-center justify-center border-2 border-dashed border-black/20 bg-white/50 text-xs font-medium text-black/40 ${className}`}
    >
      {rotulo}
    </div>
  );
}
