import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';
import { isServiceError } from '@/lib/utils/errors';
import { OrderStatus } from '@/types/order';

const orderService = new OrderService();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = (await req.json()) as { status: OrderStatus };

    if (!status) {
      return NextResponse.json({ error: 'El estado es requerido' }, { status: 400 });
    }

    const updated = await orderService.updateOrderStatus(id, status);
    return NextResponse.json(updated);
  } catch (error: any) {
    if (isServiceError(error)) {
      const httpStatus = error.appError.type === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.appError.message }, { status: httpStatus });
    }
    return NextResponse.json({ error: 'Error al actualizar el estado del pedido' }, { status: 500 });
  }
}
