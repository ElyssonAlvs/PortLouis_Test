import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error';

interface BodyParserError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ erro: error.message });
    return;
  }

  if (error instanceof SyntaxError) {
    const parserError = error as BodyParserError;
    if (parserError.status === 400 || parserError.statusCode === 400) {
      res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
      return;
    }
  }

  if (error && typeof error === 'object') {
    const parserError = error as BodyParserError;
    if (
      parserError.type === 'entity.too.large' ||
      parserError.status === 413 ||
      parserError.statusCode === 413
    ) {
      res.status(413).json({ erro: 'Payload excede o tamanho máximo permitido.' });
      return;
    }
  }

  res.status(500).json({ erro: 'Erro interno do servidor.' });
}
