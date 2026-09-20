import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateId } from '@/lib/utils/id-generator';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen (PNG, JPG, WEBP, etc.)' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `product-${generateId()}${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Check if Supabase Storage is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filename, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (error) {
          console.error('Supabase Storage upload error:', error);
          // If Supabase upload fails (e.g. policy/key issue), fallback to local storage
        } else {
          const { data: publicData } = supabase.storage
            .from('products')
            .getPublicUrl(filename);

          return NextResponse.json({ url: publicData.publicUrl, filename });
        }
      } catch (sbErr) {
        console.error('Supabase client error during upload:', sbErr);
      }
    }

    // 2. Local fallback storage
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
  }
}
