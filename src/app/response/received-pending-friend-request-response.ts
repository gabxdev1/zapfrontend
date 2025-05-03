import {RequestStatus} from './request-status';
import {UserGetCustomResponse} from './user-get-custom-response';

export interface ReceivedPendingFriendRequestResponse {
  status: RequestStatus;

  sender: UserGetCustomResponse;

  createdAt: string;
}
