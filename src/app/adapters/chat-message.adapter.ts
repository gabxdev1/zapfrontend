import {ChatMessage} from '../model/chat-message';
import {PrivateMessageGetResponse} from '../response/private-message-get-response';
import {ChatType} from '../enums/chat-type';
import {userFromUserGetResponse} from './user-adapter';
import {GroupMessageResponse} from '../response/group-message-response';

export function fromPrivateMessage(msg: PrivateMessageGetResponse): ChatMessage {
  return {
    id: msg.messageId,
    content: msg.content,
    createdAt: msg.audit.createdAt,
    receivedAt: msg.receivedAt,
    readAt: msg.readAt,
    sender: userFromUserGetResponse(msg.audit.createdBy),
    type: ChatType.PRIVATE,
    recipient: userFromUserGetResponse(msg.recipient),
    status: msg.status
  };
}

export function fromGroupMessage(msg: GroupMessageResponse): ChatMessage {
  return {
    id: msg.messageId,
    content: msg.content,
    createdAt: msg.audit.createdAt,
    receivedAt: null,
    readAt: null,
    sender: userFromUserGetResponse(msg.audit.createdBy),
    type: ChatType.GROUP,
    status: msg.status,
    color: msg.color,
  };
}
