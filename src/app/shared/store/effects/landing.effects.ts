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

  getDateTimeSlotsByIdPlatformsAndDates$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getDateTimeSlotsByIdPlatformsAndDates),
      switchMap(({ id_platforms, start_date, end_date }) => {
        return this.landingService
          .getDateTimeSlotsByIdPlatformsAndDates(
            id_platforms,
            start_date,
            end_date
          )
          .pipe(
            map((response) => {
              return LandingActions.getDateTimeSlotsByIdPlatformsAndDatesSuccess(
                {
                  response,
                }
              );
            }),
            catchError((error) => {
              return of(
                LandingActions.getDateTimeSlotsByIdPlatformsAndDatesFailure({
                  error,
                })
              );
            })
          );
      })
    );
  });

  getUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getUsers),
      switchMap(({ id_platforms }) => {
        return this.landingService.getUsers(id_platforms).pipe(
          map((response) => {
            return LandingActions.getUsersSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(
              LandingActions.getUsersFailure({
                error,
              })
            );
          })
        );
      })
    );
  });

  insertUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertUserWeb),
      switchMap(({ user }) => {
        return this.landingService
          .insertUser(
            user.full_name,
            user.age,
            user.date_of_birth,
            user.email,
            user.phone_number,
            user.phone_number_code,
            user.type,
            user.id_platforms
          )
          .pipe(
            map((response) => {
              return LandingActions.insertUserWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.insertUserWebFailure({ error }));
            })
          );
      })
    );
  });

  deleteUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.deleteUserWeb),
      switchMap(({ id_platforms_user, id_platforms }) => {
        return this.landingService
          .deleteUser(id_platforms_user, id_platforms)
          .pipe(
            map((response) => {
              return LandingActions.deleteUserWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.deleteUserWebFailure({ error }));
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
