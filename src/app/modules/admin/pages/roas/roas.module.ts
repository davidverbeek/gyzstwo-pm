import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentroasComponent } from './currentroas/currentroas.component';
import { AgGridModule } from 'ag-grid-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RoascalculationComponent } from './roascalculation/roascalculation.component';



@NgModule({
  declarations: [
    CurrentroasComponent,
    RoascalculationComponent
  ],
  imports: [
    CommonModule,
    AgGridModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule
  ]
})
export class RoasModule { }
