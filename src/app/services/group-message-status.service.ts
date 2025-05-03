import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {
  GroupMessageStatusResponse,
  groupMessageStatusResponseListMapper
} from '../response/group-message-status-response';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {UserService} from './user.service';
import {UserGetResponse} from '../response/user-get-response';

@Injectable({
  providedIn: 'root'
})
export class GroupMessageStatusService {

  private _groupsMessageStatus = new BehaviorSubject<GroupMessageStatusResponse[]>([]);

  public readonly groupsMessageStatus$ = this._groupsMessageStatus.asObservable();

  public initialResult = new BehaviorSubject<GroupMessageStatusResponse[]>([]);

  private currentUser: UserGetResponse;

  constructor(private clientHttp: HttpClient,
              private userService: UserService,) {
    userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    })
  }

  public findAllGroupMessageStatus() {
    this.clientHttp.get<GroupMessageStatusResponse[]>(environment.api.baseURL + '/group-messages/status').subscribe({
      next: result => {
        const groupMessageStatusResponses = groupMessageStatusResponseListMapper(result);
        this._groupsMessageStatus.next(groupMessageStatusResponseListMapper(groupMessageStatusResponses));
        this.initialResult.next(groupMessageStatusResponses);
      }
    })
  }

  public addStatusMessage(messageStatus: GroupMessageStatusResponse) {
    const currentMessagesStatus = this._groupsMessageStatus.getValue();

    const index = currentMessagesStatus.findIndex(msg => msg.id === messageStatus.id);

    if (index !== -1) {
      currentMessagesStatus[index] = messageStatus;

      this._groupsMessageStatus.next([...currentMessagesStatus]);

      return;
    }

    this._groupsMessageStatus.next([...currentMessagesStatus, messageStatus]);
  }
}
