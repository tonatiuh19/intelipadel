import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { fromLanding } from '../shared/store/selectors';
import {
  faQrcode,
  faCheckCircle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // Import timeGrid plugin
import interactionPlugin from '@fullcalendar/interaction'; // for event dragging and resizing
import allLocales from '@fullcalendar/core/locales-all';
import {
  formatDate,
  transformReservations,
  formatTime,
  formatDateToSpanish,
} from '../../../src/app/shared/utils/help-functions';
import { ReservationsState, UserState } from '../home/home.model';
import { LandingActions } from '../shared/store/actions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locales: allLocales,
    locale: 'es',
    weekends: false,
    events: [],
    eventContent: (args) => {
      return { html: args.event.title.toUpperCase() };
    },
    eventChange: this.handleEventChange.bind(this), // Bind the callback
    eventClick: this.handleDateClick.bind(this), // Handle event click
    select: this.handleSelect.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    //dateClick: this.handleDateClick.bind(this),
  };

  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectReservations$ = this.store.select(
    fromLanding.selectReservations
  );

  faQrcode = faQrcode;
  faCheckCircle = faCheckCircle;
  faTrash = faTrash;

  user: UserState | undefined;

  formatDate = formatDate;
  fomatTime = formatTime;
  formatDateToSpanish = formatDateToSpanish;

  selectedDateEvent!: ReservationsState; // Store events for the selected date
  selectedDate: Date | null = null; // Store the selected date

  displayModal: boolean = false;
  displayCancelModal: boolean = false;
  displayValidateModal: boolean = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.user = user;
    });

    this.selectReservations$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reservations) => {
        console.log('Reservations:', reservations);
        const transformedEvents = transformReservations(reservations);
        console.log('Transformed events:', transformedEvents);
        this.calendarOptions.events = transformedEvents;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  handleEventChange(eventChangeInfo: any) {
    console.log('Event changed:', eventChangeInfo.event);
    // Handle the event change logic here
  }

  handleEventClick(arg: any) {
    console.log('Event clicked:', arg.event);
    // Handle the event click logic here
  }

  handleSelect(selectionInfo: any) {
    console.log(
      'Date selected:',
      selectionInfo.startStr,
      'to',
      selectionInfo.endStr
    );
    // Handle the date selection logic here
  }

  handleDatesSet(dateInfo: any) {
    if (this.user) {
      this.store.dispatch(
        LandingActions.getDateTimeSlotsByIdPlatformsAndDates({
          id_platforms: this.user.id_platforms,
          start_date: this.formatDate(dateInfo.start),
          end_date: this.formatDate(dateInfo.end),
        })
      );
    }
  }

  handleDateClick(arg: any) {
    this.selectedDateEvent = arg.event._def.extendedProps;
    console.log('Date clicked:', this.selectedDateEvent);

    this.selectedDate = arg.date; // Store the selected date
    this.displayModal = true; // Show the modal
  }

  confirmCancellation() {
    // Handle the cancellation logic here
    console.log('Reservation cancelled:', this.selectedDateEvent);
    this.displayCancelModal = false;
    this.displayModal = false;
  }

  confirmValidation() {
    // Handle the validation logic here
    console.log('Reservation validated:', this.selectedDateEvent);
    this.displayValidateModal = false;
    this.displayModal = false;
  }
}
