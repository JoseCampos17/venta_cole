import {
  getOrderRepository,
  getProductRepository,
  getInventoryRepository,
  getSaleRepository,
} from '@/lib/db/provider';
import { CreateOrderInput, OrderStatus, OrderWithItems } from '@/types/order';
import { ServiceError } from '@/lib/utils/errors';
import { generateOrderId } from '@/lib/utils/id-generator';

export class OrderService {
  async getOrders(status?: OrderStatus, page?: number, pageSize?: number): Promise<OrderWithItems[]> {
    const orderRepo = getOrderRepository();
    return await orderRepo.findAll(status, page, pageSize);
  }

  async getOrderById(id: string): Promise<OrderWithItems> {
    const orderRepo = getOrderRepository();
    const order = await orderRepo.findById(id);
    if (!order) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Pedido no encontrado' });
    }
    return order;
  }

  async createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
    const orderRepo = getOrderRepository();
    const productRepo = getProductRepository();

    if (!input.items || input.items.length === 0) {
      throw new ServiceError({
        type: 'VALIDATION',
        message: 'El pedido debe incluir al menos un producto',
      });
    }

    // Fetch and validate all products and calculate snapshot pricing
    let totalAmount = 0;
    const itemsData = [];

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new ServiceError({
          type: 'VALIDATION',
          message: 'La cantidad debe ser mayor a 0',
        });
      }

      const product = await productRepo.findById(item.productId);
      if (!product || product.isDeleted || !product.isActive) {
        throw new ServiceError({
          type: 'NOT_FOUND',
          message: `El producto ${product?.name ?? item.productId} no está disponible`,
        });
      }

      const subtotal = product.salePrice * item.quantity;
      totalAmount += subtotal;

      itemsData.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.salePrice,
        unitCost: product.costPrice,
        quantity: item.quantity,
        subtotal,
      });
    }

    const orderId = generateOrderId();

    const order = await orderRepo.create(
      {
        id: orderId,
        customerName: input.customerName.trim(),
        customerWhatsapp: input.customerWhatsapp.trim(),
        customerClassroom: input.customerClassroom.trim(),
        deliveryDate: input.deliveryDate,
        deliveryTime: input.deliveryTime,
        paymentMethod: input.paymentMethod,
        status: 'PENDIENTE',
        totalAmount,
        notes: input.notes?.trim() || null,
      },
      itemsData
    );

    return order;
  }

  async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<OrderWithItems> {
    const orderRepo = getOrderRepository();
    const productRepo = getProductRepository();
    const inventoryRepo = getInventoryRepository();
    const saleRepo = getSaleRepository();

    const order = await orderRepo.findById(id);
    if (!order) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Pedido no encontrado' });
    }

    if (order.status === newStatus) {
      return order;
    }

    // Business rule: When transitioning PENDIENTE -> ACEPTADO, reserve/deduct stock
    if (order.status === 'PENDIENTE' && newStatus === 'ACEPTADO') {
      // Validate all stock first
      for (const item of order.items) {
        const product = await productRepo.findById(item.productId);
        if (!product || product.stock < item.quantity) {
          throw new ServiceError({
            type: 'INSUFFICIENT_STOCK',
            message: `No tienes suficiente stock de "${item.productName}". Tienes: ${product?.stock ?? 0}, pero te encargaron: ${item.quantity}`,
          });
        }
      }

      // Deduct stock and log movement
      for (const item of order.items) {
        await productRepo.updateStock(item.productId, -item.quantity);
        await inventoryRepo.create({
          productId: item.productId,
          productName: item.productName,
          type: 'OUT',
          quantity: item.quantity,
          reason: 'SALE',
          referenceId: order.id,
          notes: `Apartado para encargo ${order.id} (${order.customerName})`,
        });
      }
    }

    // Business rule: If an ACEPTADO/PREPARANDO/LISTO order is CANCELADO/RECHAZADO, restore stock
    const wasStockDeducted = ['ACEPTADO', 'PREPARANDO', 'LISTO'].includes(order.status);
    const isNowCancelled = ['CANCELADO', 'RECHAZADO'].includes(newStatus);

    if (wasStockDeducted && isNowCancelled) {
      for (const item of order.items) {
        await productRepo.updateStock(item.productId, item.quantity);
        await inventoryRepo.create({
          productId: item.productId,
          productName: item.productName,
          type: 'IN',
          quantity: item.quantity,
          reason: 'RETURN',
          referenceId: order.id,
          notes: `Stock devuelto por encargo cancelado ${order.id}`,
        });
      }
    }

    // Business rule: When marked as ENTREGADO, generate a Sale record
    if (newStatus === 'ENTREGADO') {
      const existingSale = await saleRepo.findByOrderId(order.id);
      if (!existingSale) {
        let totalRevenue = 0;
        let totalCost = 0;

        const saleItems = order.items.map(item => {
          const subtotalRevenue = item.unitPrice * item.quantity;
          const subtotalCost = item.unitCost * item.quantity;
          const subtotalProfit = subtotalRevenue - subtotalCost;

          totalRevenue += subtotalRevenue;
          totalCost += subtotalCost;

          return {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.unitCost,
            subtotalRevenue,
            subtotalCost,
            subtotalProfit,
          };
        });

        await saleRepo.create(
          {
            orderId: order.id,
            customerName: order.customerName,
            totalRevenue,
            totalCost,
            totalProfit: totalRevenue - totalCost,
          },
          saleItems
        );
      }
    }

    await orderRepo.updateStatus(id, newStatus);
    const updated = await orderRepo.findById(id);
    return updated!;
  }
}
