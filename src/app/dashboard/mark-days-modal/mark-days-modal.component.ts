import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { UserState } from '../../home/home.model';
import { formatDateString } from '../../shared/utils/help-functions';

@Component({
  selector: 'app-mark-days-modal',
  templateUrl: './mark-days-modal.component.html',
  styleUrl: './mark-days-modal.component.css',
})
export class MarkDaysModalComponent {
  @Input() display: boolean = false;

  @Input() start_date: string = '';

  @Input() end_date: string = '';

  selectDate: string | null = null;
  selectedDate = '';
  selectedField: any | undefined;

  selectedOption: number = 0;
  platformsId: number = 0;

  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectPlatformsFields$ = this.store.select(
    fromLanding.selectPlatformsFields
  );

  markDaysForm!: FormGroup;

  faClock = faClock;

  minDate!: Date;
  maxDate!: Date;

  options = [
    { name: 'Todo el dia', value: 1 },
    { name: 'Horario Especifico', value: 2 },
  ];

  user: UserState | undefined;
  fields: any[] = [];

  isFieldDisabled: boolean = false;

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store, private fb: FormBuilder) {
    const currentDate = new Date();
    this.minDate = currentDate;
    this.maxDate = new Date(currentDate);
    this.maxDate.setDate(this.maxDate.getDate() + 30);

    this.markDaysForm = this.fb.group({
      selectedField: [null, Validators.required],
      selectedOption: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.markDaysForm
      .get('selectedOption')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.onSelectedOptionChange(value);
      });

    this.markDaysForm
      .get('selectedField')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.onSelectedFieldChange(value);
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
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSelectedOptionChange(value: any): void {
    console.log('Selected option:', value);
    this.isFieldDisabled = false;
  }

  onSelectedFieldChange(event: any): void {
    this.isFieldDisabled = false;
    console.log('Selected field:', event);
    // Handle the selected date here
  }

  onDateSelect(event: any): void {
    this.isFieldDisabled = false;
    this.markDaysForm.reset();
    this.selectedField = '';
    this.selectedDate = formatDateString(event);

    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.user = user;
      this.platformsId = user.id_platforms;
    });
    // Handle the selected date here
  }

  closeDialog() {
    this.markDaysForm.reset();
    this.selectedDate = '';
    this.display = false;
  }

  onSubmit(): void {
    if (this.markDaysForm.valid) {
      console.log('Form Submitted', this.markDaysForm.value, this.selectDate);
      this.closeDialog();
    } else {
      this.markDaysForm.markAllAsTouched();
    }
  }
}
