import {ChatType} from '../enums/chat-type';

export interface UserChatHeaderInfo {
  type: ChatType.PRIVATE

  name: string;

  nickname: string;
}
