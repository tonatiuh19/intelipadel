import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mark-days-modal',
  templateUrl: './mark-days-modal.component.html',
  styleUrl: './mark-days-modal.component.css',
})
export class MarkDaysModalComponent {
  @Input() display: boolean = false;
}
