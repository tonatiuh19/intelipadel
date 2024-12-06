import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../store/actions';
import { UserState } from '../../../home/home.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Input() isMain = true;

  public selectUser$ = this.store.select(fromLanding.selectUser);

  faUserCircle = faUserCircle;
  faNewspaper = faNewspaper;

  isLogged = false;
  user: UserState | undefined;

  private unsubscribe$ = new Subject<void>();

  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      console.log(user);
      if (user.id_platforms_user === 0) {
        this.isLogged = false;
        this.router.navigate(['']);
      } else {
        this.isLogged = true;
        this.user = user;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  login(): void {
    console.log('Login');
    this.router.navigate(['iniciarsesion']);
  }

  logout(): void {
    this.store.dispatch(LandingActions.resetLandingState());
    this.router.navigate(['']);
  }
}
