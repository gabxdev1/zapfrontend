import {PrivateMessageGetResponse} from './private-message-get-response';

export interface ConversationSummary {
  friendId: number;
  lastMessage: PrivateMessageGetResponse;
  count: number;
}
