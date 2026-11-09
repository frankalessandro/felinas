/**
 * Animaciones ligadas al scroll. Importar desde acá arrastra ScrollTrigger;
 * si solo hace falta GSAP core (landing, loader), importar desde `./gsap`.
 */
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, reduceMotion } from "./gsap";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Scroll-reveal para todos los [data-reveal] de la página (reemplaza el IntersectionObserver + transition CSS). */
/**
 * Devuelve una función para terminar la configuración, en vez de hacerlo todo de una.
 * `gsap.fromTo` renderiza el estado "from" (oculto) en el momento en que se crea el
 * tween: si esa llamada se retrasa a un frame posterior al primer paint (para no
 * bloquear el render, ver show.astro/academia.astro), el elemento se ve un frame en
 * su posición final visible y al siguiente salta a oculto+desplazado — un layout
 * shift real y perceptible. Separar "ocultar ya" (barato, sin medir layout) de
 * "conectar el ScrollTrigger" (caro, sí mide layout) permite que la página pinte con
 * el contenido ya oculto pero deje la creación de triggers para después.
 */
export function initReveals(selector = "[data-reveal]") {
  const els = gsap.utils.toArray<HTMLElement>(selector);
  gsap.set(els, { autoAlpha: 0, y: 28 });

  return () => {
    els.forEach((el) => {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
  };
}

/**
 * Simula :hover con el scroll: cuando un [data-scroll-active] entra en la banda central
 * del viewport se le marca data-active="true" (leído por variantes Tailwind
 * `group-data-[active=true]:` o `data-[active=true]:`). Así los mismos estilos que antes
 * solo se veían con el mouse se disparan solos al pasar por pantalla — imprescindible en
 * móvil, donde no existe hover, y da vida al scroll también en desktop.
 */
export function initScrollActive(selector = "[data-scroll-active]") {
  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      end: "bottom 25%",
      onToggle: (self) => {
        el.dataset.active = self.isActive ? "true" : "false";
      },
    });
  });
}

/**
 * Variante exclusiva de initScrollActive: dentro de un contenedor, solo el elemento más
 * cercano al centro del viewport queda activo (data-spot="true"), nunca dos a la vez.
 * Existe porque una banda ancha (initScrollActive) permite que dos filas grandes y vecinas
 * queden encendidas al mismo tiempo — bien para acentos sutiles, mal para efectos fuertes
 * como un flood de color que invierte el texto: ahí dos activos a la vez se ve roto.
 */
export function initScrollSpotlight(containerSelector: string, itemSelector = "[data-spotlight-item]") {
  document.querySelectorAll<HTMLElement>(containerSelector).forEach((container) => {
    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
    if (!items.length) return;

    const mark = () => {
      const centerY = window.innerHeight / 2;
      let closest: HTMLElement | null = null;
      let minDist = Infinity;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - centerY);
        if (dist < minDist) {
          minDist = dist;
          closest = item;
        }
      }
      items.forEach((it) => (it.dataset.spot = it === closest ? "true" : "false"));
    };

    ScrollTrigger.create({ trigger: container, start: "top bottom", end: "bottom top", onUpdate: mark, onRefresh: mark });
  });
}

/** Contadores animados para [data-counter] (reemplaza los setInterval de React). */
export function initCounters(selector = "[data-counter]") {
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const target = Number(el.dataset.counter ?? 0);
    const suffix = el.dataset.suffix ?? "";
    const state = { v: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(state, {
      v: target,
      duration: 1.5,
      ease: "power1.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
      onUpdate: () => {
        el.textContent = `${Math.floor(state.v)}${suffix}`;
      },
    });
  });
}

/** Entrada lateral para [data-reveal-x="left|right"] (imágenes/paneles que entran desde un costado). */
/** Mismo criterio que initReveals: ocultar es síncrono, conectar el trigger se difiere. */
export function initSlideReveals(selector = "[data-reveal-x]") {
  const els = gsap.utils.toArray<HTMLElement>(selector);
  const dirs = els.map((el) => (el.dataset.revealX === "right" ? 1 : -1));
  els.forEach((el, i) => gsap.set(el, { autoAlpha: 0, x: 60 * dirs[i] }));

  return () => {
    els.forEach((el, i) => {
      gsap.to(el, {
        autoAlpha: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
  };
}

/** Entrada escalonada tipo hero para los [data-hero-fade] (reemplaza animate-fade-up con animation-delay). */
export function initHeroIntro(scope?: HTMLElement | null) {
  const root = scope ?? document;
  const els = root.querySelectorAll<HTMLElement>("[data-hero-fade]");
  if (!els.length) return;
  gsap.fromTo(
    els,
    { autoAlpha: 0, y: 30 },
    { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.05 }
  );
}

/**
 * Animaciones ambientales en bucle (glows flotantes, latidos, rebotes) que antes eran
 * @keyframes de CSS. En GSAP se pueden pausar cuando el elemento sale del viewport,
 * cosa que una animación CSS no permite: un glow con blur de 110px animándose fuera de
 * pantalla sigue costando composición en cada frame.
 *
 * Uso: data-ambient="float | glow | bounce | pulse" y, opcional, data-ambient-duration.
 */
export function initAmbient(selector = "[data-ambient]") {
  if (reduceMotion()) return;

  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    const kind = el.dataset.ambient;
    const duration = Number(el.dataset.ambientDuration) || undefined;
    const base = { repeat: -1, yoyo: true, ease: "sine.inOut", paused: true };

    let tween: gsap.core.Tween;
    switch (kind) {
      case "float":
        tween = gsap.to(el, { ...base, duration: duration ?? 8, y: -20, scale: 1.05, opacity: 0.8 });
        gsap.set(el, { opacity: 0.5 });
        break;
      case "glow":
        tween = gsap.to(el, {
          ...base,
          duration: duration ?? 2,
          boxShadow: "0 0 40px hsl(340 82% 52% / 0.6)",
        });
        gsap.set(el, { boxShadow: "0 0 20px hsl(340 82% 52% / 0.3)" });
        break;
      case "bounce":
        tween = gsap.to(el, { ...base, duration: duration ?? 2, y: -8 });
        break;
      case "pulse":
        tween = gsap.to(el, { ...base, duration: duration ?? 1, opacity: 0.35 });
        break;
      default:
        return;
    }

    if (el.dataset.ambientReverse !== undefined) tween.progress(0.5);

    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
    });
  });
}

/** Parallax horizontal: mueve el elemento en X a medida que se hace scroll vertical. Uso: data-parallax-x="valor px". */
export function initParallaxX(selector = "[data-parallax-x]") {
  if (reduceMotion()) return;
  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    const distance = Number(el.dataset.parallaxX ?? 120);
    gsap.to(el, {
      x: distance,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  });
}

/** Parallax vertical: desplaza el elemento en Y (±valor px) mientras su contenedor cruza el viewport. Uso: data-parallax-y="valor px". */
export function initParallaxY(selector = "[data-parallax-y]") {
  if (reduceMotion()) return;
  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    const distance = Number(el.dataset.parallaxY ?? 40);
    gsap.fromTo(
      el,
      { y: -distance },
      {
        y: distance,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );
  });
}

/**
 * Mazo de cartas apiladas: cada [data-stack-card] queda sticky bajo el borde superior
 * y la siguiente se monta encima. El apilado en sí es CSS puro; esto solo anima el
 * "retroceso" de la carta que queda debajo —escala, giro leve y oscurecido— para que
 * se lea profundidad en vez de un corte seco entre una foto y la siguiente.
 *
 * El trigger es la carta SIGUIENTE, no la propia: una carta sticky deja de moverse
 * respecto del viewport en cuanto se pega, así que su propio progreso de scroll se
 * congela y no sirve para medir nada. La que sí viaja es la que sube por encima.
 */
export function initStackCards(selector = "[data-stack]") {
  if (reduceMotion()) return;
  gsap.utils.toArray<HTMLElement>(selector).forEach((stack) => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", stack);

    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;

      const inner = card.querySelector<HTMLElement>("[data-stack-inner]");
      if (!inner) return;
      const dim = inner.querySelector<HTMLElement>("[data-stack-dim]");

      // Giro alternado: da sensación de mazo repartido a mano en vez de una pila
      // perfectamente alineada, que se lee como un simple fade.
      const tilt = i % 2 === 0 ? -2.2 : 2.2;

      // Una sola timeline por carta: dos ScrollTriggers sobre el mismo tramo se
      // desincronizan entre sí al hacer refresh.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: next,
          start: "top bottom",
          end: "top top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      tl.to(inner, { scale: 0.9, rotate: tilt, ease: "none" }, 0);
      if (dim) tl.to(dim, { opacity: 0.55, ease: "none" }, 0);
    });
  });
}

/**
 * Mosaico: las piezas [data-mosaic-tile] entran escalonadas (subida + giro leve que se
 * endereza), la foto [data-mosaic-img] de cada pieza hace parallax interno y las barras
 * [data-mosaic-bar="0..1"] se llenan. Como initReveals, devuelve una función para conectar
 * los triggers después del primer paint: ocultar es síncrono y barato, medir layout no.
 */
export function initMosaic(selector = "[data-mosaic]") {
  const mosaics = gsap.utils.toArray<HTMLElement>(selector);
  const still = reduceMotion();
  const tilesOf = (m: HTMLElement) => gsap.utils.toArray<HTMLElement>("[data-mosaic-tile]", m);

  if (!still) {
    mosaics.forEach((m) => {
      tilesOf(m).forEach((t, i) => gsap.set(t, { autoAlpha: 0, y: 70, scale: 0.94, rotate: i % 2 ? 2 : -2 }));
    });
  }

  return () => {
    if (still) return;
    mosaics.forEach((m) => {
      ScrollTrigger.batch(tilesOf(m), {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }),
      });

      gsap.utils.toArray<HTMLElement>("[data-mosaic-img]", m).forEach((img) => {
        // La foto va más lenta que su marco: profundidad sin tocar el layout.
        gsap.fromTo(
          img,
          { yPercent: -5 },
          { yPercent: 5, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-mosaic-bar]", m).forEach((bar) => {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          { scaleX: Number(bar.dataset.mosaicBar) || 0, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: bar, start: "top 92%", once: true } },
        );
      });
    });
  };
}

/** Tilt 3D atrevido: la imagen sigue el mouse dentro de su contenedor. Uso: data-tilt="grados max" en el <img>, perspective en el padre. */
export function initTilt(selector = "[data-tilt]") {
  if (reduceMotion()) return;
  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    const max = Number(el.dataset.tilt) || 12;
    const parent = el.parentElement ?? el;
    const rotateX = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3" });
    const rotateY = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3" });
    const scale = gsap.quickTo(el, "scale", { duration: 0.5, ease: "power3" });

    parent.addEventListener("mousemove", (e) => {
      const evt = e as MouseEvent;
      const rect = parent.getBoundingClientRect();
      const px = (evt.clientX - rect.left) / rect.width - 0.5;
      const py = (evt.clientY - rect.top) / rect.height - 0.5;
      rotateX(-py * max);
      rotateY(px * max);
      scale(1.04);
    });
    parent.addEventListener("mouseleave", () => {
      rotateX(0);
      rotateY(0);
      scale(1);
    });
  });
}
