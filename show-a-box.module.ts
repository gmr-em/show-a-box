import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowABoxComponent } from './show-a-box/show-a-box.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

@NgModule({
  declarations: [ShowABoxComponent, InfoDialogComponent, SettingsDialogComponent],
  entryComponents: [InfoDialogComponent, SettingsDialogComponent],
  imports: [
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [ShowABoxComponent],
})
export class ShowABoxModule { }
