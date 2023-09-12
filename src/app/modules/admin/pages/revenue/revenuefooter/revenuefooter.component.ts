import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-revenuefooter',
  templateUrl: './revenuefooter.component.html',
  styleUrls: ['./revenuefooter.component.css']
})
export class RevenuefooterComponent implements ICellRendererAngularComp {

  public params: any;
  public style!: any;

  agInit(params: any): void {
    this.params = params;
    this.style = this.params.style;
  }

  refresh(): boolean {
    return false;
  }

}