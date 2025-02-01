import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeedHelpComponent } from './need-help.component';
import { HeaderModule } from '../shared/components/header/header.module';
import { FooterModule } from '../shared/components/footer/footer.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [NeedHelpComponent],
  imports: [CommonModule, HeaderModule, FooterModule, ReactiveFormsModule],
  exports: [NeedHelpComponent],
})
export class NeedHelpModule {}
