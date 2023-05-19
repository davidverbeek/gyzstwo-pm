import { Component, ViewEncapsulation} from '@angular/core';
import { IToolPanelAngularComp } from 'ag-grid-angular';
import { IToolPanelParams } from 'ag-grid-community';
import { PmSidebarService } from 'src/app/pm-sidebar.service';

@Component({
  selector: 'app-side-set-prices',
  templateUrl: './side-set-prices.component.html',
  styleUrls: ['./side-set-prices.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SideSetPricesComponent implements IToolPanelAngularComp {

  private params!: IToolPanelParams;
  
  constructor(private sidebarService: PmSidebarService){}
  
  agInit(params: IToolPanelParams): void {}

  textPlacehoder:string = "";
  textButton:string = "Update Price";
  txtValue:string = "";
  selCG:string = "";
  priceType: any = [];

  selectedOption(type:string) {
    if(type == "SP") {
      this.textPlacehoder = "PM Vkpr";
      this.textButton = "Update PM Vkpr";
      this.priceType["type"] = "selling_price";
    } else if(type == "PBP") {
      this.textPlacehoder = "Marge Inkpr %";
      this.textButton = "Update Marge Inkpr %";
      this.priceType["type"] = "profit_percentage";
    } else if(type == "PSP") {
      this.textPlacehoder = "Marge Verkpr %";
      this.textButton = "Update Marge Verkpr %";
      this.priceType["type"] = "profit_percentage_selling_price";
    } else if(type == "DGP") {
      this.textPlacehoder = "Korting Brupr %";
      this.textButton = "Update Korting Brupr %";
      this.priceType["type"] = "discount_on_gross_price";
    }
  }

  btnSetPrice() {
    this.priceType["val"] = this.txtValue;
    this.sidebarService.btnClicked.next(this.priceType);
  }

}
