import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacytermsComponent } from './privacyterms.component';
import { HeaderModule } from '../shared/components/header/header.module';
import { FooterModule } from '../shared/components/footer/footer.module';

@NgModule({
  declarations: [PrivacytermsComponent],
  imports: [CommonModule, HeaderModule, FooterModule],
  exports: [PrivacytermsComponent],
})
export class PrivacyTermsModule {}
