import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() isMain = true;

  faUserCircle = faUserCircle;
  faNewspaper = faNewspaper;

  constructor(private router: Router) {}

  login(): void {
    console.log('Login');
    this.router.navigate(['iniciarsesion']);
  }
}
