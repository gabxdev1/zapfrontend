import {Injectable} from '@angular/core';
import {PrivateMessageService} from './private-message.service';
import {combineLatest, last, map, Observable} from 'rxjs';
import {ChatTarget} from '../model/chat-target';
import {MessageStatus} from '../response/message-status';
import {fromPrivateMessageToChatTarget} from '../adapters/chat-target.adapter';
import {GroupMessageService} from './group-message.service';
import {GroupService} from './group.service';
import {ChatType} from '../enums/chat-type';
import {GroupMessageResponse} from '../response/group-message-response';
import {GroupMessageStatusService} from './group-message-status.service';

@Injectable({
  providedIn: 'root'
})
export class RecentConversationService {

  constructor(private privateMessageService: PrivateMessageService,
              private groupMessageService: GroupMessageService,
              private groupService: GroupService,
              private groupMessageStatusService: GroupMessageStatusService,) {
  }


  buildRecentConversations(currentUserId: number): Observable<ChatTarget[]> {
    return combineLatest([
      this.privateMessageService.privateMessage$,
      this.groupService.groups$,
      this.groupMessageService.groupMessages$,
      this.groupMessageStatusService.groupsMessageStatus$
    ]).pipe(
      map(([privateMessages, groups, groupMessages, groupMessagesStatus]) => {
          const privateConversationsTarget = new Map<number, ChatTarget>();
          const groupConversationsTarget: ChatTarget[] = [];

          privateMessages.forEach(msg => {
            const friendshipId = msg.senderId === currentUserId ? msg.recipient.id : msg.senderId;

            const existing = privateConversationsTarget.get(friendshipId);

            const isStatusReceived = msg.status === MessageStatus.RECEIVED && msg.senderId !== currentUserId;

            if (!existing) {
              privateConversationsTarget.set(friendshipId, fromPrivateMessageToChatTarget(msg, currentUserId, isStatusReceived ? 1 : 0))
            }

            if (existing) {

              if (!existing.lastMessageAt) {
                console.error("ChatTarget inconsistente: lastMessageAt ausente.");
                return;
              }

              if (new Date(msg.audit.createdAt) > new Date(existing.lastMessageAt)) {
                existing.lastMessage = msg.content;
                existing.lastMessageAt = msg.audit.createdAt;
              }

              if (isStatusReceived) {
                existing.unreadCount = (existing.unreadCount || 0) + 1;
              }
            }
          })

          groups.forEach(group => {
            const groupMsgs = groupMessages.filter(msg => msg.groupId === group.id);
            const groupMsgsStatus = groupMessagesStatus.filter(msg => msg.groupId === group.id && msg.messageStatus === MessageStatus.RECEIVED && msg.senderId !== currentUserId);
            let lastMessage: GroupMessageResponse | undefined = undefined;
            let content = ""
            let unreadCount: number = 0;


            if (groupMsgs.length > 0) {
              lastMessage = groupMsgs.sort((a, b) => new Date(b.audit.createdAt).getTime() - new Date(a.audit.createdAt).getTime())[0];

              content = lastMessage?.audit.createdBy.firstName + " " + lastMessage?.audit.createdBy.lastName + ": " + lastMessage?.content;

              unreadCount = groupMsgsStatus.length;
            }

            groupConversationsTarget.push({
              id: group.id,
              name: group.name,
              type: ChatType.GROUP,
              unreadCount: unreadCount,
              lastMessageAt: lastMessage?.audit.createdAt || group.audit.createdAt,
              lastMessage: content,
              groupCreatAt: group.audit.createdAt,
              groupCreateBy: group.audit.createdBy.nickname,
            });
          })

          const allRecentsPrivateTargets = Array.from(privateConversationsTarget.values());

          allRecentsPrivateTargets.push(...groupConversationsTarget)

          return allRecentsPrivateTargets.sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());
        }
      )
    );
  }
}
