import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule-court-modal',
  templateUrl: './schedule-court-modal.component.html',
  styleUrl: './schedule-court-modal.component.css',
})
export class ScheduleCourtModalComponent implements OnInit {
  @Input() display: boolean = false;

  selectedDate: Date | null = null;
  minDate!: Date;

  markedDates = {
    '2024-11-27': {
      marked: true,
      dotColor: 'red',
      activeOpacity: 0,
      id_platforms_disabled_date: 1,
      start_date_time: '2024-11-27 16:00:00',
      end_date_time: '2024-11-27 16:00:00',
      active: 1,
    },
    '2024-11-18': {
      marked: true,
      dotColor: 'blue',
      activeOpacity: 0,
      id_platforms_disabled_date: 2,
      start_date_time: '2024-11-18 11:00:00',
      end_date_time: '2024-11-18 23:00:00',
      active: 2,
    },
    '2024-12-02': {
      marked: true,
      dotColor: 'blue',
      activeOpacity: 0,
      id_platforms_disabled_date: 4,
      start_date_time: '2024-12-02 21:30:00',
      end_date_time: '2024-12-02 23:30:00',
      active: 2,
    },
  } as any;

  ngOnInit(): void {
    this.minDate = new Date();
  }

  getDateStyle(date: any): any {
    const dateString = `${date.year}-${('0' + (date.month + 1)).slice(-2)}-${(
      '0' + date.day
    ).slice(-2)}`;
    if (this.markedDates[dateString] && this.markedDates[dateString].marked) {
      return {
        'background-color': this.markedDates[dateString].dotColor,
        'border-radius': '50%',
        width: '2em',
        height: '2em',
        display: 'inline-block',
        'line-height': '2em',
        'text-align': 'center',
        color: 'white',
      };
    }
    return {};
  }

  onDateSelect(event: any): void {
    console.log('Selected date:', event);
    // Handle the selected date here
  }

  closeDialog() {
    this.display = false;
  }
}
