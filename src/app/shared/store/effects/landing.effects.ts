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

  updateUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.updateUserWeb),
      switchMap(({ user }) => {
        return this.landingService
          .editUser(
            user.id_platforms_user,
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
              return LandingActions.updateUserWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.updateUserWebFailure({ error }));
            })
          );
      })
    );
  });

  getDisabledSlots$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getDisabledSlots),
      switchMap(({ id_platforms_field, id_platform, date }) => {
        return this.landingService
          .getDisabledSlots(id_platforms_field, id_platform, date)
          .pipe(
            map((response) => {
              return LandingActions.getDisabledSlotsSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.getDisabledSlotsFailure({ error }));
            })
          );
      })
    );
  });

  getPlatformFieldsById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getPlatformFieldsById),
      switchMap(({ id_platform, imageDirectory, id_platforms_user }) => {
        return this.landingService
          .getPlatformFieldsById(id_platform, imageDirectory, id_platforms_user)
          .pipe(
            map((response) => {
              return LandingActions.getPlatformFieldsByIdSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.getPlatformFieldsByIdFailure({ error }));
            })
          );
      })
    );
  });

  insertPlatformDateTimeSlotWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertPlatformDateTimeSlotWeb),
      switchMap(
        ({
          id_platforms_field,
          id_platforms_user,
          id_platforms,
          platforms_date_time_start,
          active,
          validated,
          start_date,
          end_date,
        }) => {
          return this.landingService
            .insertPlatformDateTimeSlotWeb(
              id_platforms_field,
              id_platforms_user,
              id_platforms,
              platforms_date_time_start,
              active,
              validated,
              start_date,
              end_date
            )
            .pipe(
              map((response) => {
                return LandingActions.insertPlatformDateTimeSlotWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(
                  LandingActions.insertPlatformDateTimeSlotWebFailure({ error })
                );
              })
            );
        }
      )
    );
  });

  deactivatePlatformDateTimeSlotWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.deactivatePlatformDateTimeSlotWeb),
      switchMap(
        ({
          id_platforms_date_time_slot,
          id_platforms,
          start_date,
          end_date,
        }) => {
          return this.landingService
            .deactivatePlatformDateTimeSlotWeb(
              id_platforms_date_time_slot,
              id_platforms,
              start_date,
              end_date
            )
            .pipe(
              map((response) => {
                return LandingActions.deactivatePlatformDateTimeSlotWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(
                  LandingActions.deactivatePlatformDateTimeSlotWebFailure({
                    error,
                  })
                );
              })
            );
        }
      )
    );
  });

  validatePlatformDateTimeSlotWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.validatePlatformDateTimeSlotWeb),
      switchMap(
        ({
          id_platforms_date_time_slot,
          id_platforms,
          start_date,
          end_date,
        }) => {
          return this.landingService
            .validatePlatformDateTimeSlotWeb(
              id_platforms_date_time_slot,
              id_platforms,
              start_date,
              end_date
            )
            .pipe(
              map((response) => {
                return LandingActions.validatePlatformDateTimeSlotWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(
                  LandingActions.validatePlatformDateTimeSlotWebFailure({
                    error,
                  })
                );
              })
            );
        }
      )
    );
  });

  insertDisabledSlotsWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertDisabledSlotsWeb),
      switchMap(
        ({
          id_platforms_field,
          id_platforms,
          start_date_time,
          end_date_time,
          active,
          start_date,
          end_date,
        }) => {
          return this.landingService
            .insertDisabledSlotsWeb(
              id_platforms_field,
              id_platforms,
              start_date_time,
              end_date_time,
              active,
              start_date,
              end_date
            )
            .pipe(
              map((response) => {
                return LandingActions.insertDisabledSlotsWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(
                  LandingActions.insertDisabledSlotsWebFailure({ error })
                );
              })
            );
        }
      )
    );
  });

  deletePlatformDateTimeSlotWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.deletePlatformDateTimeSlotWeb),
      switchMap(
        ({
          id_platforms_disabled_date,
          id_platforms,
          start_date,
          end_date,
        }) => {
          return this.landingService
            .deletePlatformDateTimeSlotWeb(
              id_platforms_disabled_date,
              id_platforms,
              start_date,
              end_date
            )
            .pipe(
              map((response) => {
                return LandingActions.deletePlatformDateTimeSlotWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(
                  LandingActions.deletePlatformDateTimeSlotWebFailure({ error })
                );
              })
            );
        }
      )
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private landingService: LandingService
  ) {}
}
