import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueComponent } from './revenue/revenue.component';
import { AgGridModule } from 'ag-grid-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RevenuefooterComponent } from './revenuefooter/revenuefooter.component';
import { RevenuecalculationComponent } from './revenuecalculation/revenuecalculation.component';

@NgModule({
  declarations: [
    RevenueComponent,
    RevenuefooterComponent,
    RevenuecalculationComponent
  ],
  imports: [
    CommonModule,
    AgGridModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule
  ]
})
export class RevenueModule { }
