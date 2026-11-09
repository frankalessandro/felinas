# Lenguaje visual — Felinas (producto)

Esto es una **app de gestión**, no la web. Debe sentirse como un dashboard profesional de primer
nivel (piensa en Linear, Stripe, Vercel) con la identidad de Felinas: base oscura con leve tinte
violeta, rosa de marca para acción y foco, Montserrat en títulos y cifras, Manrope en todo lo demás.
La personalidad aparece en **detalles puntuales**, nunca en toda la pantalla.

## Prohibido (era el lenguaje de la web)
- Marquesinas/franjas en movimiento, numeraciones 01/02/03 como decoración.
- Palabras gigantes de fondo (`GhostWord`), texto en contorno (`text-stroke*`), títulos de tres voces (`DisplayTitle`).
- Sellos inclinados, todo en MAYÚSCULAS, tracking exagerado, animal print (`bg-leopard`) y grano.
  Estas piezas se están retirando: no las uses y elimínalas donde aparezcan.

## Piezas
| Pieza | Uso |
|---|---|
| `IconTile` (`@/components/brand`) | Icono lucide en contenedor tintado (`tone`: rosa, violeta, ambar, cian, ok, warn, danger, neutral). Acompaña títulos de tarjetas, filas de listas, estadísticas. |
| `Stamp` | Etiqueta de estado con punto ("Pagado", "Abono", "Congelado"). Texto en tipo oración. |
| `Meter` | Anillo o barra para cupos, clases restantes, ocupación. |
| `Ticket` | Tarjeta con talón troquelado. **Solo** como detalle creativo: la próxima clase de la alumna, eventos. |
| `BigNumber` | La cifra principal de una tarjeta (sólida). |
| `Eyebrow` | Antetítulo pequeño en rosa. |
| `@/components/charts` | `Sparkline`, `ColumnChart`, `DonutChart`, `BarList`: gráficas SVG/divs accesibles. |
| `@/components/illustrations` `Illustration` | Ilustraciones duotono (calendar, ticket, people, wallet, bell, chart, search, success, dance) para estados vacíos y momentos clave. `EmptyState` acepta `illustration`. |
| `@/components/ui` | `PageHeader` (acepta `icon`, `accent` con moderación), `StatCard` (icono + cifra + `trend` + `chart`), `Card`, `Button` (rounded-xl, tipo oración). |

## Reglas
1. **Jerarquía clara:** PageHeader → fila de KPIs (StatCard con icono y, si hay datos, sparkline)
   → contenido principal en tarjetas. Grids de 12 columnas con tamaños distintos cuando aporta
   (ej. 8/4), pero alineados y ordenados: nada de composición "póster".
2. **Tipografía:** títulos de página `text-2xl/3xl font-extrabold`, títulos de tarjeta
   `font-display text-base font-bold`, cuerpo `text-sm`. Mayúsculas solo en overlines pequeñas
   (`text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle`). Cifras en
   `font-display font-bold tabular-nums`.
3. **Color:** rosa = acción, selección, "ahora". Violeta/cian = datos secundarios. Ámbar = dinero,
   eventos. ok/warn/danger = estados. El color del tipo de clase solo como acento
   (barra lateral, punto, anillo). Usa tokens, nunca hex sueltos.
4. **Iconos por todas partes con sentido:** cada tarjeta lleva un `IconTile` o icono en su título;
   filas con avatar o icono; botones importantes con icono.
5. **Toques creativos permitidos (pocos y con gusto):** halo degradado sutil en la tarjeta de
   bienvenida, la "próxima clase" como Ticket, ilustraciones en vacíos, anillos de progreso,
   sparklines, el degradado de marca en un número o palabra clave, microinteracciones suaves.
6. **Utilidad y accesibilidad:** densidad cómoda (tablas limpias en escritorio, tarjetas en móvil),
   objetivos ≥44 px, contraste ≥4.5:1, `aria-hidden` en lo decorativo, gráficas con alternativa
   textual, estados loading/empty/error cuidados.
