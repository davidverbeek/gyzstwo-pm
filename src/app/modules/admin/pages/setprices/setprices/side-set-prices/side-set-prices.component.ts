import { Component} from '@angular/core';
import { IToolPanelAngularComp } from 'ag-grid-angular';
import { IToolPanelParams } from 'ag-grid-community';

@Component({
  selector: 'app-side-set-prices',
  templateUrl: './side-set-prices.component.html',
  styleUrls: ['./side-set-prices.component.css']
})
export class SideSetPricesComponent implements IToolPanelAngularComp {

  private params!: IToolPanelParams;
  agInit(params: IToolPanelParams): void {}

}
