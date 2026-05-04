import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './ScrollExpandMedia.css';

/**
 * ScrollExpandMedia
 * Section pleine hauteur où une vidéo (ou image) grandit progressivement
 * du centre vers le plein écran à mesure que l'utilisateur scrolle.
 *
 * Adapté de https://21st.dev pour ce projet :
 *  - JSX (pas de TypeScript)
 *  - <img>/<video> standards (pas de next/image)
 *  - CSS custom (pas de Tailwind)
 *  - Hijack de la molette UNIQUEMENT quand la section est centrée à l'écran
 *    (sinon ça casserait la nav du reste de la page)
 */
const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  titlePartStart = '',
  titlePartEnd = '',
  textBlend = false,
  scrollHint = '',
  children,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const touchStartY = useRef(0);

  // Détection mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Active le hijack uniquement quand la section remplit ~95% du viewport
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        setIsActive(ratio >= 0.9);
        // Reset complet quand l'utilisateur sort vraiment de la section
        if (ratio < 0.1) {
          progressRef.current = 0;
          setScrollProgress(0);
          setMediaFullyExpanded(false);
          setShowContent(false);
        }
      },
      { threshold: [0, 0.1, 0.5, 0.9, 0.95, 1] }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Hijack molette + touch pendant que la section est active
  useEffect(() => {
    if (!isActive) return;

    const updateProgress = (delta) => {
      const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
      progressRef.current = next;
      setScrollProgress(next);

      if (next >= 1) {
        setMediaFullyExpanded(true);
        setShowContent(true);
      } else if (next < 0.75) {
        setShowContent(false);
      }
    };

    const tryCollapse = (e) => {
      // Ne re-collapser que si la section est bien alignée en haut
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect && rect.top >= -10) {
        e.preventDefault();
        setMediaFullyExpanded(false);
        setShowContent(false);
        progressRef.current = 0.99;
        setScrollProgress(0.99);
      }
    };

    const handleWheel = (e) => {
      if (mediaFullyExpanded) {
        // Quand la vidéo est plein écran, on laisse le scroll-down filer
        // mais on retient le scroll-up pour permettre de re-collapser
        if (e.deltaY < 0) tryCollapse(e);
        return;
      }
      // Si l'utilisateur scroll vers le HAUT et qu'on est déjà au début (progress=0),
      // on laisse le scroll naturel se faire pour pouvoir remonter aux sections précédentes
      if (e.deltaY < 0 && progressRef.current <= 0) {
        return;
      }
      e.preventDefault();
      updateProgress(e.deltaY * 0.0009);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchStartY.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;

      if (mediaFullyExpanded) {
        if (deltaY < -20) tryCollapse(e);
        return;
      }
      // Pareil sur mobile : si on swipe vers le bas (= scroll up) et qu'on est à progress=0,
      // on laisse le scroll naturel pour pouvoir remonter à la section précédente
      if (deltaY < 0 && progressRef.current <= 0) {
        return;
      }
      e.preventDefault();
      const factor = deltaY < 0 ? 0.008 : 0.005;
      updateProgress(deltaY * factor);
      touchStartY.current = touchY;
    };

    const handleTouchEnd = () => {
      touchStartY.current = 0;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, mediaFullyExpanded]);

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);
  const isYouTube = typeof mediaSrc === 'string' && mediaSrc.includes('youtube.com');

  const renderMedia = () => {
    if (mediaType === 'video' && isYouTube) {
      const embedSrc = mediaSrc.includes('embed')
        ? mediaSrc + (mediaSrc.includes('?') ? '&' : '?') + 'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
        : mediaSrc.replace('watch?v=', 'embed/') + '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' + mediaSrc.split('v=')[1];
      return (
        <div className="sem-media-wrap">
          <iframe
            src={embedSrc}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="video"
          />
        </div>
      );
    }
    if (mediaType === 'video') {
      return (
        <div className="sem-media-wrap">
          <video
            src={mediaSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
          />
        </div>
      );
    }
    return (
      <div className="sem-media-wrap">
        <img src={mediaSrc} alt="" />
      </div>
    );
  };

  return (
    <section className="sem-section" ref={sectionRef}>
      {/* Image de fond plein écran qui s'estompe au fur et à mesure */}
      <motion.div
        className="sem-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 - scrollProgress }}
        transition={{ duration: 0.1 }}
      >
        <img src={bgImageSrc} alt="" />
        <div className="sem-bg-tint" />
      </motion.div>

      {/* Stage : titre + média superposés */}
      <div className="sem-stage">
        {/* Média centré, taille animée par le scroll */}
        <div
          className="sem-media"
          style={{ width: `${mediaWidth}px`, height: `${mediaHeight}px` }}
        >
          {renderMedia()}
          <motion.div
            className="sem-media-tint"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
            transition={{ duration: 0.2 }}
          />
          {scrollHint && (
            <p className="sem-hint" style={{ transform: `translateX(${textTranslateX}vw)` }}>
              {scrollHint}
            </p>
          )}
        </div>

        {/* Titre — les deux parties s'écartent à mesure que le scroll progresse */}
        <div className={`sem-title ${textBlend ? 'sem-title--blend' : ''}`}>
          <h2
            className="sem-title-line"
            style={{ transform: `translateX(-${textTranslateX}vw)` }}
          >
            {titlePartStart}
          </h2>
          <h2
            className="sem-title-line"
            style={{ transform: `translateX(${textTranslateX}vw)` }}
          >
            {titlePartEnd}
          </h2>
        </div>
      </div>

      {/* Contenu optionnel sous la vidéo expandée */}
      {children && (
        <motion.div
          className="sem-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.7 }}
        >
          {children}
        </motion.div>
      )}
    </section>
  );
};

export default ScrollExpandMedia;
