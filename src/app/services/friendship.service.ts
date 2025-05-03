import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PaginatedResponse} from '../response/paginated-response';
import {FriendshipGetResponse} from '../response/friendship-get-response';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {FriendRequestPostRequest} from '../request/friend-request-post-request';
import {UserGetCustomResponse} from '../response/user-get-custom-response';
import {ReceivedPendingFriendRequestResponse} from '../response/received-pending-friend-request-response';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {


  constructor(private http: HttpClient) {
  }

  public getFriendships(page: number, size: number): Observable<PaginatedResponse<FriendshipGetResponse>> {
    return this.http.get<PaginatedResponse<FriendshipGetResponse>>(
      `${environment.api.baseURL}/users/friendships?page=${page}&size=${size}`
    );
  }

  public findUsers(nickName: string) {
    return this.http.get<UserGetCustomResponse[]>(
      `${environment.api.baseURL}/users/search?nickname=${nickName}`
    );
  }

  public sendFriendRequest(friendRequestPostRequest: FriendRequestPostRequest) {
    this.http.post<void>(
      `${environment.api.baseURL}/users/friends-requests`,
      friendRequestPostRequest
    ).subscribe({
      error: error => console.log(error),
    });
  }

  public acceptFriendRequest(friendRequestPutRequest: { senderId: number }) {
    this.http.put<void>(
      `${environment.api.baseURL}/users/friends-requests`,
      friendRequestPutRequest
    ).subscribe({
      error: error => console.log(error),
    });
  }

  public rejectFriendRequest(friendRequestDeleteRequest: { senderId: number }) {
    this.http.delete<void>(
      `${environment.api.baseURL}/users/friends-requests`, {
        body: friendRequestDeleteRequest
      }
    ).subscribe({
      error: error => console.log(error),
    });
  }

  public getPendingReceivedRequests() {
    return this.http.get<ReceivedPendingFriendRequestResponse[]>(
      `${environment.api.baseURL}/users/friends-requests/received/pending`
    );
  }
}
