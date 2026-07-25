/**
 * WhatsApp integration — starting point.
 *
 * For now this builds a wa.me deep link, which requires no API setup
 * and works immediately. When ready to automate outreach (broadcast
 * messages, automated replies, order confirmations), swap this for
 * the WhatsApp Business Platform API and move the logic here so the
 * rest of the app doesn't need to change.
 */

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";

export function buildWhatsAppLink(message?: string): string {
  const defaultMessage = "Hi Maxverse Fitness, I'd like to know more about your training plans.";
  const text = encodeURIComponent(message ?? defaultMessage);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
