import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkDaysModalComponent } from './mark-days-modal.component';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [MarkDaysModalComponent],
  imports: [CommonModule, DialogModule],
  exports: [MarkDaysModalComponent],
})
export class MarkDaysModalModule {}
