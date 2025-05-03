import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GroupPostRequest} from '../request/group-post-request';
import {environment} from '../../environments/environment';
import {BehaviorSubject, combineLatestWith, take} from 'rxjs';
import {GroupGetResponse} from '../response/group-get-response';
import {StompSubscription} from '@stomp/stompjs';
import {ChatWebSocketService} from './chat-web-socket.service';
import {GroupMessageStatusService} from './group-message-status.service';
import {GroupMessageService} from './group-message.service';
import {UserService} from './user.service';
import {UserGetResponse} from '../response/user-get-response';
import {GroupMemberPostRequest} from '../request/group-member-post-request';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private groups = new BehaviorSubject<GroupGetResponse[]>([]);

  public readonly groups$ = this.groups.asObservable();

  private groupSubscriptions: StompSubscription[] = [];

  private groupMessagesStatusSub: StompSubscription[] = [];

  private currentUser: UserGetResponse;

  constructor(private clientHttp: HttpClient,
              private chatWebSocketService: ChatWebSocketService,
              private groupMessageStatusService: GroupMessageStatusService,
              private groupMessagesService: GroupMessageService,
              private userService: UserService) {
    this.userService.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    })

    this.chatWebSocketService.groupCreatedNotification.subscribe(group => {
      if (group) {
        this.addGroup(group);
        this.joinGroup(group.id);
      }
    })
  }

  public createGroup(newGroup: GroupPostRequest) {
    return this.clientHttp.post<GroupGetResponse>(environment.api.baseURL + '/groups', newGroup);
  }

  public getAllGroupsByUser() {
    this.clientHttp.get<GroupGetResponse[]>(environment.api.baseURL + '/groups')
      .subscribe({
        next: result => {
          this.groups.next(result)
          this.initSubscribersGroups()
        },
      });
  }

  public addGroup(newGroup: GroupGetResponse) {
    const currentGroups = this.groups.getValue();

    const index = currentGroups.findIndex(group => group.id === newGroup.id);

    if (index !== -1) {
      currentGroups[index] = newGroup;

      this.groups.next([...currentGroups]);

      return;
    }

    currentGroups.push(newGroup);

    this.groups.next([...currentGroups]);
  }


  private initSubscribersGroups() {
    this.chatWebSocketService.connected$.subscribe(connected => {
      if (connected) {
        this.groups.getValue().forEach(group => {
          this.groupSubscriptions[group.id] = this.chatWebSocketService.subscribeToGroupMessages(group.id);

          this.groupMessagesStatusSub[group.id] = this.chatWebSocketService.subscribeToGroupMessagesStatus(group.id);

        })
      } else {
        this.groupSubscriptions.forEach(subscription => {
          subscription.unsubscribe();
        })

        this.groupMessagesStatusSub.forEach(message => {
          message.unsubscribe();
        })
      }
    })
  }

  public syncMessageStatus() {
    this.groupMessagesService.initialResult
      .pipe(
        combineLatestWith(this.groupMessageStatusService.initialResult),
        take(1)
      )
      .subscribe(([groupMessages, groupMessagesStatus]) => {
        groupMessages.forEach((groupMessage) => {


          const index = groupMessagesStatus.findIndex(status => status.messageId === groupMessage.messageId);

          if (index === -1 && groupMessage.audit.createdBy.id !== this.currentUser.id) {
            this.chatWebSocketService.markAsReceivedGroupMessage(groupMessage);
          }
        });

        this.groupMessagesService.initialResult.next([]);
        this.groupMessageStatusService.initialResult.next([]);
      });
  }

  public joinGroup(groupId: number) {
    if (this.groupSubscriptions[groupId]) {
      this.groupSubscriptions[groupId].unsubscribe();
      this.groupMessagesStatusSub[groupId].unsubscribe();
    }

    this.groupSubscriptions[groupId] = this.chatWebSocketService.subscribeToGroupMessages(groupId);
    this.groupMessagesStatusSub[groupId] = this.chatWebSocketService.subscribeToGroupMessagesStatus(groupId);
  }

  public leaveGroup(groupId: number) {
    if (this.groupSubscriptions[groupId]) {
      this.groupSubscriptions[groupId].unsubscribe();
      this.groupMessagesStatusSub[groupId].unsubscribe();

      delete this.groupSubscriptions[groupId];
      delete this.groupMessagesStatusSub[groupId];

      const currentGroups = this.groups.value;
      const index = currentGroups.findIndex(group => group.id === groupId);
      delete currentGroups[index];

      this.groups.next([...currentGroups]);
    }
  }

  public addMemberToGroup(request: GroupMemberPostRequest) {
    return this.clientHttp.post<void>(environment.api.baseURL + '/groups/members', request);
  }
}
