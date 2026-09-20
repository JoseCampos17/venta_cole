import { NextRequest, NextResponse } from 'next/server';
import { SaleService } from '@/services/sale.service';

export const dynamic = 'force-dynamic';

const saleService = new SaleService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined;

    const sales = await saleService.getSales(from, to, page, pageSize);
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Error al obtener historial de ventas' }, { status: 500 });
  }
}
