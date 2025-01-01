import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../shared/store/actions';
import { UserState } from '../../home/home.model';
import { formatDateString } from '../../shared/utils/help-functions';

@Component({
  selector: 'app-schedule-event-modal',
  templateUrl: './schedule-event-modal.component.html',
  styleUrls: ['./schedule-event-modal.component.css'],
})
export class ScheduleEventModalComponent implements OnInit, OnDestroy {
  @Input() display: boolean = false;

  @Input() start_date: string = '';

  @Input() end_date: string = '';

  @Output() close = new EventEmitter<void>();

  selectDate: string | null = null;
  selectedDate = '';
  selectedField: any | undefined;

  platformsId: number = 0;

  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectPlatformsFields$ = this.store.select(
    fromLanding.selectPlatformsFields
  );
  public selectMarkedDates$ = this.store.select(fromLanding.selectMarkedDates);
  public selectReservations$ = this.store.select(
    fromLanding.selectReservations
  );

  markDaysForm!: FormGroup;

  faTrophy = faTrophy;

  minDate!: Date;
  maxDate!: Date;

  options = [
    { name: 'Todo el dia', value: 1 },
    { name: 'Horario Especifico', value: 2 },
  ];

  user: UserState | undefined;
  markedDates: any[] = [];
  reservations: any[] = [];
  fields: any[] = [];

  isFieldDisabled: boolean = false;

  timeSlots: any[] = [];
  filteredEndTimeSlots: any[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    const currentDate = new Date();
    this.minDate = currentDate;
    this.maxDate = new Date(currentDate);
    this.maxDate.setDate(this.maxDate.getDate() + 30);

    this.markDaysForm = this.fb.group({
      selectedField: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      price: [null, Validators.required],
    });

    this.generateTimeSlots();
  }

  ngOnInit() {
    this.markDaysForm
      .get('selectedField')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.onSelectedFieldChange(value);
      });

    this.markDaysForm
      .get('startTime')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.onStartTimeChange(value);
      });

    this.selectPlatformsFields$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((platformsFields) => {
        this.fields = platformsFields.platforms_fields.map(
          (platformsField) => ({
            name: platformsField.title,
            code: platformsField.id_platforms_field,
          })
        );
      });

    this.selectMarkedDates$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((markedDates) => {
        this.markedDates = markedDates;
      });

    this.selectReservations$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reservations) => {
        this.reservations = reservations;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  generateTimeSlots() {
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0);
    const endTime = new Date();
    endTime.setHours(23, 0, 0, 0);

    while (startTime <= endTime) {
      this.timeSlots.push({
        label: startTime.toTimeString().substring(0, 5),
        value: startTime.toTimeString().substring(0, 5),
      });
      startTime.setMinutes(startTime.getMinutes() + 90);
    }
  }

  onSelectedFieldChange(event: any): void {
    this.isFieldDisabled = false;
    const selectedField = this.markDaysForm.get('selectedField')?.value;
    if (
      selectedField &&
      (this.markedDates.some(
        (date) =>
          date.start_date_time.startsWith(this.selectedDate) &&
          date.id_platforms_field === selectedField.code
      ) ||
        this.reservations.some(
          (reservation) =>
            reservation.platforms_date_time_start.startsWith(
              this.selectedDate
            ) && reservation.id_platforms_field === selectedField.code
        ))
    ) {
      this.isFieldDisabled = true;
    }

    this.selectedField = event;
  }

  onStartTimeChange(value: any): void {
    if (value) {
      this.filteredEndTimeSlots = this.timeSlots.filter(
        (slot) => slot.value > value.value
      );
    }
    this.markDaysForm.get('endTime')?.reset();
  }

  onDateSelect(event: any): void {
    this.isFieldDisabled = true;
    this.markDaysForm.reset();
    this.selectedField = '';
    this.selectedDate = formatDateString(event);

    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.user = user;
      this.platformsId = user.id_platforms;
    });
  }

  closeDialog() {
    this.isFieldDisabled = true;
    this.selectDate = null;
    this.markDaysForm.reset();
    this.selectedDate = '';
    this.display = false;
    this.close.emit();
  }

  onSubmit(): void {
    if (this.markDaysForm.valid) {
      const date = this.selectedDate;
      const startTime = `${date} ${this.markDaysForm.value.startTime.value}:00`;
      const endTime = `${date} ${this.markDaysForm.value.endTime.value}:00`;

      this.store.dispatch(
        LandingActions.insertEventDisabledSlotsWeb({
          id_platforms_field: this.markDaysForm.value.selectedField.code,
          id_platforms: this.platformsId,
          start_date_time: this.markDaysForm.value.startTime
            ? this.selectedDate + ' ' + this.markDaysForm.value.startTime.value
            : this.selectedDate + ' ' + '00:00',
          end_date_time: this.markDaysForm.value.endTime
            ? this.selectedDate + ' ' + this.markDaysForm.value.endTime.value
            : this.selectedDate + ' ' + '23:59',
          active: 3,
          start_date: this.start_date,
          end_date: this.end_date,
          price: this.markDaysForm.value.price,
          platforms_fields_price_start_time: startTime,
          platforms_fields_price_end_time: endTime,
        })
      );
      this.closeDialog();
    } else {
      this.markDaysForm.markAllAsTouched();
    }
  }
}
