import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';
import { isServiceError } from '@/lib/utils/errors';

const orderService = new OrderService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await orderService.getOrderById(id);
    return NextResponse.json(order);
  } catch (error: any) {
    if (isServiceError(error)) {
      const status = error.appError.type === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.appError.message }, { status });
    }
    return NextResponse.json({ error: 'Error al obtener el pedido' }, { status: 500 });
  }
}
