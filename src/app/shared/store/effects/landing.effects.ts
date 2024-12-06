import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { LandingActions } from '../actions';
import { LandingService } from '../../services/landing.service';

@Injectable()
export class LandingEffects {
  sendCodeByMailWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.sendCodeByMailWeb),
      switchMap(({ email }) => {
        return this.landingService.sendCodeByMailWeb(email).pipe(
          map((response) => {
            return LandingActions.sendCodeByMailWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(LandingActions.sendCodeByMailWebFailure({ error }));
          })
        );
      })
    );
  });

  validateSessionCodeWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.validateSessionCodeWeb),
      switchMap(({ code, email }) => {
        return this.landingService.validateSessionCodeWeb(code, email).pipe(
          map((response) => {
            return LandingActions.validateSessionCodeWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(LandingActions.validateSessionCodeWebFailure({ error }));
          })
        );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private landingService: LandingService
  ) {}
}
