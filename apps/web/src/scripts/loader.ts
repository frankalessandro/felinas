/**
 * Pantalla de carga: cuándo sale y cómo sale.
 * Solo depende de GSAP core, así la landing no arrastra ScrollTrigger por usar el loader.
 */
import { gsap, reduceMotion } from "./gsap";

/** Evento que emite el loader al terminar; la landing lo usa para encadenar su intro. */
export const LOADER_DONE = "felinas:loader-done";

/**
 * Quita el loader en cuanto la página está *visualmente* lista, no cuando termina `load`.
 * `window.load` espera a TODAS las imágenes (incluidas las de más abajo y las lazy), por eso
 * el loader se quedaba puesto de más. Acá basta con las fuentes y las imágenes del primer
 * viewport; el resto entra después sin bloquear nada.
 */
export function revealPage({ id = "loading-screen", duration = 0.6, timeout = 1200 } = {}) {
  const start = performance.now();
  const MIN_VISIBLE = 350; // sin esto el loader parpadea en cargas instantáneas

  const after = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  // WebKit/Safari: `document.fonts.ready` y sobre todo `img.decode()` sobre un SVG
  // pueden no resolver NUNCA (ni resolve ni reject), y ahí `.catch()` no ayuda: la
  // promesa nunca se settlea y `Promise.all` cuelga hasta el timeout global. Por eso
  // cada señal corre contra su propio tope corto en vez de encadenarse a ciegas.
  const cap = (p: unknown, ms: number) => Promise.race([Promise.resolve(p).catch(() => {}), after(ms)]);

  const fonts = document.fonts ? cap(document.fonts.ready, 800) : Promise.resolve();

  const above = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[fetchpriority="high"], img[loading="eager"]')
  ).map((img) => (img.complete ? Promise.resolve() : cap(img.decode(), 600)));

  const domReady =
    document.readyState !== "loading"
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          document.addEventListener("DOMContentLoaded", () => resolve(), { once: true })
        );

  const ready = Promise.all([domReady, fonts, ...above]);

  Promise.race([ready, after(timeout)]).then(() => {
    const waited = performance.now() - start;
    window.setTimeout(() => hideLoader(id, duration), Math.max(0, MIN_VISIBLE - waited));
  });
}

/**
 * Desvanece y elimina la pantalla de carga.
 * El halo neón crece al salir para que el corte con el fondo negro de la página no se note.
 */
export function hideLoader(id = "loading-screen", duration = 0.5) {
  const loader = document.getElementById(id);
  const done = () => window.dispatchEvent(new CustomEvent(LOADER_DONE));
  if (!loader) {
    done();
    return;
  }

  const halo = loader.querySelector<HTMLElement>(".ls-halo");
  const stack = loader.querySelector<HTMLElement>(".ls-stack");
  const logo = loader.querySelector<HTMLElement>(".ls-logo");
  // Una animación CSS gana sobre el transform inline: hay que apagarla antes de que GSAP tome el relevo.
  [halo, logo].forEach((el) => el && (el.style.animation = "none"));

  const tl = gsap.timeline({
    onComplete: () => {
      loader.remove();
      done();
    },
  });

  if (!reduceMotion()) {
    if (halo) tl.to(halo, { scale: 1.6, opacity: 0, duration: duration * 1.4, ease: "power2.in" }, 0);
    if (stack) tl.to(stack, { scale: 0.94, y: -8, duration: duration * 1.2, ease: "power2.in" }, 0);
  }

  tl.to(loader, { autoAlpha: 0, duration, ease: "power1.out" }, duration * 0.25);
}
