import { ReservationsModel } from '../../home/home.model';

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const transformReservations = (
  reservations: ReservationsModel[]
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
      cancha: reservation.title,
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

export const formatDateString = (date: string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export const generateTimeSlots = (
  start: number,
  end: number,
  range: number,
  disabledSlots: string[],
  selectedDate: string
): string[] => {
  const slots = [];
  const now = new Date(selectedDate);
  const currentDate = now.toISOString().split('T')[0]; // Get current date in "YYYY-MM-DD" format
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  slots.push('');
  for (let hour = start; hour <= end; hour += range) {
    const fullHour = Math.floor(hour);
    const minutes = (hour % 1) * 60;
    const formattedHour = fullHour < 10 ? `0${fullHour}` : fullHour;
    const formattedMinutes = minutes === 0 ? '00' : minutes;
    const time = `${formattedHour}:${formattedMinutes}:00`;
    if (!disabledSlots.includes(time)) {
      slots.push(time);
    }
  }
  return slots;
};

export const transformMarkedDates = (markedDates: any): any[] => {
  return Object.keys(markedDates)
    .filter((date) => markedDates[date].active === 1)
    .map((date) => ({
      id_platforms_date_time_slot: markedDates[date].id_platforms_disabled_date,
      id_platforms_field: 1, // Assuming a static value, update as needed
      id_platforms_user: 37, // Assuming a static value, update as needed
      platforms_date_time_start: markedDates[date].start_date_time,
      platforms_date_time_end: markedDates[date].end_date_time,
      active: 7, // New active value
      validated: 0, // Assuming a static value, update as needed
      full_name: 'Félix Gómez', // Assuming a static value, update as needed
      date_of_birth: '2024-11-02', // Assuming a static value, update as needed
      email: 'tonatiuh.gom@gmail.com', // Assuming a static value, update as needed
      title: `${new Date(markedDates[date].start_date_time).toLocaleTimeString(
        [],
        { hour: '2-digit', minute: '2-digit' }
      )} - ${new Date(markedDates[date].end_date_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      start: new Date(markedDates[date].start_date_time).toISOString(),
      end: new Date(markedDates[date].end_date_time).toISOString(),
    }));
};

export const transformDateString = (dateTimeString: string): string => {
  return dateTimeString.split(' ')[0];
};
