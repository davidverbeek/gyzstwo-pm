import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams } from 'ag-grid-community';
import { ActivategoogleroasComponent } from '../activategoogleroas/activategoogleroas.component';


@Component({
  selector: 'app-googleroas',
  templateUrl: './googleroas.component.html',
  styleUrls: ['./googleroas.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GoogleroasComponent implements OnInit {

  value: number = 0;
  googleroasfile: any = "";
  message = null;
  startDate: any;
  endDate: any;

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


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  // Each Column Definition results in one Column.
  public columnDefs = [
    { field: 'id', headerName: 'ID', sortable: true, filter: 'number' },
    { field: 'from_date', headerName: 'From Date', sortable: true, filter: 'text' },
    { field: 'to_date', headerName: 'To Date', sortable: true, filter: 'text' },
    {
      field: 'file_name', headerName: 'File', sortable: true, filter: 'text',
      cellRenderer: params => {
        return '<a href="' + environment.nodebasePath + '/googleroas/' + params.value + '" targets="_blank">' + params.value + '</a>';
      }
    },
    { field: 'active', headerName: 'Active', sortable: true, filter: 'number', cellRenderer: ActivategoogleroasComponent }
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

  onFileSelected(event: any) {
    this.googleroasfile = event.target.files[0];
  }

  getStartDate(event: any) {
    var date = new Date(event.value.getTime()).getDate();
    var month = new Date(event.value.getTime()).getMonth() + 1;
    var year = new Date(event.value.getTime()).getFullYear();
    this.startDate = year + "-" + month + "-" + date;
  }

  getEndDate(event: any) {
    var date = new Date(event.value.getTime()).getDate();
    var month = new Date(event.value.getTime()).getMonth() + 1;
    var year = new Date(event.value.getTime()).getFullYear();
    this.endDate = year + "-" + month + "-" + date;
  }

  onUpload() {
    if (this.googleroasfile == "") {
      alert("Upload File");
      return false;
    }

    var fileType = this.googleroasfile.type;
    if (fileType != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      alert("File is not Xlsx");
      return false;
    }

    var fileReader = new FileReader();
    fileReader.readAsBinaryString(this.googleroasfile);
    fileReader.onload = (e) => {
      var workbook = XLSX.read(fileReader.result, { type: 'binary' });
      var sheetNames = workbook.SheetNames;
      var xlsxHeader = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { header: 1 });
      if (xlsxHeader.length > 0) {
        let getXlsxCols: any = "";
        getXlsxCols = xlsxHeader[0]; //Header Cols
        var allValidHeaders = ["Item-ID", "Valuta", "Vertoningen", "Klikken", "CTR", "Gem. CPC", "Kosten", "Conversies", "Kosten/conv.", "Conv. perc.", "Conv.waarde/kosten", "Conv.waarde"];

        for (let xlsxCol of getXlsxCols) {
          if (!allValidHeaders.includes(xlsxCol)) {
            //this.uploadValidationMessage = "Column Name does not match";
            //this.uploadMessage = "";
            alert("<b>Invalid Column Headers.</b><br><br> Valid Column Headers Should Be As Below.<br>" + allValidHeaders + "");
            return false;
          }
        }

        this.upload(this.googleroasfile).pipe().subscribe(event => {
          if (event["loaded"] && event["total"]) {
            this.value = Math.round(event["loaded"] / event["total"] * 100)
          }

          if (event["body"]) {
            this.message = event["body"].message;
            this.loadAGGrid();
          }

        })


      }
    }
  }

  upload(file: File) {
    const multipartFormData = new FormData();
    multipartFormData.append('startdate', this.startDate);
    multipartFormData.append('enddate', this.endDate);
    multipartFormData.append('googleroas', file);
    return this.http.post(environment.webservicebaseUrl + "/uploadgoogleroas", multipartFormData, { reportProgress: true, observe: "events" });
  }
}

function createServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows(params) {

      if (params.request["sortModel"].length == 0) {
        params.request["sortModel"] = [{ sort: 'desc', colId: 'id' }];
      }

      fetch(environment.webservicebaseUrl + "/google-actual-roas", {
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
