
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef, GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams, CellValueChangedEvent, CellEditingStoppedEvent, DragStoppedEvent, FullWidthCellKeyDownEvent, GetRowIdFunc, GetRowIdParams, SideBarDef, PaginationChangedEvent
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import { environment } from 'src/environments/environment';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-verifyprices',
  templateUrl: './verifyprices.component.html',
  styleUrls: ['./verifyprices.component.css']
})
export class VerifypricesComponent implements OnInit {

  public rowModelType: 'serverSide' = 'serverSide';
  rowStyle = { background: '' };
  public paginationPageSize = 500;
  public cacheBlockSize = 500;
  api: any;
  gridParams: any;
  public fillHandleDirection: 'x' | 'y' | 'xy' = 'x';
  columnApi: any;
  public serverSideStoreType: ServerSideStoreType = 'partial';
  private firstObsSubscription: Subscription;


  getRowStyle = (params: RowClassParams) => this.rowStyle;

  public columnDefs: ColDef[] = [
    { field: 'product_id', headerName: 'ID', sortable: true, filter: 'number', hide: true },
    { field: 'sku', headerName: 'SKU', sortable: true, filter: 'text' },
    { field: 'gross_unit_price', headerName: 'Brutopr', sortable: true, filter: 'number' },
    { field: 'buying_price', headerName: 'PM Inkpr', sortable: true, filter: 'number' },
    { field: 'selling_price', headerName: 'PM Vkpr', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'profit_percentage', headerName: 'Marge Inkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'profit_percentage_selling_price', headerName: 'Marge Verkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'discount_on_gross_price', headerName: 'Korting Brupr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'verify_profit_percentage', headerName: 'Verify Marge Inkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'verify_profit_percentage_sp', headerName: 'Verify Marge Verkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'verify_discount_on_gp', headerName: 'Verify Korting Brupr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'diff_profit_percentage_bp', headerName: 'Diff Marge Inkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'diff_profit_percentage_sp', headerName: 'Diff Marge Verkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'diff_discount_percentage_gp', headerName: 'Diff Korting Brupr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
  ];


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  onVerifyPrices() {
    $("#showloader_of_vp").addClass("loader");
    var store_html = $("#showloader_of_vp").find('span').html();
    $("#showloader_of_vp").find('span').html('Please wait....updating Selling Price.');
    $("showloader_of_vp.loader_txt").show();
    // this.api.refreshServerSide([], false);
    this.http
      .get(environment.webservicebaseUrl + '/verify-pmd-prices')
      .subscribe(msg => {
        $(".loader_txt").hide();

        alert(msg['msg']);
        //this.api.refreshServerSide([], false);
        this.loadAGGrid();
      })
  }

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 115,
    resizable: true
  };

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.product_id;
  };

  // Data that gets displayed in the grid
  public rowData: any;



  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  loadAGGrid() {
    const datasource = createServerSideDatasource(this.gridParams);
    this.api.setServerSideDatasource(datasource);
    this.fillHandleDirection = 'y';
  }

  onGridReady(params: GridReadyEvent) {
    this.api = params.api;
    this.gridParams = params;
    this.columnApi = params.columnApi;
    this.loadAGGrid();


    this.getRowStyle = function (params) {
      if (typeof params.data != "undefined") {
        if (params.data.is_updated == 1 && params.data.is_updated_skwirrel == 1) {
          return { background: '#bce0bc' };
        } else {
          return { background: '' };
        }
      }
      return { background: '' };
    };


  }

  OnDestroy(): void {
    this.firstObsSubscription.unsubscribe();
  }

}

function createServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows(params) {




      fetch(environment.webservicebaseUrl + "/verified-pmd-prices", {
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
          params.success({ rowData: response.rows, rowCount: response.lastRow });

        })
        .catch(error => {
          // params.failCallback();
          params.fail();
        })
    }
  };
}
