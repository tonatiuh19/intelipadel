import { Component, Input, OnInit } from '@angular/core';
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
} from '../../shared/utils/help-functions';

@Component({
  selector: 'app-schedule-court-modal',
  templateUrl: './schedule-court-modal.component.html',
  styleUrl: './schedule-court-modal.component.css',
})
export class ScheduleCourtModalComponent implements OnInit {
  @Input() display: boolean = false;

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

  markedDates = {} as any;

  cities: any[] | undefined;

  selectedCity: any | undefined;
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
      selectedCity: [null, Validators.required],
      selectedUser: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
    this.selectMarkedDates$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((markedDates) => {
        console.log('markedDates:', markedDates);
        this.markedDates = markedDates;
      });

    this.selectUsersEnd$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((users) => {
        console.log(users);
        this.users = users.map((user) => ({
          name: user.full_name,
          code: user.id_platforms_user,
        }));
      });

    this.selectPlatformsFields$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((platformsFields) => {
        console.log('platformsFields', platformsFields);
        this.fields = platformsFields.platforms_fields.map(
          (platformsFields) => ({
            name: platformsFields.title,
            code: platformsFields.id_platforms_field,
          })
        );
      });

    this.selectDisabledSlots$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((slots) => {
        console.log('Disabled Slots', slots);
        //if (slots && slots.length !== 0) {
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
        //}
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

  getDateStyle(date: any): any {
    const dateString = `${date.year}-${('0' + (date.month + 1)).slice(-2)}-${(
      '0' + date.day
    ).slice(-2)}`;
    if (this.markedDates[dateString] && this.markedDates[dateString].marked) {
      return {
        'background-color': this.markedDates[dateString].dotColor,
        'border-radius': '50%',
        width: '2em',
        height: '2em',
        display: 'inline-block',
        'line-height': '2em',
        'text-align': 'center',
        color: 'white',
      };
    }
    return {};
  }

  onDateSelect(event: any): void {
    console.log('Selected date:', formatDateString(event));
    this.scheduleForm.reset();
    this.selectedField = '';
    this.selectedDate = formatDateString(event);
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
    console.log('Selected field changed:', value);
    // Handle the change in selected field here
    if (value) {
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
    this.scheduleForm.reset();
    this.selectedDate = '';
    this.display = false;
  }

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      console.log('Form Submitted', this.scheduleForm.value);
    } else {
      this.scheduleForm.markAllAsTouched();
    }
  }
}
