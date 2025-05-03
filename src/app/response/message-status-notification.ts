import {MessageStatus} from './message-status';

export interface MessageStatusNotification {
  messageId: string;

  status: MessageStatus;

  timestamp: string;
}
