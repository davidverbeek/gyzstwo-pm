import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from 'src/app/app-constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(logindata = {}) {
    return this.http.post<any>(
      AppConstants.webservicebaseUrl + "/auth",
      logindata
    );
  }
}
