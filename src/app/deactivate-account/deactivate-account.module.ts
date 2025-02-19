import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeactivateAccountComponent } from './deactivate-account.component';
import { HeaderModule } from '../shared/components/header/header.module';
import { FooterModule } from '../shared/components/footer/footer.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DeactivateAccountComponent],
  imports: [CommonModule, HeaderModule, FooterModule, ReactiveFormsModule],
  exports: [DeactivateAccountComponent],
})
export class DeactivateAccountModule {}
