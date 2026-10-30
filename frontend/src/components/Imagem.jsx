
import { useEffect, useState } from 'react';

export default function Imagem({
  src,
  alt = '',
  className = '',
  rotulo = 'Imagem indisponível',
}) {
  const [falhou, setFalhou] = useState(false);

  const origem = typeof src === 'string' ? src.trim() : '';
  const srcNormalizado = origem &&
    !origem.startsWith('/') &&
    !/^https?:\/\//i.test(origem) &&
    !/^data:|^blob:/i.test(origem)
      ? `/${origem.replace(/^\.\//, '')}`
      : origem;

  useEffect(() => {
    setFalhou(false);
  }, [srcNormalizado]);

  if (!srcNormalizado || falhou) {
    return (
      <div
        role="img"
        aria-label={alt || rotulo}
        className={`flex min-h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-black/20 bg-white/50 p-3 text-center text-xs font-medium text-black/40 ${className}`}
      >
        {rotulo}
      </div>
    );
  }

  return (
    <img
      src={srcNormalizado}
      alt={alt}
      loading="lazy"
      className={`block max-w-full ${className}`}
      onError={() => setFalhou(true)}
    />
  );
}
