import { LandingState } from '../../../home/home.model';

export const LANDING_FEATURE_KEY = 'landingInteliPadel';

export const initialLandingState: LandingState = {
  isLogged: false,
  isLoading: false,
  isError: false,
  user: {
    isUserValid: false,
    isCodeValid: false,
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
    id_platform: 0,
    title: '',
    start_time: '',
    end_time: '',
  },
  reservations: {
    data: [],
    markedDates: [],
  },
  usersEnd: [],
  ads: [],
  platformsFields: {
    title: '',
    today: new Date(),
    start_time: '',
    end_time: '',
    platforms_fields: [],
    last_reservation: {
      id_platforms_date_time_slot: 0,
      id_platforms_field: 0,
      id_platforms_user: 0,
      platforms_date_time_start: new Date(),
      platforms_date_time_end: new Date(),
      active: 0,
      stripe_id: '',
      validated: 0,
    },
  },
  disabledSlots: [],
  prices: {
    fixedPrices: [],
    specialPrices: [],
  },
  eventUsers: [],
  products: [],
  termsAndConditions: {
    terms_and_conditions: '',
    terms_and_conditions_date: '',
    title: '',
  },
  privacyTerms: {
    privacy_terms: '',
    privacy_terms_date: '',
    title: '',
  },
  activePlatforms: [],
};
