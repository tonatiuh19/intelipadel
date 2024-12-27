import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TermsandconditionsComponent } from './termsandconditions/termsandconditions.component';
import { PrivacytermsComponent } from './privacyterms/privacyterms.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'iniciarsesion', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'terminosycondiciones', component: TermsandconditionsComponent },
  { path: 'avisodeprivacidad', component: PrivacytermsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
