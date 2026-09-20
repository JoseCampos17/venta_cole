import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';
import { isServiceError } from '@/lib/utils/errors';

const productService = new ProductService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productService.getProductById(id);
    return NextResponse.json(product);
  } catch (error: any) {
    if (isServiceError(error)) {
      const status = error.appError.type === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.appError.message }, { status });
    }
    return NextResponse.json({ error: 'Error al obtener el producto' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await productService.updateProduct(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    if (isServiceError(error)) {
      const status = error.appError.type === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.appError.message }, { status });
    }
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await productService.deleteProduct(id);
    return NextResponse.json({ success: true, message: 'Producto eliminado' });
  } catch (error: any) {
    if (isServiceError(error)) {
      const status = error.appError.type === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.appError.message }, { status });
    }
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
  }
}
