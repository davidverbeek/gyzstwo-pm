import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedInDetails: any;

  constructor(private http: HttpClient) { }

  login(logindata = {}) {
    return this.http.post<any>(
      environment.webservicebaseUrl + "/auth",
      logindata
    );
  }

  verifyToken(token) {
    return this.http.post(
      environment.webservicebaseUrl + "/verifytoken",
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
