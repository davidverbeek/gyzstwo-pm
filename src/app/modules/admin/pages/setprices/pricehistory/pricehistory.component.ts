import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-pricehistory',
  templateUrl: './pricehistory.component.html',
  styleUrls: ['./pricehistory.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PricehistoryComponent implements ICellRendererAngularComp {

  private params: any;

  historyData: object = [];
  pSku = "";

  agInit(params: any): void {
    this.params = params;
    this.historyData[0] = params.data["product_id"];
    this.historyData[1] = params.data["sku"];
    this.historyData[2] = params.data["eancode"];
    this.pSku = params.data["sku"];
  }

  refresh(): boolean {
    return false;
  }

  constructor(private CommonService: CommonService) { }
  openPriceHistory() {
    $("#modalprice").modal("show");
    this.CommonService.productHistoryData.next(this.historyData);
  }

}
