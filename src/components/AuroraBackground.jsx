import './AuroraBackground.css';

/**
 * Effet "aurore" — calque animé de bandes colorées floues qui ondulent.
 * Adaptation du composant AuroraBackground (TS + Tailwind + cn) → JSX + CSS pur.
 *
 * Différences clés :
 *  - Palette chaude (or, terracotta, sable, rose poudré) au lieu de bleu/violet
 *    pour matcher le ton coucher-de-soleil du hero
 *  - Pas de wrapper `<main>` ni de logique `children` — c'est juste un calque à
 *    insérer dans une section existante (.hero ici), avec pointer-events: none
 *
 * Technique :
 *  - 2 repeating-linear-gradients superposés (l'un colore, l'autre crée le motif "stries")
 *  - Le ::after rejoue ces gradients avec mix-blend-mode: difference + position animée
 *    → effet de pulsation lente
 *  - Mask radial pour cantonner l'effet au coin supérieur droit (au-dessus de l'horizon)
 */
export default function AuroraBackground({ className = '', showRadialGradient = true }) {
  return (
    <div className={`aurora ${className}`} aria-hidden="true">
      <div className={`aurora-inner ${showRadialGradient ? 'aurora-inner--radial' : ''}`} />
    </div>
  );
}
