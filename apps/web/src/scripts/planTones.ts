/**
 * Cada plan tiene su identidad de color, simple y reconocible: una escala rosa, fucsia, violeta, y el
 * dorado champagne reservado al plan destacado de cada pestaña. El tono es el mismo en todas las
 * pestañas (un "Plan Shake" siempre es rosa), así quien compara no tiene que reaprender nada.
 */
type Tone = { t1: string; t2: string; tint: string };

const rosa: Tone = { t1: "#ff006a", t2: "#b5179e", tint: "rgb(255 0 106 / 0.07)" };
const fucsia: Tone = { t1: "#c2188f", t2: "#7b2cbf", tint: "rgb(194 24 143 / 0.07)" };
const violeta: Tone = { t1: "#7b2cbf", t2: "#4a1d96", tint: "rgb(123 44 191 / 0.08)" };

const byPlan: Record<string, Tone> = {
  Despierta: rosa,
  Instinto: fucsia,
  Alfa: rosa, // destacado: el dorado lo pone .plan-card-featured
  "Ruge y Fluye": violeta,
  "Plan Shake": rosa,
  "Plan Tic Toc": fucsia, // destacado en Twerk grupal
  "Plan Jiggle": violeta,
};

/** Variables CSS del tono de un plan, para el atributo style de su tarjeta. */
export const planToneStyle = (name: string): string => {
  const t = byPlan[name] ?? rosa;
  return `--t1:${t.t1};--t2:${t.t2};--tint:${t.tint}`;
};
