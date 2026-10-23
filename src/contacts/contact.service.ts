import { HttpError } from '../errors/http-error';
import { ContactRepository, contactRepository } from './contact.repository';
import { Contact } from './contact.types';
import { parseContactId, validateContactPayload } from './contact.validator';

export class ContactService {
  constructor(private readonly repository: ContactRepository = contactRepository) {}

  public async createContact(payload: unknown): Promise<Contact> {
    const validatedInput = validateContactPayload(payload);
    return this.repository.insert(validatedInput);
  }

  public async listContacts(): Promise<Contact[]> {
    return this.repository.findAll();
  }

  public async updateContact(rawId: unknown, payload: unknown): Promise<Contact> {
    const id = parseContactId(rawId);
    const validatedInput = validateContactPayload(payload);

    const existingContact = await this.repository.findById(id);
    if (!existingContact) {
      throw HttpError.notFound('Contato não encontrado.');
    }

    await this.repository.updateById(id, validatedInput);

    return {
      id,
      nome: validatedInput.nome,
      telefone: validatedInput.telefone
    };
  }

  public async deleteContact(rawId: unknown): Promise<void> {
    const id = parseContactId(rawId);

    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw HttpError.notFound('Contato não encontrado.');
    }
  }
}

export const contactService = new ContactService();
