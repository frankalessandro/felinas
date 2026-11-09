/**
 * GSAP core, sin plugins.
 *
 * Existe separado de `animations.ts` para que las páginas que no scrollean (la landing,
 * el loader) no arrastren ScrollTrigger: son ~45 KB de JS que ahí no se usan nunca.
 * Si un módulo necesita ScrollTrigger, importa desde `animations.ts`.
 */
import { gsap } from "gsap";

export { gsap };

/** Único punto donde se consulta la preferencia de movimiento reducido. */
export const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
