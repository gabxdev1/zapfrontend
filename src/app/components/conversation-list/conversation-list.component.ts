import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CommonModule} from '@angular/common';
import {UserService} from '../../services/user.service';
import {UserGetResponse} from '../../response/user-get-response';
import {ChatTarget} from '../../model/chat-target';
import {MatBadge} from '@angular/material/badge';
import {RecentConversationService} from '../../services/recent-conversation.service';
import {CurrentChatService} from '../../services/current-chat.service';
import {ChatType} from '../../enums/chat-type';

@Component({
  selector: 'app-conversation-list',
  imports: [
    CommonModule,
    MatBadge,

  ],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss'
})
export class ConversationListComponent implements OnInit {
  public recentConversations$: Observable<ChatTarget[]>;

  protected currentUser: UserGetResponse;

  constructor(private recentConversations: RecentConversationService,
              private currentChatService: CurrentChatService,
              private userService: UserService,) {
    this.retrieveCurrentUser();
  }

  ngOnInit(): void {
    this.recentConversations$ = this.recentConversations.buildRecentConversations(this.currentUser.id);
  }

  private retrieveCurrentUser() {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    })
  }

  openChat(conversation: ChatTarget) {
    this.currentChatService.openChat(conversation);
  }

  protected readonly ChatType = ChatType;
}
