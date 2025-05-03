import {AuditFullDetailsResponse} from './audit-full-details-response';
import { GroupMemberPostResponse } from './group-member-post-response';

export interface GroupGetResponse {
  id: number;

  name: string;

  description: string;

  members: GroupMemberPostResponse[];

  audit: AuditFullDetailsResponse;
}
