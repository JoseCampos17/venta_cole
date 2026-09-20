export type CommunicationType = 'SURVEY' | 'THANKS' | 'NEW_PRODUCTS' | 'FOLLOWUP';
export type CommunicationStatus = 'LINK_OPENED' | 'MARKED_SENT';

export interface Communication {
  id: string;
  orderId: string;
  customerName: string;
  customerWhatsapp: string;
  type: CommunicationType;
  status: CommunicationStatus;
  createdAt: string;
  markedSentAt: string | null;
}

export type CreateCommunicationInput = Omit<Communication, 'id' | 'createdAt' | 'markedSentAt'>;

export const COMMUNICATION_TYPE_LABELS: Record<CommunicationType, string> = {
  SURVEY: '📋 Encuesta de satisfacción',
  THANKS: '💗 Agradecimiento',
  NEW_PRODUCTS: '🛍️ Nuevos productos',
  FOLLOWUP: '💬 Seguimiento',
};
