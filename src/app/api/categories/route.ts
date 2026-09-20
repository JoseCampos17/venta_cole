import { NextResponse } from 'next/server';
import { getCategoryRepository } from '@/lib/db/provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categoryRepo = getCategoryRepository();
    const categories = await categoryRepo.findAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}
