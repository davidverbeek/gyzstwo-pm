import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BolcommissionComponent } from './bolcommission/bolcommission.component';
import { AgGridModule } from 'ag-grid-angular';



@NgModule({
  declarations: [
    BolcommissionComponent
  ],
  imports: [
    CommonModule,
    AgGridModule
  ]
})
export class BolcommissionModule { }
