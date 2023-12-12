import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PmSidebarService {

  constructor() { }

  btnClicked = new Subject<any>();
  loadAgGrid = new Subject<any>();
  btnBsUpdate = new Subject<any>();


  refreshSubject = new Subject<void>();

  refresh$ = this.refreshSubject.asObservable();

  triggerRefresh() {
    this.refreshSubject.next();
  }

}
