import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-revenuecalculation',
  templateUrl: './revenuecalculation.component.html',
  styleUrls: ['./revenuecalculation.component.css']
})
export class RevenuecalculationComponent implements ICellRendererAngularComp {

  private params: any;

  revData: object = [];
  revSku: any = "";

  agInit(params: any): void {
    if (typeof params.data["sku"] != "undefined") {
      this.params = params;
      this.revSku = params.data["sku"];
      var getRevDate = (params.data["reportdate"]).split(" To ");
      this.revData[0] = "" + getRevDate[0] + " 00:00:00";
      this.revData[1] = "" + getRevDate[1] + " 23:59:00";
      this.revData[2] = params.data["sku"];
    }
  }

  refresh(): boolean {
    return false;
  }

  constructor(private CommonService: CommonService) { }
  openRevCalculation() {
    $("#modalRevenue").modal("show");
    this.CommonService.revenueCalculation.next(this.revData);
  }

}
