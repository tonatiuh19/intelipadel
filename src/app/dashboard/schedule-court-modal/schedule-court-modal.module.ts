import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleCourtModalComponent } from './schedule-court-modal.component';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ScheduleCourtModalComponent],
  imports: [CommonModule, DialogModule, CalendarModule, FormsModule],
  exports: [ScheduleCourtModalComponent],
})
export class ScheduleCourtModalModule {}
