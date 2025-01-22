import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  faCalendar,
  faKey,
  faUsers,
  faDesktop,
  faBullhorn,
  faHeadset,
  faEnvelope,
  faTrophy,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { LandingActions } from '../shared/store/actions';
import { fromLanding } from '../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  public selectIsContactSent$ = this.store.select(
    fromLanding.selectIsContactSent
  );

  faCalendar = faCalendar;
  faKey = faKey;
  faUsers = faUsers;
  faDesktop = faDesktop;
  faBullhorn = faBullhorn;
  faHeadset = faHeadset;
  faEnvelope = faEnvelope;
  faTrophy = faTrophy;
  faArrowRight = faArrowRight;

  showContactForm: boolean = false;
  contactForm: FormGroup;

  isContactSent: boolean = true;
  isMobile: boolean = false;

  private unsubscribe$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      message: [''],
    });
  }

  ngOnInit(): void {
    this.selectIsContactSent$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isContactSent) => {
        console.log('isContactSent', isContactSent);
        this.isContactSent = isContactSent ?? false;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkIfMobile();
  }

  checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 576;
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Formulario de Contacto Enviado', this.contactForm.value);
      this.store.dispatch(
        LandingActions.insertContactWeb({
          id_platforms: 0,
          name: this.contactForm.value.name,
          email: this.contactForm.value.email,
          phone: this.contactForm.value.phone,
          message: this.contactForm.value.message,
        })
      );

      this.contactForm.reset();
      this.isContactSent = true;
    }
    this.contactForm.markAllAsTouched();
  }
}
