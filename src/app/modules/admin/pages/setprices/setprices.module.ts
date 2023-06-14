import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetpricesComponent } from './setprices/setprices.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import { SideSetPricesComponent } from './setprices/side-set-prices/side-set-prices.component';
import { PricehistoryComponent } from './pricehistory/pricehistory.component';



@NgModule({
  declarations: [
    SetpricesComponent,
    SideSetPricesComponent,
    PricehistoryComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AgGridModule,
    FormsModule
  ]
})
export class SetpricesModule { }
