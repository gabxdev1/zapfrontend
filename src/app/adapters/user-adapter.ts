import {UserGetResponse} from '../response/user-get-response';
import {User} from '../model/user';

export function userFromUserGetResponse(user: UserGetResponse): User{
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    nickname: user.nickname
  }
}
