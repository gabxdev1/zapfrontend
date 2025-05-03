import {ChatType} from '../enums/chat-type';

export interface GroupChatHeaderInfo {
  type: ChatType.GROUP

  name: string;

  nickname: string;
}
