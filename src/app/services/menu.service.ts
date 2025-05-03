import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private conversationListOpen = new BehaviorSubject<boolean>(true);
  public conversationListOpen$ = this.conversationListOpen.asObservable();

  private friendRequestOpen = new BehaviorSubject<boolean>(false);
  public friendRequestOpen$ = this.friendRequestOpen.asObservable();

  private sideBarFriendship = new BehaviorSubject<boolean>(false);
  public sideBarFriendship$ = this.sideBarFriendship.asObservable();

  private notifications = new BehaviorSubject<boolean>(false);
  public notifications$ = this.notifications.asObservable();

  private createGroup = new BehaviorSubject<boolean>(false);
  public createGroup$ = this.createGroup.asObservable();

  private login = new BehaviorSubject<boolean>(true);
  public login$ = this.login.asObservable();

  private register = new BehaviorSubject<boolean>(false);
  public register$ = this.register.asObservable();

  public openFriendRequest() {
    this.friendRequestOpen.next(true);
  }

  public closeFriendRequest() {
    this.friendRequestOpen.next(false);
  }

  public openConversationList() {
    this.conversationListOpen.next(true);
  }

  public closeConversationList() {
    this.conversationListOpen.next(false);
  }

  public openSideBarFriendship() {
    this.sideBarFriendship.next(true);
  }

  public closeSideBarFriendship() {
    this.sideBarFriendship.next(false);
  }

  public openNotifications() {
    this.notifications.next(true);
  }

  public closeNotifications() {
    this.notifications.next(false);
  }

  public openCreateGroup() {
    this.createGroup.next(true);
  }

  public closeCreateGroup() {
    this.createGroup.next(false);
  }

  public openLogin() {
    this.login.next(true);
  }

  public closeLogin() {
    this.login.next(false);
  }

  public openRegister() {
    this.register.next(true);
  }

  public closeRegister() {
    this.register.next(false);
  }
}
