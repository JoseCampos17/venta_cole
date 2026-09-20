import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';
import { isServiceError } from '@/lib/utils/errors';
import { OrderStatus } from '@/types/order';

export const dynamic = 'force-dynamic';

const orderService = new OrderService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as OrderStatus) || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined;

    const orders = await orderService.getOrders(status, page, pageSize);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await orderService.createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    if (isServiceError(error)) {
      return NextResponse.json({ error: error.appError.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al procesar el encargo' }, { status: 500 });
  }
}
