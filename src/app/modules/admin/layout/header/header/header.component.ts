import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppConstants } from "../../../../../app-constants";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {}

  onUserSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("debtorCols");
    localStorage.removeItem("currentSql");
    window.location.href=""+AppConstants.agbaseUrl+"";
  }

}
