import { Component, ViewEncapsulation } from '@angular/core';
import { IToolPanelAngularComp } from 'ag-grid-angular';
import { IToolPanelParams } from 'ag-grid-community';
import { PmSidebarService } from '../../../../../../services/pm-sidebar.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx'

@Component({
  selector: 'app-side-set-prices',
  templateUrl: './side-set-prices.component.html',
  styleUrls: ['./side-set-prices.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SideSetPricesComponent implements IToolPanelAngularComp {

  private params!: IToolPanelParams;
  getAllDebtors: any = "";

  constructor(private sidebarService: PmSidebarService, private http: HttpClient) {

    let alldebString = localStorage.getItem("allDebts");
    this.getAllDebtors = JSON.parse(alldebString || '{}');

  }

  agInit(params: IToolPanelParams): void { }

  textPlacehoder: string = "";
  textButton: string = "Update Price";
  txtValue: string = "";
  selCG: string = "";
  priceType: any = [];
  xlsxPrices: any = "";

  selectedOption(type: string) {
    if (type == "SP") {
      this.textPlacehoder = "PM Vkpr";
      this.textButton = "Update PM Vkpr";
      this.priceType["type"] = "selling_price";
    } else if (type == "PBP") {
      this.textPlacehoder = "Marge Inkpr %";
      this.textButton = "Update Marge Inkpr %";
      this.priceType["type"] = "profit_percentage";
    } else if (type == "PSP") {
      this.textPlacehoder = "Marge Verkpr %";
      this.textButton = "Update Marge Verkpr %";
      this.priceType["type"] = "profit_percentage_selling_price";
    } else if (type == "DGP") {
      this.textPlacehoder = "Korting Brupr %";
      this.textButton = "Update Korting Brupr %";
      this.priceType["type"] = "discount_on_gross_price";
    }
  }

  btnSetPrice() {
    this.priceType["val"] = this.txtValue;
    this.priceType["customer_group_selected"] = this.selCG;
    this.sidebarService.btnClicked.next(this.priceType);
  }
  onCgSelected(selValue) {
    this.selCG = selValue;
  }
  btnImportPrices(event: any) {
    var file = event.target.files[0];
    var fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (e) => {
      var workbook = XLSX.read(fileReader.result, { type: 'binary' });
      var sheetNames = workbook.SheetNames;
      this.xlsxPrices = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { header: 1 });
      if (this.xlsxPrices.length > 0) {

        //console.log(this.xlsxPrices);

        let maxXlsxColumns = this.xlsxPrices[0].length;
        let maxXlsxRows = this.xlsxPrices.length;
        let getXlsxCols = this.xlsxPrices[0]; //Header Cols
        //console.log(getXlsxCols);

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
            console.log(maxXlsxColumns);
            console.log(this.xlsxPrices);
            break;
          } else {
            var allMappedCols = colMaps[xlsxCol].split(",");
            for (let mappedCol of allMappedCols) {
              queryHead.push(mappedCol);
              queryFoot.push("" + mappedCol + " = VALUES (" + mappedCol + ")");
            }
          }
        }

        console.log(queryHead.toString());
        console.log(queryFoot.toString());

        // Get All Xlsx Sku's
        var allXlsxSkus = Array();
        for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
          if (xlsxRow == 0) {
            continue;
          }
          allXlsxSkus.push(this.xlsxPrices[xlsxRow][0]); // column 0 is always Artikelnummer (Artikel)
        }


        // Get All Xlsx Sku's PM Data
        this.http.post(environment.webservicebaseUrl + "/get-products-byskus", allXlsxSkus).subscribe(skuPMData => {

          var allExistingPmData = Array();

          for (let obj of skuPMData["msg"]) {
            for (let key in obj) {
              if (key == "sku") {
                allExistingPmData[obj[key]] = obj;
              }
            }
          }


          console.log(allExistingPmData);

          // Get All Xlsx Data
          var processXlsxData: any = [];
          var sku = "";

          for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
            var eachItem = {};
            for (var xlsxCol = 0; xlsxCol < maxXlsxColumns; xlsxCol++) {
              if (xlsxRow == 0) {
                continue;
              }
              if (this.xlsxPrices[0][xlsxCol] == "Artikelnummer (Artikel)") {
                eachItem["sku"] = this.xlsxPrices[xlsxRow][xlsxCol];
                sku = this.xlsxPrices[xlsxRow][xlsxCol];
                var bp = allExistingPmData[sku]["buying_price"];
                var sp = allExistingPmData[sku]["selling_price"];

                var gup = allExistingPmData[sku]["gross_unit_price"];
                var wsp = allExistingPmData[sku]["webshop_selling_price"];
                if (allExistingPmData[sku]["afwijkenidealeverpakking"] == 0) {
                  bp = bp / allExistingPmData[sku]["idealeverpakking"];
                  sp = sp / allExistingPmData[sku]["idealeverpakking"];
                  gup = gup / allExistingPmData[sku]["idealeverpakking"];
                  wsp = wsp / allExistingPmData[sku]["idealeverpakking"];
                }
                if (gup == 0) {
                  gup = 1;
                }
              } else if (this.xlsxPrices[0][xlsxCol] == "Inkoopprijs (Inkpr per piece)") {
                eachItem["buying_price"] = this.xlsxPrices[xlsxRow][xlsxCol].toFixed(4);
              } else if (this.xlsxPrices[0][xlsxCol] == "Nieuwe Verkoopprijs (Niewe Vkpr per piece)") {
                eachItem["selling_price"] = this.xlsxPrices[xlsxRow][xlsxCol].toFixed(4);
                var sp = this.xlsxPrices[xlsxRow][xlsxCol].toFixed(4);
                var buying_price_index = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Inkoopprijs (Inkpr per piece)");
                if (typeof buying_price_index != "undefined") {
                  bp = this.xlsxPrices[xlsxRow][buying_price_index].toFixed(4);
                }
                eachItem["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
                eachItem["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
                eachItem["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
                eachItem["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
              } else {
                var tempGroupName = colAlias[this.xlsxPrices[0][xlsxCol]].split("|||");
                //console.log(groupName[1]);
                var groupName = tempGroupName[0];
                var magentoID = allExistingPmData[sku]["group_" + groupName + "_magento_id"];
                if (magentoID === null && typeof this.xlsxPrices[xlsxRow][xlsxCol] == "undefined") {
                  eachItem["group_" + groupName + "_magento_id"] = null;
                  eachItem["group_" + groupName + "_debter_selling_price"] = null;
                  eachItem["group_" + groupName + "_margin_on_buying_price"] = null;
                  eachItem["group_" + groupName + "_margin_on_selling_price"] = null;
                  eachItem["group_" + groupName + "_discount_on_grossprice_b_on_deb_selling_price"] = null;
                } else {
                  if (magentoID === null) {
                    magentoID = tempGroupName[1];
                  }
                  eachItem["group_" + groupName + "_magento_id"] = magentoID;
                  if (typeof this.xlsxPrices[xlsxRow][xlsxCol] == "undefined") {
                    var debsp = allExistingPmData[sku]["group_" + groupName + "_debter_selling_price"]
                  } else {
                    debsp = this.xlsxPrices[xlsxRow][xlsxCol].toFixed(4);
                  }
                  eachItem["group_" + groupName + "_debter_selling_price"] = debsp;
                  var buying_price_index = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Inkoopprijs (Inkpr per piece)");
                  if (typeof buying_price_index != "undefined") {
                    bp = this.xlsxPrices[xlsxRow][buying_price_index].toFixed(4);
                  }
                  eachItem["group_" + groupName + "_margin_on_buying_price"] = (((debsp - bp) / bp) * 100).toFixed(4);
                  eachItem["group_" + groupName + "_margin_on_selling_price"] = (((debsp - bp) / debsp) * 100).toFixed(4);
                  eachItem["group_" + groupName + "_discount_on_grossprice_b_on_deb_selling_price"] = ((1 - (debsp / gup)) * 100).toFixed(4);
                }
              }
              processXlsxData[sku] = eachItem;
            }
          }
          console.log(processXlsxData);

          /*
         for (let obj of this.xlsxPrices) {
           var eachItem = {};
           for (let key in obj) {
             if (key == "Artikelnummer (Artikel)") {
               eachItem["sku"] = obj[key];
               sku = obj[key];
             } else {

               var bp = allExistingPmData[sku]["buying_price"];
               var gup = allExistingPmData[sku]["gross_unit_price"];
               var wsp = allExistingPmData[sku]["webshop_selling_price"];
               if (allExistingPmData[sku]["afwijkenidealeverpakking"] == 0) {
                 bp = bp / allExistingPmData[sku]["idealeverpakking"];
                 gup = gup / allExistingPmData[sku]["idealeverpakking"];
                 wsp = wsp / allExistingPmData[sku]["idealeverpakking"];
               }
               if (gup == 0) {
                 gup = 1;
               }
               if (key == "Inkoopprijs (Inkpr per piece)") {
                 eachItem["buying_price"] = obj[key].toFixed(4);
               } else if (key == "Nieuwe Verkoopprijs (Niewe Vkpr per piece)") {
                 eachItem["selling_price"] = obj[key].toFixed(4);
                 var sp = obj[key].toFixed(4);
                 if (typeof obj["Inkoopprijs (Inkpr per piece)"] != "undefined") {
                   bp = obj["Inkoopprijs (Inkpr per piece)"].toFixed(4);
                 }

                 eachItem["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
                 eachItem["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
                 eachItem["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
                 eachItem["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
               } else {
                 var groupName = colAlias[key];
                 if (typeof obj["Inkoopprijs (Inkpr per piece)"] != "undefined") {
                   bp = obj["Inkoopprijs (Inkpr per piece)"].toFixed(4);
                 }
                 eachItem["group_" + groupName + "_magento_id"] = allExistingPmData[sku]["group_" + groupName + "_magento_id"];
                 eachItem["group_" + groupName + "_debter_selling_price"] = obj[key].toFixed(4);
                 var debsp = obj[key].toFixed(4);
                 eachItem["group_" + groupName + "_margin_on_buying_price"] = (((debsp - bp) / bp) * 100).toFixed(4);
                 eachItem["group_" + groupName + "_margin_on_selling_price"] = (((debsp - bp) / debsp) * 100).toFixed(4);
                 eachItem["group_" + groupName + "_discount_on_grossprice_b_on_deb_selling_price"] = ((1 - (debsp / gup)) * 100).toFixed(4);
               }

             }

             processXlsxData[sku] = eachItem;

           }
         }

         console.log(processXlsxData);
         */

        });
      }
    }

  }
}

function createHeaderSql() {
  //"INSERT INTO price_management_data (sku,selling_price, profit_percentage, profit_percentage_selling_price, discount_on_gross_price, percentage_increase) VALUES "
  //selling_price = VALUES(selling_price),profit_percentage = VALUES(profit_percentage),profit_percentage_selling_price = VALUES(profit_percentage_selling_price),discount_on_gross = VALUES(discount_on_gross), percentage_increase = VALUES(percentage_increase)
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
  //columnMappings["ZZP"] = "group_4027100_magento_id,group_4027100_debter_selling_price,group_4027100_margin_on_buying_price,group_4027100_margin_on_selling_price,group_4027100_discount_on_grossprice_b_on_deb_selling_price";
  columnMappings["Inkoopprijs (Inkpr per piece)"] = "buying_price,selling_price,profit_percentage,profit_percentage_selling_price,discount_on_gross_price,percentage_increase," + allDebCols + "";
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


