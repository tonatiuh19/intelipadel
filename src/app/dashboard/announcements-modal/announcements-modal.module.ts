import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementsModalComponent } from './announcements-modal.component';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [AnnouncementsModalComponent],
  imports: [CommonModule, DialogModule],
  exports: [AnnouncementsModalComponent],
})
export class AnnouncementsModalModule {}
