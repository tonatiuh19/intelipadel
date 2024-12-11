import { LandingState } from '../../../home/home.model';

export const LANDING_FEATURE_KEY = 'landingInteliPadel';

export const initialLandingState: LandingState = {
  isLogged: false,
  isLoading: false,
  isError: false,
  user: {
    isCodeValid: false,
    isUserValid: false,
    id_platforms_user: 0,
    full_name: '',
    age: 0,
    date_of_birth: '',
    email: '',
    phone_number: '',
    phone_number_code: '',
    stripe_id: '',
    type: 0,
    date_created: '',
    id_platforms: 0,
  },
  reservations: [],
  usersEnd: [],
  platformsSlots: {
    id_platforms_field: 0,
    title: '',
    today: new Date(),
    fullToday: new Date(),
    markedDates: {},
    slots: [],
  },
};
