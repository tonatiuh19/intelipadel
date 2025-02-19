import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { LandingStoreModule } from './shared/store/landing.store.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule as NgrxStoreModule } from '@ngrx/store';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DashboardModule } from './dashboard/dashboard.module';
import { LoginModule } from './login/login.module';
import { LoadingMaskModule } from './shared/components/loading-mask/loading-mask.module';
import { provideHttpClient } from '@angular/common/http';
import { TermsAndConditionsModule } from './termsandconditions/termsandconditions.module';
import { PrivacyTermsModule } from './privacyterms/privacyterms.module';
import { NeedHelpModule } from './need-help/need-help.module';
import { DeactivateAccountModule } from './deactivate-account/deactivate-account.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LandingStoreModule,
    EffectsModule.forRoot([]),

    NgrxStoreModule.forRoot({
      routerReducer: routerReducer,
    }),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
    }),
    HomeModule,
    DashboardModule,
    LoginModule,
    LoadingMaskModule,
    TermsAndConditionsModule,
    PrivacyTermsModule,
    NeedHelpModule,
    DeactivateAccountModule,
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
