import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {
  
  title = 'gyzstwo-pm';
  
  constructor(private authService: AuthService, private router: Router) {}
  
  invalidUser:string = "";

  ngOnInit(){
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
  }

  onLogin(form:NgForm) {
    //const authFormValue = form.value;
    //this.router.navigate(["/admin/dashboard"]);
    
    if(form.valid) {
      this.authService.login(form.value).subscribe(
        responseData => { 
          localStorage.setItem("token", responseData.token);
          this.router.navigate(["/admin/dashboard"]);
        },
        error => {
          this.invalidUser = "yes"; 
        }
      )
    }


  }


}
