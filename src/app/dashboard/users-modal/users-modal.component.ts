import { Component, Input, OnInit } from '@angular/core';
import { UserState } from '../../home/home.model';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../shared/store/actions';
import {
  faPlusCircle,
  faTrashAlt,
  faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-modal',
  templateUrl: './users-modal.component.html',
  styleUrls: ['./users-modal.component.css'],
})
export class UsersModalComponent implements OnInit {
  @Input() display: boolean = false;

  public selectUsersEnd$ = this.store.select(fromLanding.selectUsersEnd);
  public selectUser$ = this.store.select(fromLanding.selectUser);

  faPlusCircle = faPlusCircle;
  faTrashAlt = faTrashAlt;
  faPencilAlt = faPencilAlt;

  users: UserState[] = [];
  paginatedUsers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalPagesArray: number[] = [];

  currentStep: number = 1;
  createUserForm!: FormGroup;

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store, private fb: FormBuilder) {
    this.createUserForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      date_of_birth: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.store.dispatch(
        LandingActions.getUsers({
          id_platforms: user.id_platforms,
        })
      );
    });

    this.selectUsersEnd$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((users) => {
        console.log(users);
        this.users = users;
      });
  }

  nextStep() {
    this.currentStep = 2;
  }

  previousStep() {
    this.currentStep = 1;
  }

  onSubmit() {
    if (this.createUserForm.valid) {
      this.users.push(this.createUserForm.value);
      this.createUserForm.reset();
      this.previousStep(); // Return to the users table step
    }
  }

  closeDialog() {
    this.display = false;
    this.currentStep = 1; // Reset to the first step
  }

  onDialogHide() {
    this.currentStep = 1; // Reset to the first step when the dialog is hidden
  }
}