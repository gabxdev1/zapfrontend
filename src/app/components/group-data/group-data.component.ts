import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {GroupService} from '../../services/group.service';
import {GroupGetResponse} from '../../response/group-get-response';
import {UserService} from '../../services/user.service';
import {UserGetResponse} from '../../response/user-get-response';
import {AddMemberModalComponent} from '../add-member-modal/add-member-modal.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-group-data',
  imports: [
    MatIconModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './group-data.component.html',
  styleUrl: './group-data.component.scss'
})
export class GroupDataComponent implements OnInit {

  @Input()
  groupId: number | undefined;

  @Output()
  closeGroupInfoEvent = new EventEmitter<void>();

  activeGroup: GroupGetResponse;

  private currentUser: UserGetResponse;

  isAdmin: boolean = false;

  constructor(private groupService: GroupService,
              private userService: UserService,
              public dialog: MatDialog,) {
    userService.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    })
  }

  ngOnInit(): void {
    this.groupService.groups$.subscribe(groups => {
      const index = groups.findIndex((group) => this.groupId === group.id);

      if (index !== 1) {
        this.activeGroup = groups[index];

        for (const member of this.activeGroup.members) {
          if (member.user.id === this.currentUser.id) {
            this.isAdmin = member.moderator;
            break;
          }
        }

      } else {
        this.closeGroupInfo();
      }
    })
  }

  closeGroupInfo() {
    this.closeGroupInfoEvent.emit();
  }

  openModalAddMember() {
    this.dialog.open(AddMemberModalComponent, {
      data: this.activeGroup,
    })
  }
}
