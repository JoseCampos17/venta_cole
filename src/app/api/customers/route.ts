import { NextResponse } from 'next/server';
import { CustomerService } from '@/services/customer.service';

export const dynamic = 'force-dynamic';

const customerService = new CustomerService();

export async function GET() {
  try {
    const customers = await customerService.getCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Error al obtener directorio de clientes' }, { status: 500 });
  }
}
