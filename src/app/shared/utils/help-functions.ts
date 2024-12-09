import { ReservationsState } from '../../home/home.model';

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const transformReservations = (
  reservations: ReservationsState[]
): any[] => {
  return reservations.map((reservation) => {
    const start = new Date(reservation.platforms_date_time_start);
    const end = new Date(reservation.platforms_date_time_end);
    /*const title = `${start.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}: ${reservation.full_name}`;*/
    const title = `${start.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format
    })} - ${end.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format
    })}`;
    return {
      id_platforms_date_time_slot: reservation.id_platforms_date_time_slot, // Use a unique ID from the reservation
      id_platforms_field: reservation.id_platforms_field,
      id_platforms_user: reservation.id_platforms_user,
      platforms_date_time_start: reservation.platforms_date_time_start,
      platforms_date_time_end: reservation.platforms_date_time_end,
      active: reservation.active,
      validated: reservation.validated,
      full_name: reservation.full_name,
      date_of_birth: reservation.date_of_birth,
      email: reservation.email,
      title,
      start,
      end,
    };
  });
};

export const formatTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleTimeString([], options);
};

export const formatDateToSpanish = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  const formattedDate = date.toLocaleDateString('es-ES', options);
  const [weekday, ...rest] = formattedDate.split(', ');
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${rest.join(', ')}`;
};
