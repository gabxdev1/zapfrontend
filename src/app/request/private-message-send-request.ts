export interface PrivateMessageSendRequest {
  messageId: string;

  recipientId: number;

  content: string;
}
