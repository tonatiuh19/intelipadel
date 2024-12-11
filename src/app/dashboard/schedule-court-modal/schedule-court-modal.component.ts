import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-schedule-court-modal',
  templateUrl: './schedule-court-modal.component.html',
  styleUrl: './schedule-court-modal.component.css',
})
export class ScheduleCourtModalComponent {
  @Input() display: boolean = false;
}
