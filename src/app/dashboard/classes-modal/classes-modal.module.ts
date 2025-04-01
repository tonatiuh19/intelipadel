import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassesModalComponent } from './classes-modal.component';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [ClassesModalComponent],
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    DropdownModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    CalendarModule,
  ],
  exports: [ClassesModalComponent],
})
export class ClassesModalModule {}
