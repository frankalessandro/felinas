# Felinas Web

![Felinas](docs/bannerReadme.png)

Sitio web oficial de **Pantera Felinas**, academia de danza urbana femenina. Pensado para captar alumnas nuevas: presenta la identidad de la academia, la oferta de clases y membresías, y da acceso directo a agendar una clase gratis por WhatsApp.

🔗 [felinas-web.vercel.app](https://felinas-web.vercel.app/)

---

## La experiencia

El sitio arranca con una **landing split-screen**: dos bandas diagonales, una para Academia y otra para Show, que se expanden al pasar el mouse y llevan a cada sección con una transición tipo wipe. De ahí en adelante, todo el recorrido está pensado como una sola pieza animada en vez de una serie de secciones sueltas: reveals al hacer scroll, contadores animados, parallax y loops ambientes (glow, float, bounce) en los elementos decorativos.

### `/academia`

La página principal de captación de alumnas:

- **Hero** con llamado a la acción directo a WhatsApp para agendar una clase gratis
- **About** — historia y valores de la academia (empoderamiento, autoconfianza, comunidad)
- **Stats** — números de la academia con animación de conteo al entrar en viewport
- **Clases** — catálogo de estilos: Twerk, Hip Hop, Breaking y más
- **Membresías** — planes y precios
- **FAQ** — preguntas frecuentes
- **CTA final** de conversión
- **Botón de WhatsApp** flotante, siempre accesible

### `/show`

**F Productions**, el equipo comercial de Felinas — shows en vivo, videoclips, activaciones de marca:

- **Hero** con la foto grupal del equipo, enmarcada con un desregistro de placas de color (magenta + morado) que retoma el mismo recurso de las palabras fantasma
- **Manifiesto** y **Por qué elegirnos**
- **Equipo** — cartucho tipo revólver: cada integrante rota en 3D y da paso a la siguiente con el scroll (pin + scrub)
- **Servicios** y **Proceso** de trabajo
- **Galería** — filmstrip horizontal pinneado (el scroll vertical mueve las fotos en X) con clips de video mudos intercalados entre las fotos, que autoreproducen solo mientras están en pantalla
- **Reels** — los shows con audio. En desktop, un índice editorial (títulos en contorno tipográfico, el activo se rellena) controla un escenario con el mismo desregistro de placas del hero; en mobile se pinnea y el scroll avanza de reel en reel. Al tocar uno se abre en un lightbox navegable con flechas
- **CTA de reserva** por WhatsApp

---

## Dirección de diseño

El sitio evita a propósito los defaults genéricos (fuentes de sistema, gradientes morados, layouts predecibles). La identidad se apoya en:

- Tipografía **Montserrat** (display) + **Inter** (texto), no las típicas Inter/Space Grotesk sueltas
- Paleta oscura de marca con acentos definidos, no tonos tibios repartidos por igual
- Composición asimétrica en la landing (bandas diagonales) en vez de un hero centrado convencional
- Movimiento orquestado con GSAP en cada entrada de página y cada scroll, no animaciones sueltas por elemento

---

## Tecnologías

- **[Astro](https://astro.build)** — sitio 100% estático, sin servidor, build a `dist/`. Sin frameworks de UI: toda la interactividad es `<script>` vanilla con TypeScript
- **GSAP + ScrollTrigger** — reveals, contadores, parallax, pines con scroll y loops ambientes; respeta `prefers-reduced-motion` en todos los casos
- **TypeScript** — tipado en componentes y utilidades
- **Tailwind CSS** — estilos con variables de marca
- **pnpm** — gestor de paquetes (nunca npm/yarn)

---

## Desarrollo local

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # genera dist/
pnpm preview   # sirve el build de producción
```

Requiere Node ≥ 22.12.

---

## Assets

- **Imágenes** — `src/assets/{academia,fproductions}/`, importadas con `astro:assets` (`<Image>`): Astro genera automáticamente los tamaños responsive y las sirve en webp.
- **Video** — los reels y loops comprimidos viven en `public/videos/` (~500 KB–13 MB cada uno, listos para producción). Los originales de cámara (4K/120fps, cientos de MB) **no se versionan**: se procesan con `scripts/encode-reels.sh`, que recorta ruido, reencodea a 720×1280 y genera también los posters en `src/assets/fproductions/posters/`.
- El logo y los favicons están en `public/assets/` y `public/`, servidos tal cual (no pasan por el pipeline de imágenes).
