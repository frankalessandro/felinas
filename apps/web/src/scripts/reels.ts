import { gsap, reduceMotion } from "./gsap";
// ScrollTrigger solo hace falta para el modo móvil del escenario. Se importa desde
// animations.ts, que es donde se registra el plugin una única vez.
import { ScrollTrigger } from "./animations";

/**
 * Lógica de los reels de F Productions. Vive fuera de animations.ts porque no es
 * ScrollTrigger: es control de reproducción + un lightbox, y la sección se monta
 * en páginas que ya cargan ScrollTrigger por otras razones.
 *
 * Un solo tipo de tile: [data-reel-hero] → clip con audio, se abre en lightbox al
 * click. Lo usan tanto ReelsSection como GallerySection, compartiendo el mismo
 * overlay (ver initLightbox).
 */

type Teardown = () => void;
const teardowns: Teardown[] = [];

/**
 * Escenario: el índice de la izquierda manda sobre la vista previa de la derecha.
 *
 * No hay movimiento automático a propósito. La sección se mueve cuando el usuario
 * la mueve — apuntar una fila cambia el escenario, hacer click abre el reel. Lo
 * único animado es la transición entre reels, que reusa el desregistro de placas
 * del retrato del hero: se separan de golpe y vuelven a su sitio.
 */
function initStage(root: ParentNode): Teardown {
  const stage = root.querySelector<HTMLElement>("[data-reel-stage]");
  if (!stage) return () => {};

  const rows = Array.from(stage.querySelectorAll<HTMLElement>("[data-reel-row]"));
  const posters = Array.from(stage.querySelectorAll<HTMLElement>("[data-stage-poster]"));
  const title = stage.querySelector<HTMLElement>("[data-stage-title]");
  const dots = Array.from(stage.querySelectorAll<HTMLElement>("[data-stage-dot]"));
  const counter = stage.querySelector<HTMLElement>("[data-stage-counter]");
  const hint = stage.querySelector<HTMLElement>("[data-stage-hint]");
  const plateA = stage.querySelector<HTMLElement>('[data-stage-plate="a"]');
  const plateB = stage.querySelector<HTMLElement>('[data-stage-plate="b"]');
  const playBtn = stage.querySelector<HTMLElement>("[data-reel-stage-play]");
  if (!rows.length || !posters.length) return () => {};

  // El desplazamiento base de las placas crece en desktop, donde el escenario es
  // más grande y un offset chico se perdería.
  const wide = window.matchMedia("(min-width: 1024px)");
  const base = () => (wide.matches ? 14 : 9);

  const placePlates = () => {
    if (!plateA || !plateB) return;
    const o = base();
    gsap.set(plateA, { x: -o, y: -o });
    gsap.set(plateB, { x: o, y: o });
  };
  placePlates();
  wide.addEventListener("change", placePlates);

  let current = 0;

  const select = (i: number) => {
    if (i === current || !rows[i]) return;
    current = i;

    rows.forEach((row, r) => row.setAttribute("aria-current", r === i ? "true" : "false"));

    // Indicadores de móvil: el punto activo se alarga, como una barra de progreso
    // por pasos en vez de cinco puntos iguales.
    dots.forEach((dot, d) => {
      dot.classList.toggle("w-8", d === i);
      dot.classList.toggle("bg-[#ff006a]", d === i);
      dot.classList.toggle("w-3", d !== i);
      dot.classList.toggle("bg-white/25", d !== i);
    });
    if (counter) counter.textContent = `0${i + 1} / 0${rows.length}`;

    if (reduceMotion()) {
      posters.forEach((p, r) => gsap.set(p, { autoAlpha: r === i ? 1 : 0 }));
      if (title) title.textContent = rows[i].dataset.caption ?? "";
      return;
    }

    posters.forEach((p, r) => gsap.to(p, { autoAlpha: r === i ? 1 : 0, duration: 0.45, ease: "power2.out" }));

    // Golpe de desregistro: las placas saltan hacia afuera y vuelven.
    const o = base();
    if (plateA) gsap.fromTo(plateA, { x: -o * 2.6, y: -o * 2.6 }, { x: -o, y: -o, duration: 0.5, ease: "power3.out" });
    if (plateB) gsap.fromTo(plateB, { x: o * 2.6, y: o * 2.6 }, { x: o, y: o, duration: 0.5, ease: "power3.out" });

    if (title) {
      title.textContent = rows[i].dataset.caption ?? "";
      gsap.fromTo(title, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
  };

  // Apuntar una fila (mouse o teclado) cambia el escenario; el click lo abre y
  // de eso ya se encarga el lightbox, que lee los mismos [data-reel-hero].
  const handlers = rows.map((row, i) => {
    const onEnter = () => select(i);
    row.addEventListener("pointerenter", onEnter);
    row.addEventListener("focus", onEnter);
    return { row, onEnter };
  });

  // El botón del escenario abre el reel que se está mostrando.
  const onPlay = () => rows[current]?.click();
  playBtn?.addEventListener("click", onPlay);

  /**
   * Móvil: el escenario se pinnea y el scroll avanza de reel, igual que el revólver
   * de TeamSection. Ahí no cabe el índice numerado, así que el scroll pasa a ser la
   * navegación y el título vive sobre el propio botón.
   *
   * Va dentro de matchMedia y no de un media query suelto para que ScrollTrigger
   * cree y destruya el pin al cruzar el breakpoint: un pin que sobrevive al pasar a
   * desktop deja la sección trabada.
   */
  const mm = gsap.matchMedia();

  mm.add("(max-width: 1023px)", () => {
    // Sin animación no hay pin: el usuario quedaría atrapado en una sección que
    // solo avanza con un scroll que no se le anima. En su lugar se muestra el
    // índice completo, que es navegable con un tap.
    if (reduceMotion()) {
      const list = stage.querySelector<HTMLElement>("ul");
      list?.classList.remove("hidden");
      list?.classList.add("flex");
      if (hint) gsap.set(hint, { autoAlpha: 0 });
      return;
    }

    const steps = rows.length - 1;
    if (steps < 1) return;

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      // Una pantalla de scroll por reel: suficiente para que el cambio se sienta
      // deliberado y no un parpadeo al rozar la sección.
      end: () => `+=${steps * window.innerHeight * 0.9}`,
      scrub: 0.5,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        select(Math.min(steps, Math.round(self.progress * steps)));
        if (hint) {
          gsap.to(hint, { autoAlpha: self.progress > 0.02 ? 0 : 1, duration: 0.3, overwrite: true });
        }
      },
    });

    return () => trigger.kill();
  });

  return () => {
    handlers.forEach(({ row, onEnter }) => {
      row.removeEventListener("pointerenter", onEnter);
      row.removeEventListener("focus", onEnter);
    });
    playBtn?.removeEventListener("click", onPlay);
    wide.removeEventListener("change", placePlates);
    mm.revert();
  };
}

/**
 * Lightbox para los reels con audio. Un único overlay reutilizado por todos los
 * tiles (crear/destruir un <video> por apertura obliga al navegador a rearmar el
 * decoder cada vez). El clip se descarga recién al abrir.
 */
function initLightbox(root: ParentNode): Teardown {
  const heroes = Array.from(root.querySelectorAll<HTMLElement>("[data-reel-hero]"));
  const overlay = document.querySelector<HTMLElement>("[data-reel-lightbox]");
  if (!heroes.length || !overlay) return () => {};

  const video = overlay.querySelector<HTMLVideoElement>("video");
  const panel = overlay.querySelector<HTMLElement>("[data-reel-lightbox-panel]");
  const caption = overlay.querySelector<HTMLElement>("[data-reel-lightbox-caption]");
  const closeBtn = overlay.querySelector<HTMLElement>("[data-reel-close]");
  const counter = overlay.querySelector<HTMLElement>("[data-reel-lightbox-counter]");
  const prevBtn = overlay.querySelector<HTMLElement>("[data-reel-prev]");
  const nextBtn = overlay.querySelector<HTMLElement>("[data-reel-next]");
  if (!video || !panel) return () => {};

  // La cinta duplica las tarjetas para poder hacer el bucle; los candidatos a
  // playlist se arman solo con los originales, para que prev/next no recorra
  // cada reel dos veces.
  const candidates = heroes.filter((t) => t.getAttribute("aria-hidden") !== "true");

  // prev/next navega solo dentro de la sección donde se abrió el clip (Reels,
  // Galería o Producción), no entre las tres mezcladas: cada [data-reel-hero]
  // lleva su data-reel-group y la playlist se recalcula por grupo al abrir.
  let playlist: HTMLElement[] = [];
  let lastFocused: HTMLElement | null = null;
  let current = 0;

  /**
   * Los reels de ReelsSection son todos 9:16, pero GallerySection mete clips
   * horizontales de verdad (grabados en 16:9): forzarlos al marco vertical los
   * recorta por los costados. El lightbox es uno solo para toda la página, así
   * que se adapta por tile en vez de tener dos lightbox distintos.
   */
  const applyOrientation = (tile: HTMLElement) => {
    const landscape = tile.dataset.orientation === "landscape";
    video.classList.toggle("aspect-[9/16]", !landscape);
    video.classList.toggle("aspect-video", landscape);
    panel.classList.toggle("max-w-[min(420px,88vw)]", !landscape);
    panel.classList.toggle("max-w-[min(860px,92vw)]", landscape);
  };

  /** Carga el reel `i` en el reproductor ya abierto. */
  const load = (i: number) => {
    const tile = playlist[i];
    if (!tile?.dataset.src) return;

    current = i;
    video.src = tile.dataset.src;
    video.currentTime = 0;
    applyOrientation(tile);
    if (caption) caption.textContent = tile.dataset.caption ?? "";
    if (counter) counter.textContent = `${i + 1} / ${playlist.length}`;
    void video.play().catch(() => {});
  };

  const step = (delta: number) => {
    if (!playlist.length) return;
    load((current + delta + playlist.length) % playlist.length);
  };

  const show = (tile: HTMLElement) => {
    if (!tile.dataset.src) return;

    const group = tile.dataset.reelGroup ?? "default";
    playlist = candidates.filter((t) => (t.dataset.reelGroup ?? "default") === group);

    // Si el click vino de un clon de la cinta, no está en la lista: se resuelve
    // por su data-index, que apunta al reel original.
    const found = playlist.indexOf(tile);
    const i = found >= 0 ? found : Number(tile.dataset.index ?? 0);
    if (!playlist[i]) return;

    lastFocused = tile;
    load(i);

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    // Bloquea el scroll de fondo mientras el lightbox está abierto.
    document.body.style.overflow = "hidden";

    closeBtn?.focus();
    void video.play().catch(() => {});

    if (!reduceMotion()) {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.fromTo(panel, { scale: 0.92, y: 24 }, { scale: 1, y: 0, duration: 0.45, ease: "power3.out" });
    }
  };

  const hide = () => {
    // El estado real es el atributo `hidden`, no una bandera aparte: si el overlay
    // llega visible por cualquier motivo, cerrar tiene que funcionar igual.
    if (overlay.hidden) return;

    const finish = () => {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      video.pause();
      // Suelta el buffer: sin esto el clip sigue en memoria tras cerrar.
      video.removeAttribute("src");
      video.load();
      document.body.style.overflow = "";
      lastFocused?.focus();
    };

    if (reduceMotion()) {
      finish();
    } else {
      gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power2.in", onComplete: finish });
    }
  };

  const onTileActivate = (event: Event) => {
    event.preventDefault();
    show(event.currentTarget as HTMLElement);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (overlay.hidden) return;
    if (event.key === "Escape") hide();
    // Las flechas navegan entre reels; sin esto habría que cerrar y volver a elegir.
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  };

  const onPrev = () => step(-1);
  const onNext = () => step(1);

  const onOverlayClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // Cierra al hacer click en el fondo, pero no sobre el panel ni sobre los
    // controles: prev/next viven fuera del panel y sin esta guarda cerrarían.
    if (panel.contains(target)) return;
    if (target.closest("[data-reel-prev],[data-reel-next],[data-reel-close]")) return;
    hide();
  };

  heroes.forEach((tile) => tile.addEventListener("click", onTileActivate));
  closeBtn?.addEventListener("click", hide);
  prevBtn?.addEventListener("click", onPrev);
  nextBtn?.addEventListener("click", onNext);
  overlay.addEventListener("click", onOverlayClick);
  document.addEventListener("keydown", onKeydown);

  return () => {
    heroes.forEach((tile) => tile.removeEventListener("click", onTileActivate));
    closeBtn?.removeEventListener("click", hide);
    prevBtn?.removeEventListener("click", onPrev);
    nextBtn?.removeEventListener("click", onNext);
    overlay.removeEventListener("click", onOverlayClick);
    document.removeEventListener("keydown", onKeydown);
    document.body.style.overflow = "";
    video.pause();
  };
}

/** Punto de entrada único de la sección de reels. */
export function initReels(root: ParentNode = document) {
  teardowns.push(initStage(root), initLightbox(root));
}

/** Limpieza para View Transitions: evita listeners y videos huérfanos entre navegaciones. */
export function destroyReels() {
  while (teardowns.length) teardowns.pop()?.();
}

if (typeof document !== "undefined") {
  document.addEventListener("astro:before-swap", destroyReels);
}
