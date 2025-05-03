import {MessageStatus} from './message-status';
import {AuditFullDetailsResponse} from './audit-full-details-response';

export interface GroupMessageResponse {
  groupId: number;

  messageId: string;

  content: string;

  status: MessageStatus;

  audit: AuditFullDetailsResponse

  color: string;
}
