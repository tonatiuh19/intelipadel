import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleCourtModalComponent } from './schedule-court-modal.component';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [ScheduleCourtModalComponent],
  imports: [CommonModule, DialogModule],
  exports: [ScheduleCourtModalComponent],
})
export class ScheduleCourtModalModule {}
