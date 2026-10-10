import { useState } from 'react';

export default function Imagem({
  src,
  alt,
  className = '',
  rotulo = 'Imagem do produto',
}) {
  const [falhou, setFalhou] = useState(false);

  if (!src || falhou) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex min-h-[6rem] items-center justify-center border-2 border-dashed border-black/20 bg-white/50 p-3 text-center text-xs font-medium text-black/40 ${className}`}
      >
        {rotulo}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFalhou(true)}
    />
  );
}

