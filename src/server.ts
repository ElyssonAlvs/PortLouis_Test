import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  process.stdout.write(`Servidor rodando na porta ${port}\n`);
});
