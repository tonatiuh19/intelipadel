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

  insertContactWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertContactWeb),
      switchMap(({ id_platforms, name, email, phone, message }) => {
        return this.landingService
          .insertContactWeb(id_platforms, name, email, phone, message)
          .pipe(
            map((response) => {
              return LandingActions.insertContactWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.insertContactWebFailure({ error }));
            })
          );
      })
    );
  });

  getAdsByIdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getAdsByIdWeb),
      switchMap(({ id_platform }) => {
        return this.landingService.getAdsByIdWeb(id_platform).pipe(
          map((response) => {
            return LandingActions.getAdsByIdWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(LandingActions.getAdsByIdWebFailure({ error }));
          })
        );
      })
    );
  });

  insertAdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertAdWeb),
      switchMap(
        ({ id_platform, platforms_ad_title, active, platforms_ad_image }) => {
          return this.landingService
            .insertAdWeb(
              id_platform,
              platforms_ad_title,
              active,
              platforms_ad_image
            )
            .pipe(
              map((response) => {
                return LandingActions.insertAdWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(LandingActions.insertAdWebFailure({ error }));
              })
            );
        }
      )
    );
  });

  updateAdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.updateAdWeb),
      switchMap(
        ({
          id_platforms_ad,
          platforms_ad_title,
          active,
          platforms_ad_image,
        }) => {
          return this.landingService
            .updateAdWeb(
              id_platforms_ad,
              platforms_ad_title,
              active,
              platforms_ad_image
            )
            .pipe(
              map((response) => {
                return LandingActions.updateAdWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(LandingActions.updateAdWebFailure({ error }));
              })
            );
        }
      )
    );
  });

  deleteAdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.deleteAdWeb),
      switchMap(({ id_platforms_ad, active }) => {
        return this.landingService.deleteAdWeb(id_platforms_ad, active).pipe(
          map((response) => {
            return LandingActions.deleteAdWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(LandingActions.deleteAdWebFailure({ error }));
          })
        );
      })
    );
  });

  getPricesByIdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getPricesByIdWeb),
      switchMap(({ id_platforms }) => {
        return this.landingService.getPricesByIdWeb(id_platforms).pipe(
          map((response) => {
            return LandingActions.getPricesByIdWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(LandingActions.getPricesByIdWebFailure({ error }));
          })
        );
      })
    );
  });

  updatePriceByIdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.updatePriceByIdWeb),
      switchMap(({ id_platforms_fields_price, active }) => {
        return this.landingService
          .updatePriceByIdWeb(id_platforms_fields_price, active)
          .pipe(
            map((response) => {
              return LandingActions.updatePriceByIdWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.updatePriceByIdWebFailure({ error }));
            })
          );
      })
    );
  });

  insertPriceWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertPriceWeb),
      switchMap(
        ({
          id_platforms,
          price,
          platforms_fields_price_start_time,
          platforms_fields_price_end_time,
          active,
        }) => {
          return this.landingService
            .insertPriceWeb(
              id_platforms,
              price,
              platforms_fields_price_start_time,
              platforms_fields_price_end_time,
              active
            )
            .pipe(
              map((response) => {
                return LandingActions.insertPriceWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(LandingActions.insertPriceWebFailure({ error }));
              })
            );
        }
      )
    );
  });

  insertFixedPriceWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertFixedPriceWeb),
      switchMap(({ id_platforms, timeRanges, active }) => {
        return this.landingService
          .insertFixedPriceWeb(id_platforms, timeRanges, active)
          .pipe(
            map((response) => {
              return LandingActions.insertFixedPriceWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.insertFixedPriceWebFailure({ error }));
            })
          );
      })
    );
  });

  insertEventDisabledSlotsWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertEventDisabledSlotsWeb),
      switchMap(
        ({
          id_platforms_field,
          id_platforms,
          start_date_time,
          end_date_time,
          active,
          start_date,
          end_date,
          price,
          platforms_fields_price_start_time,
          platforms_fields_price_end_time,
          title,
          eventType,
        }) => {
          return this.landingService
            .insertEventDisabledSlotsWeb(
              id_platforms_field,
              id_platforms,
              start_date_time,
              end_date_time,
              active,
              start_date,
              end_date,
              price,
              platforms_fields_price_start_time,
              platforms_fields_price_end_time,
              title,
              eventType
            )
            .pipe(
              map((response) => {
                if (active === 4) {
                  return LandingActions.getClassesByIdPlatformWebSuccess({
                    response,
                  });
                } else {
                  return LandingActions.insertEventDisabledSlotsWebSuccess({
                    response,
                  });
                }
              }),
              catchError((error) => {
                return of(
                  LandingActions.insertEventDisabledSlotsWebFailure({ error })
                );
              })
            );
        }
      )
    );
  });

  getEventsUsersByIdPlatformWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getEventsUsersByIdPlatformWeb),
      switchMap(({ id_platform, id_platforms_disabled_date }) => {
        return this.landingService
          .getEventsUsersByIdPlatformWeb(
            id_platform,
            id_platforms_disabled_date
          )
          .pipe(
            map((response) => {
              return LandingActions.getEventsUsersByIdPlatformWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(
                LandingActions.getEventsUsersByIdPlatformWebFailure({ error })
              );
            })
          );
      })
    );
  });

  getTermsAndConditionsByIdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getTermsAndConditionsByIdWeb),
      switchMap(({ id_platforms }) => {
        return this.landingService
          .getTermsAndConditionsByIdWeb(id_platforms)
          .pipe(
            map((response) => {
              return LandingActions.getTermsAndConditionsByIdWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(
                LandingActions.getTermsAndConditionsByIdWebFailure({ error })
              );
            })
          );
      })
    );
  });

  getPrivacyTermsByIdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getPrivacyTermsByIdWeb),
      switchMap(({ id_platforms }) => {
        return this.landingService.getPrivacyTermsByIdWeb(id_platforms).pipe(
          map((response) => {
            return LandingActions.getPrivacyTermsByIdWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(LandingActions.getPrivacyTermsByIdWebFailure({ error }));
          })
        );
      })
    );
  });

  getActivePlatforms$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getActivePlatformsWeb),
      switchMap(() => {
        return this.landingService.getActivePlatformsWeb().pipe(
          map((response) => {
            return LandingActions.getActivePlatformsWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(LandingActions.getActivePlatformsWebFailure({ error }));
          })
        );
      })
    );
  });

  insertSupportHelp$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertSupportHelpWeb),
      switchMap(({ id_platforms, name, email, message }) => {
        return this.landingService
          .insertSupportHelp(id_platforms, name, email, message)
          .pipe(
            map((response) => {
              return LandingActions.insertSupportHelpWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.insertSupportHelpWebFailure({ error }));
            })
          );
      })
    );
  });

  getUserFullInfoByIdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getUserFullInfoByIdWeb),
      switchMap(({ id_platforms_user }) => {
        return this.landingService
          .getFullUserInfoByIdWeb(id_platforms_user)
          .pipe(
            map((response) => {
              return LandingActions.getUserFullInfoByIdWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(
                LandingActions.getUserFullInfoByIdWebFailure({ error })
              );
            })
          );
      })
    );
  });

  deactivateUserWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.deactivateUserWeb),
      switchMap(({ id_platforms_user, motivation }) => {
        return this.landingService
          .deactivateUserWeb(id_platforms_user, motivation)
          .pipe(
            map((response) => {
              return LandingActions.deactivateUserWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.deactivateUserWebFailure({ error }));
            })
          );
      })
    );
  });

  getProductsWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getProductsWeb),
      switchMap(({ id_platform, productType }) => {
        return this.landingService
          .getProductsWeb(id_platform, productType)
          .pipe(
            map((response) => {
              return LandingActions.getProductsWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.getProductsWebFailure({ error }));
            })
          );
      })
    );
  });

  insertProductWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.insertProductWeb),
      switchMap(
        ({ id_platforms, productType, name, description, price, active }) => {
          return this.landingService
            .insertProductWeb(
              id_platforms,
              productType,
              name,
              description,
              price,
              active
            )
            .pipe(
              map((response) => {
                return LandingActions.insertProductWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(LandingActions.insertProductWebFailure({ error }));
              })
            );
        }
      )
    );
  });

  updateProductWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.updateProductWeb),
      switchMap(
        ({
          id_platforms_product,
          name,
          description,
          price,
          productType,
          active,
        }) => {
          return this.landingService
            .updateProductWeb(
              id_platforms_product,
              name,
              description,
              price,
              productType,
              active
            )
            .pipe(
              map((response) => {
                return LandingActions.updateProductWebSuccess({
                  response,
                });
              }),
              catchError((error) => {
                return of(LandingActions.updateProductWebFailure({ error }));
              })
            );
        }
      )
    );
  });

  getClassesByIdPlatformWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.getClassesByIdPlatformWeb),
      switchMap(({ id_platform }) => {
        return this.landingService.getClassesByIdPlatformWeb(id_platform).pipe(
          map((response) => {
            return LandingActions.getClassesByIdPlatformWebSuccess({
              response,
            });
          }),
          catchError((error) => {
            return of(
              LandingActions.getClassesByIdPlatformWebFailure({ error })
            );
          })
        );
      })
    );
  });

  deleteClassByIdWeb$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LandingActions.deleteClassByIdWeb),
      switchMap(({ id_platforms_disabled_date, id_platform }) => {
        return this.landingService
          .deleteClassByIdWeb(id_platforms_disabled_date, id_platform)
          .pipe(
            map((response) => {
              return LandingActions.deleteClassByIdWebSuccess({
                response,
              });
            }),
            catchError((error) => {
              return of(LandingActions.deleteClassByIdWebFailure({ error }));
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
