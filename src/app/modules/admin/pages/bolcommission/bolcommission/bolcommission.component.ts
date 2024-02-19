import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-bolcommission',
  templateUrl: './bolcommission.component.html',
  styleUrls: ['./bolcommission.component.css']
})
export class BolcommissionComponent implements OnInit {

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

  ngOnInit(): void { }

  // Each Column Definition results in one Column.
  public columnDefs = [
    { field: 'product_sku', headerName: 'SKU', sortable: true, filter: 'text' },
    { field: 'product_verpakkingsEAN', headerName: 'VerpakkingsEAN', sortable: true, filter: 'text' },
    { field: 'api_condition', headerName: 'Condition', sortable: true, filter: 'text' },
    { field: 'api_unit_price', headerName: 'UnitPrice', sortable: true, filter: 'number' },
    { field: 'api_fixed_amout', headerName: 'Fixed Amout', sortable: true, filter: 'number' },
    { field: 'api_percentage', headerName: 'Percentage', sortable: true, filter: 'number' },
    { field: 'api_total_cost', headerName: 'Total Cost', sortable: true, filter: 'number' },
    { field: 'updated_date_time', headerName: 'Updated Date', sortable: true }
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
    this.api = params.api;
    this.gridParams = params;
    this.columnApi = params.columnApi;
    this.loadAGGrid();
  }

  loadAGGrid() {
    var datasource = createServerSideDatasource(this.gridParams);
    this.api.setServerSideDatasource(datasource);
  }
}

function createServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows(params) {

      fetch(environment.webservicebaseUrl + "/pm-bol-commission", {
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
          params.success({ rowData: response.rows, rowCount: response.lastRow })

        })
        .catch(error => {
          // params.failCallback();
          params.fail();
        })
    }
  };
}
