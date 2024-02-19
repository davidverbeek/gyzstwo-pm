import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { roas } from './models/roas.model'
import { employeecost } from './models/employeecost.model'


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {

  constructor(private http: HttpClient) { }

  settingsData: any;
  savedSettingsData: any = 0;
  roas = new roas();
  roasArray: any = [];

  employeecost = new employeecost();
  empcostArray: any = [];

  ngOnInit(): void {
    //this.roasArray.push(this.roas);
    //this.empcostArray.push(this.employeecost);

    var getSettingsData: any = "";
    getSettingsData = localStorage.getItem("settings");
    this.settingsData = JSON.parse(getSettingsData);

    var roasRanges = this.settingsData["roas_range"];
    var roasLowerRange = this.settingsData["roas_lower_bound"];
    var roasUpperRange = this.settingsData["roas_upper_bound"];

    var shipmentRevenue = this.settingsData["shipment_revenue"];

    var employeecostRanges = this.settingsData["employeecost_range"];
    var employeecostLowerRange = this.settingsData["employeecost_lower_bound"];
    var employeecostUpperRange = this.settingsData["employeecost_upper_bound"];

    //console.log(roasRanges.length);
    //console.log(employeecostRanges.length);

    (Object.keys(roasLowerRange)).forEach((key, index) => {
      this.settingsData['roasval_lb_set_option'] = key;
      this.settingsData['roasval_lb_set_value'] = roasLowerRange[key];
    });

    (Object.keys(roasRanges)).forEach((key, index) => {
      var getRoasMinMax = key.split("-");
      this.roas = new roas();
      this.roas.roasmin = getRoasMinMax[0];
      this.roas.roasmax = getRoasMinMax[1];
      this.roas.roasval = roasRanges[key]["r_val"];
      if (roasRanges[key]["r_type"] == "fixed") {
        this.roas.roasvaltype = true;
      } else if (roasRanges[key]["r_type"] == "increment") {
        this.roas.roasvaltype = false;
      }
      //console.log(key, roasRanges[key], index);
      this.roasArray.push(this.roas);
    });

    (Object.keys(roasUpperRange)).forEach((key, index) => {
      this.settingsData['roasval_ub_set_option'] = key;
      this.settingsData['roasval_ub_set_value'] = roasUpperRange[key];
    });

    (Object.keys(employeecostLowerRange)).forEach((key, index) => {
      this.settingsData['empcost_ov_lb_set_option'] = key;
      this.settingsData['empcost_lb_set_value'] = employeecostLowerRange[key];
    });

    (Object.keys(employeecostRanges)).forEach((key, index) => {
      var getEmployeeCostMinMax = key.split("-");
      this.employeecost = new employeecost();
      this.employeecost.empcost_ov_min = getEmployeeCostMinMax[0];
      this.employeecost.empcost_ov_max = getEmployeeCostMinMax[1];
      this.employeecost.empcostval = employeecostRanges[key];
      this.empcostArray.push(this.employeecost);
    });

    (Object.keys(employeecostUpperRange)).forEach((key, index) => {
      this.settingsData['empcost_ov_ub_set_option'] = key;
      this.settingsData['empcost_ub_set_value'] = employeecostUpperRange[key];
    });

    this.settingsData['shippment_revenue_order_value_peak'] = shipmentRevenue["peak_order_value"];
    this.settingsData['transmission_shippment_revenue_less_then'] = shipmentRevenue["transmission"]["transmission_shippment_revenue_less_then"];
    this.settingsData['transmission_shippment_revenue_greater_then_or_equal'] = shipmentRevenue["transmission"]["transmission_shippment_revenue_greater_then_or_equal"];
    this.settingsData['other_shippment_revenue_less_then'] = shipmentRevenue["other"]["other_shippment_revenue_less_then"];
    this.settingsData['other_shippment_revenue_greater_then_or_equal'] = shipmentRevenue["other"]["other_shippment_revenue_greater_then_or_equal"];




  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      var formData = Array();
      formData.push(form.value);
      formData.push(this.roasArray);
      formData.push(this.empcostArray);

      this.http.post(environment.webservicebaseUrl + "/set-settings", formData).subscribe(allSettings => {
        this.savedSettingsData = 1;
        localStorage.setItem("settings", allSettings["settings"]);
      });
    }
  }
  addroasRange() {
    this.roas = new roas();
    this.roas.roasvaltype = true;
    this.roasArray.push(this.roas);
  }
  removeroasRange(index) {
    this.roasArray.splice(index);
  }
  addemployeecostRange() {
    this.employeecost = new employeecost();
    this.empcostArray.push(this.employeecost);
  }
  removeemployeecostRange(eindex) {
    this.empcostArray.splice(eindex);
  }

}
