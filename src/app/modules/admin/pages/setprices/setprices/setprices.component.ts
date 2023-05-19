import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams, CellValueChangedEvent, CellEditingStoppedEvent, DragStoppedEvent, FullWidthCellKeyDownEvent, GetRowIdFunc, GetRowIdParams, SideBarDef } from 'ag-grid-community';
import 'ag-grid-enterprise';
import { AppConstants } from "src/app/app-constants";
import { PmCategoryService } from 'src/app/pm.category.service';
import { PmSidebarService } from 'src/app/pm-sidebar.service';
import { SideSetPricesComponent } from 'src/app/modules/admin/pages/setprices/setprices/side-set-prices/side-set-prices.component';

@Component({
  selector: 'app-setprices',
  templateUrl: './setprices.component.html',
  styleUrls: ['./setprices.component.css']
})
export class SetpricesComponent implements OnInit {

  api: any;
  gridParams: any;
  columnApi: any;
  cats: String = "";
  categoryChanged: String = "0";
  updatedProducts: any = [];
  subcat: any;
  subbtnclicked: any;
  chkAllCount: string;
  chkAllProducts: any;
  isChkAllChecked: number = 0;

  public rowModelType: 'serverSide' = 'serverSide';
  public serverSideStoreType: ServerSideStoreType = 'partial';
  public fillHandleDirection: 'x' | 'y' | 'xy' = 'x';

  //public rowModelType: 'serverSide';

  public paginationPageSize = 200;
  public cacheBlockSize = 200;
  rowStyle = { background: '' };
  getRowStyle = (params: RowClassParams) => this.rowStyle;

  constructor(private http: HttpClient, private categoryService: PmCategoryService, private sidebarService: PmSidebarService) { }

  ngOnInit() {
    this.subcat = this.categoryService.categorySelected.subscribe((allselectedcats) => {
      this.cats = allselectedcats;
      this.updatedProducts = [];
      this.loadAGGrid();
    });

    this.subbtnclicked = this.sidebarService.btnClicked.subscribe((priceType) => {
      var idsToUpdate = this.api.getSelectedNodes().map(function (node) {
        return node.data.product_id;
      });

      var err = 0;
      if (idsToUpdate.length == 0) {
        alert("Please select record first!!");
      } else {
        if (typeof priceType["type"] == "undefined") {
          alert("Please select price type");
          err = 1;
        }
        if (priceType["val"] == "") {
          alert("Please enter value");
          err = 1;
        }
        if (err == 0) {

          if (this.isChkAllChecked == 0) {
            this.api.forEachNode((rowNode) => {
              if (idsToUpdate.indexOf(rowNode.data.product_id) >= 0) {
                var updated = JSON.parse(JSON.stringify(rowNode.data));
                this.formProductData(updated,priceType);
              }
            });
          } else if (this.isChkAllChecked == 1) {
            if ((this.chkAllProducts["msg"]).length > 0) {
              this.chkAllCount = "(Please Wait ...)";
              this.chkAllProducts["msg"].forEach(
                (value, key) => {
                  //console.log(key);
                  //console.log(value.product_id);
                  this.formProductData(value,priceType);
                }
              )
            }
          }

          //console.log(this.updatedProducts); 
          this.saveUpdatedProducts(this.updatedProducts);

        }
      }

    });
  }

  ngOnDestroy() {
    this.subcat.unsubscribe();
    this.subbtnclicked.unsubscribe();
  }

  formProductData(prodData,priceType) {
    let new_selling_price = prodData.selling_price;
    let new_profit_percentage = prodData.profit_percentage;
    let new_profit_percentage_selling_price = prodData.profit_percentage_selling_price;
    let new_discount_on_gross_price = prodData.discount_on_gross_price;

    if (priceType["type"] == "selling_price") {
      new_selling_price = (1 + (priceType["val"] / 100)) * prodData.selling_price;
    } else if (priceType["type"] == "profit_percentage") {
      new_profit_percentage = priceType["val"];
    } else if (priceType["type"] == "profit_percentage_selling_price") {
      new_profit_percentage_selling_price = priceType["val"];
    } else if (priceType["type"] == "discount_on_gross_price") {
      new_discount_on_gross_price = priceType["val"];
    }

    var prepareProductData = [];
    prepareProductData["field"] = priceType["type"];
    prepareProductData["product_id"] = prodData.product_id;
    prepareProductData["buying_price"] = prodData.buying_price;
    prepareProductData["selling_price"] = new_selling_price;
    prepareProductData["profit_percentage"] = new_profit_percentage;
    prepareProductData["profit_percentage_selling_price"] = new_profit_percentage_selling_price;
    prepareProductData["discount_on_gross_price"] = new_discount_on_gross_price;
    prepareProductData["percentage_increase"] = prodData.percentage_increase;
    prepareProductData["gross_unit_price"] = prodData.gross_unit_price;
    prepareProductData["webshop_selling_price"] = prodData.webshop_selling_price;
    this.createProductData(prepareProductData);
  }

  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    { field: 'product_id', headerName: 'ID', sortable: true, filter: 'number' },
    {
      field: 'supplier_type', headerName: 'Leverancier', sortable: true, filter: 'agSetColumnFilter', filterParams: {
        values: ['Gyzs', 'JRS', 'Transferro']
      }
    },
    { field: 'name', headerName: 'Naam', sortable: true, filter: 'text' },
    { field: 'sku', headerName: 'SKU', sortable: true, filter: 'text' },
    { field: 'supplier_sku', headerName: 'SKU (Sup)', sortable: true, filter: 'text' },
    { field: 'eancode', headerName: 'Ean', sortable: true, filter: 'text' },
    { field: 'merk', headerName: 'Merk', sortable: true, filter: 'text' },
    { field: 'gross_unit_price', headerName: 'Brutopr', sortable: true, filter: 'number' },
    { field: 'supplier_discount_gross_price', headerName: 'Korting brutopr', sortable: true, filter: 'number' },
    { field: 'net_unit_price', headerName: 'Nettopr Lev', sortable: true, filter: 'number' },
    { field: 'idealeverpakking', headerName: 'Ideal.verp', sortable: true, filter: 'number' },
    { field: 'afwijkenidealeverpakking', headerName: 'Afw.Ideal.verp', sortable: true, filter: 'number' },
    { field: 'buying_price', headerName: 'PM Inkpr', sortable: true, filter: 'number' },
    { field: 'selling_price', headerName: 'PM Vkpr', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'profit_percentage', headerName: 'Marge Inkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'profit_percentage_selling_price', headerName: 'Marge Verkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'discount_on_gross_price', headerName: 'Korting Brupr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'percentage_increase', headerName: 'Stijging %', sortable: true, filter: 'number' },
    { field: 'magento_status', headerName: 'Status', sortable: true, filter: 'number' },
    { field: 'webshop_selling_price', headerName: 'WS Vkpr', sortable: true, filter: 'number' }

  ];

  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
      {
        id: 'sideSetPrices',
        labelDefault: 'Set Prices',
        labelKey: 'sideSetPrices',
        iconKey: 'app-side-set-prices',
        toolPanel: SideSetPricesComponent,
      },
    ],
    defaultToolPanel: 'columns',
  };


  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    resizable: true,
    enableCellChangeFlash: true
  };

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.product_id;
  };

  // Data that gets displayed in the grid
  public rowData: any;



  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    this.api = params.api;
    this.gridParams = params;
    this.columnApi = params.columnApi;
    this.loadAGGrid();

    this.getRowStyle = function (params) {
      if (typeof params.data != "undefined") {
        if (params.data.is_updated == 1) {
          return { background: '#e9f6ec' };
        } else {
          return { background: '' };
        }
      }
      return { background: '' };
    };

  }


  loadAGGrid() {
    var datasource = createServerSideDatasource(this.gridParams, this.cats);

    this.api.setServerSideDatasource(datasource);

    this.columnApi.setColumnVisible('product_id', false);
    this.columnApi.setColumnVisible('supplier_sku', false);
    this.columnApi.setColumnVisible('eancode', false);
    this.columnApi.setColumnVisible('idealeverpakking', false);
    this.columnApi.setColumnVisible('afwijkenidealeverpakking', false);
    this.columnApi.setColumnVisible('magento_status', false);
    this.columnApi.setColumnVisible('gross_unit_price', false);
    this.columnApi.setColumnVisible('supplier_discount_gross_price', false);
    this.columnApi.setColumnVisible('webshop_selling_price', false);
    this.columnApi.setColumnVisible('net_unit_price', false);
    this.columnApi.setColumnVisible('is_updated', false);

    this.fillHandleDirection = 'y';
  }
  onCellValueChanged(event: CellValueChangedEvent) {
    var prepareProductData = [];
    prepareProductData["field"] = event.colDef.field;
    prepareProductData["product_id"] = event.data.product_id;
    prepareProductData["buying_price"] = event.data.buying_price;
    prepareProductData["selling_price"] = event.data.selling_price;
    prepareProductData["profit_percentage"] = event.data.profit_percentage;
    prepareProductData["profit_percentage_selling_price"] = event.data.profit_percentage_selling_price;
    prepareProductData["discount_on_gross_price"] = event.data.discount_on_gross_price;
    prepareProductData["percentage_increase"] = event.data.percentage_increase;
    prepareProductData["gross_unit_price"] = event.data.gross_unit_price;
    prepareProductData["webshop_selling_price"] = event.data.webshop_selling_price;
    this.createProductData(prepareProductData);
  }

  createProductData(preparedProductData: any) {
    var productData = {};
    productData["field"] = preparedProductData["field"];
    productData["product_id"] = preparedProductData["product_id"];
    productData["buying_price"] = preparedProductData["buying_price"];
    productData["selling_price"] = preparedProductData["selling_price"];
    productData["profit_percentage"] = preparedProductData["profit_percentage"];
    productData["profit_percentage_selling_price"] = preparedProductData["profit_percentage_selling_price"];
    productData["discount_on_gross_price"] = preparedProductData["discount_on_gross_price"];
    productData["percentage_increase"] = preparedProductData["percentage_increase"];
    productData["gross_unit_price"] = preparedProductData["gross_unit_price"];
    productData["webshop_selling_price"] = preparedProductData["webshop_selling_price"];

    var processedData;
    processedData = processUpdatedProduct(productData);
    this.updatedProducts[preparedProductData["product_id"]] = processedData;
  }

  onCellEditingStopped(event: CellEditingStoppedEvent) {
    //console.log(this.updatedProducts);
    this.saveUpdatedProducts(this.updatedProducts);
    /* this.saveRow(this.updatedProducts); 
    setTimeout(()=>{                          
      this.updatedProducts = [];
      console.log(this.updatedProducts);
    }, 3000);
    */
  }
  onDragStopped(event: DragStoppedEvent) {
    //console.log(this.updatedProducts);
    this.saveUpdatedProducts(this.updatedProducts);
    /* this.saveRow(this.updatedProducts);
    this.updatedProducts = []; */
  }
  onCellKeyDown(e: FullWidthCellKeyDownEvent) {
    var keyPressed = (e.event as KeyboardEvent).key;
    if (keyPressed == "z") {
      //console.log(this.updatedProducts);
      this.saveUpdatedProducts(this.updatedProducts);
      /* this.saveRow(this.updatedProducts);
      this.updatedProducts = []; */
    }
  }

  onBtnClicked() {
    var rowNode = this.api.getRowNode('13');
    //console.log(rowNode);
    rowNode.setDataValue('selling_price', "100");
    //console.log(rowNode);
    //const newData = rowNode.data;
    //newData.selling_price = "250";

    //rowNode.updateData(newData);
  }


  saveRow(updatedProducts) {
    console.log(updatedProducts);
    updatedProducts.forEach(
      (value, key) => {
        var rowNode = this.api.getRowNode(key.toString());

        rowNode.setDataValue('selling_price', value["selling_price"]);
        rowNode.setDataValue('profit_percentage', value["profit_percentage"]);
        rowNode.setDataValue('profit_percentage_selling_price', value["profit_percentage_selling_price"]);
        rowNode.setDataValue('discount_on_gross_price', value["discount_on_gross_price"]);
      }
    );
    this.updatedProducts = [];
  }

  saveUpdatedProducts(processedData) {
    if(processedData.length > 0) {
      var filterProcessData = processedData.filter(function () { return true; });
      this.http.post(AppConstants.webservicebaseUrl + "/save-products", filterProcessData).subscribe(responseData => {
        if(responseData["msg"] == "done") {
          if(this.isChkAllChecked == 0) {
            this.saveRow(this.updatedProducts)
          } else if(this.isChkAllChecked == 1) {
            this.chkAllCount = "(" + (this.chkAllProducts["msg"]).length + " Products Updated Successfully)";
            this.updatedProducts = [];
            this.loadAGGrid();
          }
        }
      });
    }
  }

  getAllProducts(event) {
    if (event.target.checked) {
      var currentsql = localStorage.getItem("currentSql")?.trim();
      this.chkAllCount = "(Please Wait ...)";
      this.http.post(AppConstants.webservicebaseUrl + "/all-products", currentsql).subscribe(responseData => {
        this.chkAllProducts = responseData;
        this.chkAllCount = "(" + responseData["msg"].length + ")";
        this.isChkAllChecked = 1;

        /* responseData["msg"].forEach(
          (value, key) => {
            //console.log(key);
            //console.log(value["product_id"]);
          }
        ); */

      });
    } else {
      this.chkAllCount = "";
      this.chkAllProducts = "";
      this.isChkAllChecked = 0;
    }
  }

}



function createServerSideDatasource(server: any, cats: any): IServerSideDatasource {
  return {
    getRows(params) {

      params.request["cats"] = cats;
      //console.log(params.request);
      fetch(AppConstants.webservicebaseUrl + "/pm-products", {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { "Content-Type": "application/json; charset=utf-8" }
      })
        .then(httpResponse => httpResponse.json())
        .then(response => {

          //console.log(response);
          if (response.lastRow == null) {
            response.lastRow = 0;
          }
          //params.successCallback(response.rows, response.lastRow);
          var limitIndex = (response.currentSql).indexOf("limit");
          localStorage.setItem("currentSql", (response.currentSql).substring(0, limitIndex));
          params.success({ rowData: response.rows, rowCount: response.lastRow })

        })
        .catch(error => {
          // params.failCallback();
          params.fail();
        })
    }
  };
}

function processUpdatedProduct(productData) {
  var bp = parseFloat(productData.buying_price);
  var sp = parseFloat(productData.selling_price);
  var gup = (parseFloat(productData.gross_unit_price) == 0 ? 1 : parseFloat(productData.gross_unit_price));
  var wsp = parseFloat(productData.webshop_selling_price);

  switch (productData.field) {
    case "selling_price":
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
      productData["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
      productData["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
    case "profit_percentage":
      var pp = parseFloat(productData.profit_percentage);
      sp = ((1 + (pp / 100)) * bp);
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = pp.toFixed(4);
      productData["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
      productData["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
    case "profit_percentage_selling_price":
      var ppsp = parseFloat(productData.profit_percentage_selling_price);
      sp = (bp / (1 - (ppsp / 100)));
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
      productData["profit_percentage_selling_price"] = ppsp.toFixed(4);
      productData["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
    case "discount_on_gross_price":
      var dgp = parseFloat(productData.discount_on_gross_price);
      sp = ((1 - (dgp / 100)) * gup);
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
      productData["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
      productData["discount_on_gross_price"] = dgp.toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
  }
  return productData;
}


