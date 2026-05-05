import React from 'react';
import { motion } from 'framer-motion';
import { REVIEWS } from '../data/reviews';
import './TestimonialsWall.css';

/**
 * Mur de témoignages clients — 3 colonnes qui défilent verticalement à l'infini.
 * Adaptation du composant TestimonialsColumn d'origine
 *  (TS + 'motion/react' + Tailwind) → JSX + framer-motion + CSS pur.
 *
 * Principe : chaque colonne contient les cartes dupliquées 2× et la track
 * anime translateY: -50% en boucle linéaire infinie. Quand elle a remonté
 * de la moitié de sa hauteur, le second jeu est exactement à la place du
 * premier → boucle parfaitement seamless.
 */

function ReviewCard({ name, initials, stars, quote }) {
  return (
    <article className="tw-card">
      <p className="tw-card-quote">{quote}</p>
      <div className="tw-card-author">
        <div className="tw-card-initials" aria-hidden="true">
          <span>{initials}</span>
        </div>
        <div className="tw-card-meta">
          <div className="tw-card-name">{name}</div>
          <div className="tw-card-stars" aria-label={`${stars} étoiles sur 5`}>
            {Array.from({ length: stars }).map((_, i) => (
              <iconify-icon key={i} icon="lucide:star" class="tw-card-star"></iconify-icon>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function TestimonialsColumn({ testimonials, duration = 20, className = '' }) {
  return (
    <div className={`tw-column ${className}`}>
      <motion.div
        className="tw-column-track"
        animate={{ translateY: '-50%' }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
      >
        {/* On double la liste pour rendre la boucle parfaitement continue */}
        {[0, 1].map((dupIndex) => (
          <React.Fragment key={dupIndex}>
            {testimonials.map((t, i) => (
              <ReviewCard key={`${dupIndex}-${t.id}-${i}`} {...t} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

export default function TestimonialsWall() {
  // 3 colonnes alimentées par des slices différentes pour varier l'apparence
  const col1 = REVIEWS.slice(0, 4);
  const col2 = REVIEWS.slice(3, 7);
  const col3 = REVIEWS.slice(6, 10);

  return (
    <div className="tw-wall">
      <TestimonialsColumn testimonials={col1} duration={22} />
      <TestimonialsColumn testimonials={col2} duration={28} className="tw-column--md" />
      <TestimonialsColumn testimonials={col3} duration={25} className="tw-column--lg" />
    </div>
  );
}
