import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersEventTableComponent } from './users-event-table.component';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [UsersEventTableComponent],
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  exports: [UsersEventTableComponent],
})
export class UsersEventTableModule {}
