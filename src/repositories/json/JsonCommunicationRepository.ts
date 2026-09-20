import { ICommunicationRepository } from '../interfaces/ICommunicationRepository';
import { Communication, CreateCommunicationInput, CommunicationStatus } from '@/types/communication';
import { readJsonFile, writeJsonFile } from '@/lib/db/json/json-client';
import { generateId } from '@/lib/utils/id-generator';

const FILE = 'communications.json';

export class JsonCommunicationRepository implements ICommunicationRepository {
  async findAll(orderId?: string): Promise<Communication[]> {
    let comms = await readJsonFile<Communication[]>(FILE, []);
    if (orderId) {
      comms = comms.filter(c => c.orderId === orderId);
    }
    comms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return comms;
  }

  async create(input: CreateCommunicationInput): Promise<Communication> {
    const comms = await readJsonFile<Communication[]>(FILE, []);
    const newComm: Communication = {
      ...input,
      id: `comm-${generateId()}`,
      createdAt: new Date().toISOString(),
      markedSentAt: null,
    };
    comms.push(newComm);
    await writeJsonFile(FILE, comms);
    return newComm;
  }

  async updateStatus(id: string, status: CommunicationStatus): Promise<Communication | null> {
    const comms = await readJsonFile<Communication[]>(FILE, []);
    const index = comms.findIndex(c => c.id === id);
    if (index === -1) return null;

    comms[index] = {
      ...comms[index],
      status,
      markedSentAt: status === 'MARKED_SENT' ? new Date().toISOString() : comms[index].markedSentAt,
    };

    await writeJsonFile(FILE, comms);
    return comms[index];
  }
}
