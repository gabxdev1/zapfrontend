import {Injectable, OnInit} from '@angular/core';
import {ChatWebSocketService} from './chat-web-socket.service';
import {PrivateMessageService} from './private-message.service';

@Injectable({
  providedIn: 'root'
})
export class PrivateMessageStatusService {

  constructor(
    private chatWebSocketService: ChatWebSocketService,
    private privateMessageService: PrivateMessageService) {

    this.chatWebSocketService.privateMessageStatus$.subscribe(messageStatus => {
      if (messageStatus) {
        this.privateMessageService.updateStatusMessage(messageStatus);
      }
    })
  }
}
