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
