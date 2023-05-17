import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams, CellValueChangedEvent, CellEditingStoppedEvent, DragStoppedEvent, FullWidthCellKeyDownEvent, GetRowIdFunc, GetRowIdParams, SideBarDef } from 'ag-grid-community';
import { Observable, UnsubscriptionError } from 'rxjs';
import 'ag-grid-enterprise';
import { AppConstants } from "src/app/app-constants";
import { PmCategoryService } from 'src/app/pm.category.service';
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

  public rowModelType: 'clientSide' | 'infinite' | 'viewport' | 'serverSide' = 'serverSide';
  public serverSideStoreType: ServerSideStoreType = 'partial';
  public fillHandleDirection: 'x' | 'y' | 'xy' = 'x';

  //public rowModelType: 'serverSide';

  public paginationPageSize = 200;
  public cacheBlockSize = 200;
  rowStyle = { background: '' };
  getRowStyle = (params: RowClassParams) => this.rowStyle;

  constructor(private http: HttpClient, private categoryService: PmCategoryService) { }

  ngOnInit() {
    console.log("price");
    this.categoryService.categorySelected.subscribe((allselectedcats) => {
      //console.log(allselectedcats);
      this.cats = allselectedcats;
      this.loadAGGrid();
      //console.log(allselectedcats);
    })
    //this.categoryChanged = "1";

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
      if(typeof params.data != "undefined") {
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
    var productData = {};
    productData["field"] = event.colDef.field;
    productData["product_id"] = event.data.product_id;
    productData["buying_price"] = event.data.buying_price;
    productData["selling_price"] = event.data.selling_price;
    productData["profit_percentage"] = event.data.profit_percentage;
    productData["profit_percentage_selling_price"] = event.data.profit_percentage_selling_price;
    productData["discount_on_gross_price"] = event.data.discount_on_gross_price;
    productData["percentage_increase"] = event.data.percentage_increase;
    productData["gross_unit_price"] = event.data.gross_unit_price;
    productData["webshop_selling_price"] = event.data.webshop_selling_price;

    var processedData;
    processedData = processUpdatedProduct(productData);
    this.updatedProducts[event.data.product_id] = processedData;
    //console.log(this.updatedProducts);
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
    updatedProducts.forEach(
      (value, key) => {
        var rowNode = this.api.getRowNode(key.toString());
        console.log(rowNode);
        rowNode.setDataValue('selling_price', value["selling_price"]);
        rowNode.setDataValue('profit_percentage', value["profit_percentage"]);
        rowNode.setDataValue('profit_percentage_selling_price', value["profit_percentage_selling_price"]);
        rowNode.setDataValue('discount_on_gross_price', value["discount_on_gross_price"]);
      }
    );
    this.updatedProducts = [];
  }

  saveUpdatedProducts(processedData) {
    console.log(processedData);
    var filterProcessData = processedData.filter(function () { return true; });
    this.http.post(AppConstants.webservicebaseUrl + "/save-products", filterProcessData).subscribe(responseData => {
      // console.log(responseData);
      this.saveRow(this.updatedProducts)
    });


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


