import { CommunicationType } from '@/types/communication';
import { getWhatsAppMessage, WhatsAppTemplateData } from './templates';

/**
 * Cleans a phone number: removes spaces, dashes, parentheses and adds Colombian country code 57 if needed.
 */
export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && !cleaned.startsWith('57')) {
    cleaned = `57${cleaned}`;
  }
  return cleaned;
}

/**
 * Creates a valid wa.me link with encoded message.
 */
export function createWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanedPhone = cleanPhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
}

/**
 * Creates a WhatsApp link for a specific communication template.
 */
export function createTemplateWhatsAppLink(
  phoneNumber: string,
  type: CommunicationType,
  data: WhatsAppTemplateData
): { url: string; message: string } {
  const message = getWhatsAppMessage(type, data);
  const url = createWhatsAppLink(phoneNumber, message);
  return { url, message };
}
