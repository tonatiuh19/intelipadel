import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkDaysModalComponent } from './mark-days-modal.component';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MarkDaysModalComponent],
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    DropdownModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    CalendarModule,
  ],
  exports: [MarkDaysModalComponent],
})
export class MarkDaysModalModule {}
