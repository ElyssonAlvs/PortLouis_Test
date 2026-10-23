import express from 'express';
import { contactRoutes } from './contacts/contact.routes';
import { errorHandler } from './middlewares/error-handler';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.use('/contatos', contactRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use(errorHandler);
