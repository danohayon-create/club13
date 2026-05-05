import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './ScrollExpandMedia.css';

/**
 * ScrollExpandMedia — version "sticky scroll" (fiable à 100%)
 *
 * Principe : la section fait 200dvh de haut. À l'intérieur, un conteneur sticky
 * de 100dvh reste fixé en haut du viewport pendant que l'utilisateur scroll
 * à travers les 200dvh. Le scroll progress se déduit directement de la position
 * de la section dans le viewport — aucun hijack de molette, aucun listener wheel.
 *
 * Avantages vs l'ancienne approche scroll-hijack :
 *  - Pas de race condition avec IntersectionObserver (problème : sur scroll rapide,
 *    l'observer ne s'active pas à temps et le user passe la section sans effet)
 *  - Comportement identique sur trackpad, molette, scrollbar, touch, clavier (Page Down…)
 *  - Aucun blocage du scroll naturel
 *  - Le user peut remonter sans contrainte
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
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);

  // Détection mobile (impacte la croissance max de la vidéo)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Calcule scrollProgress depuis la position de la section dans le viewport.
  // - rect.top > 0  → la section n'a pas encore atteint le haut du viewport (progress = 0)
  // - rect.top entre 0 et -(sectionHeight - viewportHeight) → progress va de 0 à 1
  // - rect.top < -(sectionHeight - viewportHeight) → l'utilisateur a scrollé au-delà (progress = 1)
  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sectionHeight = el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollable = sectionHeight - viewportHeight;
      if (scrollable <= 0) return;

      let p;
      if (rect.top > 0) p = 0;
      else if (rect.top < -scrollable) p = 1;
      else p = -rect.top / scrollable;

      setScrollProgress(p);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update(); // calcul initial au mount

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const showContent = scrollProgress >= 0.75;
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
      {/* Conteneur sticky de 100dvh : reste fixé en haut du viewport pendant le scroll */}
      <div className="sem-sticky">
        {/* Image de fond plein écran qui s'estompe quand la vidéo grandit */}
        <motion.div
          className="sem-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 - scrollProgress }}
          transition={{ duration: 0.1 }}
        >
          <img src={bgImageSrc} alt="" />
          <div className="sem-bg-tint" />
        </motion.div>

        <div className="sem-stage">
          {/* Média centré, taille animée par scrollProgress */}
          <div
            className="sem-media"
            style={{
              width: `${mediaWidth}px`,
              height: `${mediaHeight}px`,
              // Shine border : invisible au début, fade-in entre 70% et 100% du scroll
              '--shine-opacity': Math.max(0, Math.min(1, (scrollProgress - 0.7) / 0.3)),
            }}
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
      </div>

      {/* Contenu optionnel sous la section sticky (apparaît quand video proche du plein écran) */}
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
