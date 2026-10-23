import { HttpError } from '../src/errors/http-error';
import {
  parseContactId,
  validateContactPayload,
  validateName,
  validatePhone
} from '../src/contacts/contact.validator';

describe('contact.validator', () => {
  describe('validateName', () => {
    it('aceita nomes compostos por duas ou mais palavras com pelo menos 3 letras cada', () => {
      expect(validateName('Maria Silva')).toBe('Maria Silva');
      expect(validateName('João Pedro Conceição')).toBe('João Pedro Conceição');
      expect(validateName('Ítalo Érico Ávila')).toBe('Ítalo Érico Ávila');
    });

    it('normaliza espaços múltiplos e aplica trim', () => {
      expect(validateName('   Carlos    Eduardo   Santos  ')).toBe('Carlos Eduardo Santos');
    });

    it('normaliza caracteres Unicode decompostos (NFD para NFC)', () => {
      const decomposedName = 'Jo\u0061\u0303o Silv\u0061';
      expect(validateName(decomposedName)).toBe('João Silva');
    });

    it('rejeita nome com apenas uma palavra', () => {
      expect(() => validateName('Leonardo')).toThrow(HttpError);
      expect(() => validateName('   Leonardo   ')).toThrow(
        'O nome deve conter no mínimo duas palavras, cada uma com pelo menos 3 letras.'
      );
    });

    it('rejeita nome quando qualquer palavra possui menos de 3 letras', () => {
      expect(() => validateName('Ana Lu')).toThrow(HttpError);
      expect(() => validateName('Maria de Souza')).toThrow(HttpError);
      expect(() => validateName('Jo Silva')).toThrow(HttpError);
      expect(() => validateName('Ab Cde')).toThrow(HttpError);
    });

    it('rejeita nomes contendo números, pontuação ou símbolos', () => {
      expect(() => validateName('Maria Silva 2')).toThrow(HttpError);
      expect(() => validateName('Maria123 Silva')).toThrow(HttpError);
      expect(() => validateName('Maria @Silva')).toThrow(HttpError);
      expect(() => validateName('<script>alert(1)</script> Teste')).toThrow(HttpError);
    });

    it('rejeita valores não textuais ou acima de 150 caracteres', () => {
      expect(() => validateName(undefined)).toThrow(HttpError);
      expect(() => validateName(null)).toThrow(HttpError);
      expect(() => validateName(12345)).toThrow(HttpError);

      const longWord = 'a'.repeat(80);
      expect(() => validateName(`${longWord} ${longWord}`)).toThrow(HttpError);
    });
  });

  describe('validatePhone', () => {
    it('aceita formatos de telefone válidos com 8 a 15 dígitos', () => {
      expect(validatePhone('(11) 98765-4321')).toBe('(11) 98765-4321');
      expect(validatePhone('+55 11 98765-4321')).toBe('+55 11 98765-4321');
      expect(validatePhone('3232-4545')).toBe('3232-4545');
      expect(validatePhone('  11   987654321  ')).toBe('11 987654321');
    });

    it('rejeita telefones com menos de 8 ou mais de 15 dígitos', () => {
      expect(() => validatePhone('1234567')).toThrow('Telefone inválido.');
      expect(() => validatePhone('1234567890123456')).toThrow('Telefone inválido.');
    });

    it('rejeita telefones com letras, símbolos inválidos ou tamanho total acima de 20', () => {
      expect(() => validatePhone('1198765432a')).toThrow(HttpError);
      expect(() => validatePhone('1198765#4321')).toThrow(HttpError);
      expect(() => validatePhone('+55 (11) 98765-4321000')).toThrow(HttpError);
      expect(() => validatePhone(null)).toThrow(HttpError);
      expect(() => validatePhone(11987654321)).toThrow(HttpError);
    });
  });

  describe('parseContactId', () => {
    it('converte string de inteiro positivo válido para number', () => {
      expect(parseContactId('1')).toBe(1);
      expect(parseContactId('42')).toBe(42);
    });

    it('rejeita ids não positivos, decimais, alfanuméricos ou fora do limite', () => {
      expect(() => parseContactId('0')).toThrow('Id inválido.');
      expect(() => parseContactId('-5')).toThrow('Id inválido.');
      expect(() => parseContactId('1.5')).toThrow('Id inválido.');
      expect(() => parseContactId('abc')).toThrow('Id inválido.');
      expect(() => parseContactId('1 OR 1=1')).toThrow('Id inválido.');
      expect(() => parseContactId('999999999999')).toThrow('Id inválido.');
      expect(() => parseContactId(undefined)).toThrow('Id inválido.');
    });
  });

  describe('validateContactPayload', () => {
    it('extrai apenas nome e telefone ignorando propriedades extras (prevenção de Mass Assignment)', () => {
      const result = validateContactPayload({
        id: 999,
        nome: 'Fernanda Costa',
        telefone: '11988887777',
        role: 'admin',
        isAdmin: true
      });

      expect(result).toEqual({
        nome: 'Fernanda Costa',
        telefone: '11988887777'
      });
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('role');
      expect(result).not.toHaveProperty('isAdmin');
    });

    it('rejeita payload nulo, array ou primitivo', () => {
      expect(() => validateContactPayload(null)).toThrow('Corpo da requisição inválido.');
      expect(() => validateContactPayload([])).toThrow('Corpo da requisição inválido.');
      expect(() => validateContactPayload('texto')).toThrow('Corpo da requisição inválido.');
    });
  });
});
