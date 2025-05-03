import { Injectable } from '@angular/core';
import {ChatTarget} from '../model/chat-target';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentChatService {
  private chatTargetSubject = new BehaviorSubject<ChatTarget | null>(null);
  public readonly chatTarget$ = this.chatTargetSubject.asObservable();

  openChat(target: ChatTarget) {
    this.chatTargetSubject.next(target);
  }

  clearChat() {
    this.chatTargetSubject.next(null);
  }
}
