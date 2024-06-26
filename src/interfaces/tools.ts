import { IncomingHttpHeaders } from 'http';

export interface QueryParams {
  createMail?: string;
  email?: string;
  emailPassword?: string;
  password?: string;
}

export interface HeadersParams {
  executionId: string;
}

export interface Params {
  query: QueryParams;
  headers: HeadersParams | IncomingHttpHeaders;
  body: any;
  params: any;
}

export interface Log {
  label: string;
  level: string;
  message: {
    executionId: string;
  };
  timestamp: string;
}
