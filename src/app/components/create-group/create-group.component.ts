import {Component, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {FriendshipGetResponse} from '../../response/friendship-get-response';
import {FriendshipService} from '../../services/friendship.service';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MenuService} from '../../services/menu.service';
import {GroupService} from '../../services/group.service';
import {GroupPostRequest} from '../../request/group-post-request';


@Component({
  selector: 'app-create-group',
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss'
})
export class CreateGroupComponent implements OnInit {
  currentStep: number = 0;

  selectedUsers: FriendshipGetResponse[] = [];

  private friendshipsOriginal: FriendshipGetResponse[] = [];

  friendshipsFiltered: FriendshipGetResponse[] = [];

  searchControl = new FormControl('');

  public formGroup: FormGroup;

  constructor(private friendshipService: FriendshipService,
              private menuService: MenuService,
              private formBuild: FormBuilder,
              private groupService: GroupService) {
  }

  private buildForm(): void {
    this.formGroup = this.formBuild.group({
      name: [null, [Validators.required]],
      description: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.buildForm();
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
        this.friendshipsOriginal.push(...response.content);
        this.friendshipsFiltered.push(...response.content);
      });
  }

  closeOrPrevStep(): void {
    if (this.currentStep === 1) {
      this.currentStep = 0;
      return;
    }

    this.close();
  }

  private close() {
    this.menuService.closeCreateGroup();
    this.menuService.closeFriendRequest();
    this.menuService.closeNotifications();
    this.menuService.closeSideBarFriendship();

    this.menuService.openConversationList();
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

  nextPrevStep() {
    this.currentStep = 1;
  }

  createGroup() {
    if (!this.formGroup.valid) {
      return;
    }

    const rawValue: GroupPostRequest = this.formGroup.getRawValue();

    this.formGroup.reset();

    rawValue.usersId = this.selectedUsers
      .map((user: FriendshipGetResponse) => user.id);

    this.groupService.createGroup(rawValue).subscribe({
      next: newGroup => {
        this.groupService.addGroup(newGroup);
        this.groupService.joinGroup(newGroup.id)
        this.close();
      },
      error: error => {
        this.close();
        console.log(error);
      },
    })
  }
}
