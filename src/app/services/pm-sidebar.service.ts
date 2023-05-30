import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PmSidebarService {

  constructor() { }

  btnClicked = new Subject<any>();
  
}
