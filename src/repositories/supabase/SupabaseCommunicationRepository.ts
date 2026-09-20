import { ICommunicationRepository } from '../interfaces/ICommunicationRepository';
import { Communication, CreateCommunicationInput, CommunicationStatus } from '@/types/communication';
import { query } from '@/lib/db/supabase/db';
import { generateId } from '@/lib/utils/id-generator';

const toIso = (d: any): string => (d instanceof Date ? d.toISOString() : String(d || ''));

export class SupabaseCommunicationRepository implements ICommunicationRepository {
  async findAll(orderId?: string): Promise<Communication[]> {
    let sql = `
      SELECT 
        id,
        order_id as "orderId",
        customer_name as "customerName",
        customer_whatsapp as "customerWhatsapp",
        type,
        status,
        created_at as "createdAt",
        marked_sent_at as "markedSentAt"
      FROM communications
    `;
    const params: any[] = [];

    if (orderId) {
      sql += ` WHERE order_id = $1`;
      params.push(orderId);
    }

    sql += ` ORDER BY created_at DESC`;

    const rows = await query(sql, params);
    return rows.map(r => ({
      ...r,
      createdAt: toIso(r.createdAt),
      markedSentAt: r.markedSentAt ? toIso(r.markedSentAt) : null,
    }));
  }

  async create(input: CreateCommunicationInput): Promise<Communication> {
    const id = `comm-${generateId()}`;
    const now = new Date().toISOString();

    const rows = await query(
      `INSERT INTO communications (
        id, order_id, customer_name, customer_whatsapp, type, status, created_at, marked_sent_at
      ) VALUES ($1, $2, $3, $4, $5, 'LINK_OPENED', $6, NULL)
      RETURNING 
        id,
        order_id as "orderId",
        customer_name as "customerName",
        customer_whatsapp as "customerWhatsapp",
        type,
        status,
        created_at as "createdAt",
        marked_sent_at as "markedSentAt"`,
      [
        id,
        input.orderId,
        input.customerName,
        input.customerWhatsapp,
        input.type,
        now,
      ]
    );

    return {
      ...rows[0],
      createdAt: toIso(rows[0].createdAt),
      markedSentAt: rows[0].markedSentAt ? toIso(rows[0].markedSentAt) : null,
    };
  }

  async updateStatus(id: string, status: CommunicationStatus): Promise<Communication | null> {
    const markedSentAt = status === 'MARKED_SENT' ? new Date().toISOString() : null;

    const rows = await query(
      `UPDATE communications 
       SET status = $1, marked_sent_at = COALESCE($2, marked_sent_at)
       WHERE id = $3
       RETURNING 
        id,
        order_id as "orderId",
        customer_name as "customerName",
        customer_whatsapp as "customerWhatsapp",
        type,
        status,
        created_at as "createdAt",
        marked_sent_at as "markedSentAt"`,
      [status, markedSentAt, id]
    );

    if (!rows[0]) return null;
    return {
      ...rows[0],
      createdAt: toIso(rows[0].createdAt),
      markedSentAt: rows[0].markedSentAt ? toIso(rows[0].markedSentAt) : null,
    };
  }
}
