import { Component, ViewEncapsulation } from '@angular/core';
import { IToolPanelAngularComp } from 'ag-grid-angular';
import { IToolPanelParams } from 'ag-grid-community';
import { PmSidebarService } from '../../../../../../services/pm-sidebar.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx'
import { DatePipe } from '@angular/common';
import { writeFile } from 'xlsx';


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

  constructor(private sidebarService: PmSidebarService, private http: HttpClient, private datePipe: DatePipe) {

    let alldebString = localStorage.getItem("allDebts");
    this.getAllDebtors = JSON.parse(alldebString || '{}');
    this.currentDateTime = this.datePipe.transform((new Date), 'yyyy-MM-dd hh:mm:ss');

  }

  agInit(params: IToolPanelParams): void { }

  textPlacehoder: string = "";
  textButton: string = "Update Price";
  txtValue: string = "";
  selCG: string = "";
  priceType: any = [];
  xlsxPrices: any = "";
  uploadMessage: any = "";
  uploadSpinner: any = false;

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
  btnExportPrices() {

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
          exportItem[idAlias[1]] = (debPrice == "" ? 0 : debPrice);
          exportItem["Marge Inkpr % (" + idAlias[1] + ")"] = responseData["msg"][i][debMarginOnBuyingPriceCol];
          exportItem["Marge Verkpr % (" + idAlias[1] + ")"] = responseData["msg"][i][debMarginOnSellingPriceCol];
        }

        exportData[i] = exportItem;
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Prices');
      writeFile(workbook, 'priceExport.xlsx');

    });
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
        this.uploadSpinner = true;
        this.uploadMessage = "";
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
            break;
          } else {
            var allMappedCols = colMaps[xlsxCol].split(",");
            for (let mappedCol of allMappedCols) {
              queryHead.push(mappedCol);
              queryFoot.push("" + mappedCol + " = VALUES (" + mappedCol + ")");
            }
          }
        }

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

          // Get All Xlsx Data
          var processXlsxData: any = [];
          var processHistoryData: any = [];
          var sku = "";

          for (var xlsxRow = 0; xlsxRow < maxXlsxRows; xlsxRow++) {
            var eachItem = {};
            var eachHistoryItem = {};
            for (var xlsxCol = 0; xlsxCol < maxXlsxColumns; xlsxCol++) {
              if (xlsxRow == 0) {
                continue;
              }
              if (this.xlsxPrices[0][xlsxCol] == "Artikelnummer (Artikel)") {
                eachItem["sku"] = this.xlsxPrices[xlsxRow][xlsxCol];
                sku = this.xlsxPrices[xlsxRow][xlsxCol];

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

                /* if (allExistingPmData[sku]["afwijkenidealeverpakking"] == 0) {
                  bp = bp / allExistingPmData[sku]["idealeverpakking"];
                  sp = sp / allExistingPmData[sku]["idealeverpakking"];
                  gup = gup / allExistingPmData[sku]["idealeverpakking"];
                  wsp = wsp / allExistingPmData[sku]["idealeverpakking"];
                } */
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

                var buying_price_index = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Inkoopprijs (Inkpr per piece)");
                if (typeof buying_price_index != "undefined") {
                  bp = parseFloat(this.xlsxPrices[xlsxRow][buying_price_index]);
                  if (afwijkenidealeverpakking == 0) {
                    bp = bp * idealeverpakking;
                  }
                }
                bp = bp.toFixed(4);

                if (typeof this.xlsxPrices[xlsxRow][xlsxCol] == "undefined") {
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
                  var buying_price_index = Object.keys(getXlsxCols).find(key => getXlsxCols[key] === "Inkoopprijs (Inkpr per piece)");
                  if (typeof buying_price_index != "undefined") {
                    bp = parseFloat(this.xlsxPrices[xlsxRow][buying_price_index]);
                    if (afwijkenidealeverpakking == 0) {
                      bp = bp * idealeverpakking;
                    }
                  }
                  bp = bp.toFixed(4);
                  var debsp: any = "";
                  if (typeof this.xlsxPrices[xlsxRow][xlsxCol] == "undefined") {
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
              eachItem["is_updated"] = 1;
              eachItem["is_updated_skwirrel"] = 1;
              processXlsxData[xlsxRow] = eachItem;

              var historyBP = eachItem["buying_price"];
              if (typeof historyBP == "undefined") {
                historyBP = allExistingPmData[eachItem["sku"]]["buying_price"];
              }

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

          //console.log(processXlsxData.length);

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

            //console.log(uploadRequestData);

            this.http.post(environment.webservicebaseUrl + "/upload-products", uploadRequestData).subscribe(responseData => {
              this.uploadMessage = responseData["msg"].join("\n");
              this.uploadSpinner = false;
            });
          }
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


