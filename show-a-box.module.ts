import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowABoxComponent } from './show-a-box/show-a-box.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';

@NgModule({
  declarations: [ShowABoxComponent, InfoDialogComponent],
  entryComponents: [InfoDialogComponent],
  imports: [
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [ShowABoxComponent],
})
export class ShowABoxModule { }
