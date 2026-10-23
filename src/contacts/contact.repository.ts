import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database';
import { Contact, ContactInput } from './contact.types';

interface ContactRow extends RowDataPacket {
  id: number;
  nome: string;
  telefone: string;
}

export class ContactRepository {
  public async insert(input: ContactInput): Promise<Contact> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO contatos (nome, telefone) VALUES (?, ?)',
      [input.nome, input.telefone]
    );

    return {
      id: result.insertId,
      nome: input.nome,
      telefone: input.telefone
    };
  }

  public async findAll(): Promise<Contact[]> {
    const [rows] = await pool.execute<ContactRow[]>(
      'SELECT id, nome, telefone FROM contatos ORDER BY id ASC'
    );

    return rows.map((row) => ({
      id: Number(row.id),
      nome: row.nome,
      telefone: row.telefone
    }));
  }

  public async findById(id: number): Promise<Contact | null> {
    const [rows] = await pool.execute<ContactRow[]>(
      'SELECT id, nome, telefone FROM contatos WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: Number(row.id),
      nome: row.nome,
      telefone: row.telefone
    };
  }

  public async updateById(id: number, input: ContactInput): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE contatos SET nome = ?, telefone = ? WHERE id = ?',
      [input.nome, input.telefone, id]
    );

    return result.affectedRows > 0;
  }

  public async deleteById(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM contatos WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }
}

export const contactRepository = new ContactRepository();
