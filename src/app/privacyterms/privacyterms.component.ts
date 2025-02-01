import { Component, OnInit } from '@angular/core';
import { fromLanding } from '../shared/store/selectors';
import { PrivacyTermsModel } from '../home/home.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LandingActions } from '../shared/store/actions';

@Component({
  selector: 'app-privacyterms',
  templateUrl: './privacyterms.component.html',
  styleUrl: './privacyterms.component.css',
})
export class PrivacytermsComponent implements OnInit {
  public selectPrivacyTerms$ = this.store.select(
    fromLanding.selectPrivacyTerms
  );

  lastSegment: string | null = null;

  isClubPrivacy = false;
  idPlatforms = 0;
  privacyTerms!: PrivacyTermsModel;

  private unsubscribe$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.lastSegment = params.get('id');

      if (this.lastSegment === 'padelroom') {
        this.isClubPrivacy = true;
        this.idPlatforms = 1;
      }
    });

    if (this.isClubPrivacy) {
      this.store.dispatch(
        LandingActions.getPrivacyTermsByIdWeb({
          id_platforms: this.idPlatforms,
        })
      );
    }

    this.selectPrivacyTerms$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((terms) => {
        this.privacyTerms = terms;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
