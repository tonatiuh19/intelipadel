export const DOMAIN = 'http://localhost:8015/api';
//export const DOMAIN = 'https://garbrix.com/regalame/api';

export interface LandingState {
  isLogged: boolean;
  isLoading?: boolean;
  isError?: boolean;
}
