import { Action, createReducer, on } from '@ngrx/store';
import {
  initialLandingState,
  LANDING_FEATURE_KEY,
} from '../states/landing.state';
import { LandingActions } from '../actions';
import { createRehydrateReducer } from '../../utils/rehydrate-reducer';
import { LandingState } from '../../../home/home.model';
export const LandingReducer = createRehydrateReducer(
  { key: LANDING_FEATURE_KEY },
  initialLandingState,
  on(LandingActions.sendCodeByMailWeb, (state: LandingState, { email }) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.sendCodeByMailWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        user: {
          ...state.user,
          isUserValid: response,
        },
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.sendCodeByMailWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(
    LandingActions.validateSessionCodeWeb,
    (state: LandingState, { code, email }) => {
      return {
        ...state,
        isLoading: true,
      };
    }
  ),
  on(
    LandingActions.validateSessionCodeWebSuccess,
    (state: LandingState, { response }) => {
      if (!response) {
        return {
          ...state,
          user: {
            ...state.user,
            isCodeValid: response,
          },
          isLoading: false,
          isError: false,
        };
      }
      return {
        ...state,
        user: {
          ...state.user,
          isCodeValid: true,
          email: response.email,
          full_name: response.full_name,
          id_platforms_user: response.id_platforms_user,
          age: response.age,
          date_of_birth: response.date_of_birth,
          phone_number: response.phone_number,
          phone_number_code: response.phone_number_code,
          stripe_id: response.stripe_id,
          type: response.type,
          date_created: response.date_created,
          id_platforms: response.id_platforms,
          id_platform: response.id_platform,
          title: response.title,
          start_time: response.start_time,
          end_time: response.end_time,
        },
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.validateSessionCodeWebFailure,
    (state: LandingState, {}) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.resetLandingState, () => {
    return initialLandingState;
  }),
  on(
    LandingActions.getDateTimeSlotsByIdPlatformsAndDates,
    (state: LandingState, { id_platforms, start_date, end_date }) => {
      return {
        ...state,
        isLoading: true,
      };
    }
  ),
  on(
    LandingActions.getDateTimeSlotsByIdPlatformsAndDatesSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        reservations: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getDateTimeSlotsByIdPlatformsAndDatesFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.getUsers, (state: LandingState, { id_platforms }) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(LandingActions.getUsersSuccess, (state: LandingState, { response }) => {
    return {
      ...state,
      usersEnd: response,
      isLoading: false,
      isError: false,
    };
  }),
  on(LandingActions.getUsersFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.insertUserWeb, (state: LandingState, { user }) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertUserWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        usersEnd: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(LandingActions.insertUserWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(
    LandingActions.deleteUserWeb,
    (state: LandingState, { id_platforms_user }) => {
      return {
        ...state,
        isLoading: true,
      };
    }
  ),
  on(
    LandingActions.deleteUserWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        usersEnd: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(LandingActions.deleteUserWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.updateUserWeb, (state: LandingState, { user }) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.updateUserWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        usersEnd: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(LandingActions.updateUserWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.getDisabledSlots, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getDisabledSlotsSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        disabledSlots: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getDisabledSlotsFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.getPlatformFieldsById, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getPlatformFieldsByIdSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        platformsFields: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getPlatformFieldsByIdFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.insertPlatformDateTimeSlotWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertPlatformDateTimeSlotWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        reservations: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.insertPlatformDateTimeSlotWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(
    LandingActions.deactivatePlatformDateTimeSlotWeb,
    (state: LandingState) => {
      return {
        ...state,
        isLoading: true,
      };
    }
  ),
  on(
    LandingActions.deactivatePlatformDateTimeSlotWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        reservations: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.deactivatePlatformDateTimeSlotWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.validatePlatformDateTimeSlotWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.validatePlatformDateTimeSlotWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        reservations: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.validatePlatformDateTimeSlotWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.insertDisabledSlotsWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertDisabledSlotsWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        reservations: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.insertDisabledSlotsWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.deletePlatformDateTimeSlotWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.deletePlatformDateTimeSlotWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        reservations: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.deletePlatformDateTimeSlotWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.insertContactWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertContactWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        isContactSent: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.insertContactWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.getAdsByIdWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getAdsByIdWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        ads: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(LandingActions.getAdsByIdWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.insertAdWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(LandingActions.insertAdWebSuccess, (state: LandingState, { response }) => {
    return {
      ...state,
      ads: response,
      isLoading: false,
      isError: false,
    };
  }),
  on(LandingActions.insertAdWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.updateAdWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(LandingActions.updateAdWebSuccess, (state: LandingState, { response }) => {
    return {
      ...state,
      ads: response,
      isLoading: false,
      isError: false,
    };
  }),
  on(LandingActions.updateAdWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.deleteAdWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(LandingActions.deleteAdWebSuccess, (state: LandingState, { response }) => {
    return {
      ...state,
      ads: response,
      isLoading: false,
      isError: false,
    };
  }),
  on(LandingActions.deleteAdWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(
    LandingActions.getPricesByIdWeb,
    (state: LandingState, { id_platforms }) => {
      return {
        ...state,
        isLoading: true,
      };
    }
  ),
  on(
    LandingActions.getPricesByIdWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        prices: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getPricesByIdWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.updatePriceByIdWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.updatePriceByIdWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        prices: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.updatePriceByIdWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.insertPriceWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertPriceWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        prices: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(LandingActions.insertPriceWebFailure, (state: LandingState, { error }) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.insertFixedPriceWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertFixedPriceWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        prices: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.insertFixedPriceWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.insertEventDisabledSlotsWeb, (state: LandingState, {}) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertEventDisabledSlotsWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        reservations: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.insertEventDisabledSlotsWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(
    LandingActions.getEventsUsersByIdPlatformWeb,
    (state: LandingState, {}) => {
      return {
        ...state,
        isLoading: true,
      };
    }
  ),
  on(
    LandingActions.getEventsUsersByIdPlatformWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        eventUsers: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getEventsUsersByIdPlatformWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.getTermsAndConditionsByIdWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getTermsAndConditionsByIdWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        termsAndConditions: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getTermsAndConditionsByIdWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.getPrivacyTermsByIdWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getPrivacyTermsByIdWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        privacyTerms: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getPrivacyTermsByIdWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.getActivePlatformsWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getActivePlatformsWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        activePlatforms: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getActivePlatformsWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.insertSupportHelpWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.insertSupportHelpWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        isSupportSent: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.insertSupportHelpWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isSupportSent: false,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.resetSupportHelpWeb, (state: LandingState) => {
    return {
      ...state,
      isSupportSent: false,
    };
  }),
  on(LandingActions.getUserFullInfoByIdWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getUserFullInfoByIdWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        userFullInfo: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getUserFullInfoByIdWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  ),
  on(LandingActions.deactivateUserWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.deactivateUserWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        isAccountDeactivated: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(LandingActions.deactivateUserWebFailure, (state: LandingState) => {
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  }),
  on(LandingActions.resetDeactivateUserWeb, (state: LandingState) => {
    return {
      ...state,
      isAccountDeactivated: false,
    };
  })
);
