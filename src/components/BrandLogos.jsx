import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './BrandLogos.css';

/**
 * Liste des références clients du Club 13.
 * `logo` pointe vers /public/images/logos/X.png — l'utilisateur dépose ses fichiers à ces chemins.
 * Si l'image manque, le `<span>` de fallback s'affiche avec le nom textuel.
 */
const brands = [
  { id: 'magnolia',     name: 'Magnolia Pictures',           logo: '/images/logos/magnolia.png' },
  { id: 'vendome',      name: 'Vendôme Films',               logo: '/images/logos/vendome.png' },
  { id: 'wildbunch',    name: 'Wild Bunch',                  logo: '/images/logos/wild-bunch.png' },
  { id: 'andera',       name: 'Andera Partners',             logo: '/images/logos/andera.png' },
  { id: 'netflix',      name: 'Netflix',                     logo: '/images/logos/netflix.png' },
  { id: 'studiocanal',  name: 'StudioCanal',                 logo: '/images/logos/studiocanal.png' },
  { id: 'studiotf1',    name: 'Studio TF1',                  logo: '/images/logos/studio-tf1.png' },
  { id: 'turner',       name: 'Turner',                      logo: '/images/logos/turner.png' },
  { id: 'ysl',          name: 'Yves Saint Laurent',          logo: '/images/logos/ysl.png' },
  { id: 'warner',       name: 'Warner Bros.',                logo: '/images/logos/warner.png' },
  { id: 'rai',          name: 'Rai Cinema',                  logo: '/images/logos/rai.png' },
  { id: 'cercle',       name: 'Cercle Entreprises & Libertés', logo: '/images/logos/cercle.png' },
];

const PLACEHOLDER_LABEL = 'Les Clients du Club 13';

export default function BrandLogos() {
  const [hoveredId, setHoveredId] = useState(null);
  const activeBrand = brands.find((b) => b.id === hoveredId);

  return (
    <div className="brand-logos">
      <div className="brand-logos-text">
        <p className="brand-logos-prefix">Ils nous ont fait confiance</p>
        <div className="brand-logos-name-wrap">
          {/* Placeholder transparent qui réserve la place pour éviter le reflow */}
          <p aria-hidden className="brand-logos-name brand-logos-name-placeholder">
            {PLACEHOLDER_LABEL}
          </p>
          <div className="brand-logos-name-overlay">
            <AnimatePresence mode="wait">
              <motion.p
                key={hoveredId ?? 'default'}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="brand-logos-name"
              >
                {activeBrand?.name ?? PLACEHOLDER_LABEL}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="brand-logos-grid">
        {brands.map(({ id, name, logo }) => {
          const isActive = hoveredId === id;
          const isDimmed = hoveredId !== null && !isActive;
          return (
            <button
              key={id}
              type="button"
              aria-label={name}
              className={`brand-logo-btn ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Le logo est appliqué comme MASK CSS sur ce span coloré.
                  Au repos : couleur cream-muted (gris clair lisible).
                  Au hover : couleur gold (var --gold).
                  Le PNG source doit avoir un fond transparent. */}
              <span
                className="brand-logo-mask"
                style={{
                  WebkitMaskImage: `url(${logo})`,
                  maskImage: `url(${logo})`,
                }}
                aria-hidden="true"
              ></span>
              {/* Fallback texte si le logo ne charge pas */}
              <span className="brand-logo-fallback">{name}</span>
              {/* Image cachée juste pour détecter une erreur de chargement */}
              <img
                src={logo}
                alt=""
                aria-hidden="true"
                style={{ display: 'none' }}
                onError={(e) => {
                  e.currentTarget.parentElement.classList.add('logo-failed');
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
