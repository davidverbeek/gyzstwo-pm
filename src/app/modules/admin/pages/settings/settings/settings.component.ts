import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private http: HttpClient) { }

  settingsData: any;
  savedSettingsData: any = 0;

  ngOnInit(): void {
    this.http.get(environment.webservicebaseUrl + "/get-settings").subscribe(allSettings => {
      this.settingsData = JSON.parse(allSettings["settings"][0]["roas"]);
    }
    );
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.http.post(environment.webservicebaseUrl + "/set-settings", form.value).subscribe(allSettings => {
        this.savedSettingsData = 1;
      });
    }
  }

}
