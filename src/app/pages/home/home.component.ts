import {Component, OnInit} from '@angular/core';
import {MenuComponent} from '../../components/menu/menu.component';
import {ConversationHeaderComponent} from '../../components/conversation-header/conversation-header.component';
import {SideBarFriendshipComponent} from '../../components/side-bar-friendship/side-bar-friendship.component';
import {LoadingScreenComponent} from '../../components/loading-screen/loading-screen.component';
import {AuthService} from '../../services/auth.service';
import {ChatWebSocketService} from '../../services/chat-web-socket.service';
import {PrivateMessageService} from '../../services/private-message.service';
import {ConversationListComponent} from '../../components/conversation-list/conversation-list.component';
import {UserService} from '../../services/user.service';
import {MenuService} from '../../services/menu.service';
import {AsyncPipe} from '@angular/common';
import {FriendRequestComponent} from '../../components/friend-request/friend-request.component';
import {NotificationComponent} from '../../components/notification/notification.component';
import {NotificationsService} from '../../services/notifications.service';
import {UserPresenceService} from '../../services/user-presence.service';
import {ChatViewComponent} from '../../components/chat-view/chat-view.component';
import {CurrentChatService} from '../../services/current-chat.service';
import {CreateGroupComponent} from '../../components/create-group/create-group.component';
import {GroupService} from '../../services/group.service';
import {Router} from '@angular/router';
import {GroupMessageService} from '../../services/group-message.service';
import {PrivateMessageStatusService} from '../../services/private-message-status.service';
import {GroupMessageStatusService} from '../../services/group-message-status.service';

@Component({
  selector: 'app-home',
  imports: [MenuComponent,
    ConversationHeaderComponent,
    SideBarFriendshipComponent, ChatViewComponent,
    LoadingScreenComponent,
    ConversationListComponent,
    AsyncPipe,
    FriendRequestComponent, NotificationComponent, CreateGroupComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isLoading = false;

  constructor(
    private authService: AuthService,
    private webSocketService: ChatWebSocketService,
    private privateMessageService: PrivateMessageService,
    private userService: UserService,
    public menuService: MenuService,
    private notificationService: NotificationsService,
    private initPrivateMessageStatusService: PrivateMessageStatusService,
    private userPresenceService: UserPresenceService,
    protected currentChatService: CurrentChatService,
    private groupService: GroupService,
    private router: Router,
    private groupMessageService: GroupMessageService,
    private groupMessageStatusService: GroupMessageStatusService,) {
  }


  async ngOnInit() {
    try {
      await Promise.all([
        this.privateMessageService.getAllPrivateMessages(),
        this.userService.getCurrentUser(),
        this.notificationService.getAllNotifications(),
        this.userPresenceService.findAllUserStatusRelatedCurrentUser(),
        this.groupService.getAllGroupsByUser(),
        this.groupMessageService.getGroupMessages(),
        this.groupMessageStatusService.findAllGroupMessageStatus()
      ]);

      const token = this.authService.getToken();

      if (!token) {
        throw new Error('No token provided');
      }

      this.webSocketService.connect(token);

      this.webSocketService.connected$.subscribe(connected => {
        if (connected) {
          this.groupService.syncMessageStatus();
        }
      })

      this.isLoading = true;
    } catch (error) {
      this.authService.logout();
      this.router.navigate(['/login']);
      console.error('Erro ao carregar dados iniciais:', error);
    }
  }

}
