import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleCourtModalComponent } from './schedule-court-modal.component';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ScheduleCourtModalComponent],
  imports: [
    CommonModule,
    DialogModule,
    CalendarModule,
    FormsModule,
    DropdownModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  exports: [ScheduleCourtModalComponent],
})
export class ScheduleCourtModalModule {}
