import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersModalComponent } from './users-modal.component';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [UsersModalComponent],
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    AccordionModule,
  ],
  exports: [UsersModalComponent],
})
export class UsersModalModule {}
