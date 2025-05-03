import {MessageStatus} from './message-status';
import {AuditFullDetailsResponse} from './audit-full-details-response';

export interface PrivateMessageNotificationResponse {
  messageId: string;

  senderId: number;

  recipientId: number;

  content: string;

  status: MessageStatus;

  readAt: string;

  receivedAt: string;

  audit: AuditFullDetailsResponse;
}
