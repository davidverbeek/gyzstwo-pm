import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { MatDatepicker } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { RevenuefooterComponent } from '../revenuefooter/revenuefooter.component';



@Component({
  selector: 'app-revenue',
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RevenueComponent implements OnInit {

  api: any;
  gridParams: any;
  columnApi: any;
  public rowModelType: 'serverSide' = 'serverSide';
  public serverSideStoreType: ServerSideStoreType = 'partial';
  public paginationPageSize = 500;
  public cacheBlockSize = 500;
  rowStyle = { background: '' };
  getRowStyle = (params: RowClassParams) => this.rowStyle;
  public rowData: any;
  revenueStartDate: any;
  revenueEndDate: any;

  @ViewChild('datepicker1') datepicker1: MatDatepicker<Date>;
  @ViewChild('datepicker2') datepicker2: MatDatepicker<Date>;
  sumRows = Array();
  selectedDate: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    var skuVericaleSom: any;

    this.http.get(environment.webservicebaseUrl + "/get-pm-revenue").subscribe(currentRevenueData => {
      this.sumRows.push({ "sku_vericale_som": currentRevenueData["revenueData"][0]["sku_vericale_som"] });
      this.sumRows.push({ "sku_vericale_som_bp": currentRevenueData["revenueData"][0]["sku_vericale_som_bp"] });
      skuVericaleSom = currentRevenueData["revenueData"][0]["sku_vericale_som"];
      this.selectedDate = currentRevenueData["revenueData"][0]["reportdate"];
    }
    );

    this.http.get(environment.webservicebaseUrl + "/get-pm-revenue-sum").subscribe(currentRevenueSumData => {
      this.sumRows.push({ "sku_abs_margin": currentRevenueSumData["revenueSumData"][0]["tot_abs_margin"] });
      this.sumRows.push({ "sku_refund_revenue_amount": currentRevenueSumData["revenueSumData"][0]["tot_refund_amount"] });
      this.sumRows.push({ "sku_margin_sp": (currentRevenueSumData["revenueSumData"][0]["tot_abs_margin"] / skuVericaleSom).toFixed(2) });

      var rows = createData(this.sumRows);
      this.api.setPinnedBottomRowData(rows);
    }
    );
  }
  // Each Column Definition results in one Column.
  public columnDefs = [
    { field: 'id', headerName: 'Id', sortable: true, filter: 'number' },
    { field: 'supplier_type', headerName: 'Leverancier', sortable: true, filter: 'text' },
    { field: 'sku', headerName: 'Sku', sortable: true, filter: 'text' },
    { field: 'name', headerName: 'Name', sortable: true, filter: 'text' },
    { field: 'merk', headerName: 'Merken', sortable: true, filter: 'text' },
    { field: 'sku_total_quantity_sold', headerName: 'Afzet', sortable: true, filter: 'number' },
    { field: 'sku_total_price_excl_tax', headerName: 'Omzet', sortable: true, filter: 'number' },
    { field: 'sku_vericale_som', headerName: 'Vericale som', sortable: true, filter: 'number' },
    { field: 'vericale_som_percentage', headerName: 'Vericale som (%)', sortable: true, filter: 'number' },
    { field: 'sku_bp_excl_tax', headerName: 'Buying Price', sortable: true, filter: 'number' },
    { field: 'sku_sp_excl_tax', headerName: 'Selling Price', sortable: true, filter: 'number' },
    { field: 'sku_abs_margin', headerName: 'Absolute margin', sortable: true, filter: 'number' },
    { field: 'sku_margin_bp', headerName: 'Profit margin BP %', sortable: true, filter: 'number' },
    { field: 'sku_margin_sp', headerName: 'Profit margin SP %', sortable: true, filter: 'number' },
    { field: 'sku_vericale_som_bp', headerName: 'Vericale som (BP)', sortable: true, filter: 'number' },
    { field: 'sku_vericale_som_bp_percentage', headerName: 'Vericale som (BP %)', sortable: true, filter: 'number' },
    { field: 'sku_refund_qty', headerName: 'Refund Quantities', sortable: true, filter: 'number' },
    { field: 'sku_refund_revenue_amount', headerName: 'Refund Amount', sortable: true, filter: 'number' },
    { field: 'sku_refund_bp_amount', headerName: 'Refund Amount (BP)', sortable: true, filter: 'number' },
    { field: 'sku_vericale_som_abs', headerName: 'Abs Mar. Vericale som', sortable: true, filter: 'number' },
    { field: 'sku_vericale_som_abs_percentage', headerName: 'Abs Mar. Vericale som %', sortable: true, filter: 'number' }
  ];

  // DefaultColDef sets props common to all Columns
  public defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 150,
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

  // Handle date selection for Datepicker 1
  getStartDate(event: any) {
    var date = new Date(event.value.getTime()).getDate();
    var month = new Date(event.value.getTime()).getMonth() + 1;
    var year = new Date(event.value.getTime()).getFullYear();
    this.revenueStartDate = year + "-" + month + "-" + date;
  }

  getEndDate(event: any) {
    var date = new Date(event.value.getTime()).getDate();
    var month = new Date(event.value.getTime()).getMonth() + 1;
    var year = new Date(event.value.getTime()).getFullYear();
    this.revenueEndDate = year + "-" + month + "-" + date;
  }

  getRevenue() {
    var date_range = Array();
    date_range[0] = this.revenueStartDate;
    date_range[1] = this.revenueEndDate;

    this.http.post(environment.revenueUrl, date_range).subscribe(responseData => {

      var sumRows = Array();

      sumRows.push({ "sku_vericale_som": responseData["total_revenue"] });
      sumRows.push({ "sku_vericale_som_bp": responseData["total_bp"] });
      sumRows.push({ "sku_refund_revenue_amount": responseData["tot_refund_amount"] });
      sumRows.push({ "sku_abs_margin": responseData["tot_abs_margin"] });
      sumRows.push({ "sku_margin_sp": responseData["tot_pm_sp"] });
      this.selectedDate = responseData["date_selected"];
      this.loadAGGrid();
      var rows = createData(sumRows);
      this.api.setPinnedBottomRowData(rows);
    });

  }



}



function createServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows(params) {

      fetch(environment.webservicebaseUrl + "/pm-revenue", {
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

function createData(sumRow) {
  var result: any[] = [];
  var bottomRow = "";
  for (let row in Object.keys(sumRow)) {
    for (let col in sumRow[row]) {
      bottomRow += col + ":" + sumRow[row][col] + ",";
    }
  }
  bottomRow = bottomRow.replace(/,+$/, '');
  result.push(eval('({' + bottomRow + '})'));
  return result;
}