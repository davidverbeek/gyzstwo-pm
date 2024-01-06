import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { CommonService } from 'src/app/services/common.service';
import { BolmincalculationComponent } from '../bolmincalculation/bolmincalculation.component';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-bolminimum',
  templateUrl: './bolminimum.component.html',
  styleUrls: ['./bolminimum.component.css']
})
export class BolminimumComponent implements OnInit {

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
  ecDeliveryTimes: any;
  ecDeliveryTimesBE: any;
  chkAllCount: string;
  chkAllProducts: any;
  isChkAllChecked: number = 0;
  updatedBolProducts: any = [];
  alertType = "info";
  strongalertMessage = "Information! ";
  alertMessage = "Edit status will be available here";

  // Data that gets displayed in the grid
  public rowData: any;

  constructor(private CommonService: CommonService, private http: HttpClient) { }

  ngOnInit(): void {
    this.updatedBolProducts = [];

    this.http.get(environment.webservicebaseUrl + "/get-ec-deliverytimes").subscribe(ecDeliveryTimes => {
      this.ecDeliveryTimes = ecDeliveryTimes["msg"];
    }
    );

    this.http.get(environment.webservicebaseUrl + "/get-ec-deliverytimes-be").subscribe(ecDeliveryTimesBE => {
      this.ecDeliveryTimesBE = ecDeliveryTimesBE["msg"];
    }
    );

  }

  // Each Column Definition results in one Column.
  public columnDefs = [
    { field: 'product_id', headerName: 'ID', sortable: true, filter: 'number', hide: true },
    { field: 'product_sku', headerName: 'SKU', sortable: true, filter: 'text', cellRenderer: BolmincalculationComponent },
    { field: 'supplier_type', headerName: 'Supplier', sortable: true, filter: 'text' },
    { field: 'product_bol_minimum_price', headerName: 'Bol Min. Price', sortable: true, filter: 'number' },
    { field: 'product_bol_selling_price', headerName: 'Bol Selling Price', sortable: true, filter: 'number' },
    { field: 'ec_deliverytime_text', headerName: 'EC Delivery Time', sortable: true, filter: 'text' },
    { field: 'ec_deliverytime_be_text', headerName: 'EC Delivery Time BE', sortable: true, filter: 'text' },
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

  updateEcDeliveryTime(event) {
    var selectedDeliveryTime = event.target.id;
    var selectedDeliveryTimeValue = event.target.value;
    var makeRequestTo = "";
    var selectedDeliveryTimeCol = "";

    if (selectedDeliveryTime == "select_ec_deliverytime") {
      makeRequestTo = "save-bol-delivery-time";
      selectedDeliveryTimeCol = "ec_deliverytime";

    } else if (selectedDeliveryTime == "select_ec_deliverytime_be") {
      makeRequestTo = "save-bol-delivery-time-be";
      selectedDeliveryTimeCol = "ec_deliverytime_be";
    }

    var idsToUpdate = this.api.getSelectedNodes().map(function (node) {
      return node.data.product_id;
    });

    if (idsToUpdate.length == 0) {
      this.alertType = "danger";
      this.strongalertMessage = "Validation! ";
      this.alertMessage = "Please select record first!!";
    } else {
      if (this.isChkAllChecked == 0) {
        this.api.forEachNode((rowNode) => {
          if (idsToUpdate.indexOf(rowNode.data.product_id) >= 0) {
            var updated = JSON.parse(JSON.stringify(rowNode.data));
            var prepareProductData = {};
            prepareProductData["product_id"] = updated.product_id;
            prepareProductData[selectedDeliveryTimeCol] = selectedDeliveryTimeValue;
            this.updatedBolProducts[updated.product_id] = prepareProductData;
          }
        });
      } else if (this.isChkAllChecked == 1) {
        if ((this.chkAllProducts["msg"]).length > 0) {
          this.chkAllProducts["msg"].forEach(
            (value, key) => {
              var prepareProductData = {};
              prepareProductData["product_id"] = value.product_id;
              prepareProductData[selectedDeliveryTimeCol] = selectedDeliveryTimeValue;
              this.updatedBolProducts[value.product_id] = prepareProductData;
            }
          )
        }
      }
    }


    var filterBolProcessData = this.updatedBolProducts.filter(function () { return true; });
    if (filterBolProcessData.length > 0) {
      this.http.post(environment.webservicebaseUrl + "/" + makeRequestTo + "", filterBolProcessData).subscribe(responseData => {
        if (responseData["msg"] > 0) {
          if (this.isChkAllChecked == 0) {
            this.updatedBolProducts = [];
            this.loadAGGrid();
          } else if (this.isChkAllChecked == 1) {
            //this.chkAllCount = "(" + (this.chkAllProducts["msg"]).length + " Delivery Time Updated Successfully)";
            this.updatedBolProducts = [];
            this.loadAGGrid();
          }
          this.alertType = "success";
          this.strongalertMessage = "Success! ";
          this.alertMessage = "Successfully updated " + responseData["msg"] + " product(s) [" + makeRequestTo + "]";

        }
      });
    }
  }

  getAllProducts(event) {
    if (event.target.checked) {
      var currentsql = localStorage.getItem("currentSql")?.trim();
      this.chkAllCount = "(Please Wait ...)";
      this.http.post(environment.webservicebaseUrl + "/all-products", currentsql).subscribe(responseData => {
        this.chkAllProducts = responseData;
        this.chkAllCount = "(" + responseData["msg"].length + ")";
        this.isChkAllChecked = 1;

        this.api.forEachNode((rowNode) => {
          rowNode.setSelected(true)
        });


      });
    } else {
      this.chkAllCount = "";
      this.chkAllProducts = "";
      this.isChkAllChecked = 0;

      this.api.forEachNode((rowNode) => {
        rowNode.setSelected(false)
      });

    }
  }

}

function createServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows(params) {

      if (params.request["sortModel"].length == 0) {
        params.request["sortModel"] = [{ sort: 'desc', colId: 'updated_date_time' }];
      }

      fetch(environment.webservicebaseUrl + "/pm-bol-minimum", {
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
