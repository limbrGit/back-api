import { IError } from '../interfaces/errors';

export default class AppError extends Error {
  public readonly message: string;
  public readonly code: number;
  public readonly detail: string;
  public readonly isOperational: boolean = true;

  constructor(args: IError) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.message = args.message || 'Error';
    this.code = args.code;
    this.detail = args.detail;

    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }

    Error.captureStackTrace(this);
  }
}
