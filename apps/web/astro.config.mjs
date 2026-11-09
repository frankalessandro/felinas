// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Necesario para que Layout.astro pueda generar og:url / og:image absolutos.
  site: 'https://felinas-web.vercel.app',
  // La landing es un menú de dos opciones: al apuntar una banda se precarga esa página,
  // así la navegación posterior al wipe es instantánea.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
