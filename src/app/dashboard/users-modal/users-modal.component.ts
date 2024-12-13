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
  platformsId: number = 0;

  paginatedUsers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalPagesArray: number[] = [];

  currentStep: number = 1;
  createUserForm!: FormGroup;
  editingUser: UserState | null = null; // Store the user being edited
  deletingUser: UserState | null = null; // Store the user being deleted

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store, private fb: FormBuilder) {
    this.createUserForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      date_of_birth: ['', Validators.required],
      age: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.platformsId = user.id_platforms;
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  nextStep() {
    this.currentStep = 2;
  }

  previousStep() {
    this.currentStep = 1;
    this.editingUser = null; // Reset the editing user
    this.deletingUser = null; // Reset the deleting user
    this.createUserForm.reset(); // Reset the form
  }

  onSubmit() {
    if (this.createUserForm.valid) {
      if (this.editingUser) {
        // Update the existing user
        console.log(
          'edit',
          this.editingUser.id_platforms_user,
          this.createUserForm.value
        );
        this.store.dispatch(
          LandingActions.updateUserWeb({
            user: {
              id_platforms_user: this.editingUser.id_platforms_user,
              ...this.createUserForm.value,
              phone_number: '',
              phone_number_code: '',
              type: 1,
              id_platforms: this.platformsId,
            },
          })
        );
      } else {
        // Add a new user
        console.log(this.createUserForm.value);
        this.store.dispatch(
          LandingActions.insertUserWeb({
            user: {
              ...this.createUserForm.value,
              phone_number: '',
              phone_number_code: '',
              id_platforms: this.platformsId,
              type: 1,
            },
          })
        );
      }
      this.createUserForm.reset();
      this.previousStep(); // Return to the users table step
    } else {
      // Mark all fields as touched to trigger validation messages
      this.createUserForm.markAllAsTouched();
    }
  }

  editUser(user: UserState) {
    this.editingUser = user;
    this.createUserForm.patchValue(user); // Populate the form with user data
    this.nextStep(); // Go to the next step
  }

  confirmDeleteUser(user: UserState) {
    this.deletingUser = user;
    this.currentStep = 3; // Go to the delete confirmation step
  }

  deleteUser() {
    if (this.deletingUser) {
      console.log('delete', this.deletingUser.id_platforms_user);
      this.store.dispatch(
        LandingActions.deleteUserWeb({
          id_platforms_user: this.deletingUser.id_platforms_user,
          id_platforms: this.platformsId,
        })
      );
    }
    this.deletingUser = null;
    this.previousStep(); // Return to the users table step
  }

  closeDialog() {
    this.display = false;
    this.currentStep = 1; // Reset to the first step
    this.editingUser = null; // Reset the editing user
    this.deletingUser = null; // Reset the deleting user
    this.createUserForm.reset(); // Reset the form
  }

  onDialogHide() {
    this.currentStep = 1; // Reset to the first step when the dialog is hidden
    this.editingUser = null; // Reset the editing user
    this.deletingUser = null; // Reset the deleting user
    this.createUserForm.reset(); // Reset the form
  }
}
