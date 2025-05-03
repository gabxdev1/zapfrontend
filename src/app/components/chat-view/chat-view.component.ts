import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {PrivateMessageService} from '../../services/private-message.service';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  withLatestFrom
} from 'rxjs';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserGetResponse} from '../../response/user-get-response';
import {UserPresenceStatusResponse} from '../../response/user-presence-status-response';
import {ChatTarget} from "../../model/chat-target";
import {CurrentChatService} from "../../services/current-chat.service";
import {ChatType} from "../../enums/chat-type";
import {UserService} from '../../services/user.service';
import {fromGroupMessage, fromPrivateMessage} from "../../adapters/chat-message.adapter";
import {ChatMessage} from "../../model/chat-message";
import {UserPresenceService} from "../../services/user-presence.service";
import {UserStatus} from "../../response/user-status";
import {MessageStatus} from "../../response/message-status";
import {ChatWebSocketService} from "../../services/chat-web-socket.service";
import {ChatHeaderInfo} from "../../model/chat-header-info";
import {v4 as uuidv4} from 'uuid';
import {PrivateMessageSendRequest} from "../../request/private-message-send-request";
import {PrivateMessageGetResponse} from "../../response/private-message-get-response";
import {GroupMessageService} from '../../services/group-message.service';
import {GroupService} from '../../services/group.service';
import {GroupMessageSendRequest} from '../../response/group-message-send-request';
import {GroupMessageResponse} from '../../response/group-message-response';
import {GroupMessageStatusService} from '../../services/group-message-status.service';
import {GroupMessageStatusResponse} from '../../response/group-message-status-response';
import {GroupDataComponent} from '../group-data/group-data.component';

@Component({
  selector: 'app-chat-view',
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    GroupDataComponent
  ],
  templateUrl: './chat-view.component.html',
  styleUrl: './chat-view.component.scss'
})
export class ChatViewComponent implements OnInit, AfterViewInit, OnDestroy {

  message: string = '';

  activeChatTarget: ChatTarget | null = null;

  activeChatHeaderInfo: ChatHeaderInfo = {userChatHeaderInfo: null, groupChatHeaderInfo: null};

  activeGroupMessagesStatus = new BehaviorSubject<GroupMessageStatusResponse[]>([]);

  userPresenceStatus = signal<UserPresenceStatusResponse | null>(null);

  activeChatMessages = new BehaviorSubject<ChatMessage[]>([]);

  currentUser: UserGetResponse;
  selectedMessage: ChatMessage;
  messageData = new BehaviorSubject<ChatMessage | null>(null);
  messageData$ = signal<ChatMessage | null>(null);
  messageGroupStatus$ = signal<GroupMessageStatusResponse[]>([]);

  messageDataOpen = false;

  detailsOpen = false

  @ViewChild('chatInput', {static: true}) chatInput!: ElementRef<HTMLTextAreaElement>;

  @ViewChildren('messageRef', {read: ElementRef})
  messageElements!: QueryList<ElementRef>;

  private observer!: IntersectionObserver;
  private visibleMessage$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private currentChatService: CurrentChatService,
              private privateMessageService: PrivateMessageService,
              private userService: UserService,
              private userPresenceService: UserPresenceService,
              private chatWebSocketService: ChatWebSocketService,
              private groupMessageService: GroupMessageService,
              private groupService: GroupService,
              private groupMessageStatusService: GroupMessageStatusService,) {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    })
  }

  ngAfterViewInit(): void {
    this.setupObserver();
    this.observeMessageElements();
    this.handleMessageVisibility();

    this.messageData
      .asObservable()
      .pipe(
        filter((msg): msg is ChatMessage => msg !== null),
        switchMap(targetMsg => {
          const isGroup = this.activeChatTarget?.type === ChatType.GROUP;

          if (isGroup) {
            return combineLatest([
              this.activeChatMessages,
              this.activeGroupMessagesStatus
            ]).pipe(
              map(([messages, statusList]) => {
                const foundMsg = messages.find(msg => msg.id === targetMsg.id);
                const groupStatus = statusList.filter(status => status.messageId === targetMsg.id);

                this.messageGroupStatus$.set(groupStatus);

                return foundMsg;
              })
            );
          } else {
            this.messageGroupStatus$.set([]);

            return this.activeChatMessages.pipe(
              map(messages => messages.find(msg => msg.id === targetMsg.id))
            );
          }
        }),
        filter((msg): msg is ChatMessage => !!msg),
        takeUntil(this.destroy$)
      )
      .subscribe(msg => {
        this.messageData$.set(msg);
      });
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const messageId = el.getAttribute('data-message-id');
          if (messageId) this.visibleMessage$.next(messageId);
        }
      });
    }, {threshold: 0.5});
  }

  private observeMessageElements(): void {
    this.messageElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe((elements: QueryList<ElementRef>) => {
        this.observer.disconnect();
        elements.forEach(el => this.observer.observe(el.nativeElement));
      });

    setTimeout(() => {
      this.messageElements.forEach(el => this.observer.observe(el.nativeElement));
    });
  }

  private handleMessageVisibility(): void {
    this.visibleMessage$
      .pipe(
        withLatestFrom(
          this.activeChatMessages,
          this.userService.currentUser$,
          this.currentChatService.chatTarget$,
          this.groupMessageStatusService.groupsMessageStatus$
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(([messageId, activeChatMessages, currentUser, activeChatTarget, groupMessagesStatus]) => {
        if (activeChatTarget?.type === ChatType.PRIVATE) {
          const msg = activeChatMessages.find(m =>
            m.id === messageId &&
            m.status !== MessageStatus.READ &&
            m.sender.id !== currentUser?.id
          );

          if (msg) {
            this.chatWebSocketService.markAsReadPrivateMessage({messageId: msg.id});
          }
        }

        if (activeChatTarget?.type === ChatType.GROUP) {
          const status = groupMessagesStatus.find(s =>
            s.messageId === messageId &&
            s.messageStatus !== MessageStatus.READ &&
            s.senderId !== currentUser?.id
          );

          if (status) {
            this.chatWebSocketService.markAsReadGroupMessage({messageId: status.messageId});
          }
        }
      });
  }

  ngOnInit() {
    this.adjustTextareaHeight();

    this.chatInput.nativeElement.addEventListener('input', () => {
      this.adjustTextareaHeight();
    });

    this.currentChatService.chatTarget$
      .pipe(takeUntil(this.destroy$))
      .subscribe(chatTarget => {
        this.activeChatTarget = chatTarget;

        if (chatTarget) {
          this.closeMessageData();
          this.closeGroupInfo();
          this.clearView();
          this.loadMessages(chatTarget);
        } else {
          this.closeMessageData();
          this.closeGroupInfo();
          this.clearView();
        }
      })
  }

  private loadMessages(chatTarget: ChatTarget) {
    if (chatTarget.type === ChatType.PRIVATE) {
      this.loadUserHeader(chatTarget);
      this.loadPrivateMessages(chatTarget.id).subscribe(messages => {
        this.activeChatMessages.next(messages);
      })
    }

    if (chatTarget.type === ChatType.GROUP) {
      this.loadGroupHeader(chatTarget)
      this.loadGroupMessages(chatTarget)
        .pipe(takeUntil(this.destroy$))
        .subscribe(messages => {
          this.activeChatMessages.next(messages);
        })
      this.loadGroupMessagesStatus(chatTarget)
        .pipe(takeUntil(this.destroy$))
        .subscribe(messagesStatus => {
          this.activeGroupMessagesStatus.next(messagesStatus);
        })
    }
  }

  private loadGroupMessagesStatus(chatTarget: ChatTarget) {
    return this.groupMessageStatusService.groupsMessageStatus$.pipe(
      takeUntil(this.destroy$),
      map(messagesStatus =>
        messagesStatus.filter(messageStatus => messageStatus.groupId === chatTarget.id)
      )
    );
  }

  private loadGroupMessages(chatTarget: ChatTarget) {
    return this.groupMessageService.groupMessages$.pipe(
      takeUntil(this.destroy$),
      map((messages) =>
        messages
          .filter(msg => msg.groupId === chatTarget.id)
          .map(msg => fromGroupMessage(msg))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      )
    );
  }

  private loadPrivateMessages(friendshipId: number): Observable<ChatMessage[]> {
    return this.privateMessageService.privateMessage$.pipe(
      takeUntil(this.destroy$),
      map(messages =>
        messages
          .filter(msg =>
            (msg.senderId === this.currentUser.id && msg.recipient.id === friendshipId) ||
            (msg.senderId === friendshipId && msg.recipient.id === this.currentUser.id)
          )
          .map(msg => fromPrivateMessage(msg))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      )
    );
  }

  private loadUserHeader(chatTarget: ChatTarget) {

    this.activeChatHeaderInfo.groupChatHeaderInfo = null;

    this.activeChatHeaderInfo.userChatHeaderInfo = {
      type: ChatType.PRIVATE,
      name: chatTarget.name,
      nickname: chatTarget.nickname || ''
    }

    this.userPresenceService.userPresenceStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userPresenceStatus => {
        userPresenceStatus.forEach(status => {
          if (!this.activeChatTarget) return;

          if (status.userId === chatTarget.id) {
            this.userPresenceStatus.set(status);
          }
        })
      });

  }

  private loadGroupHeader(chatTarget: ChatTarget) {
    this.activeChatHeaderInfo.userChatHeaderInfo = null;

    let nicknames = "You, "

    this.groupService.groups$
      .pipe(takeUntil(this.destroy$))
      .subscribe(groups => {
        groups.forEach(group => {
          if (group.id === chatTarget.id) {
            group.members.forEach(member => {
              if (member.user.id !== this.currentUser.id) {
                nicknames += '@' + member.user.nickname + ', ';
              }
            })
          }
        })
      })

    nicknames = nicknames.substring(0, nicknames.length - 2)

    this.activeChatHeaderInfo.groupChatHeaderInfo = {
      type: ChatType.GROUP,
      name: chatTarget.name,
      nickname: nicknames
    }
  }

  private clearView(): void {
    this.userPresenceStatus.set(null);
    this.activeChatHeaderInfo.userChatHeaderInfo = null;
    this.activeChatHeaderInfo.groupChatHeaderInfo = null;
    this.activeChatMessages.next([]);
  }

  ngOnDestroy(): void {
    this.clearView();


    this.observer.disconnect();
    this.destroy$.next();
    this.destroy$.complete();

  }

  sendPrivateMessage() {
    if (this.activeChatTarget?.type === ChatType.GROUP) {
      return;
    }

    let messageToSend = this.message.trim();

    this.message = '';
    this.resetTextAreaHeight();

    if (!(messageToSend.length > 0)) {
      return;
    }

    if (!this.activeChatTarget) {
      return;
    }

    const payload: PrivateMessageSendRequest = {
      messageId: uuidv4(),
      recipientId: this.activeChatTarget.id,
      content: messageToSend
    }

    const tempMessage: PrivateMessageGetResponse = {
      messageId: payload.messageId,
      senderId: this.currentUser.id,
      recipient: {
        id: payload.recipientId,
        firstName: "",
        lastName: "",
        nickname: "",
      },
      content: messageToSend,
      status: MessageStatus.PENDING,
      readAt: null,
      receivedAt: null,
      audit: {
        createdBy: this.currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        updatedBy: null
      },
    };

    this.privateMessageService.addMessage(tempMessage);

    this.chatWebSocketService.sendPrivateMessage(payload);
  }

  sendGroupMessage() {
    if (this.activeChatTarget?.type === ChatType.PRIVATE) {
      return;
    }

    let messageToSend = this.message.trim();

    this.message = '';
    this.resetTextAreaHeight();

    if (!(messageToSend.length > 0)) {
      return;
    }

    if (!this.activeChatTarget) {
      return;
    }

    const payload: GroupMessageSendRequest = {
      messageId: uuidv4(),
      groupId: this.activeChatTarget.id,
      content: messageToSend
    }

    const tempMessage: GroupMessageResponse = {
      groupId: this.activeChatTarget.id,
      messageId: payload.messageId,
      content: messageToSend,
      status: MessageStatus.PENDING,
      color: "#e0dce4",
      audit: {
        createdBy: this.currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        updatedBy: null
      },
    };

    this.groupMessageService.addMessage(tempMessage);

    this.chatWebSocketService.sendGroupMessage(payload);
  }

  private adjustTextareaHeight() {
    const textarea = this.chatInput.nativeElement;
    this.resetTextAreaHeight();
    textarea.style.height = `${textarea.scrollHeight}px`;
    if (textarea.scrollHeight >= 300) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'none';
    }
  }

  private resetTextAreaHeight(): void {
    const textarea = this.chatInput.nativeElement;
    textarea.style.height = '35px';
  }

  openMenu(event: MouseEvent, message: ChatMessage) {
    event.preventDefault();
    this.selectedMessage = message;
  }

  onOptionClick(action: string, message: ChatMessage) {
    if (message.sender.id !== this.currentUser.id) {
      return;
    }

    this.messageData.next(message);

    if (action === 'messageData') {
      this.detailsOpen = false;
      this.messageDataOpen = true;
    }
  }

  closeMessageData() {
    this.messageDataOpen = false;
  }

  closeConversation() {
    this.currentChatService.clearChat();
  }

  protected readonly UserStatus = UserStatus;
  protected readonly MessageStatus = MessageStatus;
  protected readonly ChatType = ChatType;

  openDetails() {
    if (this.activeChatTarget?.type === ChatType.GROUP) {
      this.messageDataOpen = false;
      this.detailsOpen = true;
    }

  }

  closeGroupInfo() {
    this.detailsOpen = false;
  }
}
