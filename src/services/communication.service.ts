import { getCommunicationRepository, getOrderRepository } from '@/lib/db/provider';
import { Communication, CommunicationType, CommunicationStatus } from '@/types/communication';
import { createTemplateWhatsAppLink } from '@/lib/whatsapp/whatsapp.utils';
import { ServiceError } from '@/lib/utils/errors';
import { APP_NAME } from '@/config/constants';

export class CommunicationService {
  private commRepo = getCommunicationRepository();
  private orderRepo = getOrderRepository();

  async getCommunications(orderId?: string): Promise<Communication[]> {
    return await this.commRepo.findAll(orderId);
  }

  async prepareWhatsAppMessage(orderId: string, type: CommunicationType): Promise<{ url: string; message: string; communication: Communication }> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Pedido no encontrado' });
    }

    if (order.status !== 'ENTREGADO') {
      throw new ServiceError({
        type: 'VALIDATION',
        message: 'Las comunicaciones de seguimiento solo se pueden enviar para pedidos ENTREGADOS',
      });
    }

    const { url, message } = createTemplateWhatsAppLink(order.customerWhatsapp, type, {
      customerName: order.customerName,
      orderId: order.id,
      appName: APP_NAME,
    });

    // Register that the link was prepared/opened
    const communication = await this.commRepo.create({
      orderId: order.id,
      customerName: order.customerName,
      customerWhatsapp: order.customerWhatsapp,
      type,
      status: 'LINK_OPENED',
    });

    return { url, message, communication };
  }

  async markAsSent(id: string): Promise<Communication> {
    const updated = await this.commRepo.updateStatus(id, 'MARKED_SENT');
    if (!updated) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Registro de comunicación no encontrado' });
    }
    return updated;
  }
}
