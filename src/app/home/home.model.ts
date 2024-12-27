//export const DOMAIN = 'http://localhost:8015/api';
export const DOMAIN = 'https://garbrix.com/padel/api';

export interface LandingState {
  isLogged: boolean;
  user: UserState;
  reservations: ReservationsState;
  usersEnd: UserState[];
  platformsFields: PlatformsFieldsState;
  disabledSlots: string[];
  isLoading?: boolean;
  isError?: boolean;
  isContactSent?: boolean;
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
