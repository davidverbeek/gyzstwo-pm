import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PmCategoryService {

  categorySelected = new Subject<string>();
  
  constructor() { }

}
