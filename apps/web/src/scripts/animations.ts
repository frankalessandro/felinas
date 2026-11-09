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
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 95%", once: true },
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
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 95%", once: true },
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
        start: "top 96%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: "power3.out", stagger: 0.07, overwrite: true }),
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

/**
 * Escenario anclado de clases: la sección se fija y las [data-stage-slide] pasan una a la vez —la
 * actual sale hacia arriba mientras la siguiente sube desde abajo—, con la tarjeta [data-stage-card]
 * girando levemente y el texto [data-stage-text] entrando después. Una sola timeline scrubbed.
 * Solo en escritorio y con movimiento permitido; en móvil las clases quedan en fila y entran con un
 * fundido simple. `data-pinned` lo activa este script, así el CSS no depende de que cargue.
 * Avisa con el evento `class-stage-change` cuando cambia la clase visible.
 */
export function initClassStage(selector = "[data-stage]") {
  const stage = document.querySelector<HTMLElement>(selector);
  if (!stage) return;
  const slides = gsap.utils.toArray<HTMLElement>("[data-stage-slide]", stage);
  const dots = gsap.utils.toArray<HTMLElement>("[data-stage-dot]", stage);
  const n = slides.length;
  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    stage.dataset.pinned = "true";
    // Cada clase ocupa STEP de tiempo: entra en [t-0.4, t], se queda 0.7 y sale en [t+0.7, t+1] ANTES de
    // que empiece a entrar la siguiente. Que salga y entre una tras otra (no a la vez) evita que dos
    // tarjetas y dos textos se crucen a mitad de la transición, que se leía como desorden.
    const STEP = 1.4;
    const total = (n - 1) * STEP + 0.7;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * n * 0.9}`,
        pin: true,
        refreshPriority: 1,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => setActive(Math.min(n - 1, Math.floor((self.progress * total + 0.4) / STEP))),
      },
    });

    slides.forEach((slide, i) => {
      const card = slide.querySelector<HTMLElement>("[data-stage-card]");
      const flip = card?.querySelector<HTMLElement>("[data-flip]");
      const wash = slide.querySelector<HTMLElement>("[data-stage-wash]");
      const text = slide.querySelector<HTMLElement>("[data-stage-text]");
      const parts = text ? Array.from(text.children) : [];
      const dir = Number(card?.dataset.dir) || 1;
      const t = i * STEP;

      if (i > 0) {
        tl.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, t - 0.4);
        // La tarjeta sube desde abajo girando sobre su eje (3D, con poca perspectiva para que ningún borde se agrande).
        if (flip) tl.fromTo(flip, { y: 190, scale: 0.82, rotation: dir * 8, rotationY: dir * -26, transformPerspective: 2200, transformOrigin: "50% 60%" }, { y: 0, scale: 1, rotation: 0, rotationY: 0, duration: 0.45, ease: "power3.out" }, t - 0.4);
        // La luz de color detrás florece al mismo tiempo: marca el cambio de clase sin gritar.
        if (wash) tl.fromTo(wash, { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, t - 0.4);
        // El texto llega en cascada, pieza por pieza, desde el lado opuesto a la tarjeta.
        if (parts.length) tl.fromTo(parts, { y: 55, x: dir * -40, autoAlpha: 0 }, { y: 0, x: 0, autoAlpha: 1, duration: 0.3, stagger: 0.05, ease: "power3.out" }, t - 0.3);
      }
      if (i < n - 1) {
        if (flip) tl.to(flip, { y: -170, scale: 0.88, rotation: -dir * 5, rotationY: dir * 20, transformPerspective: 2200, duration: 0.3, ease: "power2.in" }, t + 0.7);
        if (wash) tl.to(wash, { scale: 1.3, autoAlpha: 0, duration: 0.3 }, t + 0.7);
        if (parts.length) tl.to(parts, { y: -40, x: dir * 30, autoAlpha: 0, duration: 0.22, stagger: 0.03, ease: "power2.in" }, t + 0.7);
        tl.to(slide, { autoAlpha: 0, duration: 0.1 }, t + 0.9);
      }
    });
    // La última clase se queda quieta un momento antes de soltar el anclaje.
    tl.to({}, { duration: 0.7 }, (n - 1) * STEP);

    let current = -1;
    const setActive = (idx: number) => {
      if (idx === current) return;
      current = idx;
      // Solo la clase visible recibe foco y clics: las demás están apiladas debajo.
      slides.forEach((s, j) => s.toggleAttribute("inert", j !== idx));
      dots.forEach((d, j) => d.setAttribute("aria-current", String(j === idx)));
      document.dispatchEvent(new CustomEvent("class-stage-change", { detail: { index: idx } }));
    };
    setActive(0);

    const onDot = (e: Event) => {
      const i = Number((e.currentTarget as HTMLElement).dataset.stageDot);
      const st = tl.scrollTrigger;
      if (!st) return;
      window.scrollTo({ top: st.start + ((i * STEP + 0.3) / total) * (st.end - st.start), behavior: "smooth" });
    };
    dots.forEach((d) => d.addEventListener("click", onDot));

    return () => {
      dots.forEach((d) => d.removeEventListener("click", onDot));
      slides.forEach((s) => s.removeAttribute("inert"));
      delete stage.dataset.pinned;
    };
  });

  // Móvil: sin anclaje, cada clase entra con un fundido al llegar a pantalla.
  mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
    slides.forEach((slide) => {
      gsap.from(slide, { autoAlpha: 0, y: 50, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: slide, start: "top 88%", once: true } });
    });
  });
}

/**
 * Entrada tipo telón: en cada [data-curtain-tile] la foto [data-curtain-photo] se destapa de abajo
 * hacia arriba (clip-path), la imagen [data-curtain-img] se asienta desde un zoom, la luz
 * [data-curtain-glow] florece y el nombre [data-curtain-name] sube desde una máscara. Las fichas
 * entran una tras otra. Como initMosaic, devuelve una función que conecta los triggers después del
 * primer paint: ocultar es síncrono y barato, medir layout no.
 */
export function initCurtain(selector = "[data-curtain]") {
  const groups = gsap.utils.toArray<HTMLElement>(selector);
  if (reduceMotion()) return () => {};
  const parts = (tile: HTMLElement) => ({
    photo: tile.querySelector<HTMLElement>("[data-curtain-photo]"),
    img: tile.querySelector<HTMLElement>("[data-curtain-img]"),
    glow: tile.querySelector<HTMLElement>("[data-curtain-glow]"),
    name: tile.querySelector<HTMLElement>("[data-curtain-name]"),
  });
  const tilesOf = (g: HTMLElement) => gsap.utils.toArray<HTMLElement>("[data-curtain-tile]", g);

  groups.forEach((g) =>
    tilesOf(g).forEach((tile) => {
      const { photo, img, glow, name } = parts(tile);
      if (photo) gsap.set(photo, { clipPath: "inset(100% 0% 0% 0% round 1.5rem)" });
      if (img) gsap.set(img, { scale: 1.55 });
      if (glow) gsap.set(glow, { autoAlpha: 0, scale: 0.6 });
      if (name) gsap.set(name, { yPercent: 115 });
    }),
  );

  return () => {
    groups.forEach((g) => {
      ScrollTrigger.batch(tilesOf(g), {
        start: "top 96%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((tile, i) => {
            const { photo, img, glow, name } = parts(tile);
            const tl = gsap.timeline({ delay: i * 0.1 });
            if (glow) tl.to(glow, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0);
            if (photo) tl.to(photo, { clipPath: "inset(0% 0% 0% 0% round 1.5rem)", duration: 0.75, ease: "power3.inOut" }, 0);
            if (img) tl.to(img, { scale: 1.12, duration: 1.1, ease: "power3.out" }, 0);
            if (name) tl.to(name, { yPercent: 0, duration: 0.55, ease: "power3.out" }, 0.35);
          });
        },
      });
    });
  };
}

/**
 * Galería automática en columnas: cada [data-marquee] desplaza su [data-marquee-track] en bucle
 * continuo. El track trae el contenido DUPLICADO, así que mover exactamente la mitad (-50%) devuelve
 * al inicio sin salto. data-marquee-dir="up|down" y data-marquee-duration (segundos por vuelta).
 * Se pausa fuera de pantalla (no gasta CPU) y se frena —no se detiene— al pasar el cursor.
 * Con reduced-motion no se mueve.
 */
export function initMarquee(selector = "[data-marquee]") {
  if (reduceMotion()) return;
  gsap.utils.toArray<HTMLElement>(selector).forEach((col) => {
    const track = col.querySelector<HTMLElement>("[data-marquee-track]");
    if (!track) return;
    const down = col.dataset.marqueeDir === "down";
    const duration = Number(col.dataset.marqueeDuration) || 40;

    gsap.set(track, { yPercent: down ? -50 : 0 });
    const tween = gsap.to(track, { yPercent: down ? 0 : -50, duration, ease: "none", repeat: -1, paused: true });

    ScrollTrigger.create({
      trigger: col,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
    });

    col.addEventListener("pointerenter", () => gsap.to(tween, { timeScale: 0.12, duration: 0.5, overwrite: true }));
    col.addEventListener("pointerleave", () => gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: true }));
  });
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
