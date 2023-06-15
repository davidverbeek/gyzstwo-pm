import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
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
        { field: 'old_buying_price', headerName: 'Inkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if(JSON.parse(params.data["fields_changed"]).includes("old_buying_price")) {
              return {backgroundColor: '#c2c3e0'};
            }
            return null;
          }
        },
        { field: 'old_selling_price', headerName: 'Vkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if(JSON.parse(params.data["fields_changed"]).includes("old_selling_price")) {
              return {backgroundColor: '#c2c3e0'};
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
        { field: 'new_buying_price', headerName: 'Inkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if(JSON.parse(params.data["fields_changed"]).includes("new_buying_price")) {
              return {backgroundColor: '#c2c3e0'};
            }
            return null;
          }
      
        },
        {
          field: 'new_selling_price', headerName: 'Vkpr', sortable: true, filter: 'number',
          cellStyle: params => {
            if(JSON.parse(params.data["fields_changed"]).includes("new_selling_price")) {
              return {backgroundColor: '#c2c3e0'};
            }
            return null;
          }

        }
      ]
    },
    { field: 'updated_by', headerName: 'From', sortable: true, filter: 'text' }
  ];

  // DefaultColDef sets props common to all Columns
  public defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    resizable: true
  };

  onGridReady(params: GridReadyEvent) {
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

  ngOnDestroy() {
    this.subHistoryPid.unsubscribe();
  }

  loadAGGrid() {
    var datasource = createServerSideDatasource(this.gridParams, this.historyPid);
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
