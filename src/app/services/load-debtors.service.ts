import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface Response {
  'debter_cats': [0]
}


@Injectable({
  providedIn: 'root'
})
export class LoadDebtorsService {

  //public debter_category_id = "";
  debtorColumns: any = [];
  allDebtors = new Object();
  debterProds: any = [];

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

          this.allDebtors[value["customer_group_name"]] = value["magento_id"] + "|||" + value["group_alias"];

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

  /* getDebtorCategories(debter_id: string) {

    this.http.post<Response>(environment.webservicebaseUrl + "/dbt-rules-cats", { debter_id: debter_id })
      .pipe(map(responseData => {
        let cat_ids = "";
        //if (responseData.debter_cats.hasOwnProperty('category_ids')) {
        cat_ids = responseData.debter_cats[0]['category_ids'];
        //}

        return cat_ids;
      }))
      .subscribe(responseData => {
        localStorage.setItem("debterCats", responseData);
      });
  } */

  resetDebterPrices(debter_group: string, product_ids: any) {
    const reset_debter_rules_request = {
      customer_group: debter_group,
      product_ids: product_ids
    };
    this.http.post<Response>(environment.webservicebaseUrl + "/dbt-rules-reset", reset_debter_rules_request).subscribe(responseData => {
      if (responseData["msg"] == "done") {
        alert('reset is done');
      }
    });
  }


  getMultipleDebterCats(debters_arr: any) {
    //console.log(categories);
    // const debter_id = debters_arr;

    this.http.post(environment.webservicebaseUrl + "/dbt-rules-cats", { debter_id: debters_arr })
      .pipe(map(responseData => {
        let cats_ids: any = [];

        responseData["debter_cats"].forEach(function1);

        function function1(currentValue, index) {
          // console.log("Index in array is: " + index + " ::  Value is: " + currentValue.product_id);
          cats_ids.push(currentValue.category_ids);
        }

        //let comma_sperated_ids = cats_ids.toString();
        return cats_ids;
      }))
      .subscribe(
        responseData => {
          // console.log(responseData);
          //localStorage.setItem("categoryProds", responseData);
        });
  }

  setDebtorProds() {

    this.http.get(environment.webservicebaseUrl + "/all-debtor-product").subscribe(responseData => {
      var element = {};
      if (responseData["msg"]) {
        responseData["msg"].forEach((value, key) => {
          localStorage.setItem(value["customer_group_name"], value["product_ids"]);
        });
      }


    });
  }

  getDebtorProds() {
    return localStorage.getItem("debtorProds");
  }
}