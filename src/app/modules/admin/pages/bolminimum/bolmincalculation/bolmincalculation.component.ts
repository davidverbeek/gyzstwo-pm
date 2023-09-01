import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-bolmincalculation',
  templateUrl: './bolmincalculation.component.html',
  styleUrls: ['./bolmincalculation.component.css']
})
export class BolmincalculationComponent implements ICellRendererAngularComp {

  private params: any;

  bolMinData: object = [];
  bolSku: any = "";

  agInit(params: any): void {
    this.params = params;
    this.bolMinData[0] = params.data["product_sku"];
    this.bolMinData[1] = params.data["product_bol_minimum_price_cal"];
    this.bolSku = params.data["product_sku"];
  }

  refresh(): boolean {
    return false;
  }

  constructor(private CommonService: CommonService) { }
  openBolCalculation() {
    $("#bolmodal").modal("show");
    this.CommonService.bolCalculation.next(this.bolMinData);
  }

}
