import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DOMAIN } from '../../home/home.model';

@Injectable({
  providedIn: 'root',
})
export class LandingService {
  public SEND_CODE_BY_MAIL_WEB = `${DOMAIN}/sendCodeByMailWeb.php`;
  public VALIDATE_CODE_WEB = `${DOMAIN}/validateSessionCodeWeb.php`;
  public GET_DATE_TIME_SLOTS_BY_ID_PLATFORMS_AND_DATES = `${DOMAIN}/getDateTimeSlotsByIdPlatformsAndDates.php`;
  public GET_USERS = `${DOMAIN}/getUsersByIdWeb.php`;
  public INSERT_USER = `${DOMAIN}/insertUserWeb.php`;
  public DELETE_USER = `${DOMAIN}/deleteUserWeb.php`;
  public EDIT_USER = `${DOMAIN}/editUserWeb.php`;
  public GET_DISABLED_SLOTS = `${DOMAIN}/getDisabledSlotsWeb.php`;
  public GET_PLATFORMS_BY_ID = `${DOMAIN}/getPlatformFieldsById.php`;
  public INSERT_PLATFORM_DATE_TIME_SLOT_WEB = `${DOMAIN}/insertPlatformDateTimeSlotWeb.php`;
  public DEACTIVATE_PLATFORM_DATE_TIME_SLOT_WEB = `${DOMAIN}/deactivatePlatformDateTimeSlotWeb.php`;
  public VALIDATE_PLATFORM_DATE_TIME_SLOT_WEB = `${DOMAIN}/validatePlatformDateTimeSlotWeb.php`;
  public INSERT_DISABLED_SLOT = `${DOMAIN}/insertDisabledSlotsWeb.php`;
  public DELETE_DISABLED_SLOT = `${DOMAIN}/deleteDisabledPlatformDateTimeSlotWeb.php`;
  public INSERT_CONTACT = `${DOMAIN}/insertContactWeb.php`;
  public GET_ADS_BY_ID = `${DOMAIN}/getAdsByIdWeb.php`;
  public INSERT_AD_WEB = `${DOMAIN}/insertAdWeb.php`;
  public UPDATE_AD_WEB = `${DOMAIN}/updateAdByIdWeb.php`;

  constructor(private httpClient: HttpClient) {}

  public sendCodeByMailWeb(email: string): Observable<any> {
    return this.httpClient
      .post(this.SEND_CODE_BY_MAIL_WEB, {
        email,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public validateSessionCodeWeb(code: string, email: string): Observable<any> {
    return this.httpClient
      .post(this.VALIDATE_CODE_WEB, {
        code,
        email,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public getDateTimeSlotsByIdPlatformsAndDates(
    id_platforms: number,
    start_date: string,
    end_date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.GET_DATE_TIME_SLOTS_BY_ID_PLATFORMS_AND_DATES, {
        id_platforms,
        start_date,
        end_date,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public getUsers(id_platforms: number): Observable<any> {
    return this.httpClient
      .post(this.GET_USERS, {
        id_platforms,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public insertUser(
    full_name: string,
    age: number,
    date_of_birth: string,
    email: string,
    phone_number: string,
    phone_number_code: string,
    type: number,
    id_platforms: number
  ): Observable<any> {
    return this.httpClient
      .post(this.INSERT_USER, {
        full_name,
        age,
        date_of_birth,
        email,
        phone_number,
        phone_number_code,
        type,
        id_platforms,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public deleteUser(
    id_platforms_user: number,
    id_platforms: number
  ): Observable<any> {
    return this.httpClient
      .post(this.DELETE_USER, {
        id_platforms_user,
        id_platforms,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public editUser(
    id_platforms_user: number,
    full_name: string,
    age: number,
    date_of_birth: string,
    email: string,
    phone_number: string,
    phone_number_code: string,
    type: number,
    id_platforms: number
  ): Observable<any> {
    return this.httpClient
      .post(this.EDIT_USER, {
        id_platforms_user,
        full_name,
        age,
        date_of_birth,
        email,
        phone_number,
        phone_number_code,
        type,
        id_platforms,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public getDisabledSlots(
    id_platforms_field: number,
    id_platform: number,
    date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.GET_DISABLED_SLOTS, {
        id_platforms_field,
        date,
        id_platform,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public getPlatformFieldsById(
    id_platform: number,
    imageDirectory: string,
    id_platforms_user: number
  ): Observable<any> {
    return this.httpClient
      .post(this.GET_PLATFORMS_BY_ID, {
        id_platform,
        imageDirectory,
        id_platforms_user,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public insertPlatformDateTimeSlotWeb(
    id_platforms_field: number,
    id_platforms_user: number,
    id_platforms: number,
    platforms_date_time_start: string,
    active: number,
    validated: number,
    start_date: string,
    end_date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.INSERT_PLATFORM_DATE_TIME_SLOT_WEB, {
        id_platforms_field,
        id_platforms_user,
        id_platforms,
        platforms_date_time_start,
        active,
        validated,
        start_date,
        end_date,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public deactivatePlatformDateTimeSlotWeb(
    id_platforms_date_time_slot: number,
    id_platforms: number,
    start_date: string,
    end_date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.DEACTIVATE_PLATFORM_DATE_TIME_SLOT_WEB, {
        id_platforms_date_time_slot,
        id_platforms,
        start_date,
        end_date,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public validatePlatformDateTimeSlotWeb(
    id_platforms_date_time_slot: number,
    id_platforms: number,
    start_date: string,
    end_date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.VALIDATE_PLATFORM_DATE_TIME_SLOT_WEB, {
        id_platforms_date_time_slot,
        id_platforms,
        start_date,
        end_date,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public insertDisabledSlotsWeb(
    id_platforms_field: number,
    id_platforms: number,
    start_date_time: string,
    end_date_time: string,
    active: number,
    start_date: string,
    end_date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.INSERT_DISABLED_SLOT, {
        id_platforms_field,
        id_platforms,
        start_date_time,
        end_date_time,
        active,
        start_date,
        end_date,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public deletePlatformDateTimeSlotWeb(
    id_platforms_disabled_date: number,
    id_platforms: number,
    start_date: string,
    end_date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.DELETE_DISABLED_SLOT, {
        id_platforms_disabled_date,
        id_platforms,
        start_date,
        end_date,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public insertContactWeb(
    id_platforms: number,
    name: string,
    email: string,
    phone: number,
    message: string
  ): Observable<any> {
    return this.httpClient
      .post(this.INSERT_CONTACT, {
        id_platforms,
        name,
        email,
        phone,
        message,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public getAdsByIdWeb(id_platform: number): Observable<any> {
    return this.httpClient
      .post(this.GET_ADS_BY_ID, {
        id_platform,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public insertAdWeb(
    id_platform: number,
    platforms_ad_title: string,
    active: number,
    platforms_ad_image: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('id_platform', id_platform.toString());
    formData.append('platforms_ad_title', platforms_ad_title);
    formData.append('active', active.toString());
    formData.append('platforms_ad_image', platforms_ad_image);
  
    return this.httpClient
      .post(this.INSERT_AD_WEB, formData)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public updateAdWeb(
    id_platforms_ad: number,
    platforms_ad_title: string,
    active: number,
    platforms_ad_image: File | string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('id_platforms_ad', id_platforms_ad.toString());
    formData.append('platforms_ad_title', platforms_ad_title);
    formData.append('active', active.toString());
    formData.append('platforms_ad_image', platforms_ad_image);
  
    return this.httpClient
      .post(this.UPDATE_AD_WEB, formData)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
