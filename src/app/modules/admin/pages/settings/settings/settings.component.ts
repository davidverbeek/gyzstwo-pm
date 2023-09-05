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
    var getSettingsData: any = "";
    getSettingsData = localStorage.getItem("settings");
    this.settingsData = JSON.parse(getSettingsData);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.http.post(environment.webservicebaseUrl + "/set-settings", form.value).subscribe(allSettings => {
        this.savedSettingsData = 1;
        localStorage.setItem("settings", allSettings["settings"]);
      });
    }
  }
}
