import { Component, OnInit, ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {
  title = 'gyzstwo-pm';

  ngOnInit(){
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
  }

}
