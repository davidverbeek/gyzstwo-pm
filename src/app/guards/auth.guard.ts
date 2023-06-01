import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppConstants } from "src/app/app-constants";
import { LoadDebtorsService } from 'src/app/services/load-debtors.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private loaddebtorsService: LoadDebtorsService) { }

  canActivate() {
    this.authService.verifyToken(localStorage.getItem("token")).subscribe(
      responseData => {
        this.authService.setLogggedInDetails(responseData);
        if(localStorage.getItem("debtorCols") == null) {
          this.loaddebtorsService.setDebtorColumns();
        }
        return true;
      },
      error => {
        window.location.href=""+AppConstants.agbaseUrl+"";
      }
    )
    return true;
  }
}
