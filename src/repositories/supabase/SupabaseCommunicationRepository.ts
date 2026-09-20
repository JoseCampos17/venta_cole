import { ICommunicationRepository } from '../interfaces/ICommunicationRepository';
import { Communication, CreateCommunicationInput, CommunicationStatus } from '@/types/communication';
import { supabase } from '@/lib/db/supabase/client';
import { generateId } from '@/lib/utils/id-generator';

export class SupabaseCommunicationRepository implements ICommunicationRepository {
  async findAll(orderId?: string): Promise<Communication[]> {
    let q = supabase
      .from('communications')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderId) {
      q = q.eq('order_id', orderId);
    }

    const { data, error } = await q;
    if (error) {
      console.error('Error fetching communications from Supabase:', error);
      throw error;
    }

    return (data || []).map(r => ({
      id: r.id,
      orderId: r.order_id,
      customerName: r.customer_name,
      customerWhatsapp: r.customer_whatsapp,
      type: r.type,
      status: r.status,
      createdAt: r.created_at,
      markedSentAt: r.marked_sent_at || null,
    }));
  }

  async create(input: CreateCommunicationInput): Promise<Communication> {
    const id = `comm-${generateId()}`;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('communications')
      .insert({
        id,
        order_id: input.orderId,
        customer_name: input.customerName,
        customer_whatsapp: input.customerWhatsapp,
        type: input.type,
        status: 'LINK_OPENED',
        created_at: now,
        marked_sent_at: null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating communication in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      orderId: data.order_id,
      customerName: data.customer_name,
      customerWhatsapp: data.customer_whatsapp,
      type: data.type,
      status: data.status,
      createdAt: data.created_at,
      markedSentAt: data.marked_sent_at || null,
    };
  }

  async updateStatus(id: string, status: CommunicationStatus): Promise<Communication | null> {
    const updateData: Record<string, any> = { status };
    if (status === 'MARKED_SENT') {
      updateData.marked_sent_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('communications')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      orderId: data.order_id,
      customerName: data.customer_name,
      customerWhatsapp: data.customer_whatsapp,
      type: data.type,
      status: data.status,
      createdAt: data.created_at,
      markedSentAt: data.marked_sent_at || null,
    };
  }
}
