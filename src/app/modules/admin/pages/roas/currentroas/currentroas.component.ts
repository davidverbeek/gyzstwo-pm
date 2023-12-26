import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { MatDatepicker } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx'
import { writeFile } from 'xlsx';
import { RoascalculationComponent } from '../roascalculation/roascalculation.component';
import { PmCategoryService } from '../../../../../services/pm.category.service';


@Component({
  selector: 'app-currentroas',
  templateUrl: './currentroas.component.html',
  styleUrls: ['./currentroas.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CurrentroasComponent implements OnInit {

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
  roasStartDate: any;
  roasEndDate: any;
  roasSetDate: any;
  roasLiveDate: any;
  subcat: any;
  cats: String = "";
  product_brands: any = [];

  @ViewChild('datepicker1') datepicker1: MatDatepicker<Date>;
  @ViewChild('datepicker2') datepicker2: MatDatepicker<Date>;
  sumRows = Array();
  selectedDate: any;
  roasBol: any;

  roasSpinner: any = false;
  isRoasDisabled: any = false;

  setroasSpinner: any = false;
  isSetRoasDisabled: any = false;

  exportroasSpinner: any = false;
  isExportRoasDisabled: any = false;

  constructor(private http: HttpClient, private categoryService: PmCategoryService) { }

  ngOnInit(): void {
    this.http.get(environment.webservicebaseUrl + "/get-roasdate").subscribe(roasDate => {
      this.roasSetDate = roasDate["message"][0]["new_roas_feed_from_date"] + " To " + roasDate["message"][0]["new_roas_feed_to_date"];
      this.roasLiveDate = roasDate["message"][0]["live_roas_feed_from_date"] + " To " + roasDate["message"][0]["live_roas_feed_to_date"];
    }
    );
    this.subcat = this.categoryService.categorySelected.subscribe((allselectedcats) => {
      this.cats = allselectedcats;
      this.loadAGGrid();
    });
  }

  ngOnDestroy() {
    this.subcat.unsubscribe();
  }

  public columnDefs = [
    {
      field: 'sku', headerName: 'Sku', sortable: true, filter: 'text'
    },
    { field: 'name', headerName: 'Name', sortable: true, filter: 'text' },
    {
      field: 'merk', headerName: 'Brand', sortable: true, filter: 'agSetColumnFilter', filterParams: {
        values: params => {
          this.product_brands = this.categoryService.product_brand_arr;

          // simulating async delay
          setTimeout(() => params.success(this.product_brands), 500);
        },
        refreshValuesOnOpen: true
      }
    },


    { field: 'total_quantity', headerName: 'Total Quantity', sortable: true, filter: 'number' },
    { field: 'total_orders', headerName: 'Total Orders', sortable: true, filter: 'number' },

    { field: 'total_orders_bol', headerName: 'Total Orders(Bol)', sortable: true, filter: 'number' },
    { field: 'total_quantity_bol', headerName: 'Total Quantity(Bol)', sortable: true, filter: 'number' },
    {
      field: 'return_general', headerName: 'Return General (Qty) (%)', sortable: true, filter: 'number',
      cellRenderer: params => {
        if (params.node.id == 0) {
          this.selectedDate = params.data["roas_genereated_date"];
          this.roasBol = params.data["roas_bol_status"];
        }
        return '<a href="#" data-toggle="tooltip" data-placement="top" data-html="true" title="' + params.data.return_help + '">' + params.value + '</a>';
      }
    },
    {
      field: 'return_bol', headerName: 'Return BOL (Qty) (%)', sortable: true, filter: 'number',
      cellRenderer: params => {
        return '<a href="#" data-toggle="tooltip" data-placement="top" data-html="true" title="' + params.data.return_help + '">' + params.value + '</a>';
      }
    },

    {
      field: 'return_nobol', headerName: 'Return NO-BOL (Qty) (%)', sortable: true, filter: 'number',
      cellRenderer: params => {
        return '<a href="#" data-toggle="tooltip" data-placement="top" data-html="true" title="' + params.data.return_help + '">' + params.value + '</a>';
      }
    },
    {
      field: 'return_order_general', headerName: 'Return General (Order) (%)', sortable: true, filter: 'number',
      cellRenderer: params => {
        return '<a href="#" data-toggle="tooltip" data-placement="top" data-html="true" title="' + params.data.return_order_help + '">' + params.value + '</a>';
      }
    },
    {
      field: 'return_order_bol', headerName: 'Return BOL (Order) (%)', sortable: true, filter: 'number',
      cellRenderer: params => {
        return '<a href="#" data-toggle="tooltip" data-placement="top" data-html="true" title="' + params.data.return_order_help + '">' + params.value + '</a>';
      }
    },
    {
      field: 'return_order_nobol', headerName: 'Return NO-BOL (Order) (%)', sortable: true, filter: 'number',
      cellRenderer: params => {
        return '<a href="#" data-toggle="tooltip" data-placement="top" data-html="true" title="' + params.data.return_order_help + '">' + params.value + '</a>';
      }
    },
    { field: 'parent_product_factor', headerName: 'Product Factor', sortable: true, filter: 'number' },
    { field: 'parent_absolute_margin', headerName: 'Absolute Margin (€)', sortable: true, filter: 'number' },
    { field: 'parent_return_margin', headerName: 'Return Margin (€)', sortable: true, filter: 'number' },
    { field: 'total_parent_margin', headerName: 'Total Margin (€)', sortable: true, filter: 'number' },
    { field: 'average_order_per_month', headerName: 'Average Orders month', sortable: true, filter: 'number' },
    { field: 'other_absolute_margin', headerName: 'Child Margin (€)', sortable: true, filter: 'number' },
    { field: 'total_absolute_margin', headerName: 'Total Absolute Margin (€)', sortable: true, filter: 'number' },
    { field: 'shipment_revenue', headerName: 'Shipment Revenue (€)', sortable: true, filter: 'number' },
    { field: 'shipment_cost', headerName: 'Shipment Cost (€)', sortable: true, filter: 'number' },
    { field: 'shipment_diff', headerName: 'Shipment Diff (€)', sortable: true, filter: 'number' },
    { field: 'employee_cost', headerName: 'Employee Cost (€)', sortable: true, filter: 'number' },
    { field: 'margin_after_deductions', headerName: 'Margin After Deductions (€)', sortable: true, filter: 'number' },
    { field: 'total_selling_price', headerName: 'Total Selling Price (€)', sortable: true, filter: 'number' },
    { field: 'payment_other_company_cost', headerName: 'Payment Other Company Cost (%)', sortable: true, filter: 'number' },
    { field: 'burning_margin', headerName: 'Burning Margin (%)', sortable: true, filter: 'number' },
    { field: 'roas_target', headerName: 'Roas Target (%)', sortable: true, filter: 'number' },
    { field: 'google_kosten', headerName: 'Google Kosten (€)', sortable: true, filter: 'number' },
    { field: 'google_roas', headerName: 'Google Roas (%)', sortable: true, filter: 'number' },
    { field: 'performance', headerName: 'Performance', sortable: true, filter: 'text' },
    { field: 'avg_per_cat', headerName: 'Average Per Category', sortable: true, filter: 'number' },
    { field: 'avg_per_cat_per_brand', headerName: 'Average Per Category Per Brand', sortable: true, filter: 'number' },
    {
      field: 'roas_per_cat_per_brand', headerName: 'Roas Per Category Per Brand', sortable: true, filter: 'number',
      cellRenderer: params => {
        return '<a href="#" data-toggle="tooltip" data-placement="top" data-html="true" title="' + params.data.roas_per_cat_per_brand_help + '">' + params.value + '</a>';
      }
    },
    { field: 'end_roas', headerName: 'End Roas (%)', sortable: true, filter: 'number' },
    {
      field: '', headerName: 'Calculation', cellRenderer: RoascalculationComponent
    },

  ];

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

    this.getRowStyle = function (params) {
      if (typeof params.data != "undefined") {
        if (params.data.performance == "Over Performance") {
          return { background: '#bce0bc' };
        } else if (params.data.performance == "Under Performance") {
          return { background: '#fadbd8' };
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
    this.product_brands = this.categoryService.setCategoryBrands(this.cats);
  }

  getStartDate(event: any) {
    var date = new Date(event.value.getTime()).getDate();
    var month = new Date(event.value.getTime()).getMonth() + 1;
    var year = new Date(event.value.getTime()).getFullYear();
    this.roasStartDate = year + "-" + month + "-" + date;
  }

  getEndDate(event: any) {
    var date = new Date(event.value.getTime()).getDate();
    var month = new Date(event.value.getTime()).getMonth() + 1;
    var year = new Date(event.value.getTime()).getFullYear();
    this.roasEndDate = year + "-" + month + "-" + date;
  }

  getRoas() {
    var date_range = Array();
    date_range[0] = this.roasStartDate;
    date_range[1] = this.roasEndDate;
    if (typeof date_range[0] == "undefined" || typeof date_range[1] == "undefined") {
      alert("Please select from and to date");
      return false;
    }

    this.roasSpinner = true;
    this.isRoasDisabled = true;
    this.http.post(environment.roasUrl, date_range).subscribe(responseData => {
      if (responseData["err"] == "error") {
        alert("Something Went wrong. Please try again with different date range")
      } else {
        this.loadAGGrid();
        this.getRowStyle = function (params) {
          if (typeof params.data != "undefined") {
            if (params.data.performance == "Over Performance") {
              return { background: '#bce0bc' };
            } else if (params.data.performance == "Under Performance") {
              return { background: '#fadbd8' };
            } else {
              return { background: '' };
            }
          }
          return { background: '' };
        };
      }
      this.roasSpinner = false;
      this.isRoasDisabled = false;
    });
  }

  exportRoas() {
    this.exportroasSpinner = true;
    this.isExportRoasDisabled = true;
    var currentsql = localStorage.getItem("currentSql")?.trim();
    this.http.post(environment.webservicebaseUrl + "/all-roas", currentsql).subscribe(responseRoasData => {
      var roasExportData: any = [];
      for (let i = 0; i < responseRoasData["msg"].length; i++) {
        var exportRoasItem: any = {};
        exportRoasItem["Roas Date Range"] = responseRoasData["msg"][i]["roas_genereated_date"];
        exportRoasItem["Bol"] = responseRoasData["msg"][i]["roas_bol_status"];
        exportRoasItem["Leverancier"] = responseRoasData["msg"][i]["supplier_type"];
        exportRoasItem["Artikelnummer (Artikel)"] = responseRoasData["msg"][i]["sku"];
        exportRoasItem["Naam"] = responseRoasData["msg"][i]["name"];
        exportRoasItem["Merk"] = responseRoasData["msg"][i]["merk"];
        exportRoasItem["Categories"] = responseRoasData["msg"][i]["categories"];
        exportRoasItem["total_quantity"] = responseRoasData["msg"][i]["total_quantity"];
        exportRoasItem["total_orders"] = responseRoasData["msg"][i]["total_orders"];
        exportRoasItem["total_orders_bol"] = responseRoasData["msg"][i]["total_orders_bol"];
        exportRoasItem["total_quantity_bol"] = responseRoasData["msg"][i]["total_quantity_bol"];
        exportRoasItem["return_general (% Qty)"] = responseRoasData["msg"][i]["return_general"];
        exportRoasItem["return_bol (% Qty)"] = responseRoasData["msg"][i]["return_bol"];
        exportRoasItem["return_nobol (% Qty)"] = responseRoasData["msg"][i]["return_nobol"];
        exportRoasItem["return_order_general (% Order)"] = responseRoasData["msg"][i]["return_order_general"];
        exportRoasItem["return_order_bol (% Order)"] = responseRoasData["msg"][i]["return_order_bol"];
        exportRoasItem["return_order_nobol (% Order)"] = responseRoasData["msg"][i]["return_order_nobol"];
        exportRoasItem["parent_product_factor"] = responseRoasData["msg"][i]["parent_product_factor"];
        exportRoasItem["parent_absolute_margin(€)"] = responseRoasData["msg"][i]["parent_absolute_margin"];
        exportRoasItem["parent_return_margin(€)"] = responseRoasData["msg"][i]["parent_return_margin"];
        exportRoasItem["total_parent_margin(€)"] = responseRoasData["msg"][i]["total_parent_margin"];
        exportRoasItem["average_order_per_month"] = responseRoasData["msg"][i]["average_order_per_month"];
        exportRoasItem["other_absolute_margin(€)"] = responseRoasData["msg"][i]["other_absolute_margin"];
        exportRoasItem["total_absolute_margin(€)"] = responseRoasData["msg"][i]["total_absolute_margin"];
        exportRoasItem["shipment_revenue(€)"] = responseRoasData["msg"][i]["shipment_revenue"];
        exportRoasItem["shipment_cost(€)"] = responseRoasData["msg"][i]["shipment_cost"];
        exportRoasItem["shipment_diff(€)"] = responseRoasData["msg"][i]["shipment_diff"];
        exportRoasItem["employee_cost(€)"] = responseRoasData["msg"][i]["employee_cost"];
        exportRoasItem["margin_after_deductions(€)"] = responseRoasData["msg"][i]["margin_after_deductions"];
        exportRoasItem["total_selling_price(€)"] = responseRoasData["msg"][i]["total_selling_price"];
        exportRoasItem["payment_other_company_cost(%)"] = responseRoasData["msg"][i]["payment_other_company_cost"];
        exportRoasItem["burning_margin(%)"] = responseRoasData["msg"][i]["burning_margin"];
        exportRoasItem["roas_target(%)"] = responseRoasData["msg"][i]["roas_target"];
        exportRoasItem["google_kosten(€)"] = responseRoasData["msg"][i]["google_kosten"];
        exportRoasItem["google_roas(%)"] = responseRoasData["msg"][i]["google_roas"];
        exportRoasItem["performance"] = responseRoasData["msg"][i]["performance"];
        exportRoasItem["avg_per_cat"] = responseRoasData["msg"][i]["avg_per_cat"];
        exportRoasItem["avg_per_cat_per_brand"] = responseRoasData["msg"][i]["avg_per_cat_per_brand"];
        exportRoasItem["roas_per_cat_per_brand"] = responseRoasData["msg"][i]["roas_per_cat_per_brand"];
        exportRoasItem["end_roas (%)"] = responseRoasData["msg"][i]["end_roas"];
        roasExportData[i] = exportRoasItem;
      }
      const worksheet = XLSX.utils.json_to_sheet(roasExportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue');
      writeFile(workbook, 'roasExport.xlsx');
      this.exportroasSpinner = false;
      this.isExportRoasDisabled = false;
    });
  }

  setRoasDate() {
    this.setroasSpinner = true;
    this.isSetRoasDisabled = true;

    var date_range = Array();
    date_range[0] = this.roasStartDate;
    date_range[1] = this.roasEndDate;
    if (typeof date_range[0] == "undefined" || typeof date_range[1] == "undefined") {
      alert("Please select from and to date");
      this.setroasSpinner = false;
      this.isSetRoasDisabled = false;
      return false;
    }

    if (confirm("Ready to GO LIVE with this Roas Date?\n\nBy clicking on below 'OK' button Roas will be calculated from " + date_range[0] + " To " + date_range[1] + "  and will GO LIVE in the NEXT CYCLE.")) {
      this.http.post(environment.webservicebaseUrl + "/set-roasdate", date_range).subscribe(responseData => {
        console.log(responseData);
        if (responseData["message"] != "success") {
          alert("Something went wrong please try again");
        } else {
          this.roasSetDate = date_range[0] + " To " + date_range[1];
        }
        this.setroasSpinner = false;
        this.isSetRoasDisabled = false;
      });
    }


  }
}

function createServerSideDatasource(server: any, cats: any): IServerSideDatasource {
  return {
    getRows(params) {

      params.request["cats"] = cats;
      fetch(environment.webservicebaseUrl + "/currentroas", {
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
