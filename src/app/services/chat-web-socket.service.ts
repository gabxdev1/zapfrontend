import {Injectable} from '@angular/core';
import {Client} from '@stomp/stompjs';
import {BehaviorSubject, Subscription} from 'rxjs';
import {PrivateMessageReceivedNotificationRequest} from '../request/private-message-received-notification-request';
import {PrivateMessageGetResponse} from '../response/private-message-get-response';
import {PrivateMessageService} from './private-message.service';
import {PrivateMessageSendRequest} from '../request/private-message-send-request';
import {ReceivedPendingFriendRequestResponse} from '../response/received-pending-friend-request-response';
import {NotificationsService} from './notifications.service';
import {UserPresenceStatusResponse} from '../response/user-presence-status-response';
import {UserPresenceService} from './user-presence.service';
import {GroupMessageResponse} from '../response/group-message-response';
import {GroupMessageService} from './group-message.service';
import {GroupMessageSendRequest} from '../response/group-message-send-request';
import {GroupMessageStatusNotificationRequest} from '../request/group-message-status-notification-request';
import {UserService} from './user.service';
import {UserGetResponse} from '../response/user-get-response';
import {GroupMessageStatusResponse, groupMessageStatusResponseMapper} from '../response/group-message-status-response';
import {GroupMessageStatusService} from './group-message-status.service';
import {GroupGetResponse} from '../response/group-get-response';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatWebSocketService {

  private _stompClient: Client;

  private currentUser: UserGetResponse;

  private connected = new BehaviorSubject<boolean>(false);

  public connected$ = this.connected.asObservable();

  private subscriptions = new Subscription();

  private privateMessageStatus = new BehaviorSubject<PrivateMessageGetResponse | null>(null);
  public privateMessageStatus$ = this.privateMessageStatus.asObservable();

  public groupCreatedNotification = new BehaviorSubject<GroupGetResponse | null>(null);

  constructor(private privateMessageService: PrivateMessageService,
              private notificationsService: NotificationsService,
              private userPresenceService: UserPresenceService,
              private groupMessageService: GroupMessageService,
              private userService: UserService,
              private groupMessageStatusService: GroupMessageStatusService,) {

    userService.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    })
  }


  get stompClient(): Client {
    return this._stompClient;
  }

  connect(token: string): void {
    this._stompClient = new Client({
      brokerURL: environment.api.brokerURL + '/zapbackend-ws?token=' + token,
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('connection established');
        this.connected.next(true);
        this.initSubscribers();
        this.syncUserContext();
      },
      onDisconnect: (error) => {
        console.log(error);
        this.connected.next(false);
      },
      onWebSocketError: (error: Error) => {
        console.log(error);
      },
      onStompError: (frame) => {
        console.error(frame);
      }
    });

    this._stompClient.activate();
  }

  private initSubscribers(): void {
    this.subscriptions.unsubscribe();

    this.subscribeToGroupCreatedNotifications();
    this.subscribeToGroupMessageNotifications();
    this.subscribeToUserPresenceStatus();
    this.subscribeToPrivateMessages();
    this.subscribeToPrivateMessageStatus();
    this.subscribeToNewFriendRequest();
  }

  private subscribeToPrivateMessages() {
    this.subscriptions.add(
      () => this._stompClient.subscribe('/user/queue/messages', message => {
        const body: PrivateMessageGetResponse = JSON.parse(message.body);

        let messageId: PrivateMessageReceivedNotificationRequest = {
          messageId: body.messageId
        }

        this._stompClient.publish({
          destination: '/app/private-message-received',
          body: JSON.stringify(messageId),
        });

        this.privateMessageService.addMessage(body);
      })
    )
  }

  private subscribeToGroupCreatedNotifications(): void {
    this.subscriptions.add(
      () => this._stompClient.subscribe('/user/queue/group-created', message => {
        const body: GroupGetResponse = JSON.parse(message.body);
        this.groupCreatedNotification.next(body);
      })
    );
  }

  private subscribeToGroupMessageNotifications(): void {
    this.subscriptions.add(
      () => this._stompClient.subscribe('/user/queue/group-message', message => {
        const body: GroupMessageResponse[] = JSON.parse(message.body);

        body.forEach(message => {
          this.markAsReceivedGroupMessage(message);

          this.groupMessageService.addMessage(message);
        })
      })
    );
  }

  private subscribeToPrivateMessageStatus() {
    this.subscriptions.add(
      () => this._stompClient.subscribe('/user/queue/status-private-message', message => {
        const body: PrivateMessageGetResponse = JSON.parse(message.body);
        this.privateMessageStatus.next(body);
      })
    );
  }

  private subscribeToUserPresenceStatus() {
    this.subscriptions.add(
      () => this._stompClient.subscribe('/user/queue/presence', message => {
        const body: UserPresenceStatusResponse = JSON.parse(message.body);
        this.userPresenceService.addPresenceUser(body);
      })
    )
  }

  public sendPrivateMessage(payload: PrivateMessageSendRequest): void {
    if (this._stompClient && this._stompClient.connected) {
      this._stompClient.publish({
        destination: '/app/private-message',
        body: JSON.stringify(payload)
      });
    }
  }

  public sendGroupMessage(payload: GroupMessageSendRequest): void {
    if (this._stompClient && this._stompClient.connected) {
      this._stompClient.publish({
        destination: '/app/group-message',
        body: JSON.stringify(payload)
      })
    }
  }

  public syncUserContext(): void {
    if (this._stompClient && this._stompClient.connected) {
      this._stompClient.publish({
        destination: '/app/session-sync'
      });
    }
  }

  private subscribeToNewFriendRequest() {
    this.subscriptions.add(
      () => this._stompClient.subscribe('/user/queue/new-friend-request', message => {
        const body: ReceivedPendingFriendRequestResponse = JSON.parse(message.body);
        this.notificationsService.addNotification(body);
      })
    )
  }

  public markAsReadPrivateMessage(messageId: PrivateMessageReceivedNotificationRequest): void {
    if (this._stompClient && this._stompClient.connected) {
      this._stompClient.publish({
        destination: '/app/private-message-read',
        body: JSON.stringify(messageId)
      });
    }
  }

  public markAsReadGroupMessage(messageId: GroupMessageStatusNotificationRequest): void {
    if (this._stompClient && this._stompClient.connected) {
      this._stompClient.publish({
        destination: '/app/group-message-read',
        body: JSON.stringify(messageId)
      });
    }
  }

  public markAsReceivedGroupMessage(groupMessage: GroupMessageResponse): void {
    if (this._stompClient && this._stompClient.connected) {
      if (groupMessage.audit.createdBy.id !== this.currentUser.id) {
        this._stompClient.publish({
          destination: '/app/group-message-received',
          body: JSON.stringify({messageId: groupMessage.messageId}),
        });
      }
    }
  }

  public subscribeToGroupMessages(groupId: number) {
    return this._stompClient.subscribe("/topic/group-" + groupId, message => {
      const body: GroupMessageResponse = JSON.parse(message.body);

      this.markAsReceivedGroupMessage(body);

      this.groupMessageService.addMessage(body);
    });
  }

  public subscribeToGroupMessagesStatus(groupId: number) {
    return this._stompClient.subscribe("/topic/status-group-message-" + groupId, message => {
      const body: GroupMessageStatusResponse = JSON.parse(message.body);
      if (body.senderId === this.currentUser.id || body.userId === this.currentUser.id) {
        this.groupMessageStatusService.addStatusMessage(groupMessageStatusResponseMapper(body));
      }
    });
  }

  disconnect(): void {
    if (this._stompClient) {
      this._stompClient.deactivate();
      this.connected.next(false);
    }
  }
}
