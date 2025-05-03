import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GroupMessageResponse} from '../response/group-message-response';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupMessageService {

  private _groupMessages = new BehaviorSubject<GroupMessageResponse[]>([]);

  public readonly groupMessages$ = this._groupMessages.asObservable();

  public initialResult = new BehaviorSubject<GroupMessageResponse[]>([]);

  constructor(private clientHttp: HttpClient) {
  }

  public getGroupMessages() {
    this.clientHttp.get<GroupMessageResponse[]>(environment.api.baseURL + '/group-messages')
      .subscribe({
        next: result => {
          this._groupMessages.next(result)

          this.initialResult.next(result);

          result.forEach(groupMessage => {
            groupMessage.color = this.getRandomColor();
          })
        },
      });
  }

  private getRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
  }

  public addMessage(message: GroupMessageResponse) {
    const current = this._groupMessages.value;

    let index = current.findIndex(msg => msg.messageId === message.messageId);

    if (index !== -1) {
      message.color = this.getRandomColor();
      current[index] = message;
      this._groupMessages.next([...current]);
      return
    }

    message.color = this.getRandomColor();

    this._groupMessages.next([...current, message]);
  }
}
