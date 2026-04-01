export interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(payload: MailPayload): Promise<void>;
}
