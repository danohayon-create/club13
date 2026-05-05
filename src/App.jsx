import React, { useState, useEffect, useRef } from 'react';
import ScrollExpandMedia from './components/ScrollExpandMedia';
import BrandLogos from './components/BrandLogos';
import ParisMap from './components/ParisMap';
import PressTestimonial from './components/PressTestimonial';
import TestimonialsWall from './components/TestimonialsWall';
import AuroraBackground from './components/AuroraBackground';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavDark, setIsNavDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stars, setStars] = useState([]);
  const [wellnessStars, setWellnessStars] = useState([]);
  const heroBgRef = useRef(null);

  // Scroll logic for Nav and Parallax
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const transitionSection = document.getElementById('transition');
          
          setIsScrolled(scrollY > 60);

          if (transitionSection) {
            setIsNavDark(scrollY > transitionSection.offsetTop - 200);
          } else {
            setIsNavDark(false);
          }

          if (heroBgRef.current && scrollY < window.innerHeight) {
            heroBgRef.current.style.transform = `translateY(${scrollY * 0.25}px)`;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body overflow toggle for mobile menu
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Intersection Observers for reveals
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    const elements = document.querySelectorAll('.reveal, .reveal-left, .stagger-up');
    elements.forEach((el) => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const duration = 1800;
      const start = performance.now();
      
      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const statsStrip = document.querySelector('.stats-strip');
    if (statsStrip) counterObserver.observe(statsStrip);

    return () => counterObserver.disconnect();
  }, []);

  // Generate stars arrays once on mount (transition + wellness)
  useEffect(() => {
    const makeStars = (count, topMin, topMax) =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${topMin + Math.random() * (topMax - topMin)}%`,
        dur: `${2 + Math.random() * 4}s`,
        del: `${Math.random() * 3}s`,
        size: `${1 + Math.random() * 2}px`
      }));
    // Section transition : étoiles dans le tiers inférieur (suit le dégradé jour→nuit)
    setStars(makeStars(70, 35, 95));
    // Section wellness : étoiles sur toute la hauteur (fond nuit uniforme)
    setWellnessStars(makeStars(50, 0, 100));
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* NAV */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''} ${isNavDark ? 'nav-dark' : ''}`} id="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo" aria-label="Club 13">
            <img src="/images/logo-club13.png" alt="Club 13" />
          </a>
          <div className="nav-links">
            <a href="#philosophy">Histoire</a>
            <a href="#suites">Espaces</a>
            <a href="#wellness">Prestations</a>
            <a href="#excursions">Reservation</a>
            <a href="#temoignages">Témoignages</a>
          </div>
          <a href="#reserve" className="nav-cta">Reservation</a>
          <button 
            className={`nav-hamburger ${isMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <div className={`mobile-overlay ${isMenuOpen ? 'active' : ''}`} id="mobileOverlay">
        <a href="#philosophy" className="mobile-link" onClick={closeMenu}>Histoire</a>
        <a href="#suites" className="mobile-link" onClick={closeMenu}>Espaces</a>
        <a href="#wellness" className="mobile-link" onClick={closeMenu}>Prestations</a>
        <a href="#excursions" className="mobile-link" onClick={closeMenu}>Reservation</a>
        <a href="#temoignages" className="mobile-link" onClick={closeMenu}>Témoignages</a>
        <a href="#reserve" className="mobile-link" onClick={closeMenu}>Reservation</a>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <img 
          ref={heroBgRef}
          className="hero-bg" 
          src="/images/hero-aerial.png"
          alt="Club 13 Paris — vue aérienne"
          loading="eager" 
        />
        <div className="hero-overlay"></div>
        <AuroraBackground className="hero-aurora" />
        <div className="hero-content">
          <p className="hero-location cursor-pointer" onClick={() => window.location.href='https://maps.app.goo.gl/F9T36GXXNkd8zpW9A'} role="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" className="inline mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            15 Avenue Hoche, Paris
          </p>
          <img className="hero-title-img" src="/images/signature-lelouch.png" alt="Signature Claude Lelouch — Club 13 Paris" />
          <p className="hero-subtitle">Un temple du 7ème art unique à Paris, créé par Claude Lelouch.</p>
          <div className="hero-line"></div>
          <a href="/#reserve" className="hero-cta">Réserver le Club 13</a>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="philosophy day-section" id="philosophy">
        <div className="container">
          <div className="philosophy-grid">
            <div className="philosophy-text reveal-left">
              <span className="section-label">Notre histoire</span>
              <h2 className="text-3xl font-bold mb-4">Un Lieu Unique et Mythique</h2>
              <p>Crée par Claude Lelouch après le succès d’ « Un homme et une femme », le Club 13 a accueilli les plus grandes légendes du cinéma mondial : Charlie Chaplin, Orson Welles, Stanley Kubrick, Francis Ford Coppola, Martin Scorsese… Situé au coeur du triangle d’or parisien, ce lieu unique est encore à ce jour un lieu sacré du cinéma.</p>
              <p>Temple du cinéma français depuis 1968, le Club 13 incarne l'excellence culturelle parisienne avec son histoire prestigieuse et son ambiance authentique. Idéalement situé entre l’Arc de Triomphe et le Parc Monceau, depuis plus de cinquante ans, le Club 13 vous ouvre ses portes du pour des projections privées. Lieu mythique et incontournable du 7ᵉ art, vous serez en immersion totale, plongé au cœur du monde cinématographie de Monsieur Claude Lelouch.</p>
              <h2 className="text-3xl font-bold mt-6 mb-4">L’esprit du lieu</h2>
              <p>Imaginé comme un lieu d’exception dédié aux multiples déclinaisons artistiques, le Club 13 est la conjugaison parfaite entre l’art de faire la fête le temps d’une privatisation du lieu ; et le 7eme art, bien sûr… avec sa salle de projection ouverte à la privatisation.</p>
            </div>
            <div className="philosophy-image reveal">
              <img src="/images/philosophy-riad.jpg" alt="Club 13 — espace intérieur" loading="lazy" />
            </div>
          </div>
          <div className="stats-strip stagger-up">
            <div className="stat reveal-child">
              <span className="stat-value" data-count="1968">1968</span>
              <span className="stat-label">Année de création</span>
            </div>
            <div className="stat reveal-child">
              <span className="stat-value" data-count="4">4</span>
              <span className="stat-label">Etages d'espaces privatisables</span>
            </div>
            <div className="stat reveal-child">
              <span className="stat-value" data-count="2">2</span>
              <span className="stat-label">Salles de Projection</span>
            </div>
            <div className="stat reveal-child">
              <span className="stat-value" data-count="1009">1009</span>
              <span className="stat-label">SURFACE TOTALE (m2)</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* SUITES */}
      <section className="suites day-section" id="suites">
        <div className="container">
          <span className="section-label reveal">Nos espaces</span>
          <h2 className="section-title reveal">Un écosystème complet à votre service</h2>
          <div className="suites-grid stagger-up">
            <div className="suite-card reveal-child">
              <div className="suite-image">
                <img src="/images/suite-projections.jpg" alt="Projections et Locations" loading="lazy" />
              </div>
              <div className="suite-info">
                <h3>Projections et Locations</h3>
                <p>Deux salles de projection privées équipées, salles de montage professionnelle, bureaux production et services de post-production pour l'industrie cinématographique</p>
                <span className="suite-price">Salle 1 : 75 personnes<br></br> Salle 2 : 15 personnes</span>
              </div>
            </div>
            <div className="suite-card reveal-child">
              <div className="suite-image">
                <img src="/images/suite-restaurant.jpg" alt="Restaurant" loading="lazy" />
              </div>
              <div className="suite-info">
                <h3>Restaurant</h3>
                <p>Cuisine française familiale, plats signature, service du lundi au vendredi midi, ambiance feutrée et décoration Sarah Lavoine</p>
                <span className="suite-price"><br></br>75 personnes en format cocktail debout<br></br> 40 personnes en format assis</span>
              </div>
            </div>
            <div className="suite-card reveal-child">
              <div className="suite-image">
                <img src="/images/suite-evenementiel.jpg" alt="Événementiel" loading="lazy" />
              </div>
              <div className="suite-info">
                <h3>Événementiel</h3>
                <p>Privatisations, séminaires, lancements produits, soirées thématiques, capacité cocktail jusqu'à 100 personnes</p>
                <span className="suite-price"><br></br><br></br>Salons jusqu'à 100 personnes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSITION — DAY TO NIGHT */}
      <section className="transition-section" id="transition">
        <div id="stars">
          {stars.map((star) => (
            <div 
              key={star.id} 
              className="star" 
              style={{
                left: star.left,
                top: star.top,
                '--dur': star.dur,
                '--del': star.del,
                width: star.size,
                height: star.size
              }}
            ></div>
          ))}
        </div>
        <div className="transition-content reveal">
          <div className="transition-line"></div>
          <p className="transition-quote">Sous les étoiles du cinéma, dans l’écrin du Club 13<br/>vos évennements prennent la lumière<br/>sublimés par des services d’exception</p>
          <div className="transition-line"></div>
        </div>
      </section>

      {/* DECOUVRIR — vidéo qui grandit au scroll jusqu'au plein écran */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/videos/club13-intro.mp4"
        posterSrc="/images/scroll-bg.jpg"
        bgImageSrc="/images/scroll-bg.jpg"
        titlePartStart="Decouvrez le"
        titlePartEnd="Club 13 Paris"
      />

      {/* WELLNESS */}
      <section className="wellness night-section" id="wellness">
        <div className="night-glow"></div>
        {/* Étoiles décoratives qui scintillent sur le fond nuit */}
        {wellnessStars.map((star) => (
          <div
            key={`ws-${star.id}`}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              '--dur': star.dur,
              '--del': star.del,
              width: star.size,
              height: star.size
            }}
          ></div>
        ))}
        <div className="container">
          <div className="wellness-intro reveal">
            <span className="section-label">Club 13</span>
            <h2>Nos Prestations</h2>
            <p>Pour un anniversaire, une soirée d’entreprise, un lancement de produit, une projection privée ou encore une soirée sur le thème du 7ᵉ art, tout est possible !</p>
          </div>
          <div className="wellness-hero reveal">
            <img src="/images/wellness-hammam.png" alt="Espace Club 13" loading="lazy" />
          </div>
        </div>
      </section>

      {/* EXCURSIONS */}
      <section className="excursions night-section" id="excursions">
        <div className="container">
          <span className="section-label reveal">Nos offres</span>
          <h2 className="section-title reveal">Des Prestations sur mesure</h2>
          <div className="excursions-list">
            <div className="excursion-card reveal">
              <div className="excursion-image">
                <img src="/images/excursion-1.jpg" alt="Excursion 1" loading="lazy" />
              </div>
              <div className="excursion-info">
                <h3>Projection</h3>
                <p>Organisation d'une projection de film (copie fournie ou copie louée) dans une des deux salles du Club 13. Nos salles sont privatisables et équipées de matériel de pointe vous offrant une expérience cinématographique inédite.</p>
                <span className="excursion-duration"><iconify-icon icon="lucide:clock"></iconify-icon> de 7H à Minuit</span>
              </div>
            </div>
            <div className="excursion-card reveal">
              <div className="excursion-image">
                <img src="/images/excursion-2.jpg" alt="Excursion 2" loading="lazy" />
              </div>
              <div className="excursion-info">
                <h3>Restauration - Service traiteur haut de gamme</h3>
                <p>Petit déjeuner & brunch, Déjeuner, Apéritifs, Cocktail dinatoire, Diner. Nos formules de restauration sont entièrement personnalisables et adaptées à vos besoins, avec une cuisine française familiale et des plats signature élaborés par nos chefs.
.</p>
                <span className="excursion-duration"><iconify-icon icon="lucide:clock"></iconify-icon> de 7H à Minuit</span>
              </div>
            </div>
            <div className="excursion-card reveal">
              <div className="excursion-image">
                <img src="/images/excursion-3.jpg" alt="Excursion 3" loading="lazy" />
              </div>
              <div className="excursion-info">
                <h3>Junket Interview</h3>
                <p>Plongez vos tournages dans l'atmosphère mythique et feutrée du Club 13. Nous offrons un cadre prestigieux et une logistique technique de pointe pour vos interviews presse, garantissant une image aussi authentique que sophistiquée.</p>
                <span className="excursion-duration"><iconify-icon icon="lucide:clock"></iconify-icon> Salles d'enregistrement mises à disposition</span>
              </div>
            </div>
            <div className="excursion-card reveal">
              <div className="excursion-image">
                <img src="/images/excursion-4.jpg" alt="Excursion 4" loading="lazy" />
              </div>
              <div className="excursion-info">
                <h3>Networking, Conférence, Master Class</h3>
                <p>Le Club 13 vous ouvre ses portes pour des Master Class, conférences ou événements de networking d'exception.  Nos espaces sont conçus pour favoriser les échanges et l'inspiration.</p>
                <span className="excursion-duration"><iconify-icon icon="lucide:clock"></iconify-icon> Nos salons sont adaptés à vos besoins</span>
              </div>
            </div>
            <div className="excursion-card reveal">
              <div className="excursion-image">
                <img src="/images/excursion-5.jpg" alt="Excursion 5" loading="lazy" />
              </div>
              <div className="excursion-info">
                <h3>Tournage - Shooting Photos</h3>
                <p>Sublimez vos productions dans un cadre cinématographique iconique où l'élégance intemporelle rencontre une modernité technique absolue. Que ce soit pour des tournages de films, des spots publicitaires ou des séances photo de mode, profitez d'une mise en scène naturelle et prestigieuse pour donner une dimension unique à vos images.</p>
                <span className="excursion-duration"><iconify-icon icon="lucide:clock"></iconify-icon> 2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESERVE */}
      <section className="reserve night-section" id="reserve">
        <div className="reserve-bg">
          <img src="/images/reserve-bg.jpg" alt="Club 13 — salle de projection Claude Lelouch" loading="lazy" />
        </div>
        <div className="reserve-overlay"></div>
        <div className="container">
          <div className="reserve-content reveal">
            <div className="reserve-content-top">
              <span className="section-label">Réservation</span>
              <h2>Contactez Nous</h2>
              <p>Pour une projection ou tout autre événnement, n'hésitez pas à nous contacter.</p>
              <a href="#" className="reserve-cta">Devis En Ligne</a>
              <div className="reserve-contact">
                <span><iconify-icon icon="lucide:phone"></iconify-icon> +33 1 44 13 11 14</span>
                <span><iconify-icon icon="lucide:mail"></iconify-icon> contact@club13.fr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP — placée juste après la Réservation, sous l'image Lelouch */}
      <section className="reserve-map-section night-section">
        <div className="container">
          <ParisMap />
        </div>
      </section>

      {/* TÉMOIGNAGES — références clients + presse */}
      <section className="testimonials night-section" id="temoignages">
        <div className="container">
          <span className="section-label reveal">Témoignages</span>
          <h2 className="section-title reveal">Ils nous ont fait confiance</h2>
          <BrandLogos />
          <span className="section-label press-section-label reveal">Presse</span>
          <h2 className="section-title press-section-title reveal">Le Club 13 dans la lumière des médias</h2>
          <PressTestimonial />

          <h2 className="section-title client-section-title reveal">Ils ont vécu l'expérience Club 13</h2>
          <p className="client-section-subtitle reveal">Sous le regard des étoiles, ils ont choisi le Club 13</p>
          <TestimonialsWall />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Club 13</h4>
              <p>15, Aveneue Hoche<br/>75008 Paris<br/>France</p>
            </div>
            <div className="footer-col">
              <h4>Explore</h4>
              <a href="#philosophy">Histoire</a>
              <a href="#suites">Espaces</a>
              <a href="#wellness">Prestations</a>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="https://www.instagram.com/leclub13/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/LeClub13/?locale=fr_FR" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Club 13. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;