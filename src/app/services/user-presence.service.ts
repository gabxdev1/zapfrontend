import {Injectable} from '@angular/core';
import {UserPresenceStatusResponse} from '../response/user-presence-status-response';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserPresenceService {

  private userPresenceStatus = new BehaviorSubject<UserPresenceStatusResponse[]>([]);

  public readonly userPresenceStatus$ = this.userPresenceStatus.asObservable();

  constructor(protected httpClient: HttpClient) {
  }

  public findAllUserStatusRelatedCurrentUser() {
    this.httpClient.get<UserPresenceStatusResponse[]>(
      `${environment.api.baseURL}/users/presence`
    ).subscribe((userPresenceStatusResponse) => {
      userPresenceStatusResponse.forEach((presence) => {
        this.addPresenceUser(presence);
      })
    });
  }

  public addPresenceUser(userPresence: UserPresenceStatusResponse) {
    const currentList = this.userPresenceStatus.getValue();
    const index = currentList.findIndex(user => user.userId === userPresence.userId);

    if (index !== -1) {
      currentList[index] = userPresence;
    } else {
      currentList.push(userPresence);
    }

    this.userPresenceStatus.next([...currentList]);
  }
}
