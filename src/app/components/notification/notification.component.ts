import {Component} from '@angular/core';
import {NotificationsService} from '../../services/notifications.service';
import {AsyncPipe, DatePipe} from '@angular/common';
import {FriendshipService} from '../../services/friendship.service';

@Component({
  selector: 'app-notification',
  imports: [
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  constructor(protected service: NotificationsService,
              private friendshipService: FriendshipService) {
  }


  accept(id: number) {
    this.service.removeNotification(id);
    this.friendshipService.acceptFriendRequest({senderId: id})
  }

  delete(id: number) {
    this.service.removeNotification(id);
    this.friendshipService.rejectFriendRequest({senderId: id})
  }
}
