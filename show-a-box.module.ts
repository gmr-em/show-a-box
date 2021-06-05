import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowABoxComponent } from './show-a-box/show-a-box.component';

@NgModule({
  declarations: [ShowABoxComponent],
  imports: [
    CommonModule
  ],
  exports: [ShowABoxComponent],
})
export class ShowABoxModule { }
