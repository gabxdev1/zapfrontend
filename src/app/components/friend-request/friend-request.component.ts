import {Component, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from '@angular/material/icon';
import {FriendshipService} from '../../services/friendship.service';
import {CommonModule} from '@angular/common';
import {UserGetResponse} from '../../response/user-get-response';
import {UserGetCustomResponse} from '../../response/user-get-custom-response';

@Component({
  selector: 'app-friend-request',
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './friend-request.component.html',
  styleUrl: './friend-request.component.scss'
})
export class FriendRequestComponent implements OnInit {
  searchControl = new FormControl('');

  usersFound!: UserGetCustomResponse[];

  constructor(private friendshipService: FriendshipService) {
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe(value => {
      if (value && value.length >= 2) {
        this.friendshipService.findUsers(value).subscribe(users => {
          if (users && users.length > 0) {
            this.usersFound = users;
            this.usersFound.map(user => {
              user.isRequestSent = false;
            })
          } else {
            this.usersFound = [];
          }
        })
      } else {
        this.usersFound = [];
      }
    })
  }

  inviteRequest(userFound: UserGetCustomResponse) {
    this.friendshipService.sendFriendRequest({receiverId: userFound.id});
    userFound.isRequestSent = true;
  }
}
