import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateId } from '@/lib/utils/id-generator';
import path from 'path';

// Use service role key server-side for storage uploads (bypasses RLS)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen (PNG, JPG, WEBP, etc.)' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `product-${generateId()}${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabase = getAdminClient();
    const { error } = await supabase.storage
      .from('products')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return NextResponse.json({ error: `Error al subir: ${error.message}` }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from('products')
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicData.publicUrl, filename });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
  }
}
