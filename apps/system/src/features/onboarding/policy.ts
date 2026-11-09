export const ACADEMY_WHATSAPP_DISPLAY = '+57 320 342 6558'
export const ACADEMY_WHATSAPP_URL = 'https://wa.me/573203426558'

export interface PolicySection {
  title: string
  body: string
}

/** Resumen de la política de tratamiento de datos (Ley 1581 de 2012). Texto para revisión jurídica de la academia. */
export const DATA_POLICY_SECTIONS: PolicySection[] = [
  {
    title: 'Responsable',
    body: 'Academia Felinas (Pantera Felinas), Palmira, Valle del Cauca, Colombia.',
  },
  {
    title: 'Para qué usamos tus datos',
    body: 'Gestionar tus clases, reservas, asistencia y planes; registrar tus pagos; y comunicarnos contigo (avisos de clases, vencimiento de plan).',
  },
  {
    title: 'Tus derechos',
    body: 'Puedes conocer, actualizar y rectificar tus datos, pedir que los suprimamos y revocar esta autorización cuando quieras, según la Ley 1581 de 2012.',
  },
  {
    title: 'Menores de edad',
    body: 'Los datos de menores se tratan solo con autorización de su acudiente y con el mínimo necesario.',
  },
  {
    title: 'Contacto',
    body: `Para ejercer tus derechos escríbenos por WhatsApp al ${ACADEMY_WHATSAPP_DISPLAY}.`,
  },
]
