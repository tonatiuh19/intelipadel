import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdsModalComponent } from './ads-modal.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [AdsModalComponent],
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    TableModule,
  ],
  exports: [AdsModalComponent],
})
export class AdsModalModule {}