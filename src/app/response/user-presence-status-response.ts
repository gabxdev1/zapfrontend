import {UserStatus} from './user-status';

export interface UserPresenceStatusResponse {
  userId: number;

  status: UserStatus;

  lastSeenAt: string;
}
