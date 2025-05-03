import {MessageStatus} from './message-status';
import {AuditFullDetailsResponse} from './audit-full-details-response';
import {UserGetResponse} from './user-get-response';

export interface PrivateMessageGetResponse {
  messageId: string;

  senderId: number;

  recipient: UserGetResponse;

  content: string;

  status: MessageStatus;

  readAt: string | null;

  receivedAt: string | null;

  audit: AuditFullDetailsResponse;
}
