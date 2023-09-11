import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ModalsComponent implements OnInit {

  api: any;
  gridParams: any;
  columnApi: any;

  public rowModelType: 'serverSide' = 'serverSide';
  public serverSideStoreType: ServerSideStoreType = 'partial';
  public paginationPageSize = 500;
  public cacheBlockSize = 500;
  rowStyle = { background: '' };
  getRowStyle = (params: RowClassParams) => this.rowStyle;
  historySku = "";
  historyEan = "";
  historyPid = "";
  subHistoryPid: any;

  bolSku = "";
  bolSub: any;
  bolCalculation = "";

  revenueSub: any;
  revenueStartDate: any;
  revenueEndDate: any;
  revenueSku: any;

  // Data that gets displayed in the grid
  public rowData: any;

  constructor(private CommonService: CommonService) { }

  ngOnInit(): void {
  }

  public columnDefs = [

    { field: 'updated_date_time', headerName: 'Date', sortable: true, filter: 'date' },
    {
      headerName: 'WebShop',
      children: [
        { field: 'old_net_unit_price', headerName: 'Nettopr', sortable: true, filter: 'number' },
        { field: 'old_gross_unit_price', headerName: 'Brutopr', sortable: true, filter: 'number' },
        { field: 'old_idealeverpakking', headerName: 'Ideal', sortable: true, filter: 'number' },
        { field: 'old_afwijkenidealeverpakking', headerName: 'Afw', sortable: true, filter: 'number' },
        {
          field: 'old_buying_price', headerName: 'Inkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if (JSON.parse(params.data["fields_changed"]).includes("old_buying_price")) {
              return { backgroundColor: '#c2c3e0' };
            }
            return null;
          }
        },
        {
          field: 'old_selling_price', headerName: 'Vkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if (JSON.parse(params.data["fields_changed"]).includes("old_selling_price")) {
              return { backgroundColor: '#c2c3e0' };
            }
            return null;
          }
        },
      ]
    },
    {
      headerName: 'PriceManagement',
      children: [
        { field: 'new_net_unit_price', headerName: 'Nettopr', sortable: true, filter: 'number' },
        { field: 'new_gross_unit_price', headerName: 'Brutopr', sortable: true, filter: 'number' },
        { field: 'new_idealeverpakking', headerName: 'Ideal', sortable: true, filter: 'number' },
        { field: 'new_afwijkenidealeverpakking', headerName: 'Afw', sortable: true, filter: 'number' },
        {
          field: 'new_buying_price', headerName: 'Inkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if (JSON.parse(params.data["fields_changed"]).includes("new_buying_price")) {
              return { backgroundColor: '#c2c3e0' };
            }
            return null;
          }

        },
        {
          field: 'new_selling_price', headerName: 'Vkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if (JSON.parse(params.data["fields_changed"]).includes("new_selling_price")) {
              return { backgroundColor: '#c2c3e0' };
            }
            return null;
          }

        }
      ]
    },
    { field: 'updated_by', headerName: 'From', sortable: true, filter: 'text' }
  ];

  public revenueColumnDefs = [

    { field: 'created_at', headerName: 'Created Date', sortable: true, filter: 'date' },
    { field: 'order_id', headerName: 'Order ID', sortable: true, filter: 'number' },
    { field: 'state', headerName: 'Order Status', sortable: true, filter: 'text' },
    { field: 'qty_ordered', headerName: 'Quantity Ordered', sortable: true, filter: 'number' },
    { field: 'qty_refunded', headerName: 'Quantity Refunded', sortable: true, filter: 'number' },
    { field: 'base_cost', headerName: 'Base Cost', sortable: true, filter: 'number' },
    { field: 'base_price', headerName: 'Base Price', sortable: true, filter: 'number' },
    { field: 'cost', headerName: 'Cost (If Afw.Ideal.verp = 0: Base Cost * Qty * Ideal.verp)<br>(If Afw.Ideal.verp = 1: Base Cost * Qty)', sortable: true, filter: 'number' },
    { field: 'price', headerName: 'Price<br>(Base Price * Qty)', sortable: true, filter: 'number' },
    { field: 'absolute_margin', headerName: 'Absolute Margin', sortable: true, filter: 'number' },
    { field: 'afwijkenidealeverpakking', headerName: 'Afw.Ideal.verp', sortable: true, filter: 'number' },
    { field: 'idealeverpakking', headerName: 'Ideal.verp', sortable: true, filter: 'number' }

  ];

  // DefaultColDef sets props common to all Columns

  public defaultColDef = {
    resizable: true,
    initialWidth: 200,
    wrapHeaderText: true,
    autoHeaderHeight: true,
  }



  onGridReady(params: GridReadyEvent) {

    this.bolSub = this.CommonService.bolCalculation.subscribe((bolData) => {
      this.bolSku = bolData[0];
      this.bolCalculation = bolData[1];
    });

    this.subHistoryPid = this.CommonService.productHistoryData.subscribe((productData) => {
      this.historyPid = productData[0];
      this.historySku = productData[1];
      this.historyEan = productData[2];
      this.api = params.api;
      this.gridParams = params;
      this.columnApi = params.columnApi;

      this.columnApi.applyColumnState({
        state: [{ colId: 'updated_date_time', sort: 'desc' }],
        defaultState: { sort: null },
      });

      this.columnApi.autoSizeAllColumns();

      this.loadAGGrid();

      this.getRowStyle = function (params) {
        if (typeof params.data != "undefined") {
          if (params.data.is_viewed == "No") {
            return { background: '#ea4a4a' };
          } else {
            return { background: '' };
          }
        }
        return { background: '' };
      };
    });

  }

  onRevGridReady(revparams: GridReadyEvent) {
    this.revenueSub = this.CommonService.revenueCalculation.subscribe((revenueData) => {
      this.revenueStartDate = revenueData[0];
      this.revenueEndDate = revenueData[1];
      this.revenueSku = revenueData[2];

      this.api = revparams.api;
      this.gridParams = revparams;
      this.columnApi = revparams.columnApi;
      this.columnApi.autoSizeAllColumns();
      this.loadRevenueAGGrid();
    });
  }

  ngOnDestroy() {
    this.subHistoryPid.unsubscribe();
    this.bolSub.unsubscribe();
    this.revenueSub.unsubscribe();
  }

  loadAGGrid() {
    var datasource = createServerSideDatasource(this.gridParams, this.historyPid);
    this.api.setServerSideDatasource(datasource);
  }

  loadRevenueAGGrid() {
    var datasource = createRevenueServerSideDatasource(this.gridParams, this.revenueStartDate, this.revenueEndDate, this.revenueSku);
    this.api.setServerSideDatasource(datasource);
  }

}

function createServerSideDatasource(server: any, historyPid: any): IServerSideDatasource {
  return {
    getRows(params) {

      params.request["historyPid"] = historyPid;
      fetch(environment.webservicebaseUrl + "/pm-products-history", {
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

function createRevenueServerSideDatasource(server: any, revenueStartDate: any, revenueEndDate: any, revenueSku: any): IServerSideDatasource {
  return {
    getRows(params) {

      params.request["revenueStartDate"] = revenueStartDate;
      params.request["revenueEndDate"] = revenueEndDate;
      params.request["revenueSku"] = revenueSku;

      fetch(environment.webservicebaseUrl + "/pm-order-history", {
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
