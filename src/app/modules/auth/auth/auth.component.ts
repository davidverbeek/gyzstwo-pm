import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {
  title = 'gyzstwo-pm';
  
  constructor(private router: Router) {}

  ngOnInit(){
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
  }


  onLogin(form:NgForm) {
    //const authFormValue = form.value;
    this.router.navigate(["/admin/dashboard"]);
  }


}
