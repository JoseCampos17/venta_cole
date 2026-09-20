import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/services/inventory.service';
import { isServiceError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const inventoryService = new InventoryService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined;

    const movements = await inventoryService.getMovements(productId, page, pageSize);
    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const movement = await inventoryService.addMovement(body);
    return NextResponse.json(movement, { status: 201 });
  } catch (error: any) {
    if (isServiceError(error)) {
      return NextResponse.json({ error: error.appError.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al registrar movimiento' }, { status: 500 });
  }
}
