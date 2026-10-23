import request from 'supertest';
import { app } from '../src/app';
import { contactRepository } from '../src/contacts/contact.repository';

describe('Rotas /contatos', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /contatos', () => {
    it('cria um contato válido e retorna status 201', async () => {
      const insertSpy = jest.spyOn(contactRepository, 'insert').mockResolvedValue({
        id: 1,
        nome: 'Carlos Eduardo',
        telefone: '(11) 98765-4321'
      });

      const response = await request(app)
        .post('/contatos')
        .send({
          nome: '  Carlos   Eduardo ',
          telefone: '(11) 98765-4321',
          id: 999,
          admin: true
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 1,
        nome: 'Carlos Eduardo',
        telefone: '(11) 98765-4321'
      });
      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith({
        nome: 'Carlos Eduardo',
        telefone: '(11) 98765-4321'
      });
    });

    it('retorna 400 quando o nome possui menos de duas palavras ou palavras com menos de 3 letras', async () => {
      const insertSpy = jest.spyOn(contactRepository, 'insert');

      const response = await request(app)
        .post('/contatos')
        .send({
          nome: 'Ana Lu',
          telefone: '11987654321'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        erro: 'O nome deve conter no mínimo duas palavras, cada uma com pelo menos 3 letras.'
      });
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('retorna 400 quando o telefone é inválido', async () => {
      const insertSpy = jest.spyOn(contactRepository, 'insert');

      const response = await request(app)
        .post('/contatos')
        .send({
          nome: 'Mariana Oliveira',
          telefone: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        erro: 'Telefone inválido.'
      });
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('retorna 400 quando o JSON enviado é malformado', async () => {
      const response = await request(app)
        .post('/contatos')
        .set('Content-Type', 'application/json')
        .send('{"nome": "Carlos Eduardo", "telefone": ');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        erro: 'JSON inválido no corpo da requisição.'
      });
    });

    it('retorna 413 quando o payload ultrapassa o limite de 10kb', async () => {
      const response = await request(app)
        .post('/contatos')
        .send({
          nome: 'Carlos Eduardo',
          telefone: '11987654321',
          lixo: 'x'.repeat(15000)
        });

      expect(response.status).toBe(413);
      expect(response.body).toEqual({
        erro: 'Payload excede o tamanho máximo permitido.'
      });
    });

    it('retorna 500 sem vazar detalhes internos caso ocorra falha no banco', async () => {
      jest
        .spyOn(contactRepository, 'insert')
        .mockRejectedValue(new Error('ER_ACCESS_DENIED_ERROR: Access denied for user root'));

      const response = await request(app)
        .post('/contatos')
        .send({
          nome: 'Carlos Eduardo',
          telefone: '11987654321'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        erro: 'Erro interno do servidor.'
      });
      expect(JSON.stringify(response.body)).not.toContain('ER_ACCESS_DENIED_ERROR');
    });
  });

  describe('GET /contatos', () => {
    it('lista todos os contatos com status 200', async () => {
      jest.spyOn(contactRepository, 'findAll').mockResolvedValue([
        { id: 1, nome: 'Carlos Eduardo', telefone: '11987654321' },
        { id: 2, nome: 'Fernanda Lima', telefone: '21999998888' }
      ]);

      const response = await request(app).get('/contatos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, nome: 'Carlos Eduardo', telefone: '11987654321' },
        { id: 2, nome: 'Fernanda Lima', telefone: '21999998888' }
      ]);
    });
  });

  describe('PATCH /contatos/:id', () => {
    it('atualiza um contato existente e retorna status 200 com o contato atualizado', async () => {
      jest.spyOn(contactRepository, 'findById').mockResolvedValue({
        id: 1,
        nome: 'Carlos Eduardo',
        telefone: '11987654321'
      });
      const updateSpy = jest.spyOn(contactRepository, 'updateById').mockResolvedValue(true);

      const response = await request(app)
        .patch('/contatos/1')
        .send({
          nome: 'Roberto Almeida',
          telefone: '11912345678'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        nome: 'Roberto Almeida',
        telefone: '11912345678'
      });
      expect(updateSpy).toHaveBeenCalledWith(1, {
        nome: 'Roberto Almeida',
        telefone: '11912345678'
      });
    });

    it('retorna 400 quando apenas nome ou apenas telefone é enviado no PATCH', async () => {
      const findSpy = jest.spyOn(contactRepository, 'findById');

      const missingPhoneResponse = await request(app)
        .patch('/contatos/1')
        .send({ nome: 'Roberto Almeida' });

      expect(missingPhoneResponse.status).toBe(400);
      expect(missingPhoneResponse.body).toEqual({ erro: 'Telefone inválido.' });

      const missingNameResponse = await request(app)
        .patch('/contatos/1')
        .send({ telefone: '11912345678' });

      expect(missingNameResponse.status).toBe(400);
      expect(missingNameResponse.body).toEqual({
        erro: 'O nome deve conter no mínimo duas palavras, cada uma com pelo menos 3 letras.'
      });
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('retorna 400 quando o id na URL é inválido', async () => {
      const response = await request(app)
        .patch('/contatos/abc')
        .send({
          nome: 'Roberto Almeida',
          telefone: '11912345678'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ erro: 'Id inválido.' });
    });

    it('retorna 404 quando o contato não existe', async () => {
      jest.spyOn(contactRepository, 'findById').mockResolvedValue(null);

      const response = await request(app)
        .patch('/contatos/99')
        .send({
          nome: 'Roberto Almeida',
          telefone: '11912345678'
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ erro: 'Contato não encontrado.' });
    });
  });

  describe('DELETE /contatos/:id', () => {
    it('exclui um contato existente e retorna status 204 sem corpo', async () => {
      const deleteSpy = jest.spyOn(contactRepository, 'deleteById').mockResolvedValue(true);

      const response = await request(app).delete('/contatos/1');

      expect(response.status).toBe(204);
      expect(response.text).toBe('');
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });

    it('retorna 400 quando o id na URL é inválido', async () => {
      const response = await request(app).delete('/contatos/0');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ erro: 'Id inválido.' });
    });

    it('retorna 404 quando o contato a excluir não existe', async () => {
      jest.spyOn(contactRepository, 'deleteById').mockResolvedValue(false);

      const response = await request(app).delete('/contatos/99');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ erro: 'Contato não encontrado.' });
    });
  });

  describe('Rotas inexistentes', () => {
    it('retorna 404 para caminhos não mapeados', async () => {
      const response = await request(app).get('/rota-inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ erro: 'Rota não encontrada.' });
    });
  });
});
