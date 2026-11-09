import { gsap, reduceMotion } from "./gsap";

/**
 * "Tiras de camerino": las integrantes son franjas inclinadas lado a lado; la activa
 * se abre y muestra foto completa + ficha, las demás se comprimen.
 *
 * No anima width/flex-grow: cada panel mide siempre lo que mide abierto y lo que cambia
 * es su translate (posición) y su clip-path (cuánto se ve). Así el cambio de integrante
 * no dispara layout en ningún frame, solo composición/paint.
 *
 * Eje x en desktop (columnas), eje y en móvil (filas apiladas). No usa ScrollTrigger.
 *
 * Uso: [data-strips] > [data-strip] con [data-strip-inner] (foto), [data-strip-dim]
 * (oscurece las cerradas), [data-strip-label] (nombre cerrada) y [data-strip-info] (ficha).
 * Controles opcionales en la misma <section>: [data-strips-prev], [data-strips-next],
 * [data-strips-current] (número) y [data-strips-progress] (barra, scaleX).
 * Expone --strip-closed en el contenedor para que el label ocupe justo la franja visible.
 */

type Axis = "x" | "y";
type Layout = { axis: Axis; open: number; closed: number; slant: number; gap: number };
type PanelState = { pos: number; size: number };

const MOBILE_QUERY = "(max-width: 767px)";

function measure(container: HTMLElement, count: number): Layout {
  const mobile = window.matchMedia(MOBILE_QUERY).matches;
  if (mobile) {
    const closed = 76;
    const slant = 14;
    const gap = 4;
    // Retrato 3:4 al ancho de pantalla, sin pasarse del alto útil del viewport
    const open = Math.round(Math.min(container.clientWidth * 1.25, window.innerHeight * 0.68));
    return { axis: "y", open, closed, slant, gap };
  }
  const slant = 36;
  const gap = 6;
  const width = container.clientWidth;
  const closed = Math.round(Math.max(88, width * 0.1));
  // Suma de tiras visibles (restando el solape de la inclinación) = ancho del contenedor
  const open = Math.round(width + (count - 1) * (slant - gap) - (count - 1) * closed);
  return { axis: "x", open, closed, slant, gap };
}

function targets(layout: Layout, count: number, active: number): PanelState[] {
  let pos = 0;
  return Array.from({ length: count }, (_, i) => {
    const size = i === active ? layout.open : layout.closed;
    const state = { pos, size };
    pos += size - layout.slant + layout.gap;
    return state;
  });
}

function clipFor(layout: Layout, size: number): string {
  const s = layout.slant;
  // El panel mide `open`; se recorta a `size` con los dos bordes paralelos inclinados
  return layout.axis === "x"
    ? `polygon(${s}px 0, ${size}px 0, ${size - s}px 100%, 0 100%)`
    : `polygon(0 ${s}px, 100% 0, 100% ${size - s}px, 0 ${size}px)`;
}

export function initTeamStrips(selector = "[data-strips]") {
  gsap.utils.toArray<HTMLElement>(selector).forEach((container) => {
    const panels = gsap.utils.toArray<HTMLElement>("[data-strip]", container);
    if (panels.length < 2) return;

    const inners = panels.map((p) => p.querySelector<HTMLElement>("[data-strip-inner]")!);
    const labels = panels.map((p) => p.querySelector<HTMLElement>("[data-strip-label]"));
    const infos = panels.map((p) => p.querySelector<HTMLElement>("[data-strip-info]"));
    const dims = panels.map((p) => p.querySelector<HTMLElement>("[data-strip-dim]"));
    const states: PanelState[] = panels.map(() => ({ pos: 0, size: 0 }));

    const scope = container.closest("section") ?? document;
    const prevBtn = scope.querySelector<HTMLElement>("[data-strips-prev]");
    const nextBtn = scope.querySelector<HTMLElement>("[data-strips-next]");
    const currentEl = scope.querySelector<HTMLElement>("[data-strips-current]");
    const progressEl = scope.querySelector<HTMLElement>("[data-strips-progress]");

    let layout = measure(container, panels.length);
    let active = 0;

    const apply = (i: number) => {
      const { pos, size } = states[i];
      const panel = panels[i];
      const x = layout.axis === "x";
      panel.style.transform = x ? `translate3d(${pos}px,0,0)` : `translate3d(0,${pos}px,0)`;
      panel.style.clipPath = clipFor(layout, size);
      // Centra la foto en la parte visible; en móvil sesgada hacia arriba (caras)
      const bias = x ? 0.5 : 0.3;
      const shift = (size - layout.open) * bias;
      inners[i].style.transform = x ? `translate3d(${shift}px,0,0)` : `translate3d(0,${shift}px,0)`;
    };

    const sizeContainer = () => {
      const x = layout.axis === "x";
      panels.forEach((p) => {
        p.style.width = x ? `${layout.open}px` : "100%";
        p.style.height = x ? "100%" : `${layout.open}px`;
      });
      const total = layout.open + (panels.length - 1) * (layout.closed - layout.slant + layout.gap);
      container.style.height = x ? "" : `${total}px`;
      container.style.setProperty("--strip-closed", `${layout.closed}px`);
    };

    const setActive = (next: number, animate: boolean) => {
      active = next;
      const goal = targets(layout, panels.length, active);
      const duration = animate && !reduceMotion() ? 0.5 : 0;

      if (currentEl) currentEl.textContent = String(active + 1).padStart(2, "0");
      if (progressEl) {
        gsap.to(progressEl, { scaleX: (active + 1) / panels.length, duration, ease: "expo.out", overwrite: true });
      }

      panels.forEach((panel, i) => {
        const isActive = i === active;
        panel.setAttribute("aria-expanded", String(isActive));
        gsap.to(states[i], {
          ...goal[i],
          duration,
          ease: "expo.out",
          overwrite: true,
          onUpdate: () => apply(i),
          onComplete: () => apply(i),
        });
        if (labels[i]) gsap.to(labels[i], { autoAlpha: isActive ? 0 : 1, duration: duration * 0.5, overwrite: true });
        if (dims[i]) gsap.to(dims[i], { opacity: isActive ? 0 : 1, duration, overwrite: true });
        if (infos[i]) {
          gsap.to(infos[i], {
            autoAlpha: isActive ? 1 : 0,
            y: isActive ? 0 : 16,
            duration: isActive ? duration * 0.8 : duration * 0.3,
            delay: isActive ? duration * 0.15 : 0,
            ease: "power3.out",
            overwrite: true,
          });
        }
      });
    };

    const relayout = () => {
      layout = measure(container, panels.length);
      sizeContainer();
      targets(layout, panels.length, active).forEach((t, i) => {
        gsap.killTweensOf(states[i]);
        Object.assign(states[i], t);
        apply(i);
      });
    };

    // Estado inicial sin animación; recién entonces se pasa del fallback flex (sin JS) al absoluto
    sizeContainer();
    container.dataset.ready = "";
    setActive(0, false);

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let hoverTimer = 0;
    panels.forEach((panel, i) => {
      panel.addEventListener("click", () => i !== active && setActive(i, true));
      panel.addEventListener("focus", () => i !== active && setActive(i, true));
      // Hover solo con mouse: en táctil el pointerenter llega junto al tap y duplicaría el cambio.
      // La espera evita el efecto dominó: al abrirse una tira las demás se corren bajo el
      // cursor, y sin intención mínima cada una que pasa por debajo se abriría también.
      panel.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse" || !finePointer.matches || i === active) return;
        clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => setActive(i, true), 60);
      });
      panel.addEventListener("pointerleave", () => clearTimeout(hoverTimer));
    });

    // Carrusel circular: después de la última vuelve a la primera
    const step = (dir: 1 | -1) => setActive((active + dir + panels.length) % panels.length, true);
    prevBtn?.addEventListener("click", () => step(-1));
    nextBtn?.addEventListener("click", () => step(1));

    // Flechas para recorrer el equipo con teclado
    container.addEventListener("keydown", (e) => {
      const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
      const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
      if (!forward && !back) return;
      e.preventDefault();
      const next = (active + (forward ? 1 : -1) + panels.length) % panels.length;
      panels[next].focus();
    });

    // Solo cambios de ANCHO: en iOS la barra de URL cambia innerHeight al scrollear y
    // recalcular ahí movería el alto de la sección (layout shift) en pleno scroll.
    let raf = 0;
    let lastWidth = container.clientWidth;
    new ResizeObserver(() => {
      if (container.clientWidth === lastWidth) return;
      lastWidth = container.clientWidth;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(relayout);
    }).observe(container);
  });
}
