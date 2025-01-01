import { createAction, props } from '@ngrx/store';
import { ReservationsState, UserState } from '../../../home/home.model';

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
  props<{ response: ReservationsState }>()
);

export const getDateTimeSlotsByIdPlatformsAndDatesFailure = createAction(
  `${actor} Get Date Time Slots By Id Platforms And Dates Failure`,
  props<{ error: any }>()
);

export const getUsers = createAction(
  `${actor} Get Users`,
  props<{ id_platforms: number }>()
);

export const getUsersSuccess = createAction(
  `${actor} Get Users Success`,
  props<{ response: UserState[] }>()
);

export const getUsersFailure = createAction(
  `${actor} Get Users Failure`,
  props<{ error: any }>()
);

export const insertUserWeb = createAction(
  `${actor} Insert User Web`,
  props<{ user: any }>()
);

export const insertUserWebSuccess = createAction(
  `${actor} Insert User Web Success`,
  props<{ response: any }>()
);

export const insertUserWebFailure = createAction(
  `${actor} Insert User Web Failure`,
  props<{ error: any }>()
);

export const deleteUserWeb = createAction(
  `${actor} Delete User Web`,
  props<{ id_platforms_user: number; id_platforms: number }>()
);

export const deleteUserWebSuccess = createAction(
  `${actor} Delete User Web Success`,
  props<{ response: any }>()
);

export const deleteUserWebFailure = createAction(
  `${actor} Delete User Web Failure`,
  props<{ error: any }>()
);

export const updateUserWeb = createAction(
  `${actor} Update User Web`,
  props<{ user: any }>()
);

export const updateUserWebSuccess = createAction(
  `${actor} Update User Web Success`,
  props<{ response: any }>()
);

export const updateUserWebFailure = createAction(
  `${actor} Update User Web Failure`,
  props<{ error: any }>()
);

export const getDisabledSlots = createAction(
  `${actor} Get Disabled Slots By Id Web`,
  props<{ id_platforms_field: number; id_platform: number; date: string }>()
);

export const getDisabledSlotsSuccess = createAction(
  `${actor} Get Disabled Slots By Id Web Success`,
  props<{ response: any }>()
);

export const getDisabledSlotsFailure = createAction(
  `${actor} Get Disabled Slots By Id Web Failure`,
  props<{ error: any }>()
);

export const getPlatformFieldsById = createAction(
  `${actor} Get Platform Slots By Id`,
  props<{
    id_platform: number;
    imageDirectory: string;
    id_platforms_user: number;
  }>()
);

export const getPlatformFieldsByIdSuccess = createAction(
  `${actor} Get Platform Slots By Id Success`,
  props<{ response: any }>()
);

export const getPlatformFieldsByIdFailure = createAction(
  `${actor} Get Platform Slots By Id Failure`,
  props<{ error: any }>()
);

export const insertPlatformDateTimeSlotWeb = createAction(
  `${actor} Insert Platform Date Time Slot Web`,
  props<{
    id_platforms_field: number;
    id_platforms_user: number;
    id_platforms: number;
    platforms_date_time_start: string;
    active: number;
    validated: number;
    start_date: string;
    end_date: string;
  }>()
);

export const insertPlatformDateTimeSlotWebSuccess = createAction(
  `${actor} Insert Platform Date Time Slot Web Success`,
  props<{ response: any }>()
);

export const insertPlatformDateTimeSlotWebFailure = createAction(
  `${actor} Insert Platform Date Time Slot Web Failure`,
  props<{ error: any }>()
);

export const deactivatePlatformDateTimeSlotWeb = createAction(
  `${actor} Deactivate Platform Date Time Slot Web`,
  props<{
    id_platforms_date_time_slot: number;
    id_platforms: number;
    start_date: string;
    end_date: string;
  }>()
);

export const deactivatePlatformDateTimeSlotWebSuccess = createAction(
  `${actor} Deactivate Platform Date Time Slot Web Success`,
  props<{ response: any }>()
);

export const deactivatePlatformDateTimeSlotWebFailure = createAction(
  `${actor} Deactivate Platform Date Time Slot Web Failure`,
  props<{ error: any }>()
);

export const validatePlatformDateTimeSlotWeb = createAction(
  `${actor} Validate Platform Date Time Slot Web`,
  props<{
    id_platforms_date_time_slot: number;
    id_platforms: number;
    start_date: string;
    end_date: string;
  }>()
);

export const validatePlatformDateTimeSlotWebSuccess = createAction(
  `${actor} Validate Platform Date Time Slot Web Success`,
  props<{ response: any }>()
);

export const validatePlatformDateTimeSlotWebFailure = createAction(
  `${actor} Validate Platform Date Time Slot Web Failure`,
  props<{ error: any }>()
);

export const insertDisabledSlotsWeb = createAction(
  `${actor} Insert Disabled Slots Web`,
  props<{
    id_platforms_field: number;
    id_platforms: number;
    start_date_time: string;
    end_date_time: string;
    active: number;
    start_date: string;
    end_date: string;
  }>()
);

export const insertDisabledSlotsWebSuccess = createAction(
  `${actor} Insert Disabled Slots Web Success`,
  props<{ response: any }>()
);

export const insertDisabledSlotsWebFailure = createAction(
  `${actor} Insert Disabled Slots Web Failure`,
  props<{ error: any }>()
);

export const deletePlatformDateTimeSlotWeb = createAction(
  `${actor} Delete Platform Date Time Slot Web`,
  props<{
    id_platforms_disabled_date: number;
    id_platforms: number;
    start_date: string;
    end_date: string;
  }>()
);

export const deletePlatformDateTimeSlotWebSuccess = createAction(
  `${actor} Delete Platform Date Time Slot Web Success`,
  props<{ response: any }>()
);

export const deletePlatformDateTimeSlotWebFailure = createAction(
  `${actor} Delete Platform Date Time Slot Web Failure`,
  props<{ error: any }>()
);

export const insertContactWeb = createAction(
  `${actor} Insert Contact Web`,
  props<{
    id_platforms: number;
    name: string;
    email: string;
    phone: number;
    message: string;
  }>()
);

export const insertContactWebSuccess = createAction(
  `${actor} Insert Contact Web Success`,
  props<{ response: any }>()
);

export const insertContactWebFailure = createAction(
  `${actor} Insert Contact Web Failure`,
  props<{ error: any }>()
);

export const getAdsByIdWeb = createAction(
  `${actor} Get Ads By Id Web`,
  props<{ id_platform: number }>()
);

export const getAdsByIdWebSuccess = createAction(
  `${actor} Get Ads By Id Web Success`,
  props<{ response: any }>()
);

export const getAdsByIdWebFailure = createAction(
  `${actor} Get Ads By Id Web Failure`,
  props<{ error: any }>()
);

export const insertAdWeb = createAction(
  `${actor} Insert Ad Web`,
  props<{
    id_platform: number;
    platforms_ad_title: string;
    active: number;
    platforms_ad_image: File;
  }>()
);

export const insertAdWebSuccess = createAction(
  `${actor} Insert Ad Web Success`,
  props<{ response: any }>()
);

export const insertAdWebFailure = createAction(
  `${actor} Insert Ad Web Failure`,
  props<{ error: any }>()
);

export const updateAdWeb = createAction(
  `${actor} Update Ad Web`,
  props<{
    id_platforms_ad: number;
    platforms_ad_title: string;
    active: number;
    platforms_ad_image: File | string;
  }>()
);

export const updateAdWebSuccess = createAction(
  `${actor} Update Ad Web Success`,
  props<{ response: any }>()
);

export const updateAdWebFailure = createAction(
  `${actor} Update Ad Web Failure`,
  props<{ error: any }>()
);

export const deleteAdWeb = createAction(
  `${actor} Delete Ad Web`,
  props<{ id_platforms_ad: number; active: number }>()
);

export const deleteAdWebSuccess = createAction(
  `${actor} Delete Ad Web Success`,
  props<{ response: any }>()
);

export const deleteAdWebFailure = createAction(
  `${actor} Delete Ad Web Failure`,
  props<{ error: any }>()
);

export const getPricesByIdWeb = createAction(
  `${actor} Get Prices By Id Web`,
  props<{ id_platforms: number }>()
);

export const getPricesByIdWebSuccess = createAction(
  `${actor} Get Prices By Id Web Success`,
  props<{ response: any }>()
);

export const getPricesByIdWebFailure = createAction(
  `${actor} Get Prices By Id Web Failure`,
  props<{ error: any }>()
);

export const updatePriceByIdWeb = createAction(
  `${actor} Update Price By Id Web`,
  props<{ id_platforms_fields_price: number; active: number }>()
);

export const updatePriceByIdWebSuccess = createAction(
  `${actor} Update Price By Id Web Success`,
  props<{ response: any }>()
);

export const updatePriceByIdWebFailure = createAction(
  `${actor} Update Price By Id Web Failure`,
  props<{ error: any }>()
);

export const insertPriceWeb = createAction(
  `${actor} Insert Price Web`,
  props<{
    id_platforms: number;
    price: number;
    platforms_fields_price_start_time: string;
    platforms_fields_price_end_time: string;
    active: number;
  }>()
);

export const insertPriceWebSuccess = createAction(
  `${actor} Insert Price Web Success`,
  props<{ response: any }>()
);

export const insertPriceWebFailure = createAction(
  `${actor} Insert Price Web Failure`,
  props<{ error: any }>()
);
