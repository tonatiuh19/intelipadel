import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { fromLanding } from '../shared/store/selectors';
import { LandingActions } from '../shared/store/actions';
import { FullUserInfoModel } from '../home/home.model';

@Component({
  selector: 'app-deactivate-account',
  templateUrl: './deactivate-account.component.html',
  styleUrl: './deactivate-account.component.css',
})
export class DeactivateAccountComponent implements OnInit {
  public selectUserFullInfo$ = this.store.select(
    fromLanding.selectUserFullInfo
  );

  public selectIsAccountDeactivated$ = this.store.select(
    fromLanding.selectIsAccountDeactivated
  );

  whyForm!: FormGroup;

  lastSegment: string | null = null;
  idPlatforms = 0;
  idUser = 0;
  titlePlatform = '';

  isUserValid = true;

  userInformation!: FullUserInfoModel;

  isDeactivated = false;

  motivations = [
    { id: 1, name: 'No uso la cuenta' },
    { id: 2, name: 'Problemas técnicos' },
    { id: 3, name: 'Precios altos' },
    { id: 4, name: 'Encontré una mejor alternativa' },
    { id: 5, name: 'Otro' },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.whyForm = this.fb.group({
      motivation: ['', Validators.required],
      confirmDeactivation: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.lastSegment = params.get('id');

      this.idUser = parseInt(this.lastSegment ?? '0');
      if (this.idUser === 0) {
        this.router.navigate(['']);
      }
      console.log('ID User:', this.idUser);
      this.store.dispatch(
        LandingActions.getUserFullInfoByIdWeb({
          id_platforms_user: this.idUser,
        })
      );
    });

    this.selectUserFullInfo$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((userInfo) => {
        if (userInfo && userInfo.id_platforms_user > 0) {
          this.userInformation = userInfo;
        }
      });

    this.selectIsAccountDeactivated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAccountDeactivated) => {
        console.log('isAccountDeactivated:', isAccountDeactivated);
        if (isAccountDeactivated) {
          this.isDeactivated = isAccountDeactivated;
          this.whyForm.reset();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(): void {
    if (this.whyForm.valid) {
      console.log('Form Submitted', this.whyForm.value);
      // Handle form submission logic here
      this.store.dispatch(
        LandingActions.deactivateUserWeb({
          id_platforms_user: this.idUser,
          motivation: this.whyForm.value.motivation,
        })
      );
    }
  }

  resetForm(): void {
    this.whyForm.reset();
    this.store.dispatch(LandingActions.resetDeactivateUserWeb());
    this.isDeactivated = false;
    this.router.navigate(['']);
  }
}
