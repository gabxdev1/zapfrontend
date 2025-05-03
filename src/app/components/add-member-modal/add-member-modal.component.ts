import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FriendshipGetResponse} from '../../response/friendship-get-response';
import {FriendshipService} from '../../services/friendship.service';
import {GroupService} from '../../services/group.service';
import {MatIconModule} from '@angular/material/icon';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {GroupGetResponse} from '../../response/group-get-response';

@Component({
  selector: 'app-add-member-modal',
  imports: [
    FormsModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './add-member-modal.component.html',
  styleUrl: './add-member-modal.component.scss'
})
export class AddMemberModalComponent implements OnInit {
  selectedUsers: FriendshipGetResponse[] = [];

  private friendshipsOriginal: FriendshipGetResponse[] = [];

  friendshipsFiltered: FriendshipGetResponse[] = [];

  searchControl = new FormControl('');

  constructor(private friendshipService: FriendshipService,
              private groupService: GroupService,
              public dialogRef: MatDialogRef<AddMemberModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: GroupGetResponse) {
  }

  ngOnInit(): void {
    this.loadFriends();

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

  loadFriends() {
    this.friendshipService.getFriendships(0, 1000)
      .subscribe(response => {
        const ids = this.data.members.map(member => member.user.id);

        this.friendshipsOriginal.push(...response.content.filter((f) => !ids.includes(f.id)));
        this.friendshipsFiltered.push(...response.content.filter((f) => !ids.includes(f.id)));
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  selectUser(friendship: FriendshipGetResponse) {
    this.selectedUsers.push(friendship);

    const index1 = this.friendshipsFiltered.findIndex(user => user.id === friendship.id);
    const index2 = this.friendshipsOriginal.findIndex(user => user.id === friendship.id);

    if (index1 !== -1 && index2 !== -1) {
      this.friendshipsFiltered.splice(index1, 1);
      this.friendshipsOriginal.splice(index2, 1);
    }
  }

  removeUser(userSelected: FriendshipGetResponse) {
    const index = this.selectedUsers.findIndex(user => user.id === userSelected.id);

    if (index !== -1) {
      this.selectedUsers.splice(index, 1);

      this.friendshipsOriginal.push(userSelected);
      this.friendshipsFiltered.push(userSelected);
    }
  }

  addMembers() {
    this.groupService.addMemberToGroup({
      groupId: this.data.id,
      membersId: this.selectedUsers.map(item => item.id),
    })
      .subscribe({
        next: result => {
          this.close();
        },
        error: (err) => {
          console.log(err);
          this.close();
        }
      })
  }
}
