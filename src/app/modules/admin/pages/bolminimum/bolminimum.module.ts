import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BolminimumComponent } from './bolminimum/bolminimum.component';
import { AgGridModule } from 'ag-grid-angular';
import { BolmincalculationComponent } from './bolmincalculation/bolmincalculation.component';



@NgModule({
  declarations: [
    BolminimumComponent,
    BolmincalculationComponent
  ],
  imports: [
    CommonModule,
    AgGridModule
  ]
})
export class BolminimumModule { }
