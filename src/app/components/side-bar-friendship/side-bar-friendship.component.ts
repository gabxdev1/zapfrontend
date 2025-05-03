import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {FriendshipGetResponse} from '../../response/friendship-get-response';
import {FriendshipService} from '../../services/friendship.service';
import {finalize} from 'rxjs';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MenuService} from '../../services/menu.service';
import {CurrentChatService} from '../../services/current-chat.service';
import {fromFriendshipToChatTarget} from '../../adapters/chat-target.adapter';


@Component({
  selector: 'app-side-bar-friendship',
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './side-bar-friendship.component.html',
  styleUrl: './side-bar-friendship.component.scss',
})
export class SideBarFriendshipComponent implements OnInit {
  @ViewChild('anchor', {static: true})
  anchor!: ElementRef<HTMLElement>;

  friendshipsOriginal: FriendshipGetResponse[] = [];

  friendshipsFiltered: FriendshipGetResponse[] = [];

  private page = 0;
  private loading = false;
  private finished = false;
  observer!: IntersectionObserver;

  searchControl = new FormControl('');

  constructor(private friendshipService: FriendshipService,
              private menuService: MenuService,
              private currentChatService: CurrentChatService,) {
  }

  ngOnInit(): void {
    this.setupIntersectionObserver();

    this.searchControl.valueChanges.subscribe(value => {
      const search = value?.toLowerCase().trim() || '';

      if (!search) {
        this.friendshipsFiltered = [...this.friendshipsOriginal];  // Mostra todos!
        return;
      }

      this.friendshipsFiltered = this.friendshipsOriginal.filter(friend =>
        friend.firstName.toLowerCase().includes(search) ||
        friend.lastName.toLowerCase().includes(search)
      );
    });
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.loading && !this.finished) {
        this.loadFriends();
      }
    });
    this.observer.observe(this.anchor.nativeElement);
  }

  loadFriends() {
    this.loading = true;
    this.friendshipService.getFriendships(this.page, 1000)
      .pipe(finalize(() => this.loading = false))
      .subscribe(response => {
        this.friendshipsOriginal.push(...response.content);
        this.friendshipsFiltered.push(...response.content);
        this.page++;
        if (response.last) {
          this.finished = true;
          this.observer.disconnect();
        }
      });
  }

  closeFriendship(): void {
    this.menuService.closeSideBarFriendship();

    this.menuService.openConversationList();
    this.menuService.closeFriendRequest();
    this.menuService.closeNotifications();
    this.menuService.closeCreateGroup();
  }

  openChat(friendship: FriendshipGetResponse) {
    this.currentChatService.openChat(fromFriendshipToChatTarget(friendship));
  }
}
