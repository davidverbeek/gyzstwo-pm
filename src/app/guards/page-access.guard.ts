import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PageAccessGuard implements CanActivate {
  
  authUserDetails = {};
  userPageAccess : string[] = [];
  
  constructor(private authService: AuthService, private router : Router) {}
  
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      setTimeout(() => {
        this.authUserDetails = this.authService.getLoggedInDetails();
        console.log(this.authUserDetails);
        let currentUrl = (state.url).split("/");
        this.userPageAccess = this.authUserDetails["page_access"].split(",");
        if((this.userPageAccess).includes(currentUrl[2])) {
          return true;
        } else {
          this.router.navigate(["/admin/dashboard"]);
          return false;

        }
      },500);
      return true;
  }
  
}
