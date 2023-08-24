import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'


@Injectable({
  providedIn: 'root'
})
export class PmCategoryService {

  productsAssigned: any = {};

  constructor(private http: HttpClient) { }

  getProducts(categories: any = []) {
    //console.log(categories);
    const cats: [] = categories;
    this.http.post(environment.webservicebaseUrl + "/catpro-products", cats)
      .pipe(map(responseData => {
        const product_ids: number[] = [];

        responseData["products_of_cats"].forEach(function1);

        function function1(currentValue, index) {
          // console.log("Index in array is: " + index + " ::  Value is: " + currentValue.product_id);
          product_ids.push(currentValue.product_id)
        }
        let comma_sperated_ids = product_ids.toString();
        return comma_sperated_ids;
      }))
      .subscribe(
        responseData => {
          localStorage.setItem("categoryProds", responseData);
        });
  }

  getCategoryProducts() {
    return localStorage.getItem("categoryProds");
  }

}