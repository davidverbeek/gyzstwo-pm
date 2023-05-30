import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from 'src/app/app-constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedInDetails: any;

  constructor(private http: HttpClient) { }

  login(logindata = {}) {
    return this.http.post<any>(
      AppConstants.webservicebaseUrl + "/auth",
      logindata
    );
  }

  verifyToken(token) {
    return this.http.post(
      AppConstants.webservicebaseUrl + "/verifytoken",
      {token:token}
    );
  }

  setLogggedInDetails(loggedindetails) {
    this.loggedInDetails = loggedindetails;
  }

  getLoggedInDetails() {
    return this.loggedInDetails;
  }

}
