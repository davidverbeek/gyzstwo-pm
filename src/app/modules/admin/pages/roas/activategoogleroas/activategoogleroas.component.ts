import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as XLSX from 'xlsx'
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-activategoogleroas',
  templateUrl: './activategoogleroas.component.html',
  styleUrls: ['./activategoogleroas.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ActivategoogleroasComponent implements ICellRendererAngularComp {

  id: any;
  isactive: any;
  filename: any;

  constructor(private http: HttpClient) { }

  agInit(params: any): void {
    this.id = params.data.id;
    this.isactive = params.data.active;
    this.filename = params.data.file_name;
  }

  refresh(): boolean {
    return false;
  }

  onActivate() {
    if (confirm("Are you sure you want to activate it?")) {
      const xlsxUrl = environment.nodebasePath + '/googleroas/' + this.filename;
      this.readXlsxDataFromUrl(xlsxUrl);
    }
  }

  readXlsxDataFromUrl(url: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = (e) => {
      const arrayBuffer = xhr.response;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      var xlsRequestData: any = Array();
      xlsRequestData[0] = this.id;
      xlsRequestData[1] = jsonData;

      this.http.post(environment.webservicebaseUrl + "/save-google-actual-roas", xlsRequestData).subscribe(responseData => {
        alert(responseData["msg"]);
        location.reload();
      });


    };

    xhr.send();
  }

}
