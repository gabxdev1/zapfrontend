import {ChatType} from '../enums/chat-type';
import {MessageStatus} from '../response/message-status';
import {User} from './user';

export interface ChatMessage {
  id: string;
  type: ChatType;
  content: string;
  createdAt: string;
  readAt: string | null;
  receivedAt: string | null;
  sender: User;
  recipient?: User;
  status: MessageStatus;
  color?: string;
}
