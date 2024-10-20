export class HttpError {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    this.message = message;
    this.statusCode = statusCode;
  }

  public toString(): string {
    return `HttpError: ${this.message} (${this.statusCode})`;
  }
}
