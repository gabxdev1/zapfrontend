import {ChatType} from '../enums/chat-type';

export interface ChatTarget {
  id: number;
  type: ChatType;
  name: string;
  groupCreatAt?: string;
  groupCreateBy?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  nickname?: string;
}
