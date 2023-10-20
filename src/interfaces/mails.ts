import { MessageEnvelopeObject } from 'imapflow';

export interface MailResetPassword {
  internalDate: Date;
  envelope: MessageEnvelopeObject;
  data: string;
}
