import {UserGetResponse} from './user-get-response';

export interface AuditFullDetailsResponse {

  createdAt: string;

  createdBy: UserGetResponse;

  updatedAt: string | null;

  updatedBy: UserGetResponse | null;
}
