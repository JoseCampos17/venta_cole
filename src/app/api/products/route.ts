import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';
import { isServiceError } from '@/lib/utils/errors';
import { productSchema } from '@/lib/validation/product.schema';

export const dynamic = 'force-dynamic';

const productService = new ProductService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined;

    const products = await productService.getProducts({
      categoryId,
      isActive,
      search,
      page,
      pageSize,
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = productSchema.parse(body);

    const product = await productService.createProduct({
      name: validated.name,
      description: validated.description,
      categoryId: validated.categoryId,
      salePrice: validated.salePrice,
      costPrice: validated.costPrice,
      stock: validated.stock,
      imageUrl: validated.imageUrl ?? null,
      isActive: validated.isActive,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Datos inválidos' }, { status: 400 });
    }
    if (isServiceError(error)) {
      return NextResponse.json({ error: error.appError.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
