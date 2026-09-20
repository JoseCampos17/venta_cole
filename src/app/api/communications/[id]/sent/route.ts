import { NextRequest, NextResponse } from 'next/server';
import { CommunicationService } from '@/services/communication.service';
import { isServiceError } from '@/lib/utils/errors';

const communicationService = new CommunicationService();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await communicationService.markAsSent(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    if (isServiceError(error)) {
      return NextResponse.json({ error: error.appError.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al actualizar comunicación' }, { status: 500 });
  }
}
