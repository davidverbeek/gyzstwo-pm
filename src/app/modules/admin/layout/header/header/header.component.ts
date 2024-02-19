import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SimtreeService } from '../../../../../services/simtree.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  constructor(private simtree_service: SimtreeService) { }

  ngOnInit(): void { }

  onUserSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("debtorCols");
    localStorage.removeItem("currentSql");
    localStorage.removeItem("allDebts");
    localStorage.removeItem("settings");
    window.location.href = "" + environment.agbaseUrl + "";
  }

  onNavigate() {
    // Trigger a refresh in the sidebar component
    this.simtree_service.triggerRefresh();
  }

}
