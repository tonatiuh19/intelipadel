import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { fromLanding } from '../shared/store/selectors';
import {
  faQrcode,
  faCheckCircle,
  faTrash,
  faCalendar,
  faPlusCircle,
  faUsers,
  faNewspaper,
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
import { ReservationsModel, UserState } from '../home/home.model';
import { LandingActions } from '../shared/store/actions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locales: allLocales,
    locale: 'es',
    weekends: true,
    eventContent: (args) => {
      if (args.event.extendedProps['marked']) {
        return {
          html: `<div style="color: ${args.event.textColor}; padding: 5px; border-radius: 5px;">${args.event.title}</div>`,
        };
      }
      return { html: args.event.title.toUpperCase() };
    },
    eventClick: this.handleDateClick.bind(this), // Handle event click
    datesSet: this.handleDatesSet.bind(this),
    events: [], // Initialize with an empty array
  };

  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectReservations$ = this.store.select(
    fromLanding.selectReservations
  );
  public selectMarkedDates$ = this.store.select(fromLanding.selectMarkedDates);

  faQrcode = faQrcode;
  faCheckCircle = faCheckCircle;
  faTrash = faTrash;
  faCalendar = faCalendar;
  faPlusCircle = faPlusCircle;
  faUsers = faUsers;
  faNewspaper = faNewspaper;

  user: UserState | undefined;

  formatDate = formatDate;
  fomatTime = formatTime;
  formatDateToSpanish = formatDateToSpanish;

  selectedDateEvent!: ReservationsModel; // Store events for the selected date
  selectedDate: Date | null = null; // Store the selected date

  markedDates: any[] = [];

  displayModal: boolean = false;
  displayCancelModal: boolean = false;
  displayValidateModal: boolean = false;
  displayMarkDaysModal: boolean = false; // Control the visibility of the Mark Days modal
  displayScheduleCourtModal: boolean = false; // Control the visibility of the Schedule Court modal
  displayUsersModal: boolean = false; // Control the visibility of the Users modal
  displayAnnouncementsModal: boolean = false;
  displayMarkedDayModal: boolean = false; // Control the visibility of the Marked Day modal

  start_date: string = '';
  end_date: string = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.user = user;

      this.store.dispatch(
        LandingActions.getPlatformFieldsById({
          id_platform: user.id_platforms,
          imageDirectory: '../assets/images/carrouselImages',
          id_platforms_user: user.id_platforms_user,
        })
      );
    });

    this.selectReservations$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((reservations) => {
        const transformedEvents = transformReservations(reservations);
        this.calendarOptions.events = transformedEvents;
      });

    this.selectMarkedDates$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((markedDates) => {
        this.markedDates = markedDates;
        this.updateMarkedDates();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateMarkedDates(): void {
    const markedEvents = this.markedDates
      .filter((markedDate) => markedDate.active === 1)
      .map((markedDate) => ({
        title: markedDate.title || 'Marked Day',
        start: markedDate.start_date_time,
        end: markedDate.end_date_time,
        color: markedDate.dotColor,
        textColor: 'red',
        extendedProps: { marked: true },
      }));

    this.calendarOptions.events = [
      ...(Array.isArray(this.calendarOptions.events)
        ? this.calendarOptions.events
        : []),
      ...markedEvents,
    ];
  }

  handleDatesSet(dateInfo: any) {
    if (this.user) {
      this.start_date = this.formatDate(dateInfo.start);
      this.end_date = this.formatDate(dateInfo.end);
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

    this.selectedDate = arg.date; // Store the selected date

    if (arg.event._def.extendedProps.marked) {
      this.displayMarkedDayModal = true;
    } else {
      this.displayModal = true; // Show the modal
    }
  }

  closeMarkedDayModal() {
    this.displayMarkedDayModal = false;
  }

  confirmCancellation() {
    this.store.dispatch(
      LandingActions.deactivatePlatformDateTimeSlotWeb({
        id_platforms_date_time_slot:
          this.selectedDateEvent.id_platforms_date_time_slot,
        start_date: this.start_date,
        end_date: this.end_date,
      })
    );
    this.displayCancelModal = false;
    this.displayModal = false;
  }

  confirmValidation() {
    this.displayValidateModal = false;
    this.displayModal = false;
  }
}
