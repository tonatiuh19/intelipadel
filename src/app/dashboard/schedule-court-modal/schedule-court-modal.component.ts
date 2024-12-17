import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../shared/store/actions';
import { UserState } from '../../home/home.model';
import {
  formatDateString,
  generateTimeSlots,
  transformDateString,
} from '../../shared/utils/help-functions';

@Component({
  selector: 'app-schedule-court-modal',
  templateUrl: './schedule-court-modal.component.html',
  styleUrls: ['./schedule-court-modal.component.css'],
})
export class ScheduleCourtModalComponent implements OnInit, OnDestroy {
  @Input() display: boolean = false;

  @Input() start_date: string = '';

  @Input() end_date: string = '';

  @Output() close = new EventEmitter<void>();

  selectDate: string | null = null;

  public selectUsersEnd$ = this.store.select(fromLanding.selectUsersEnd);
  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectDisabledSlots$ = this.store.select(
    fromLanding.selectDisabledSlots
  );
  public selectPlatformsFields$ = this.store.select(
    fromLanding.selectPlatformsFields
  );
  public selectMarkedDates$ = this.store.select(fromLanding.selectMarkedDates);

  faClock = faClock;

  minDate!: Date;
  maxDate!: Date;

  scheduleForm!: FormGroup;

  platformsId: number = 0;
  users: any[] = [];
  disabledSlots: any[] = [];
  fields: any[] = [];

  markedDates: any[] = [];
  markedDatesFiltered: any[] = [];

  isFieldDisabled: boolean = false;

  selectedTimeSlot: any | undefined;
  selectedDate = '';
  selectedField: any | undefined;

  user: UserState | undefined;

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store, private fb: FormBuilder) {
    const currentDate = new Date();
    this.minDate = currentDate;
    this.maxDate = new Date(currentDate);
    this.maxDate.setDate(this.maxDate.getDate() + 30);

    this.scheduleForm = this.fb.group({
      selectedField: [null, Validators.required],
      selectedTimeSlot: [null, Validators.required],
      selectedUser: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.selectMarkedDates$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((markedDates) => {
        this.markedDates = markedDates;
      });

    this.selectUsersEnd$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((users) => {
        this.users = users.map((user) => ({
          name: user.full_name,
          code: user.id_platforms_user,
        }));
      });

    this.selectPlatformsFields$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((platformsFields) => {
        // Filter out fields that are present in markedFields
        this.fields = platformsFields.platforms_fields.map(
          (platformsField) => ({
            name: platformsField.title,
            code: platformsField.id_platforms_field,
          })
        );
      });

    this.selectDisabledSlots$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((slots) => {
        if (this.selectedDate) {
          const generatedSlots = generateTimeSlots(
            8,
            23,
            1.5,
            slots,
            this.selectedDate
          );
          this.disabledSlots = generatedSlots.map((slot) => ({
            name: slot,
            code: slot,
          }));
        }
      });

    this.scheduleForm
      .get('selectedField')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.onSelectedFieldChange(value);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onDateSelect(event: any): void {
    this.isFieldDisabled = false;
    this.scheduleForm.reset();
    this.selectedField = '';
    this.selectedDate = formatDateString(event);

    this.markedDatesFiltered = this.markedDates
      .filter(
        (markedDate) =>
          markedDate.active === 1 &&
          transformDateString(markedDate.start_date_time) === this.selectedDate
      )
      .map((markedDate) => markedDate.id_platforms_field);

    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.user = user;
      this.platformsId = user.id_platforms;
      this.store.dispatch(
        LandingActions.getUsers({
          id_platforms: user.id_platforms,
        })
      );
    });
    // Handle the selected date here
  }

  onSelectedFieldChange(value: any): void {
    this.isFieldDisabled = false;
    // Handle the change in selected field here
    if (value) {
      if (this.markedDatesFiltered.includes(value.code)) {
        this.isFieldDisabled = true;
      }
      this.selectedField = value;
      this.store.dispatch(
        LandingActions.getDisabledSlots({
          id_platforms_field: value.code,
          id_platform: this.user ? this.user.id_platforms : 0,
          date: this.selectedDate,
        })
      );
    } else {
      this.selectedField = '';
    }
  }

  closeDialog() {
    this.isFieldDisabled = true;
    this.selectDate = null;
    this.scheduleForm.reset();
    this.selectedDate = '';
    this.display = false;
    this.close.emit();
  }

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      this.store.dispatch(
        LandingActions.insertPlatformDateTimeSlotWeb({
          id_platforms_field: this.scheduleForm.value.selectedField.code,
          id_platforms_user: this.scheduleForm.value.selectedUser.code,
          id_platforms: this.user ? this.user.id_platforms : 0,
          platforms_date_time_start: `${this.selectedDate} ${this.scheduleForm.value.selectedTimeSlot.code}`,
          active: 1,
          validated: 0,
          start_date: this.start_date,
          end_date: this.end_date,
        })
      );
      this.closeDialog();
    } else {
      this.scheduleForm.markAllAsTouched();
    }
  }
}
