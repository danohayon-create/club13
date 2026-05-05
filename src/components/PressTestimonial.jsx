import { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { PRESS } from '../data/press';
import './PressTestimonial.css';

/**
 * Carrousel presse — clic pour passer à l'article suivant.
 * Adaptation du composant Testimonial original (TS + Tailwind + lib/utils cn)
 * en JSX pur avec CSS custom. Le visage de l'auteur est remplacé par le logo presse.
 * La data est partagée avec PressCarousel via src/data/press.js
 */

// Helper : si l'image du logo n'existe pas, on remplace par le titre en texte
function LogoOrText({ src, alt, label, className }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className={`press-logo-fallback ${className || ''}`}>{label || alt}</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

// Mots avec animation blur+slide individuelle (texte qui apparaît mot par mot)
function SplitText({ text }) {
  const words = text.split(' ');
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          className="press-quote-word"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function PressTestimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % PRESS.length);
  };

  const current = PRESS[activeIndex];

  return (
    <div
      ref={containerRef}
      className="press-testimonial"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNext(); } }}
    >
      {/* Curseur magnétique custom (visible au survol) */}
      <motion.div
        className="press-cursor"
        style={{ x: cursorX, y: cursorY }}
      >
        <motion.div
          className="press-cursor-circle"
          animate={{
            width: isHovered ? 80 : 0,
            height: isHovered ? 80 : 0,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        >
          <motion.span
            className="press-cursor-text"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ delay: 0.1 }}
          >
            Suivant
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Compteur en haut à droite */}
      <div className="press-index">
        <motion.span
          key={activeIndex}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="press-index-current"
        >
          {String(activeIndex + 1).padStart(2, '0')}
        </motion.span>
        <span className="press-index-sep">/</span>
        <span className="press-index-total">{String(PRESS.length).padStart(2, '0')}</span>
      </div>

      {/* Aperçus des autres logos en haut à gauche */}
      <div className="press-preview">
        {PRESS.map((p, i) => (
          <div
            key={p.id}
            className={`press-preview-item ${i === activeIndex ? 'active' : ''}`}
          >
            <LogoOrText src={p.logo} alt={p.title} label={p.title.slice(0, 2)} />
          </div>
        ))}
      </div>

      {/* Citation principale */}
      <div className="press-content">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="press-quote"
          >
            <SplitText text={current.quote} />
          </motion.blockquote>
        </AnimatePresence>

        {/* Auteur (logo presse + nom + date/headline) */}
        <div className="press-author">
          <div className="press-author-avatar">
            {PRESS.map((p, i) => (
              <motion.div
                key={p.id}
                className="press-author-img-wrap"
                animate={{
                  opacity: i === activeIndex ? 1 : 0,
                  zIndex: i === activeIndex ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <LogoOrText src={p.logo} alt={p.title} label={p.title} className="press-author-img" />
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="press-author-info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="press-author-line"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="press-author-title">{current.title}</span>
              <span className="press-author-meta">
                {current.date && <>{current.date} &mdash; </>}{current.headline}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Barre de progression */}
        <div className="press-progress">
          <motion.div
            className="press-progress-bar"
            initial={{ width: '0%' }}
            animate={{ width: `${((activeIndex + 1) / PRESS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Indication clavier/clic */}
      <motion.div
        className="press-hint"
        animate={{ opacity: isHovered ? 0.4 : 0.2 }}
        transition={{ duration: 0.3 }}
      >
        Cliquez pour le suivant
      </motion.div>
    </div>
  );
}
