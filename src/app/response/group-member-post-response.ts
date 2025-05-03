import {UserGetResponse} from './user-get-response';
import {AuditFullDetailsResponse} from './audit-full-details-response';

export interface GroupMemberPostResponse {
  user: UserGetResponse;

  moderator: boolean;

  audit: AuditFullDetailsResponse;
}
