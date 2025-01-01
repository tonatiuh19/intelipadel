import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricesModalComponent } from './prices-modal.component';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PricesModalComponent],
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  exports: [PricesModalComponent],
})
export class PricesModalModule {}
