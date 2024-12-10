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
}
