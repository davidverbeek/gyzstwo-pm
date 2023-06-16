import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { LoadDebtorsService } from 'src/app/services/load-debtors.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  authUserDetails = {};
  userPageAccess: string[] = [];

  constructor(private authService: AuthService, private loaddebtorsService: LoadDebtorsService, private router: Router) { }
  
  canActivate(next: ActivatedRouteSnapshot,state: RouterStateSnapshot) {
    this.authService.verifyToken(localStorage.getItem("token")).subscribe(
      responseData => {
        this.authService.setLogggedInDetails(responseData);
        this.authUserDetails = this.authService.getLoggedInDetails();
        let currentUrl = (state.url).split("/");
        this.userPageAccess = this.authUserDetails["page_access"].split(",");

        if ((this.userPageAccess).includes(currentUrl[2])) {
          if(localStorage.getItem("debtorCols") == null) {
            this.loaddebtorsService.setDebtorColumns();
          }
          return true;
        } else {
          this.router.navigate(["/admin/dashboard"]);
          return false;
        }
      },
      error => {
        window.location.href=""+environment.agbaseUrl+"";
      }
    )
    return true;
  }
}
