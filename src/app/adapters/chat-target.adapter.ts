import {PrivateMessageGetResponse} from '../response/private-message-get-response';
import {ChatTarget} from '../model/chat-target';
import {ChatType} from '../enums/chat-type';
import {FriendshipGetResponse} from '../response/friendship-get-response';

export function fromPrivateMessageToChatTarget(message: PrivateMessageGetResponse, currentUserId: number, unreadCount: number): ChatTarget {
  return {
    id: message.senderId === currentUserId ? message.recipient.id : message.senderId,
    name: message.senderId === currentUserId ? message.recipient.firstName + ' ' + message.recipient.lastName : message.audit.createdBy.firstName + ' ' + message.audit.createdBy.lastName,
    type: ChatType.PRIVATE,
    lastMessage: message.content,
    lastMessageAt: message.audit.createdAt,
    unreadCount: unreadCount,
    nickname: message.senderId === currentUserId ? message.recipient.nickname : message.audit.createdBy.nickname,
  }
}

export function fromFriendshipToChatTarget(friendship: FriendshipGetResponse): ChatTarget {
  return {
    id: friendship.id,
    name: friendship.firstName + ' ' + friendship.lastName,
    type: ChatType.PRIVATE,
    nickname: friendship.nickname,
  }
}
