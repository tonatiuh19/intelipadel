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
  public GET_PLATFORMS_SLOTS_BY_ID = `${DOMAIN}/getPlatformsSlotsByIdWeb.php`;

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

  public getPlatformsSlotsById(
    id_platforms_field: number,
    date: string
  ): Observable<any> {
    return this.httpClient
      .post(this.GET_PLATFORMS_SLOTS_BY_ID, {
        id_platforms_field,
        date,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
