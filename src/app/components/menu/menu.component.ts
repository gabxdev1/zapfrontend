import {Component, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MenuService} from '../../services/menu.service';
import {NotificationsService} from '../../services/notifications.service';
import {PrivateMessageService} from '../../services/private-message.service';
import {MessageStatus} from '../../response/message-status';
import {UserService} from '../../services/user.service';
import {UserGetResponse} from '../../response/user-get-response';
import {combineLatest, map} from 'rxjs';
import {GroupMessageStatusService} from '../../services/group-message-status.service';

@Component({
  selector: 'app-menu',
  imports: [
    MatIconModule,
    MatTooltip,
    MatBadgeModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {

  friendRequestCount: number = 0;
  messagesUnreadCount: number = 0;
  currentUser: UserGetResponse;

  constructor(public menuService: MenuService,
              protected notificationsService: NotificationsService,
              protected privateMessage: PrivateMessageService,
              protected userService: UserService,
              private groupMessageStatusService: GroupMessageStatusService,) {
    userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    })
  }

  ngOnInit(): void {
    this.notificationsService.notifications$.subscribe(notifications => {
      this.friendRequestCount = notifications.length;
    })

    combineLatest([
      this.privateMessage.privateMessage$,
      this.groupMessageStatusService.groupsMessageStatus$
    ]).pipe(
      map(([privateMessages, groupMessagesStatus]) => {
        let privateMessagesUnreadCount = 0;
        let groupMessagesUnreadCount = 0;
        let messagesUnreadCount = 0;

        privateMessages.forEach(message => {
          if (message.senderId !== this.currentUser.id && message.status === MessageStatus.RECEIVED) {
            privateMessagesUnreadCount++;
          }
        })

        groupMessagesStatus.forEach((groupMessagesStatus) => {
          if (groupMessagesStatus.messageStatus === MessageStatus.RECEIVED && groupMessagesStatus.senderId !== this.currentUser.id) {
            groupMessagesUnreadCount++;
          }
        })

        return privateMessagesUnreadCount + groupMessagesUnreadCount;
      })
    ).subscribe(qtd => {
      this.messagesUnreadCount = qtd;
    });
  }

  public openFriendRequest() {
    this.menuService.openFriendRequest();

    this.menuService.closeConversationList();
    this.menuService.closeSideBarFriendship();
    this.menuService.closeNotifications();
    this.menuService.closeCreateGroup();
  }

  public openConversation() {
    this.menuService.openConversationList();

    this.menuService.closeFriendRequest();
    this.menuService.closeSideBarFriendship();
    this.menuService.closeNotifications();
    this.menuService.closeCreateGroup();
  }

  public openNotifications() {
    this.menuService.openNotifications();

    this.menuService.closeFriendRequest();
    this.menuService.closeSideBarFriendship();
    this.menuService.closeConversationList();
    this.menuService.closeCreateGroup();
  }
}
