import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LandingActions } from '../shared/store/actions';
import { Store } from '@ngrx/store';
import { fromLanding } from '../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { TermsAndConditionsModel } from '../home/home.model';

@Component({
  selector: 'app-termsandconditions',
  templateUrl: './termsandconditions.component.html',
  styleUrls: ['./termsandconditions.component.css'],
})
export class TermsandconditionsComponent implements OnInit {
  public selectTermsAndConditions$ = this.store.select(
    fromLanding.selectTermsAndConditions
  );

  lastSegment: string | null = null;

  isClubTerms = false;
  idPlatforms = 0;
  termsAndConditions!: TermsAndConditionsModel;

  private unsubscribe$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.lastSegment = params.get('id');

      if (this.lastSegment === 'padelroom') {
        this.isClubTerms = true;
        this.idPlatforms = 1;
      }
    });

    if (this.isClubTerms) {
      this.store.dispatch(
        LandingActions.getTermsAndConditionsByIdWeb({
          id_platforms: this.idPlatforms,
        })
      );
    }

    this.selectTermsAndConditions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((terms) => {
        this.termsAndConditions = terms;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
