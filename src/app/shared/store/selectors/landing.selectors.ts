import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LANDING_FEATURE_KEY } from '../states/landing.state';
import { LandingState } from '../../../home/home.model';

export const selectLandingState =
  createFeatureSelector<LandingState>(LANDING_FEATURE_KEY);

export const selecIsloading = createSelector(
  selectLandingState,
  (state: LandingState) => state.isLoading
);

export const selectUser = createSelector(
  selectLandingState,
  (state: LandingState) => state.user
);

export const selectReservations = createSelector(
  selectLandingState,
  (state: LandingState) => state.reservations.data
);

export const selectMarkedDates = createSelector(
  selectLandingState,
  (state: LandingState) => state.reservations.markedDates
);

export const selectUsersEnd = createSelector(
  selectLandingState,
  (state: LandingState) => state.usersEnd
);

export const selectDisabledSlots = createSelector(
  selectLandingState,
  (state: LandingState) => state.disabledSlots
);

export const selectPlatformsFields = createSelector(
  selectLandingState,
  (state: LandingState) => state.platformsFields
);

export const selectIsContactSent = createSelector(
  selectLandingState,
  (state: LandingState) => state.isContactSent
);

export const selectAds = createSelector(
  selectLandingState,
  (state: LandingState) => state.ads
);

export const selectPrices = createSelector(
  selectLandingState,
  (state: LandingState) => state.prices
);

export const selectEventUsers = createSelector(
  selectLandingState,
  (state: LandingState) => state.eventUsers
);

export const selectTermsAndConditions = createSelector(
  selectLandingState,
  (state: LandingState) => state.termsAndConditions
);

export const selectPrivacyTerms = createSelector(
  selectLandingState,
  (state: LandingState) => state.privacyTerms
);

export const selectActivePlatforms = createSelector(
  selectLandingState,
  (state: LandingState) => state.activePlatforms
);

export const selectIsSupportSent = createSelector(
  selectLandingState,
  (state: LandingState) => state.isSupportSent
);

export const selectUserFullInfo = createSelector(
  selectLandingState,
  (state: LandingState) => state.userFullInfo
);

export const selectIsAccountDeactivated = createSelector(
  selectLandingState,
  (state: LandingState) => state.isAccountDeactivated
);

export const selectProducts = createSelector(
  selectLandingState,
  (state: LandingState) => state.products
);

export const selectClasses = createSelector(
  selectLandingState,
  (state: LandingState) => state.classes
);
