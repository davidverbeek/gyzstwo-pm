import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoadDebtorsService {

  debtorColumns: any = [];
  allDebtors = new Object();

  constructor(private http: HttpClient) { }

  setDebtorColumns() {
      this.http.get(environment.webservicebaseUrl + "/all-debtors").subscribe(responseData => {
        if (responseData["msg"]) {
          responseData["msg"].forEach((value, key) => {
            this.debtorColumns.push({ customer_group_name: "group_" + value["customer_group_name"] + "_debter_selling_price", group_alias: "Verkpr (" + value["group_alias"] + ")", type: "debsp" },
              { customer_group_name: "group_" + value["customer_group_name"] + "_margin_on_buying_price", group_alias: "Marge Inkpr % (" + value["group_alias"] + ")", type: "debppbp" },
              { customer_group_name: "group_" + value["customer_group_name"] + "_margin_on_selling_price", group_alias: "Marge Verkpr % (" + value["group_alias"] + ")", type: "debppsp" },
              { customer_group_name: "group_" + value["customer_group_name"] + "_discount_on_grossprice_b_on_deb_selling_price", group_alias: "Korting Brutpr % (" + value["group_alias"] + ")", type: "debdgp" }
            );

            this.allDebtors[value["customer_group_name"]] = value["magento_id"]+"|||"+value["group_alias"];
            
           });
        }
        let stringDebs = JSON.stringify(this.debtorColumns);
        localStorage.setItem("debtorCols", stringDebs);

        let stringDebts = JSON.stringify(this.allDebtors);
        localStorage.setItem("allDebts", stringDebts);

      });
  }

  getDebtorColumns() {
    return localStorage.getItem("debtorCols");
  }

}
