import {MessageStatus} from "./message-status";

export interface GroupMessageStatusResponse {
  id: string;

  userId: number;

  senderId: number;

  firstName: string;

  lastName: string;

  messageId: string;

  groupId: number;

  messageStatus: MessageStatus;

  receivedAt: string;

  readAt: string;
}

export function groupMessageStatusResponseMapper(messageStatus: GroupMessageStatusResponse): GroupMessageStatusResponse {
  return {
    id: messageStatus.messageId + "_" + messageStatus.userId + "_" + messageStatus.groupId,
    userId: messageStatus.userId,
    senderId: messageStatus.senderId,
    messageId: messageStatus.messageId,
    messageStatus: messageStatus.messageStatus,
    lastName: messageStatus.lastName,
    firstName: messageStatus.firstName,
    readAt: messageStatus.readAt,
    groupId: messageStatus.groupId,
    receivedAt: messageStatus.receivedAt,
  }
}

export function groupMessageStatusResponseListMapper(messagesStatus: GroupMessageStatusResponse[]): GroupMessageStatusResponse[] {
  return messagesStatus.map(msg => groupMessageStatusResponseMapper(msg))
}
