import { NextRequest, NextResponse } from 'next/server';
import { CommunicationService } from '@/services/communication.service';
import { isServiceError } from '@/lib/utils/errors';
import { CommunicationType } from '@/types/communication';

export const dynamic = 'force-dynamic';

const communicationService = new CommunicationService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || undefined;
    const comms = await communicationService.getCommunications(orderId);
    return NextResponse.json(comms);
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json({ error: 'Error al obtener comunicaciones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, type } = (await req.json()) as {
      orderId: string;
      type: CommunicationType;
    };

    if (!orderId || !type) {
      return NextResponse.json(
        { error: 'orderId y type son requeridos' },
        { status: 400 }
      );
    }

    const result = await communicationService.prepareWhatsAppMessage(orderId, type);
    return NextResponse.json(result);
  } catch (error: any) {
    if (isServiceError(error)) {
      return NextResponse.json({ error: error.appError.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Error al preparar enlace de WhatsApp' },
      { status: 500 }
    );
  }
}
