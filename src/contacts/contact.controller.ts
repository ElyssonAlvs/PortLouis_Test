import { NextFunction, Request, Response } from 'express';
import { ContactService, contactService } from './contact.service';

export class ContactController {
  constructor(private readonly service: ContactService = contactService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createdContact = await this.service.createContact(req.body);
      res.status(201).json(createdContact);
    } catch (error) {
      next(error);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contacts = await this.service.listContacts();
      res.status(200).json(contacts);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedContact = await this.service.updateContact(req.params.id, req.body);
      res.status(200).json(updatedContact);
    } catch (error) {
      next(error);
    }
  };

  public remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteContact(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const contactController = new ContactController();
