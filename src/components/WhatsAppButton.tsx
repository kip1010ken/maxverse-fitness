import { buildWhatsAppLink } from "../services/whatsapp";

type WhatsAppButtonProps = {
  message?: string;
};

/**
 * Floating action button that opens a pre-filled WhatsApp chat.
 * Phone number is read from VITE_WHATSAPP_NUMBER — see services/whatsapp.ts.
 */
export default function WhatsAppButton({ message }: WhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-moss shadow-lg transition-transform hover:scale-105"
      aria-label="Message us on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-bone" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.34a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.91-4.45 9.91-9.9C21.96 6.45 17.5 2 12.04 2Zm0 18.02c-1.5 0-2.96-.4-4.24-1.16l-.3-.18-3.15.78.84-3.07-.2-.31a8.02 8.02 0 0 1-1.24-4.27c0-4.42 3.6-8.02 8.03-8.02 4.42 0 8.02 3.6 8.02 8.02 0 4.43-3.6 8.02-8.02 8.02Z" />
      </svg>
    </a>
  );
}
