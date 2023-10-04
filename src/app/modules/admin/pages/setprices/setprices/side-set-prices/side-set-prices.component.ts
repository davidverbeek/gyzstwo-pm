import { Component, ViewEncapsulation } from '@angular/core';
import { IToolPanelAngularComp } from 'ag-grid-angular';
import { IToolPanelParams } from 'ag-grid-community';
import { PmSidebarService } from '../../../../../../services/pm-sidebar.service';

@Component({
  selector: 'app-side-set-prices',
  templateUrl: './side-set-prices.component.html',
  styleUrls: ['./side-set-prices.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SideSetPricesComponent implements IToolPanelAngularComp {

  private params!: IToolPanelParams;
  allowUndoRedo = true;
  componentParent: any;
  showButton = true;

  constructor(private sidebarService: PmSidebarService) { }

  agInit(params: IToolPanelParams): void {
    this.params = params;
    this.componentParent = this.params.context.componentParent;
    // this.allowUndoRedo = this.componentParent.updatePriceCompleted;

  }

  textPlacehoder: string = "";
  textButton: string = "Update Price";
  undoButton: string = "Undo Price";
  redoButton: string = "Redo Price";
  txtValue: string = "";
  selCG: string = "";
  priceType: any = [];
  actionType: string = "";
  storeForRedo: string = "";

  selectedOption(type: string) {
    if (type == "SP") {
      this.textPlacehoder = "PM Vkpr";
      this.textButton = "Update PM Vkpr";
      this.undoButton = "Undo PM Vkpr";
      this.redoButton = "Redo PM Vkpr";
      this.priceType["type"] = "selling_price";
    } else if (type == "PBP") {
      this.textPlacehoder = "Marge Inkpr %";
      this.textButton = "Update Marge Inkpr %";
      this.undoButton = "Undo Marge Inkpr %";
      this.redoButton = "Redo Marge Inkpr %";
      this.priceType["type"] = "profit_percentage";
    } else if (type == "PSP") {
      this.textPlacehoder = "Marge Verkpr %";
      this.textButton = "Update Marge Verkpr %";
      this.undoButton = "Undo Marge Verkpr %";
      this.redoButton = "Redo Marge Verkpr %";
      this.priceType["type"] = "profit_percentage_selling_price";
    } else if (type == "DGP") {
      this.textPlacehoder = "Korting Brupr %";
      this.textButton = "Update Korting Brupr %";
      this.undoButton = "Undo Korting Brupr %";
      this.redoButton = "Redo Korting Brupr %";
      this.priceType["type"] = "discount_on_gross_price";
    }
  }

  btnSetPrice() {
    this.actionType = "update";
    this.storeForRedo = this.txtValue;
    this.submitForm();
  }

  btnUndoPrice() {
    this.actionType = "undo";
    this.txtValue = "";
    this.submitForm();
  }

  btnRedoPrice() {
    this.actionType = "redo";
    this.txtValue = this.storeForRedo;
    this.submitForm();
  }

  onCgSelected(selValue) {
    this.selCG = selValue;
  }

  submitForm() {
    this.priceType["val"] = this.txtValue;
    this.priceType["customer_group_selected"] = this.selCG;
    this.priceType["update_type"] = this.actionType;
    this.sidebarService.btnClicked.next(this.priceType);
  }



}