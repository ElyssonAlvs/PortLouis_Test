import { HttpError } from '../errors/http-error';
import { ContactInput } from './contact.types';

const MAX_NAME_LENGTH = 150;
const MIN_WORDS_IN_NAME = 2;
const WORD_WITH_MIN_THREE_LETTERS_REGEX = /^\p{L}{3,}$/u;

const MAX_PHONE_LENGTH = 20;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;
const ALLOWED_PHONE_CHARS_REGEX = /^[0-9+\-() ]+$/;

const POSITIVE_INTEGER_REGEX = /^[1-9]\d*$/;
const MAX_UNSIGNED_INT = 4294967295;

export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function hasMinimumWordsAndLetters(normalizedName: string): boolean {
  const words = normalizedName.split(' ');
  if (words.length < MIN_WORDS_IN_NAME) {
    return false;
  }
  return words.every((word) => WORD_WITH_MIN_THREE_LETTERS_REGEX.test(word));
}

export function validateName(rawName: unknown): string {
  if (typeof rawName !== 'string') {
    throw HttpError.badRequest(
      'O nome deve conter no mínimo duas palavras, cada uma com pelo menos 3 letras.'
    );
  }

  const normalized = normalizeWhitespace(rawName.normalize('NFC'));

  if (
    normalized.length === 0 ||
    normalized.length > MAX_NAME_LENGTH ||
    !hasMinimumWordsAndLetters(normalized)
  ) {
    throw HttpError.badRequest(
      'O nome deve conter no mínimo duas palavras, cada uma com pelo menos 3 letras.'
    );
  }

  return normalized;
}

export function validatePhone(rawPhone: unknown): string {
  if (typeof rawPhone !== 'string') {
    throw HttpError.badRequest('Telefone inválido.');
  }

  const normalized = normalizeWhitespace(rawPhone);

  if (
    normalized.length === 0 ||
    normalized.length > MAX_PHONE_LENGTH ||
    !ALLOWED_PHONE_CHARS_REGEX.test(normalized)
  ) {
    throw HttpError.badRequest('Telefone inválido.');
  }

  const digitsOnly = normalized.replace(/\D/g, '');

  if (digitsOnly.length < MIN_PHONE_DIGITS || digitsOnly.length > MAX_PHONE_DIGITS) {
    throw HttpError.badRequest('Telefone inválido.');
  }

  return normalized;
}

export function parseContactId(rawId: unknown): number {
  if (typeof rawId !== 'string' || !POSITIVE_INTEGER_REGEX.test(rawId)) {
    throw HttpError.badRequest('Id inválido.');
  }

  const parsed = Number(rawId);

  if (!Number.isSafeInteger(parsed) || parsed > MAX_UNSIGNED_INT) {
    throw HttpError.badRequest('Id inválido.');
  }

  return parsed;
}

export function validateContactPayload(body: unknown): ContactInput {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw HttpError.badRequest('Corpo da requisição inválido.');
  }

  const { nome, telefone } = body as Record<string, unknown>;

  return {
    nome: validateName(nome),
    telefone: validatePhone(telefone)
  };
}
