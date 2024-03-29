export interface IError {
  code: number;
  message: string;
  detail: string;
  isOperational?: boolean;
  routeName?: string
}