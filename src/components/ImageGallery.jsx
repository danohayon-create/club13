import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { GALLERY } from '../data/gallery';
import './ImageGallery.css';

/**
 * Galerie photo en masonry 3 colonnes (responsive 1/2/3 colonnes).
 * Chaque image fade-in au moment où elle entre dans le viewport (useInView).
 *
 * Adaptation du composant ImageGallery (TS + Tailwind + cn + AspectRatio shadcn)
 *  → JSX + CSS pur, ratio naturel des photos (pas d'AspectRatio).
 */

function AnimatedImage({ src, alt }) {
  const ref = useRef(null);
  // `once: true` → l'animation ne se déclenche qu'une fois (pas re-animation au re-scroll)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div ref={ref} className="masonry-item">
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          // Si l'image ne charge pas, on bascule sur un placeholder neutre
          setImgSrc('https://placehold.co/800x600/0A0F1E/F0E6D6?text=Photo');
        }}
        className={`masonry-img ${isInView && !isLoading ? 'is-loaded' : ''}`}
        draggable={false}
      />
    </div>
  );
}

export default function ImageGallery() {
  // Distribution des photos sur 3 colonnes (modulo 3 → chaque photo dans sa colonne)
  const cols = [[], [], []];
  GALLERY.forEach((item, i) => cols[i % 3].push(item));

  return (
    <div className="masonry-section">
      <div className="masonry-header">
        <h2 className="masonry-title">Galerie du Club 13</h2>
        <p className="masonry-description">
          Une sélection d'instants captés au Club 13.
        </p>
      </div>

      <div className="masonry-grid">
        {cols.map((col, colIdx) => (
          <div key={colIdx} className="masonry-col">
            {col.map((item) => (
              <AnimatedImage key={item.id} src={item.url} alt={item.title || ''} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
