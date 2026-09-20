import { CommunicationType } from '@/types/communication';

export interface WhatsAppTemplateData {
  customerName: string;
  orderId?: string;
  appName?: string;
}

export function getWhatsAppMessage(type: CommunicationType, data: WhatsAppTemplateData): string {
  const name = data.customerName.trim();
  const app = data.appName ?? 'VentasCole';

  switch (type) {
    case 'SURVEY':
      return `¡Hola ${name}! 😊💗\n\n¡Muchas gracias por tu compra en *${app}*!\n\nNos encantaría saber cómo te fue con tu pedido ⭐\n\nCuéntanos:\n• ¿Qué tal te pareció tu producto?\n• ¿Qué te gustaría que trajéramos la próxima vez?\n\n¡Mil gracias por apoyarme! 🫶✨`;

    case 'THANKS':
      return `¡Hola ${name}! 🌸\n\nQueríamos agradecerte mucho de corazón por apoyar a *${app}* con tu encargo.\n\n¡Esperamos que disfrutes mucho tus cositas! 💗✨`;

    case 'NEW_PRODUCTS':
      return `¡Hola ${name}! 🛍️✨\n\n¡Tenemos cositas nuevas y reposición en *${app}*!\n\nEntra a ver las novedades antes de que se agoten. ¡Hay ganchitos y cosméticos hermosos! 💖`;

    case 'FOLLOWUP':
      return `¡Hola ${name}! 😊\n\nTe escribo de *${app}* para consultar sobre tu encargo. ¡Quedo atenta si necesitas algo más! 💗`;

    default:
      return `¡Hola ${name}! Te escribo de *${app}* 💗`;
  }
}
