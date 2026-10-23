import { Router } from 'express';
import { contactController } from './contact.controller';

export const contactRoutes = Router();

contactRoutes.post('/', contactController.create);
contactRoutes.get('/', contactController.list);
contactRoutes.patch('/:id', contactController.update);
contactRoutes.delete('/:id', contactController.remove);
