import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-roascalculation',
  templateUrl: './roascalculation.component.html',
  styleUrls: ['./roascalculation.component.css']
})
export class RoascalculationComponent implements ICellRendererAngularComp {

  private params: any;
  private roasData = {};
  constructor(private CommonService: CommonService) { }

  agInit(params: any): void {
    if (typeof params.data["sku"] != "undefined") {
      this.params = params;
      var getRoasDate = (params.data["roas_genereated_date"]).split(" To ");
      this.roasData[0] = getRoasDate[0];
      this.roasData[1] = getRoasDate[1];
      this.roasData[2] = params.data["sku"];
    }

  }

  refresh(): boolean {
    return false;
  }

  openRoasCalculation() {
    console.log(this.params);
    $("#modalRoas").modal("show");
    this.CommonService.roasCalculation.next(this.roasData);

  }

}
