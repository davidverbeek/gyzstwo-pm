import { Component, ViewEncapsulation } from '@angular/core';
import { IToolPanelAngularComp } from 'ag-grid-angular';
import { IToolPanelParams } from 'ag-grid-community';
import { PmSidebarService } from '../../../../../../services/pm-sidebar.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx'
import { DatePipe } from '@angular/common';
import { writeFile } from 'xlsx';
//import io from 'socket.io-client';


@Component({
  selector: 'app-side-set-prices',
  templateUrl: './side-set-prices.component.html',
  styleUrls: ['./side-set-prices.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SideSetPricesComponent implements IToolPanelAngularComp {

  private params!: IToolPanelParams;
  getAllDebtors: any = "";
  currentDateTime: any;
  allowUndoRedo = true;
  showButton = true;
  showButton_redo = false;
  undoButton: string = "Undo Price";
  redoButton: string = "Redo Price";
  actionType: string = "";
  storeForRedo: string = "";
  debter_dd: any = [];
  debterAssignment: any[][] = [];
  progress: number = 0;
  uploadProgressId: any;

  uploadValidationMessage: any = "Import Xlsx Only";

  constructor(private sidebarService: PmSidebarService, private http: HttpClient, private datePipe: DatePipe) {

    let alldebString = localStorage.getItem("allDebts");
    this.getAllDebtors = JSON.parse(alldebString || '{}');
    this.currentDateTime = this.datePipe.transform((new Date), 'yyyy-MM-dd hh:mm:ss');
    for (const [key, value] of Object.entries(this.getAllDebtors)) {
      let idAlias = this.getAllDebtors[key].split('|||');
      var element = {};
      let option_key = key + '|||' + idAlias[0];
      element['op_key'] = option_key;
      element['op_value'] = idAlias[1];
      this.debter_dd.push(element);
    }
  }

  agInit(params: IToolPanelParams): void {
  }

  textPlacehoder: string = "";
  textButton: string = "Update Price";
  txtValue: string = "";
  selCG: string = "";
  priceType: any = [];
  xlsxPrices: any = "";
  uploadSpinner: any = false;
  spinner: any = false;
  isDisabled: any = false;

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

  submitForm() {
    this.priceType["val"] = this.txtValue;
    this.priceType["customer_group_selected"] = this.selCG;
    this.priceType["update_type"] = this.actionType;
    this.sidebarService.btnClicked.next(this.priceType);
  }

  onCgSelected(selValue) {
    this.selCG = selValue;
  }
  btnExportPrices() {

    this.spinner = true;
    this.isDisabled = true;
    var currentsql = localStorage.getItem("currentSql")?.trim();
    this.http.post(environment.webservicebaseUrl + "/all-products", currentsql).subscribe(responseData => {
      var exportData: any = [];
      for (let i = 0; i < responseData["msg"].length; i++) {
        var exportItem: any = {};
        exportItem["Leverancier"] = responseData["msg"][i]["supplier_type"];
        exportItem["Naam"] = responseData["msg"][i]["name"];
        exportItem["Artikelnummer (Artikel)"] = responseData["msg"][i]["sku"];
        exportItem["Supplier Sku"] = responseData["msg"][i]["supplier_sku"];
        exportItem["Ean"] = responseData["msg"][i]["eancode"];
        exportItem["Merk"] = responseData["msg"][i]["merk"];
        exportItem["Categories"] = responseData["msg"][i]["categories"];
        exportItem["Brutoprijs (Brutopr)"] = responseData["msg"][i]["gross_unit_price"];
        exportItem["Leverancier Netto Prijs (Lev.Nettopr)"] = responseData["msg"][i]["net_unit_price"];
        exportItem["Idealeverpakking (Ideal.verp)"] = responseData["msg"][i]["idealeverpakking"];
        exportItem["Afwijkenidealeverpakking (Afw.Ideal.verp)"] = responseData["msg"][i]["afwijkenidealeverpakking"];

        if (responseData["msg"][i]["afwijkenidealeverpakking"] === "0") {
          var bpPerPiece = (responseData["msg"][i]["buying_price"] / responseData["msg"][i]["idealeverpakking"]).toFixed(4);
          var spPerPiece = (responseData["msg"][i]["selling_price"] / responseData["msg"][i]["idealeverpakking"]).toFixed(4);
        } else {
          bpPerPiece = responseData["msg"][i]["buying_price"];
          spPerPiece = responseData["msg"][i]["selling_price"];
        }

        exportItem["Inkoopprijs (Inkpr)"] = (responseData["msg"][i]["buying_price"] == "" ? 0 : responseData["msg"][i]["buying_price"]);
        exportItem["Inkoopprijs (Inkpr per piece)"] = (bpPerPiece == "" ? 0 : bpPerPiece);
        exportItem["Nieuwe Verkoopprijs (Niewe Vkpr)"] = (responseData["msg"][i]["selling_price"] == "" ? 0 : responseData["msg"][i]["selling_price"]);
        exportItem["Nieuwe Verkoopprijs (Niewe Vkpr per piece)"] = (spPerPiece == "" ? 0 : spPerPiece);

        exportItem["Marge Inkpr %"] = responseData["msg"][i]["profit_percentage"];
        exportItem["Marge Verkpr %"] = responseData["msg"][i]["profit_percentage_selling_price"];
        exportItem["Stijging"] = responseData["msg"][i]["percentage_increase"];

        for (const [key, value] of Object.entries(this.getAllDebtors)) {

          var idAlias = "";
          idAlias = this.getAllDebtors[key].split("|||");

          var debSellingPriceCol = "group_" + key + "_debter_selling_price";
          var debMarginOnBuyingPriceCol = "group_" + key + "_margin_on_buying_price";
          var debMarginOnSellingPriceCol = "group_" + key + "_margin_on_selling_price";

          var debPrice = "";
          if (responseData["msg"][i]["afwijkenidealeverpakking"] === "0") {
            debPrice = (responseData["msg"][i][debSellingPriceCol] / responseData["msg"][i]["idealeverpakking"]).toFixed(4);
          } else {
            debPrice = responseData["msg"][i][debSellingPriceCol];
          }
          //exportItem[idAlias[1]] = (debPrice == "" ? 0 : debPrice);
          exportItem[idAlias[1]] = debPrice;
          exportItem["Marge Inkpr % (" + idAlias[1] + ")"] = responseData["msg"][i][debMarginOnBuyingPriceCol];
          exportItem["Marge Verkpr % (" + idAlias[1] + ")"] = responseData["msg"][i][debMarginOnSellingPriceCol];
        }

        exportData[i] = exportItem;
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Prices');
      writeFile(workbook, 'priceExport.xlsx');
      this.spinner = false;
      this.isDisabled = false;
    });
  }

  btnImportPrices(event: any) {

    // Get Debtor Assignment
    this.http.get(environment.webservicebaseUrl + "/all-debtor-product").subscribe(responseData => {
      if (responseData["msg"]) {
        responseData["msg"].forEach((value, key) => {
          var splitProducts = value["product_ids"].split(",");
          this.debterAssignment[value['customer_group_name']] = [];
          splitProducts.forEach((pids) => {
            this.debterAssignment[value['customer_group_name']][pids] = 1;
          });
        });
      }
    });

    var file = event.target.files[0];
    var fileType = file.type;

    // Check if file type is Xlsx
    if (fileType != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      this.uploadValidationMessage = "File is not Xlsx";
      return false;
    }

    var fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (e) => {
      var workbook = XLSX.read(fileReader.result, { type: 'binary' });
      var sheetNames = workbook.SheetNames;
      this.xlsxPrices = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { header: 1 });



      if (this.xlsxPrices.length > 0) {
        let getXlsxCols = this.xlsxPrices[0]; //Header Cols
        var allValidHeaders = validXlsxHeader(this.getAllDebtors);

        // Check if header is proper
        if (getXlsxCols.length == 1) {
          this.uploadValidationMessage = "Something is wrong with the columns";
          return false;
        }

        for (let xlsxCol of getXlsxCols) {
          if (!allValidHeaders.includes(xlsxCol)) {
            this.uploadValidationMessage = "Column Name does not match";
            return false;
          }
        }

        let maxXlsxColumns = this.xlsxPrices[0].length;
        let maxXlsxRows = this.xlsxPrices.length;


        var validate_buying_price = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Inkoopprijs (Inkpr per piece)");
        var validate_selling_price = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Nieuwe Verkoopprijs (Niewe Vkpr per piece)");
        var validate_margin_bp = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Marge Inkpr %");
        var validate_margin_sp = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Marge Verkpr %");

        if (typeof validate_buying_price != "undefined" || typeof validate_selling_price != "undefined" || typeof validate_margin_bp != "undefined" || typeof validate_margin_sp != "undefined") {
          for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
            //for (var xlsxCol = 0; xlsxCol < maxXlsxColumns; xlsxCol++) {
            if (xlsxRow == 0) {
              continue;
            }

            if (this.xlsxPrices[xlsxRow][0] == 0) {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:0 Value: 0";
              return false;
            }

            if (typeof validate_buying_price != "undefined" && this.xlsxPrices[xlsxRow][validate_buying_price] == 0) {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_buying_price) + 1) + " Value: 0";
              return false;
            }

            if (typeof validate_selling_price != "undefined" && this.xlsxPrices[xlsxRow][validate_selling_price] == 0) {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_selling_price) + 1) + " Value: 0";
              return false;
            }

            if (typeof validate_margin_bp != "undefined" && this.xlsxPrices[xlsxRow][validate_margin_bp] == 0) {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_margin_bp) + 1) + " Value: 0";
              return false;
            }

            if (typeof validate_margin_sp != "undefined" && this.xlsxPrices[xlsxRow][validate_margin_sp] == 0) {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_margin_sp) + 1) + " Value: 0";
              return false;
            }


            if (typeof this.xlsxPrices[xlsxRow][0] == "undefined") {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:0 Value: Empty";
              return false;
            }

            if (typeof validate_buying_price != "undefined" && typeof this.xlsxPrices[xlsxRow][validate_buying_price] == "undefined") {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_buying_price) + 1) + " Value: Empty";
              return false;
            }
            if (typeof validate_selling_price != "undefined" && typeof this.xlsxPrices[xlsxRow][validate_selling_price] == "undefined") {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_selling_price) + 1) + " Value: Empty";
              return false;
            }
            if (typeof validate_margin_bp != "undefined" && typeof this.xlsxPrices[xlsxRow][validate_margin_bp] == "undefined") {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_margin_bp) + 1) + " Value: Empty";
              return false;
            }
            if (typeof validate_margin_sp != "undefined" && typeof this.xlsxPrices[xlsxRow][validate_margin_sp] == "undefined") {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Column:" + (parseInt(validate_margin_sp) + 1) + " Value: Empty";
              return false;
            }
            //}
          }
        }



        // If no validation Error
        if (!confirm("Are you sure you want to add/update prices? Once the prices are updated they will not be reverted back")) {
          return false;
        }

        this.uploadSpinner = true;
        this.uploadValidationMessage = "";
        var queryHead = Array();
        var queryFoot = Array();

        var colMaps = columnMappings(this.getAllDebtors);
        var colAlias = columnAlias(this.getAllDebtors);

        for (let xlsxCol of getXlsxCols) {
          if (xlsxCol == "Artikelnummer (Artikel)") {
            queryHead.push("sku");
          } else if (xlsxCol == "Inkoopprijs (Inkpr per piece)") {
            var allMappedCols = colMaps[xlsxCol].split(",");
            for (let mappedCol of allMappedCols) {
              queryHead.push(mappedCol);
              queryFoot.push("" + mappedCol + " = VALUES (" + mappedCol + ")");
            }
            var buyingPriceColExists = isBuyingPriceExists(this.getAllDebtors, this.xlsxPrices, maxXlsxRows, maxXlsxColumns);
            maxXlsxColumns = buyingPriceColExists["maxXlsxColumns"];
            this.xlsxPrices = buyingPriceColExists["allNewPrices"];
            break;
          } else {
            var allMappedCols = colMaps[xlsxCol].split(",");
            for (let mappedCol of allMappedCols) {
              queryHead.push(mappedCol);
              queryFoot.push("" + mappedCol + " = VALUES (" + mappedCol + ")");
            }
          }
        }

        //console.log(queryHead);
        //console.log(this.xlsxPrices);
        //console.log(queryFoot);
        //return false;

        // Get All Xlsx Sku's
        /* var allXlsxSkus = Array();
        for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
          if (xlsxRow == 0) {
            continue;
          }
          allXlsxSkus.push(this.xlsxPrices[xlsxRow][0]); // column 0 is always Artikelnummer (Artikel)
        } */

        //console.log(allXlsxSkus);
        // Get All Xlsx Sku's PM Data
        this.http.get(environment.webservicebaseUrl + "/get-products-byskus").subscribe(skuPMData => {

          const startTime = performance.now();

          var allExistingPmData = Array();

          for (let obj of skuPMData["msg"]) {
            for (let key in obj) {
              if (key == "sku") {
                allExistingPmData[obj[key]] = obj;
              }
            }
          }

          // Get All Xlsx Data
          var processXlsxData: any = [];
          var processHistoryData: any = [];
          var sku = "";


          for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
            if (xlsxRow == 0) {
              continue;
            }
            sku = this.xlsxPrices[xlsxRow][0]; //Artikelnummer (Artikel) will always be on 0 th column
            if (!(sku in allExistingPmData)) {
              this.uploadValidationMessage = "Row:" + (xlsxRow + 1) + " Sku does not exist";
              this.uploadSpinner = false;
              return false;
            }

            var eachItem = {};
            var eachHistoryItem = {};
            for (var xlsxCol = 0; xlsxCol < maxXlsxColumns; xlsxCol++) {


              if (this.xlsxPrices[0][xlsxCol] == "Artikelnummer (Artikel)") {
                //console.log(xlsxRow + "===" + this.xlsxPrices[0][xlsxCol]);
                sku = this.xlsxPrices[xlsxRow][xlsxCol];
                eachItem["sku"] = this.xlsxPrices[xlsxRow][xlsxCol];
                var bp = allExistingPmData[sku]["buying_price"];
                var sp = allExistingPmData[sku]["selling_price"];
                var pp = allExistingPmData[sku]["profit_percentage"];
                var gup = allExistingPmData[sku]["gross_unit_price"];
                var wsp = allExistingPmData[sku]["webshop_selling_price"];
                var afwijkenidealeverpakking = allExistingPmData[sku]["afwijkenidealeverpakking"];
                var idealeverpakking = allExistingPmData[sku]["idealeverpakking"];
                if (idealeverpakking == 0 || idealeverpakking == "") {
                  idealeverpakking = 1;
                }

                if (gup == 0) {
                  gup = 1;
                }

              } else if (this.xlsxPrices[0][xlsxCol] == "Marge Inkpr %") {
                var pp = parseFloat(this.xlsxPrices[xlsxRow][xlsxCol]).toFixed(4);
                sp = ((1 + (pp / 100)) * bp);
                eachItem["selling_price"] = sp.toFixed(4);
                eachItem["profit_percentage"] = pp;
                eachItem["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
                eachItem["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
                eachItem["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
              } else if (this.xlsxPrices[0][xlsxCol] == "Marge Verkpr %") {
                var ppsp: any = parseFloat(this.xlsxPrices[xlsxRow][xlsxCol]).toFixed(4);
                sp = (bp / (1 - (ppsp / 100)));
                eachItem["selling_price"] = sp.toFixed(4);
                eachItem["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
                eachItem["profit_percentage_selling_price"] = ppsp;
                eachItem["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
                eachItem["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
              } else if (this.xlsxPrices[0][xlsxCol] == "Inkoopprijs (Inkpr per piece)") {
                bp = parseFloat(this.xlsxPrices[xlsxRow][xlsxCol]);
                if (afwijkenidealeverpakking == 0) {
                  bp = bp * idealeverpakking;
                }
                eachItem["buying_price"] = bp.toFixed(4);
              } else if (this.xlsxPrices[0][xlsxCol] == "Nieuwe Verkoopprijs (Niewe Vkpr per piece)") {
                //console.log(xlsxRow + "=" + this.xlsxPrices[0][xlsxCol]);
                var buying_price_index = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Inkoopprijs (Inkpr per piece)");
                if (typeof buying_price_index != "undefined") {
                  bp = parseFloat(this.xlsxPrices[xlsxRow][buying_price_index]);
                  if (afwijkenidealeverpakking == 0) {
                    bp = bp * idealeverpakking;
                  }
                }
                bp = bp.toFixed(4);

                if ((typeof this.xlsxPrices[xlsxRow][xlsxCol] == "undefined")) {
                  var webincreasedAmount = ((bp * pp) / 100).toFixed(4);
                  sp = (parseFloat(bp) + parseFloat(webincreasedAmount));
                } else {
                  sp = parseFloat(this.xlsxPrices[xlsxRow][xlsxCol]);
                  if (afwijkenidealeverpakking == 0) {
                    sp = sp * idealeverpakking;
                  }
                }
                sp = sp.toFixed(4);
                eachItem["selling_price"] = sp;
                eachItem["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
                eachItem["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
                eachItem["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
                eachItem["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
              } else {

                // cell is blank -- then magentoid will be 0 and cell values will be 0
                // cell is 0 -- then magentoid will be added and cell values will be 0

                var tempGroupName = colAlias[this.xlsxPrices[0][xlsxCol]].split("|||");
                //console.log(groupName[1]);
                var groupName = tempGroupName[0];
                var magentoID = allExistingPmData[sku]["group_" + groupName + "_magento_id"];
                if ((magentoID === null || magentoID == 0 || magentoID == "") && (typeof this.xlsxPrices[xlsxRow][xlsxCol] == "undefined" || this.xlsxPrices[xlsxRow][xlsxCol] == "")) {
                  eachItem["group_" + groupName + "_magento_id"] = null;
                  eachItem["group_" + groupName + "_debter_selling_price"] = null;
                  eachItem["group_" + groupName + "_margin_on_buying_price"] = null;
                  eachItem["group_" + groupName + "_margin_on_selling_price"] = null;
                  eachItem["group_" + groupName + "_discount_on_grossprice_b_on_deb_selling_price"] = null;
                } else {
                  if (magentoID === null || magentoID == 0 || magentoID == "") {
                    magentoID = tempGroupName[1];
                  }
                  eachItem["group_" + groupName + "_magento_id"] = magentoID;
                  var buying_price_index = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Inkoopprijs (Inkpr per piece)");
                  if (typeof buying_price_index != "undefined") {
                    bp = parseFloat(this.xlsxPrices[xlsxRow][buying_price_index]);
                    if (afwijkenidealeverpakking == 0) {
                      bp = bp * idealeverpakking;
                    }
                  }

                  bp = parseFloat(bp).toFixed(4);
                  var debsp: any = "";
                  if (typeof this.debterAssignment[groupName][allExistingPmData[sku]["product_id"]] == "undefined") {
                    debsp = parseFloat(allExistingPmData[sku]["group_" + groupName + "_debter_selling_price"]);
                  } else if (typeof this.xlsxPrices[xlsxRow][xlsxCol] == "undefined") {
                    var debtorMarginOnBp = allExistingPmData[sku]["group_" + groupName + "_margin_on_buying_price"];
                    var increasedAmount = ((bp * debtorMarginOnBp) / 100).toFixed(4);
                    debsp = (parseFloat(bp) + parseFloat(increasedAmount));
                  } else {
                    debsp = parseFloat(this.xlsxPrices[xlsxRow][xlsxCol]);
                    if (afwijkenidealeverpakking == 0) {
                      debsp = debsp * idealeverpakking;
                    }
                  }
                  debsp = debsp.toFixed(4);
                  eachItem["group_" + groupName + "_debter_selling_price"] = debsp;
                  eachItem["group_" + groupName + "_margin_on_buying_price"] = (((debsp - bp) / bp) * 100).toFixed(4);
                  eachItem["group_" + groupName + "_margin_on_selling_price"] = (((debsp - bp) / debsp) * 100).toFixed(4);
                  eachItem["group_" + groupName + "_discount_on_grossprice_b_on_deb_selling_price"] = ((1 - (debsp / gup)) * 100).toFixed(4);
                }
              }
            }
            eachItem["is_updated"] = 1;
            eachItem["is_updated_skwirrel"] = 1;
            //console.log(eachItem);

            processXlsxData[xlsxRow] = eachItem;
            var historyBP = eachItem["buying_price"];
            if (typeof historyBP == "undefined") {
              historyBP = allExistingPmData[eachItem["sku"]]["buying_price"];
            }

            if (typeof eachItem["selling_price"] != "undefined") { // eachItem["selling_price"] == "undefined" will happen only in case if the xlsx file has only debtors, for all the other cases the selling price will be upadated

              if ((historyBP != allExistingPmData[eachItem["sku"]]["buying_price"]) || (eachItem["selling_price"] != allExistingPmData[eachItem["sku"]]["selling_price"])) {

                var fieldsChanged = Array();
                var bpChanged = 0;

                if (historyBP != allExistingPmData[eachItem["sku"]]["buying_price"]) {
                  fieldsChanged.push('new_buying_price');
                  bpChanged = 1;
                }

                if (eachItem["selling_price"] != allExistingPmData[eachItem["sku"]]["selling_price"]) {
                  fieldsChanged.push('new_selling_price');
                }

                var pId = allExistingPmData[eachItem["sku"]]["product_id"];
                eachHistoryItem["product_id"] = pId;
                eachHistoryItem["old_net_unit_price"] = allExistingPmData[eachItem["sku"]]["webshop_net_unit_price"];
                eachHistoryItem["old_gross_unit_price"] = allExistingPmData[eachItem["sku"]]["webshop_gross_unit_price"];
                eachHistoryItem["old_idealeverpakking"] = allExistingPmData[eachItem["sku"]]["webshop_idealeverpakking"];
                eachHistoryItem["old_afwijkenidealeverpakking"] = allExistingPmData[eachItem["sku"]]["webshop_afwijkenidealeverpakking"];
                eachHistoryItem["old_buying_price"] = allExistingPmData[eachItem["sku"]]["webshop_buying_price"];
                eachHistoryItem["old_selling_price"] = allExistingPmData[eachItem["sku"]]["webshop_selling_price"];
                eachHistoryItem["new_net_unit_price"] = historyBP;
                eachHistoryItem["new_gross_unit_price"] = allExistingPmData[eachItem["sku"]]["gross_unit_price"];
                eachHistoryItem["new_idealeverpakking"] = allExistingPmData[eachItem["sku"]]["idealeverpakking"];
                eachHistoryItem["new_afwijkenidealeverpakking"] = allExistingPmData[eachItem["sku"]]["afwijkenidealeverpakking"];
                eachHistoryItem["new_buying_price"] = historyBP;
                eachHistoryItem["new_selling_price"] = eachItem["selling_price"];
                eachHistoryItem["updated_date_time"] = this.currentDateTime;
                eachHistoryItem["updated_by"] = "Price Management";
                eachHistoryItem["is_viewed"] = "No";
                eachHistoryItem["fields_changed"] = JSON.stringify(fieldsChanged);
                eachHistoryItem["buying_price_changed"] = bpChanged;
                processHistoryData[xlsxRow] = eachHistoryItem;
              }
            }

          }

          if (processXlsxData.length > 0) {



            var filterProcessData = processXlsxData.filter(function () { return true; });
            var filterProcessHistoryData = processHistoryData.filter(function () { return true; });

            var uploadRequestData: any = Array();

            queryHead.push("is_updated");
            queryHead.push("is_updated_skwirrel");

            queryFoot.push("is_updated = VALUES (is_updated)");
            queryFoot.push("is_updated_skwirrel = VALUES (is_updated_skwirrel)");

            uploadRequestData["0"] = queryHead.toString();
            uploadRequestData["1"] = filterProcessData;
            uploadRequestData["2"] = queryFoot.toString();
            uploadRequestData["3"] = filterProcessHistoryData;

            this.uploadProgressId = setInterval(() => {
              this.http.get(environment.agserverUrl + '/progress.txt?q=' + Math.random() + '', { responseType: 'json' }).subscribe((data) => {
                if (data) {
                  if (this.progress == 0 && data["cnt"] == 100) {
                    this.progress = 0;
                  } else {
                    this.progress = data["cnt"];
                  }
                }
              });
            }, 1000);

            this.http.post(environment.webservicebaseUrl + "/upload-products", uploadRequestData).subscribe(responseData => {
              const endTime = performance.now();
              const executionTime = endTime - startTime;
              const timeinSecs = executionTime / 1000;
              this.uploadSpinner = false;
              clearInterval(this.uploadProgressId);
              this.sidebarService.loadAgGrid.next(responseData["msg"] + "|||" + timeinSecs);
            });
          }
        });
      }
    }
  }
}
function columnMappings(allDebts: any) {
  var columnMappings = Array();
  columnMappings["Nieuwe Verkoopprijs (Niewe Vkpr per piece)"] = "selling_price,profit_percentage,profit_percentage_selling_price,discount_on_gross_price,percentage_increase";
  var allDebCols = Array();
  for (const [key, value] of Object.entries(allDebts)) {
    var idAlias = "";
    idAlias = allDebts[key].split("|||");
    columnMappings[idAlias[1]] = "group_" + key + "_magento_id,group_" + key + "_debter_selling_price,group_" + key + "_margin_on_buying_price,group_" + key + "_margin_on_selling_price,group_" + key + "_discount_on_grossprice_b_on_deb_selling_price";
    allDebCols.push(columnMappings[idAlias[1]]);
  }

  columnMappings["Inkoopprijs (Inkpr per piece)"] = "buying_price," + columnMappings["Nieuwe Verkoopprijs (Niewe Vkpr per piece)"] + "," + allDebCols + "";
  columnMappings["Marge Inkpr %"] = columnMappings["Nieuwe Verkoopprijs (Niewe Vkpr per piece)"];
  columnMappings["Marge Verkpr %"] = columnMappings["Nieuwe Verkoopprijs (Niewe Vkpr per piece)"];
  return columnMappings;
}

function columnAlias(allDebts: any) {
  var columnAlias = Array();
  columnAlias["Artikelnummer (Artikel)"] = "sku";
  columnAlias["Inkoopprijs (Inkpr per piece)"] = "buying_price";
  columnAlias["Nieuwe Verkoopprijs (Niewe Vkpr per piece)"] = "selling_price";

  for (const [key, value] of Object.entries(allDebts)) {
    var idAlias = "";
    idAlias = allDebts[key].split("|||");
    columnAlias[idAlias[1]] = key + "|||" + idAlias[0];
  }
  return columnAlias;
}
function isBuyingPriceExists(allDebts: any, xlsxPrices: any, maxXlsxRows: any, maxXlsxColumns: any) {
  // Convert existing xlsx data in array
  let response: any = Array();
  let existingClsxData: any = Array();
  for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
    existingClsxData[xlsxRow] = [];
    for (var xlsxCol = 0; xlsxCol < maxXlsxColumns; xlsxCol++) {
      var colName = xlsxPrices[0][xlsxCol];
      var colValue = xlsxPrices[xlsxRow][xlsxCol];
      existingClsxData[xlsxRow][colName] = colValue;
    }
  }


  // Create All cols data
  var allCols = Array()
  var tempRow = 0;
  allCols[tempRow] = [];

  let newClsxData: any = Array();
  allCols[tempRow].push("Artikelnummer (Artikel)");
  allCols[tempRow].push("Inkoopprijs (Inkpr per piece)");
  allCols[tempRow].push("Nieuwe Verkoopprijs (Niewe Vkpr per piece)");
  for (const [key, value] of Object.entries(allDebts)) {
    var idAlias = "";
    idAlias = allDebts[key].split("|||");
    allCols[tempRow].push(idAlias[1]);
  }
  maxXlsxColumns = allCols[0].length;

  for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
    newClsxData[xlsxRow] = [];
    if (xlsxRow > 0) {
      allCols[xlsxRow] = [];
    }
    for (var xlsxCol = 0; xlsxCol < maxXlsxColumns; xlsxCol++) {
      if (xlsxRow == 0) {
        //newClsxData[xlsxRow][xlsxCol] = existingClsxData[xlsxRow][allCols[xlsxRow][xlsxCol]];
        newClsxData[xlsxRow][xlsxCol] = allCols[xlsxRow][xlsxCol];
      } else {
        newClsxData[xlsxRow][xlsxCol] = existingClsxData[xlsxRow][allCols[0][xlsxCol]];
      }
    }
  }
  response["maxXlsxColumns"] = maxXlsxColumns;
  response["allNewPrices"] = newClsxData;
  return response;
}

function validXlsxHeader(allDebts: any) {
  var validHeader = Array();
  validHeader.push("Artikelnummer (Artikel)");
  validHeader.push("Marge Inkpr %");
  validHeader.push("Marge Verkpr %");
  validHeader.push("Inkoopprijs (Inkpr per piece)");
  validHeader.push("Nieuwe Verkoopprijs (Niewe Vkpr per piece)");

  for (const [key, value] of Object.entries(allDebts)) {
    var idAlias = "";
    idAlias = allDebts[key].split("|||");
    validHeader.push(idAlias[1]);
  }
  return validHeader;
}
