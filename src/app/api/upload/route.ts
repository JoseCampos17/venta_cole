import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateId } from '@/lib/utils/id-generator';
import path from 'path';

// JWT service role key - required for Supabase Storage (new sb_secret format doesn't work for storage)
const STORAGE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nZHVsdXd2aGV6cHZ3aW1mZmRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTg2MjQ3NCwiZXhwIjoyMTA1NDM4NDc0fQ.wurSk3a18i8k0TE61ZNu6kkuZU4TVtb7tFIUds8ZV_g';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ogduluwvhezpvwimffdi.supabase.co';

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

    // Use JWT service role key for storage (required for bucket operations)
    const supabase = createClient(SUPABASE_URL, STORAGE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

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
