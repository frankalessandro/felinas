/** Único punto con el número de WhatsApp de la academia y el formato de mensajes pre-armados. */
const WHATSAPP_NUMBER = "573203426558";

export const whatsappURL = (message: string) =>
  "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

export const planWhatsappURL = (planName: string, price: string) =>
  whatsappURL('¡Hola! Quiero información sobre el plan "' + planName + '" (' + price + "/mes) de Felinas Academia");

export const singleClassWhatsappURL = (discipline: string, price: string) =>
  whatsappURL("¡Hola! Quiero reservar una clase individual de " + discipline + " (" + price + ") en Felinas Academia");
