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
      console.log('aqui', response, state);
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
      console.log('aqui', error);
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
  on(LandingActions.getPlatformSlotsByIdWeb, (state: LandingState) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(
    LandingActions.getPlatformSlotsByIdWebSuccess,
    (state: LandingState, { response }) => {
      return {
        ...state,
        platformsSlots: response,
        isLoading: false,
        isError: false,
      };
    }
  ),
  on(
    LandingActions.getPlatformSlotsByIdWebFailure,
    (state: LandingState, { error }) => {
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    }
  )
);
