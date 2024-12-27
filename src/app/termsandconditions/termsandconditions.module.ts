import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsandconditionsComponent } from './termsandconditions.component';
import { HeaderModule } from '../shared/components/header/header.module';
import { FooterModule } from '../shared/components/footer/footer.module';

@NgModule({
  declarations: [TermsandconditionsComponent],
  imports: [CommonModule, HeaderModule, FooterModule],
  exports: [TermsandconditionsComponent],
})
export class TermsAndConditionsModule {}
