import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppConstants } from "src/app/app-constants";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) { }

  canActivate() {
    this.authService.verifyToken(localStorage.getItem("token")).subscribe(
      responseData => {
        this.authService.setLogggedInDetails(responseData);
        return true;
      },
      error => {
        window.location.href=""+AppConstants.agbaseUrl+"";
      }
    )
    return true;
  }
}
