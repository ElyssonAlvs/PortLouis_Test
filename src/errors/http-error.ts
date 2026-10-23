export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  public static badRequest(message: string): HttpError {
    return new HttpError(400, message);
  }

  public static notFound(message: string): HttpError {
    return new HttpError(404, message);
  }
}
