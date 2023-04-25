import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent,IServerSideDatasource,ServerSideStoreType,RowClassParams, CellValueChangedEvent, CellEditingStoppedEvent, DragStoppedEvent, FullWidthCellKeyDownEvent, GetRowIdFunc, GetRowIdParams} from 'ag-grid-community';
import { Observable, UnsubscriptionError } from 'rxjs';
import 'ag-grid-enterprise';
import { AppConstants } from "src/app/app-constants";
import { PmCategoryService } from 'src/app/pm.category.service';

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

  constructor(private http: HttpClient, private categoryService: PmCategoryService) {}

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
    { field: 'product_id', headerName: 'ID',sortable: true, filter: 'number' },
    {
      field: 'supplier_type', headerName: 'Leverancier',sortable: true, filter: 'agSetColumnFilter', filterParams: {
        values: ['Gyzs', 'JRS', 'Transferro']
      }
    },
    { field: 'name', headerName: 'Naam', sortable: true, filter: 'text' },
    { field: 'sku', headerName: 'SKU',  sortable: true, filter: 'text' },
    { field: 'supplier_sku', headerName: 'SKU (Sup)', sortable: true, filter: 'text'},
    { field: 'eancode', headerName: 'Ean', sortable: true, filter: 'text' },
    { field: 'merk', headerName: 'Merk', sortable: true, filter: 'text' },
    { field: 'idealeverpakking', headerName: 'Ideal.verp', sortable: true, filter: 'number' },
    { field: 'afwijkenidealeverpakking', headerName: 'Afw.Ideal.verp', sortable: true, filter: 'number' },
    { field: 'buying_price', headerName: 'PM Inkpr', sortable: true, filter: 'number' },
    { field: 'selling_price', headerName: 'PM Vkpr', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'profit_percentage', headerName: 'Marge Inkpr %', sortable: true, filter: 'number', editable: true, singleClickEdit: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'profit_percentage_selling_price', headerName: 'Marge Verkpr %', sortable: true, filter: 'number', editable: true, singleClickEdit: true, cellStyle: { 'background-color': '#ffffcc' }  },
    { field: 'discount_on_gross_price', headerName: 'Korting Brupr %', sortable: true, filter: 'number', editable: true, singleClickEdit: true, cellStyle: { 'background-color': '#ffffcc' }  },
    { field: 'percentage_increase', headerName: 'Stijging %', sortable: true, filter: 'number'  },
    { field: 'magento_status', headerName: 'Status', sortable: true, filter: 'number'  }

  ];


  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    resizable: true
  };

  // Data that gets displayed in the grid
  public rowData$!: Observable<any[]>;



  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    this.api = params.api;
    this.gridParams = params;
    this.columnApi = params.columnApi;
    this.loadAGGrid();
    /* this.rowData$ = this.http.get<any[]>('https://www.ag-grid.com/example-assets/row-data.json'); */
    //this.rowData$ = this.http.get<any[]>('https://hipexstaging2:QJfn2pstmS8pZrY@staging2.gyzs.nl/pdata/pdata.json');
  }


  loadAGGrid() {
    var datasource = createServerSideDatasource(this.gridParams,this.cats);
    
    this.api.setServerSideDatasource(datasource);
    
    this.columnApi.setColumnVisible('product_id', false);
    this.columnApi.setColumnVisible('supplier_sku', false);
    this.columnApi.setColumnVisible('eancode', false);
    this.columnApi.setColumnVisible('idealeverpakking', false);
    this.columnApi.setColumnVisible('afwijkenidealeverpakking', false);
    this.columnApi.setColumnVisible('magento_status', false);
    this.fillHandleDirection = 'y';
  }
  onCellValueChanged(event: CellValueChangedEvent) {
    var productData = {};
    productData["buying_price"] = event.data.buying_price;
    productData["selling_price"] = event.data.selling_price;
    productData["profit_percentage"] = event.data.profit_percentage;
    productData["profit_percentage_selling_price"] = event.data.profit_percentage_selling_price;
    productData["discount_on_gross_price"] = event.data.discount_on_gross_price;
    productData["percentage_increase"] = event.data.percentage_increase;
    this.updatedProducts[event.data.product_id] = productData;
  }
 
  onCellEditingStopped(event: CellEditingStoppedEvent) {
    console.log(this.updatedProducts);
    this.updatedProducts = [];
  }
  onDragStopped(event: DragStoppedEvent) {
    console.log(this.updatedProducts);
    this.updatedProducts = [];
  }
  onCellKeyDown(e: FullWidthCellKeyDownEvent) {
    var keyPressed = (e.event as KeyboardEvent).key;
    if(keyPressed == "z") {
      console.log(this.updatedProducts);
      this.updatedProducts = [];
    } 
  }
  onBtnClicked() {
    const selectedRows = this.api.getSelectedNodes();
    const transaction = {
      update: [{selectedRows[0].data, selling_price: "100" }],
    };
  }

}



function createServerSideDatasource(server: any,cats: any): IServerSideDatasource {
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
          if(response.lastRow == null) {
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
