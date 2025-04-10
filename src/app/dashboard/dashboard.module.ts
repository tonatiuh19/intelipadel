import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { HeaderModule } from '../shared/components/header/header.module';
import { FooterModule } from '../shared/components/footer/footer.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DialogModule } from 'primeng/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MarkDaysModalModule } from './mark-days-modal/mark-days-modal.module';
import { ScheduleCourtModalModule } from './schedule-court-modal/schedule-court-modal.module';
import { UsersModalModule } from './users-modal/users-modal.module';
import { ScheduleEventModalModule } from './schedule-event-modal/schedule-event-modal.module';
import { AdsModalModule } from './ads-modal/ads-modal.module';
import { UsersEventTableModule } from './users-event-table/users-event-table.module';
import { PricesModalModule } from './prices-modal/prices-modal.module';
import { TooltipModule } from 'primeng/tooltip';
import { BalancesModalModule } from './balances-modal/balances-modal.module';
import { ClassesModalModule } from './classes-modal/classes-modal.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    HeaderModule,
    FooterModule,
    FontAwesomeModule,
    FullCalendarModule,
    DialogModule,
    BrowserAnimationsModule,
    MarkDaysModalModule,
    ScheduleCourtModalModule,
    UsersModalModule,
    ScheduleEventModalModule,
    AdsModalModule,
    PricesModalModule,
    UsersEventTableModule,
    TooltipModule,
    BalancesModalModule,
    ClassesModalModule,
  ],
  exports: [DashboardComponent],
})
export class DashboardModule {}
