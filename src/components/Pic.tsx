import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { asset, type MediaItem } from '../data';

interface Props {
  item: MediaItem;
  alt: string;
  sizes?: string;
  /** contain for posters and screenshots (never crop), cover only where the box is fixed (home band) */
  fit?: 'cover' | 'contain';
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** keep the item's own aspect ratio (default). false = fill the parent box. */
  ratio?: boolean;
}

/** Responsive image for a media.json item with blur-up. Opacity fade only. */
export default function Pic({ item, alt, sizes = '(min-width: 900px) 800px, 100vw', fit = 'cover', priority, className, style, ratio = true }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true); }, [item.id]);
  const ws = Object.keys(item.src).map(Number).sort((a, b) => a - b);
  return (
    <span className={`pic${loaded ? ' is-loaded' : ''}${fit === 'contain' ? ' pic--contain' : ''}${className ? ' ' + className : ''}`}
      style={{ ...(ratio ? { aspectRatio: `${item.w} / ${item.h}` } : null), ...style }}>
      <span className="pic__blur" style={{ backgroundImage: `url("${item.blur}")` }} aria-hidden="true" />
      <img ref={ref} src={asset(item.src[String(ws[Math.min(1, ws.length - 1)])])} srcSet={ws.map((w) => `${asset(item.src[String(w)])} ${w}w`).join(', ')}
        sizes={sizes} width={item.w} height={item.h} alt={alt} loading={priority ? 'eager' : 'lazy'} {...(priority ? { fetchpriority: 'high' } : {})}
        decoding="async" onLoad={() => setLoaded(true)} />
    </span>
  );
}
