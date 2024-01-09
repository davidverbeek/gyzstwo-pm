import { Component, OnInit } from '@angular/core';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { environment } from 'src/environments/environment';
import { PmCategoryService } from '../../../../../services/pm.category.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-liveroas',
  templateUrl: './liveroas.component.html',
  styleUrls: ['./liveroas.component.css']
})
export class LiveroasComponent implements OnInit {

  api: any;
  gridParams: any;
  columnApi: any;
  subcat: any;
  cats: String = "";
  product_brands: any = [];

  avg_roas: any;
  avg_end_roas: any;
  avg_roas_with_google_kosten: any;
  avg_end_roas_with_google_kosten: any;
  avg_roas_google: any;
  helpavgroasall: any;
  helpavgendroasall: any;
  helpavgroasadwords: any;
  helpavgendroasadwords: any;
  helpavgroasgoogle: any;

  roasLiveDate: any;
  lastRunDate: any;
  selectedDate: any;
  roasBol: any;

  ermSpinner: any = false;
  isermDisabled: any = false;

  flag_of_cat_change: Number = 0;

  alertType = "info";
  strongalertMessage = "Information! ";
  alertMessage = "Edit status will be available here";


  public rowModelType: 'serverSide' = 'serverSide';
  public serverSideStoreType: ServerSideStoreType = 'partial';
  public paginationPageSize = 500;
  public cacheBlockSize = 500;
  rowStyle = { background: '' };
  getRowStyle = (params: RowClassParams) => this.rowStyle;
  public rowData: any;

  // Each Column Definition results in one Column.
  public columnDefs = [
    { field: 'product_id', headerName: 'ProductID', sortable: true, filter: 'number' },
    { field: 'sku', headerName: 'SKU', sortable: true, filter: 'text' },
    {
      field: 'name', headerName: 'Name', sortable: true, filter: 'text', cellRenderer: params => {
        if (params.node.id == 0) {
          this.selectedDate = params.data["roas_genereated_date"];
          this.roasBol = params.data["roas_bol_status"];
        }
        return params.value;

      }
    },
    {
      field: 'merk', headerName: 'Merk', sortable: true, filter: 'agSetColumnFilter', filterParams: {
        values: params => {
          this.product_brands = this.categoryService.product_brand_arr;

          // simulating async delay
          setTimeout(() => params.success(this.product_brands), 500);
        },
        refreshValuesOnOpen: true
      }
    },
    { field: 'carrier_level', headerName: 'Carrier Level', sortable: true, filter: 'text' },
    { field: 'total_orders', headerName: 'Total Orders', sortable: true, filter: 'number' },
    { field: 'roas_target', headerName: 'Roas Target (%)', sortable: true, filter: 'number' },
    { field: 'roas_per_cat_per_brand', headerName: 'Roas Per Category Per Brand', sortable: true, filter: 'number' },
    { field: 'end_roas', headerName: 'End Roas (%)', sortable: true, filter: 'number' }
  ];

  // DefaultColDef sets props common to all Columns
  public defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    resizable: true
  };

  constructor(private http: HttpClient, private categoryService: PmCategoryService) { }

  ngOnInit(): void {

    this.http.get(environment.webservicebaseUrl + "/get-roasdate").subscribe(roasDate => {
      this.roasLiveDate = roasDate["message"][0]["live_roas_feed_from_date"] + " To " + roasDate["message"][0]["live_roas_feed_to_date"];
      this.lastRunDate = roasDate["message"][0]["last_cron_run_date"];
    }
    );

    this.subcat = this.categoryService.categorySelected.subscribe((allselectedcats) => {
      //this.cats = allselectedcats;
      this.cats = allselectedcats['hdn_selectedcats'];
      this.flag_of_cat_change = allselectedcats['flag'];
      this.loadAGGrid();
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.api = params.api;
    this.gridParams = params;
    this.columnApi = params.columnApi;
    this.loadAGGrid();
  }

  loadAGGrid() {
    let selected_categories: String = '-1';
    if (this.flag_of_cat_change == 0) {
      if ($('a>i.sim-tree-checkbox').hasClass('checked')) {
        let updated_cats = new Array();
        //let collect_category_ids = new Array();
        $.each($('.sim-tree-checkbox'), function (index, value) {
          if ($(this).hasClass('checked')) {
            updated_cats.push($(this).parent('a').parent('li').attr('data-id'));
          }
        });
        selected_categories = updated_cats.toString();
      }
    } else {
      selected_categories = this.cats;
    }

    var datasource = createServerSideDatasource(this.gridParams, selected_categories);
    this.api.setServerSideDatasource(datasource);
    this.product_brands = this.categoryService.setCategoryBrands(selected_categories);
    this.getAverages();
  }

  ngOnDestroy() {
    this.subcat.unsubscribe();
  }

  getAverages() {
    var cats_brands = Array();
    cats_brands[0] = "";
    cats_brands[1] = "";
    cats_brands[2] = "roas";

    this.http.post(environment.roasAvgUrl, cats_brands).subscribe(responseData => {
      if (responseData["msg"]["avg_all_roas"]) {
        this.avg_roas = responseData["msg"]["avg_all_roas"]
        this.helpavgroasall = responseData["msg"]["avg_all_roas"] + " (" + responseData["msg"]["avg_all_roas_help"] + ")";
      }

      if (responseData["msg"]["avg_all_end_roas"]) {
        this.avg_end_roas = responseData["msg"]["avg_all_end_roas"];
        this.helpavgendroasall = responseData["msg"]["avg_all_end_roas"] + " (" + responseData["msg"]["avg_all_end_roas_help"] + ")";
      }

      if (responseData["msg"]["avg_all_roas_with_google_kosten"]) {
        this.avg_roas_with_google_kosten = responseData["msg"]["avg_all_roas_with_google_kosten"];
        this.helpavgroasadwords = responseData["msg"]["avg_all_roas_with_google_kosten"] + " (" + responseData["msg"]["avg_all_roas_with_google_kosten_help"] + ")";
      }

      if (responseData["msg"]["avg_all_end_roas_with_google_kosten"]) {
        this.avg_end_roas_with_google_kosten = responseData["msg"]["avg_all_end_roas_with_google_kosten"]
        this.helpavgendroasadwords = responseData["msg"]["avg_all_end_roas_with_google_kosten"] + " (" + responseData["msg"]["avg_all_end_roas_with_google_kosten_help"] + ")";
      }

      if (responseData["msg"]["avg_google_roas"]) {
        this.avg_roas_google = responseData["msg"]["avg_google_roas"];
        this.helpavgroasgoogle = responseData["msg"]["avg_google_roas"];
      }
    });
  }

  exportRoasToMagento() {
    this.ermSpinner = true;
    this.isermDisabled = true;
    this.http.get(environment.roasSyncUrl).subscribe(ermData => {
      if (ermData["msg"] != "success") {
        this.alertType = "danger";
        this.strongalertMessage = "Error! ";
        this.alertMessage = "Something went wrong please try again. Error:-" + ermData["msg"] + "";
      } else {
        this.alertType = "success";
        this.strongalertMessage = "Success! ";
        this.alertMessage = "Successfully updated roas in magento";
      }
      this.ermSpinner = false;
      this.isermDisabled = false;
    }
    );
  }

}

function createServerSideDatasource(server: any, cats: any): IServerSideDatasource {
  return {
    getRows(params) {

      params.request["cats"] = cats;
      fetch(environment.webservicebaseUrl + "/live-roas", {
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
