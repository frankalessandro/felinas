const copFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const digitsFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** Único formateador de pesos colombianos de la app: "$120.000". */
export function formatCOP(amount: number): string {
  return copFormatter.format(amount)
}

/** Igual que `formatCOP`, con texto alterno cuando no hay valor. */
export function formatCOPOr(amount: number | null | undefined, fallback: string): string {
  return amount === null || amount === undefined ? fallback : copFormatter.format(amount)
}

/** Texto de un input de dinero ("120.000", "$ 120000") → número entero, o null si está vacío. */
export function parseMoneyInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, '')
  return digits === '' ? null : Number(digits)
}

/** Texto de un input de dinero con separador de miles mientras se escribe: "120000" → "120.000". */
export function formatMoneyInput(raw: string): string {
  const value = parseMoneyInput(raw)
  return value === null ? '' : digitsFormatter.format(value)
}
