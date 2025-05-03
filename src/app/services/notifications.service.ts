import {Injectable} from '@angular/core';
import {FriendshipService} from './friendship.service';
import {BehaviorSubject} from 'rxjs';
import {ReceivedPendingFriendRequestResponse} from '../response/received-pending-friend-request-response';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private notifications = new BehaviorSubject<ReceivedPendingFriendRequestResponse[]>([]);

  public notifications$ = this.notifications.asObservable();

  constructor(private friendshipService: FriendshipService) {
  }

  public getAllNotifications(): void {
    this.friendshipService.getPendingReceivedRequests().subscribe(r => {
      this.notifications.next(r);
    })
  }

  public removeNotification(senderId: number) {
    const currentNotifications = this.notifications.getValue();

    const notiToRemove = currentNotifications.findIndex(u => u.sender.id === senderId);
    if (notiToRemove !== -1) {
      currentNotifications.splice(notiToRemove, 1);
      this.notifications.next(currentNotifications);
    }
  }

  public addNotification(notiReq: ReceivedPendingFriendRequestResponse): void {
    const current = this.notifications.value;

    let index = current.findIndex(noti => noti.sender.id === notiReq.sender.id);

    if (!(index >= 0)) {
      this.notifications.next([...current, notiReq]);
    }
  }
}
