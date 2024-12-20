import { Component } from '@angular/core';
import {
  faCalendar,
  faKey,
  faUsers,
  faDesktop,
  faBullhorn,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  faCalendar = faCalendar;
  faKey = faKey;
  faUsers = faUsers;
  faDesktop = faDesktop;
  faBullhorn = faBullhorn;
}
