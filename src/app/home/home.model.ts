//export const DOMAIN = 'http://localhost:8015/api';
export const DOMAIN = 'https://garbrix.com/padel/api';

export interface LandingState {
  isLogged: boolean;
  user: UserState;
  isLoading?: boolean;
  isError?: boolean;
}

export interface UserState {
  isUserValid: boolean;
  isCodeValid: boolean;
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
