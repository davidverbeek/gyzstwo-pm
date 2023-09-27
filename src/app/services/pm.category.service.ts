import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PmCategoryService {
  categorySelected = new Subject<string>();
  productsAssigned: any = {};
  public product_brand_arr: any = [];
  public product_supplier_arr: any = [];

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


  setCategoryBrands(categories: any = "") {
    //const cats: string = categories.toString();
    this.http.post(environment.webservicebaseUrl + "/category-brand", { selected_cats: categories })
      .pipe(map(responseData => {
        let merk_dd: any = [];
        let supplier_dd: any = [];

        responseData["brands_of_cats"].forEach(function1);

        function function1(currentValue, index) {

          // console.log("Index in array is: " + index + " ::  Value is: " + currentValue.product_id);
          merk_dd[currentValue.id] = currentValue.product_count;
          supplier_dd[currentValue.id] = currentValue.supplier_type;
        }
        let comma_sperated_brands = merk_dd;
        return [comma_sperated_brands, supplier_dd];
      }))
      .subscribe(
        responseData => {
          this.product_brand_arr = responseData[0];
          this.product_supplier_arr = responseData[1];
        });
  }

}