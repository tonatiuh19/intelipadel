import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fromLanding } from '../../shared/store/selectors';
import { Store } from '@ngrx/store';
import { EventUsers } from '../../home/home.model';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../shared/store/actions';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-users-event-table',
  templateUrl: './users-event-table.component.html',
  styleUrl: './users-event-table.component.css',
})
export class UsersEventTableComponent implements OnInit {
  @Input() idEvent: number = 0;
  @Output() usersUpdated = new EventEmitter<boolean>();

  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectEventUsers$ = this.store.select(fromLanding.selectEventUsers);

  faCheckCircle = faCheckCircle;

  eventUsers: EventUsers[] = [];

  platformsId: number = 0;

  displayConfirmation: boolean = false;

  selectedUser!: EventUsers;

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.platformsId = user.id_platforms;
      this.store.dispatch(
        LandingActions.getEventsUsersByIdPlatformWeb({
          id_platform: user.id_platforms,
          id_platforms_disabled_date: this.idEvent,
        })
      );
    });

    this.selectEventUsers$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((eventUsers) => {
        this.eventUsers = eventUsers;
        this.usersUpdated.emit(this.eventUsers.length > 0);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  showConfirm(user: any): void {
    this.selectedUser = user;
    this.displayConfirmation = true;
  }

  confirmCheckIn(): void {}
}
