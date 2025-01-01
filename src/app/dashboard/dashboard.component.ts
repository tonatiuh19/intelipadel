import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  faCheck,
  faTrophy,
  faDollarSign,
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
          html: `<div style="color: ${args.event.textColor}; border-radius: 5px;">${args.event.title}</div>`,
        };
      }
      if (args.event.extendedProps['markedScheduled']) {
        return {
          html: `<div style="color: ${args.event.textColor}; border-radius: 5px;">${args.event.title}</div>`,
        };
      }
      if (args.event.extendedProps['validated'] === 1) {
        return {
          html: `<div style="color: green;">${args.event.title}</div>`,
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
  faCheck = faCheck;
  faTrophy = faTrophy;
  faDollarSign = faDollarSign;

  user: UserState | undefined;

  formatDate = formatDate;
  fomatTime = formatTime;
  formatDateToSpanish = formatDateToSpanish;

  selectedDateEvent!: ReservationsModel; // Store events for the selected date
  selectedDate: Date | null = null; // Store the selected date
  reservationValidate: boolean = false;

  markedDates: any[] = [];

  displayModal: boolean = false;
  displayCancelModal: boolean = false;
  displayValidateModal: boolean = false;
  displayMarkDaysModal: boolean = false; // Control the visibility of the Mark Days modal
  displayScheduleCourtModal: boolean = false; // Control the visibility of the Schedule Court modal
  displayScheduleEventModal: boolean = false; // Control the visibility of the Schedule Event modal
  displayUsersModal: boolean = false; // Control the visibility of the Users modal
  displayPricesModal: boolean = false;
  displayAnnouncementsModal: boolean = false;
  displayMarkedDayModal: boolean = false; // Control the visibility of the Marked Day modal
  displayDeleteConfirmModal: boolean = false;

  start_date: string = '';
  end_date: string = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private cdr: ChangeDetectorRef
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
        console.log(this.markedDates);
        this.updateMarkedDates();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  closeModal(modalType: string): void {
    switch (modalType) {
      case 'markDays':
        this.displayMarkDaysModal = false;
        break;
      case 'scheduleCourt':
        this.displayScheduleCourtModal = false;
        break;
      case 'scheduleEvent':
        this.displayScheduleEventModal = false;
        break;
      case 'users':
        this.displayUsersModal = false;
        break;
      case 'prices':
        this.displayPricesModal = false;
        break;
      case 'announcements':
        this.displayAnnouncementsModal = false;
        break;
      case 'deleteConfirm':
        this.displayDeleteConfirmModal = false;
        break;
    }
    this.cdr.detectChanges();
  }

  updateMarkedDates(): void {
    const markedEvents = this.markedDates
      .filter((markedDate) => markedDate.active === 1)
      .map((markedDate) => ({
        title: `${markedDate.title}: Deshabilitada` || 'Marked Day',
        start: markedDate.start_date_time,
        end: markedDate.end_date_time,
        color: markedDate.dotColor,
        textColor: 'red',
        extendedProps: {
          marked: true,
          id_platforms_date_time_slot: markedDate.id_platforms_disabled_date,
          active: 1,
        },
      }));

    const markedScheduledRange = this.markedDates
      .filter((markedDate) => markedDate.active === 2)
      .map((markedDate) => ({
        title: `${markedDate.title}: Rango` || 'Marked Day',
        start: markedDate.start_date_time,
        end: markedDate.end_date_time,
        color: markedDate.dotColor,
        textColor: 'blue',
        extendedProps: {
          markedScheduled: true,
          id_platforms_date_time_slot: markedDate.id_platforms_disabled_date,
          start: markedDate.start_date_time,
          end: markedDate.end_date_time,
          active: 2,
        },
      }));

    const markedScheduledEvents = this.markedDates
      .filter((markedDate) => markedDate.active === 3)
      .map((markedDate) => ({
        title: `${markedDate.title}: Evento` || 'Marked Day',
        start: markedDate.start_date_time,
        end: markedDate.end_date_time,
        color: markedDate.dotColor,
        textColor: 'blue',
        extendedProps: {
          markedScheduled: true,
          id_platforms_date_time_slot: markedDate.id_platforms_disabled_date,
          start: markedDate.start_date_time,
          end: markedDate.end_date_time,
          active: 3,
        },
      }));

    this.calendarOptions.events = [
      ...(Array.isArray(this.calendarOptions.events)
        ? this.calendarOptions.events
        : []),
      ...markedEvents,
      ...markedScheduledEvents,
      ...markedScheduledRange,
    ];
    this.cdr.detectChanges(); // Trigger change detection
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
      this.cdr.detectChanges(); // Trigger change detection
    }
  }

  handleDateClick(arg: any) {
    console.log(arg);
    this.selectedDateEvent = arg.event._def.extendedProps;
    this.reservationValidate = this.selectedDateEvent.validated === 1;

    this.selectedDate = arg.date; // Store the selected date

    if (arg.event._def.extendedProps.marked) {
      this.displayMarkedDayModal = true;
    } else if (arg.event._def.extendedProps.markedScheduled) {
      this.displayMarkedDayModal = true; // Show the modal
    } else {
      this.displayModal = true; // Show the modal
    }
    this.cdr.detectChanges(); // Trigger change detection
  }

  closeMarkedDayModal() {
    this.displayMarkedDayModal = false;
    this.cdr.detectChanges(); // Trigger change detection
  }

  confirmCancellation() {
    this.store.dispatch(
      LandingActions.deactivatePlatformDateTimeSlotWeb({
        id_platforms_date_time_slot:
          this.selectedDateEvent.id_platforms_date_time_slot,
        id_platforms: this.user?.id_platforms ?? 0,
        start_date: this.start_date,
        end_date: this.end_date,
      })
    );
    this.displayCancelModal = false;
    this.displayModal = false;
    this.cdr.detectChanges(); // Trigger change detection
  }

  confirmValidation() {
    this.store.dispatch(
      LandingActions.validatePlatformDateTimeSlotWeb({
        id_platforms_date_time_slot:
          this.selectedDateEvent.id_platforms_date_time_slot,
        id_platforms: this.user?.id_platforms ?? 0,
        start_date: this.start_date,
        end_date: this.end_date,
      })
    );
    this.displayValidateModal = false;
    this.displayModal = false;
    this.cdr.detectChanges(); // Trigger change detection
  }

  openDeleteConfirmModal(): void {
    this.displayDeleteConfirmModal = true;
    this.cdr.detectChanges(); // Trigger change detection
  }

  closeDeleteConfirmModal(): void {
    this.displayDeleteConfirmModal = false;
    this.cdr.detectChanges(); // Trigger change detection
  }

  deleteMarkedEvent(id_platforms_disabled_date: number) {
    this.store.dispatch(
      LandingActions.deletePlatformDateTimeSlotWeb({
        id_platforms_disabled_date: id_platforms_disabled_date,
        id_platforms: this.user?.id_platforms ?? 0,
        start_date: this.start_date,
        end_date: this.end_date,
      })
    );
    this.displayMarkedDayModal = false;
    this.displayDeleteConfirmModal = false;
    this.cdr.detectChanges(); // Trigger change detection
  }
}
