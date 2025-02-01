import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../store/actions';
import { UserState } from '../../../home/home.model';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Input() isMain = true;
  @Input() isNeutral = false;

  public selectUser$ = this.store.select(fromLanding.selectUser);

  faUserCircle = faUserCircle;
  faNewspaper = faNewspaper;

  isLogged = false;
  user: UserState | undefined;

  titlePage = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private store: Store,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      if (user.id_platforms_user === 0 && !this.isNeutral) {
        this.isLogged = false;
        this.router.navigate(['']);
      } else if (this.isNeutral) {
        this.isLogged = false;
      } else {
        this.isLogged = true;
        this.user = user;
        this.titlePage = user.title;
        this.titleService.setTitle(this.titlePage);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  login(): void {
    this.router.navigate(['iniciarsesion']);
  }

  logout(): void {
    this.store.dispatch(LandingActions.resetLandingState());
    this.router.navigate(['']);
  }

  goToMyDashboard(): void {
    this.router.navigate(['dashboard']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.getElementById('navbar');
    const logo = document.getElementById('logo') as HTMLImageElement;
    const targetElement = document.getElementById('target-element');
    const changeableButtons = document.querySelectorAll('.changeable-button');

    if (this.isMain) {
      if (navbar && targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top;
        const navbarHeight = navbar.offsetHeight;

        if (targetPosition <= navbarHeight) {
          navbar.classList.add('bg-light');
          if (logo) {
            logo.src =
              'https://garbrix.com/intelipadel/assets/images/logo_intelipadel.png'; // Change to default logo
          }
          changeableButtons.forEach((button) => {
            button.classList.remove('btn-outline-light');
            button.classList.add('btn-outline-dark');
          });
        } else {
          navbar.classList.remove('bg-light');
          if (logo) {
            logo.src =
              'https://garbrix.com/intelipadel/assets/images/logo-intelipdale-white.png'; // Change to light logo
          }
          changeableButtons.forEach((button) => {
            button.classList.remove('btn-outline-dark');
            button.classList.add('btn-outline-light');
          });
        }
      }
    } else {
      if (navbar) {
        navbar.classList.add('bg-light');
        if (logo) {
          logo.src =
            'https://garbrix.com/intelipadel/assets/images/logo_intelipadel.png'; // Change to default logo
        }
        changeableButtons.forEach((button) => {
          button.classList.remove('btn-outline-light');
          button.classList.add('btn-outline-dark');
        });
      }
    }
  }
}
