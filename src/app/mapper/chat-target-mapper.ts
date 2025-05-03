import {FriendshipGetResponse} from '../response/friendship-get-response';
import {ChatTarget} from '../model/chat-target';
import {ChatType} from '../enums/chat-type';

export class ChatTargetMapper {
  static fromFriendship(friendship: FriendshipGetResponse): ChatTarget {
    return {
      id: friendship.id,
      type: ChatType.PRIVATE,
      name: friendship.firstName + ' ' + friendship.lastName
    }
  }
}
