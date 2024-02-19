import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentroasComponent } from './currentroas/currentroas.component';
import { AgGridModule } from 'ag-grid-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RoascalculationComponent } from './roascalculation/roascalculation.component';
import { GoogleroasComponent } from './googleroas/googleroas.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivategoogleroasComponent } from './activategoogleroas/activategoogleroas.component';
import { LiveroasComponent } from './liveroas/liveroas.component';



@NgModule({
  declarations: [
    CurrentroasComponent,
    RoascalculationComponent,
    GoogleroasComponent,
    ActivategoogleroasComponent,
    LiveroasComponent
  ],
  imports: [
    CommonModule,
    AgGridModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressBarModule
  ]
})
export class RoasModule { }
