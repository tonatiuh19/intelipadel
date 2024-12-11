//export const DOMAIN = 'http://localhost:8015/api';
export const DOMAIN = 'https://garbrix.com/padel/api';

export interface LandingState {
  isLogged: boolean;
  user: UserState;
  reservations: ReservationsState[];
  usersEnd: UserState[];
  platformsSlots: PlatformsSlots;
  isLoading?: boolean;
  isError?: boolean;
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
}

export interface ReservationsState {
  id_platforms_date_time_slot: number;
  id_platforms_field: number;
  id_platforms_user: number;
  platforms_date_time_start: string;
  platforms_date_time_end: string;
  active: number;
  validated: number;
  full_name: string;
  date_of_birth: string;
  email: string;
}

export interface PlatformsSlots {
  id_platforms_field: number;
  title: string;
  today: Date;
  fullToday: Date;
  markedDates: { [key: string]: MarkedDate };
  slots: any[];
}

export interface MarkedDate {
  marked: boolean;
  dotColor: string;
  activeOpacity: number;
  id_platforms_disabled_date: number;
  start_date_time: Date;
  end_date_time: Date;
  active: number;
}
