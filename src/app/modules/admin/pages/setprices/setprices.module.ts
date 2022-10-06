import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetpricesComponent } from './setprices/setprices.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    SetpricesComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AgGridModule
  ]
})
export class SetpricesModule { }
