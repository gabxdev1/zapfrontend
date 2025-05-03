import {UserChatHeaderInfo} from './user-chat-header-info';
import {GroupChatHeaderInfo} from './group-chat-header-info';

export interface ChatHeaderInfo {
  userChatHeaderInfo: UserChatHeaderInfo | null;

  groupChatHeaderInfo: GroupChatHeaderInfo | null;
}
