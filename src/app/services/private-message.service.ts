import {Injectable} from '@angular/core';
import {PrivateMessageGetResponse} from '../response/private-message-get-response';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrivateMessageService {

  private privateMessage = new BehaviorSubject<PrivateMessageGetResponse[]>([]);

  public privateMessage$ = this.privateMessage.asObservable();

  constructor(private http: HttpClient) {
  }

  public getAllPrivateMessages(): void {
    this.http.get<PrivateMessageGetResponse[]>(
      `${environment.api.baseURL}/private-message`
    ).subscribe((response: PrivateMessageGetResponse[]) => {
      this.setMessages(response);
    });
  }

  private setMessages(messages: PrivateMessageGetResponse[]) {
    this.privateMessage.next(messages);
  }

  public addMessage(message: PrivateMessageGetResponse) {
    const current = this.privateMessage.value;
    this.privateMessage.next([...current, message]);
  }

  public updateStatusMessage(messageStatus: PrivateMessageGetResponse | null) {
    if (!messageStatus) return;

    const currentMessages = this.privateMessage.getValue();
    const index = currentMessages.findIndex(msg => msg.messageId === messageStatus.messageId);

    if (index !== -1) {
      const updatedMessages = [...currentMessages];
      updatedMessages[index] = {...updatedMessages[index], ...messageStatus};
      this.privateMessage.next(updatedMessages);
    }
  }
}
