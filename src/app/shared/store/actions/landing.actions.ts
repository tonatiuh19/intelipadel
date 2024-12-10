import { createAction, props } from '@ngrx/store';
import { ReservationsState } from '../../../home/home.model';

const actor = '[Landing]';

export const sendCodeByMailWeb = createAction(
  `${actor} Send Code By Mail Web`,
  props<{ email: string }>()
);

export const sendCodeByMailWebSuccess = createAction(
  `${actor} Send Code By Mail Web Success`,
  props<{ response: any }>()
);

export const sendCodeByMailWebFailure = createAction(
  `${actor} Send Code By Mail Web Failure`,
  props<{ error: any }>()
);

export const validateSessionCodeWeb = createAction(
  `${actor} Validate Session Code Web`,
  props<{ code: string; email: string }>()
);

export const validateSessionCodeWebSuccess = createAction(
  `${actor} Validate Session Code Web Success`,
  props<{ response: any }>()
);

export const validateSessionCodeWebFailure = createAction(
  `${actor} Validate Session Code Web Failure`,
  props<{ error: any }>()
);

export const resetLandingState = createAction(`${actor} Reset Landing State`);

export const getDateTimeSlotsByIdPlatformsAndDates = createAction(
  `${actor} Get Date Time Slots By Id Platforms And Dates`,
  props<{ id_platforms: number; start_date: string; end_date: string }>()
);

export const getDateTimeSlotsByIdPlatformsAndDatesSuccess = createAction(
  `${actor} Get Date Time Slots By Id Platforms And Dates Success`,
  props<{ response: ReservationsState[] }>()
);

export const getDateTimeSlotsByIdPlatformsAndDatesFailure = createAction(
  `${actor} Get Date Time Slots By Id Platforms And Dates Failure`,
  props<{ error: any }>()
);
