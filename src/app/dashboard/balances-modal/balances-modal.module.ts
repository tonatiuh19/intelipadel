import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalancesModalComponent } from './balances-modal.component';
import { DialogModule } from 'primeng/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [BalancesModalComponent],
  imports: [CommonModule, DialogModule, FontAwesomeModule],
  exports: [BalancesModalComponent],
})
export class BalancesModalModule {}
