import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
        <ImageOff size={28} aria-hidden="true" />
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
