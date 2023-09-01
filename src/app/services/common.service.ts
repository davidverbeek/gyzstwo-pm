import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  productHistoryData = new Subject<object>();
  bolCalculation = new Subject<object>();

  constructor() { }
}
