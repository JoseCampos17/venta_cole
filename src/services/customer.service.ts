import { getOrderRepository } from '@/lib/db/provider';
import { CustomerSummary } from '@/types/customer';
import { cleanPhoneNumber } from '@/lib/whatsapp/whatsapp.utils';

export class CustomerService {
  async getCustomers(): Promise<CustomerSummary[]> {
    const orderRepo = getOrderRepository();
    const orders = await orderRepo.findAll();
    const customerMap = new Map<string, CustomerSummary>();

    for (const order of orders) {
      // Group by cleaned phone number or name
      const key = cleanPhoneNumber(order.customerWhatsapp) || order.customerName.toLowerCase().trim();
      const isDelivered = order.status === 'ENTREGADO';

      const existing = customerMap.get(key) || {
        whatsapp: order.customerWhatsapp,
        name: order.customerName,
        classroom: order.customerClassroom,
        totalOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt,
        orders: [],
      };

      existing.totalOrders += 1;
      if (isDelivered) {
        existing.completedOrders += 1;
        existing.totalSpent += order.totalAmount;
      }

      // Update latest info if newer
      const orderTime = new Date(order.createdAt).getTime();
      const lastOrderTime = new Date(existing.lastOrderDate).getTime();
      if (orderTime > lastOrderTime) {
        existing.lastOrderDate = order.createdAt;
        existing.name = order.customerName; // latest name
        existing.classroom = order.customerClassroom; // latest classroom
      }

      existing.orders.push({
        id: order.id,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        status: order.status,
        itemsCount: (order.items || []).reduce((sum, item) => sum + item.quantity, 0),
      });

      customerMap.set(key, existing);
    }

    // Sort by total money spent (best customers first), then by total orders
    return Array.from(customerMap.values()).sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) {
        return b.totalSpent - a.totalSpent;
      }
      return b.totalOrders - a.totalOrders;
    });
  }
}
