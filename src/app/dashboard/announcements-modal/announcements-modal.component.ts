import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-announcements-modal',
  templateUrl: './announcements-modal.component.html',
  styleUrl: './announcements-modal.component.css',
})
export class AnnouncementsModalComponent {
  @Input() display: boolean = false;

  @Output() close = new EventEmitter<void>();
}
