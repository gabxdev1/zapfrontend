import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MenuService} from '../../services/menu.service';
import {UserPresenceService} from '../../services/user-presence.service';

@Component({
  selector: 'app-conversation-header',
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,

  ],
  templateUrl: './conversation-header.component.html',
  styleUrl: './conversation-header.component.scss'
})
export class ConversationHeaderComponent {
  constructor(private menuService: MenuService) {
  }


  openFriendship(): void {
    this.menuService.openSideBarFriendship();

    this.menuService.closeConversationList();
    this.menuService.closeFriendRequest();
    this.menuService.closeNotifications();
    this.menuService.closeCreateGroup();
  }

  createGroupOpen() {
    this.menuService.openCreateGroup();

    this.menuService.closeSideBarFriendship();
    this.menuService.closeConversationList();
    this.menuService.closeFriendRequest();
    this.menuService.closeNotifications();
  }
}
