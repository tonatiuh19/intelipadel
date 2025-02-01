//export const DOMAIN = 'http://localhost:8015/api';
export const DOMAIN = 'https://garbrix.com/padel/api';

export interface LandingState {
  isLogged: boolean;
  user: UserState;
  reservations: ReservationsState;
  usersEnd: UserState[];
  ads: AdsModel[];
  platformsFields: PlatformsFieldsState;
  disabledSlots: string[];
  prices: PricesState;
  eventUsers: EventUsers[];
  isLoading?: boolean;
  isError?: boolean;
  isContactSent?: boolean;
  termsAndConditions: TermsAndConditionsModel;
  privacyTerms: PrivacyTermsModel;
  activePlatforms: ActivePlatformsModel[];
  isSupportSent?: boolean;
}

export interface UserState {
  isUserValid?: boolean;
  isCodeValid?: boolean;
  id_platforms_user: number;
  full_name: string;
  age: number;
  date_of_birth: string;
  email: string;
  phone_number: string;
  phone_number_code: string;
  stripe_id: string;
  type: number;
  date_created: string;
  id_platforms: number;
  id_platform: number;
  title: string;
  start_time: string;
  end_time: string;
}

export interface ReservationsState {
  data: ReservationsModel[];
  markedDates: MarkedDate[];
}

export interface ReservationsModel {
  id_platforms_date_time_slot: number;
  id_platforms_field: number;
  id_platforms_user: number;
  platforms_date_time_start: string;
  platforms_date_time_end: string;
  title: string;
  active: number;
  validated: number;
  full_name: string;
  date_of_birth: string;
  email: string;
  cancha?: string;
  start?: string;
  end?: string;
}

export interface MarkedDate {
  marked: boolean;
  dotColor: string;
  activeOpacity: number;
  id_platforms_disabled_date: number;
  start_date_time: string;
  end_date_time: string;
  active: number;
  title: string;
  id_platforms_field: number;
}

export interface PlatformsFieldsState {
  title: string;
  today: Date;
  start_time: string;
  end_time: string;
  platforms_fields: PlatformsField[];
  last_reservation: LastReservation;
}

export interface LastReservation {
  id_platforms_date_time_slot: number;
  id_platforms_field: number;
  id_platforms_user: number;
  platforms_date_time_start: Date;
  platforms_date_time_end: Date;
  active: number;
  stripe_id: string;
  validated: number;
}

export interface PlatformsField {
  id_platforms_field: number;
  title: string;
  today: Date;
  carrouselImages: CarrouselImage[];
}

export interface CarrouselImage {
  name: string;
  path: string;
}

export interface AdsModel {
  id_platforms_ad: number;
  id_platform: number;
  platforms_ad_title: string;
  platforms_ad_image: string;
  active: number;
}

export interface PricesState {
  fixedPrices: Price[];
  specialPrices: Price[];
}

export interface Price {
  id_platforms_fields_price: number;
  id_platforms: number;
  price: number;
  platforms_fields_price_start_time: string;
  platforms_fields_price_end_time: string;
  active: number;
  id_platforms_field: number;
  id_platform: number;
  title: string;
  field_active: number;
}

export interface EventUsers {
  id_platforms_fields_events_users: number;
  id_platforms_user: number;
  id_platforms_disabled_date: number;
  stripe_id: string;
  active: number;
  validated: number;
  platforms_fields_events_users_inserted: string;
  full_name: string;
  email: string;
  id_platforms_field: number;
  start_date_time: string;
  end_date_time: string;
  id_platform: number;
  title: string;
}

export interface TermsAndConditionsModel {
  terms_and_conditions: string;
  terms_and_conditions_date: string;
  title: string;
}

export interface PrivacyTermsModel {
  privacy_terms: string;
  privacy_terms_date: string;
  title: string;
}

export interface ActivePlatformsModel {
  id_platform: string;
  title: string;
  active: string;
}
