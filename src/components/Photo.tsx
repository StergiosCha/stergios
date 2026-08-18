import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { asset, photos } from '../data';

/** Portrait / event photo with blur-up. `id` is a photos.json key. */
export default function Photo({ id, alt, sizes = '600px', style, priority, className }: { id: string; alt: string; sizes?: string; style?: CSSProperties; priority?: boolean; className?: string }) {
  const p = photos[id];
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true); }, []);
  if (!p) return null;
  const ws = Object.keys(p.src).sort((a, b) => +a - +b);
  return (
    <span className={`cover${loaded ? ' is-loaded' : ''}${className ? ' ' + className : ''}`} style={{ aspectRatio: `${p.w} / ${p.h}`, boxShadow: 'none', ...style }}>
      <span className="cover__blur" style={{ backgroundImage: `url("${p.blur}")` }} aria-hidden="true" />
      <img ref={ref} src={asset(p.src[ws[0]])} srcSet={ws.map((w) => `${asset(p.src[w])} ${w}w`).join(', ')} sizes={sizes} width={p.w} height={p.h} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)} />
    </span>
  );
}
