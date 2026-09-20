import { Communication, CreateCommunicationInput, CommunicationStatus } from '@/types/communication';

export interface ICommunicationRepository {
  findAll(orderId?: string): Promise<Communication[]>;
  create(input: CreateCommunicationInput): Promise<Communication>;
  updateStatus(id: string, status: CommunicationStatus): Promise<Communication | null>;
}
