
import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

declare function checkGiven(any, boolean): void;
declare function checkIt(boolean): void;
import { environment } from 'src/environments/environment';
import { PmCategoryService } from '../../../../../services/pm.category.service';
import { LoadDebtorsService } from '../../../../../services/load-debtors.service';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Dropdown } from 'bootstrap';
import { Element } from '@angular/compiler';

export interface Response {
  'debter_cats': [0]
}
@Component({
  selector: 'app-debter-rules',
  templateUrl: './debter-rules.component.html',
  styleUrls: ['./debter-rules.component.css'],
  providers: [LoadDebtorsService]
})
export class DebterRulesComponent implements OnInit {
  debters: any = [];
  checkproperty = '';
  product_ids_arr: any = {};
  category_ids: any = "";
  from_debters: any = [];
  constructor(private http: HttpClient, private categoryService: PmCategoryService, private debterRulesService: LoadDebtorsService) {
  }
  @ViewChild('existingCats') existingCats: ElementRef;
  @ViewChild('debterdd') debterdd: ElementRef;

  ngOnInit(): void {
    this.http.get<any>(environment.webservicebaseUrl + "/all-debtors").subscribe(responseData => {
      if (responseData["msg"]) {
        responseData["msg"].forEach((value, key) => {
          this.debters.push({ customer_group_id: value["magento_id"], group_alias: value["group_alias"] },
          );
        });
      }
    });

    this.getCopyFromDebtor();

    $('#flexCheckDefault').prop('checked', false);

    $('a>i.sim-tree-checkbox').each(function (index) {
      $(this).removeClass('checked');
    });

  }

  onSaveChanges() {

    var selected_group = this.debterdd.nativeElement.value;
    if (selected_group == '') {
      alert("Please select Customer group.");
      $("#sel_debt_group").trigger("focus");
      return false;
    }

    let old_cats = this.existingCats.nativeElement.value;
    let updated_cats = new Array();
    $.each($('.sim-tree-checkbox'), function (index, value) {
      if ($(this).hasClass('checked')) {
        updated_cats.push($(this).parent('a').parent('li').attr('data-id'));
      }
    });

    let check_old_is_removed: any = [];
    let old_cats_arr: any = [];
    var catId_new_arr = updated_cats;
    let debtor_key_in_localStorage = '';
    if (old_cats != "") {
      old_cats_arr = old_cats.split(',');
      check_old_is_removed =
        old_cats_arr.filter((element) => !catId_new_arr.includes(element));
    } else {
      check_old_is_removed = catId_new_arr;
    }

    //console.log(old_cats_arr);
    //console.log(check_old_is_removed);
    if (old_cats != "" && check_old_is_removed.length > 0) {
      var filterProcessData_1 = check_old_is_removed.filter(function () { return true; });
      // this.categoryService.getProducts(filterProcessData_1);
      // let reset_product_ids = localStorage.getItem("categoryProds");

      const cats: [] = filterProcessData_1;
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
            let reset_product_ids = responseData;
            let debter_group = '';

            let debColString = localStorage.getItem("allDebts");
            let deb_columns_new = [];
            deb_columns_new = JSON.parse(debColString || '{}');
            for (const [key, value] of Object.entries(deb_columns_new)) {
              let part: string = value;
              const resultArray: string[] = part.split('|||');
              if (resultArray[0] == selected_group) {
                debter_group = key;
                debtor_key_in_localStorage = key;
                break;
              }
            }
            //console.log(debter_group);
            if (reset_product_ids != "") {
              this.debterRulesService.resetDebterPrices(debter_group, reset_product_ids);
            }
          });
    }


    var filterProcessData = updated_cats.filter(function () { return true; });
    // this.categoryService.getProducts(filterProcessData);

    const cats = filterProcessData;
    var debterData = new Array();
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
          //localStorage.setItem("categoryProds", responseData);
          let category_product_ids = responseData;
          var pageData = {};
          var processedData;
          pageData["category_ids"] = updated_cats.filter(function () { return true; }).toString();
          pageData["product_ids"] = category_product_ids;
          pageData["customer_group"] = selected_group;
          processedData = pageData;
          debterData = processedData;

          this.http.post(environment.webservicebaseUrl + "/save-debter-rules", debterData).subscribe(responseData => {
            if (responseData["msg"] == "saved successfully") {
              localStorage.setItem(debtor_key_in_localStorage, category_product_ids);
              //to show success message in the page
              $('<div class="alert alert-success" role="alert">Data is saved successfully!</div>').insertBefore("#data_filters1");

              window.setTimeout(function () {
                $(".alert").fadeTo(500, 0).slideUp(500, function () {
                  $(this).remove();
                });
              }, 4000);
              $('.ddfields').val("");
              //know: i.sim-tree-checkbox should be there not only .sim-tree-checkbox
              $("i.sim-tree-checkbox").removeClass('checked');
              $("i.sim-tree-checkbox").removeClass('sim-tree-semi');
              $("i.sim-icon-d").trigger('click');

              $('a#linkCategories').css('display', 'none');
              $("#flexCheckDefault").prop('checked', false);
              this.toggleCheckbox('');
            }
          });
        });


    return true;
  }//end onSaveChanges()

  toggleCheckbox(new_status) {
    $('a>i.sim-tree-checkbox').each(function (index) {
      if (!$(this).hasClass('checked')) {
        if (new_status == 'none') {
          $(this).parent('a').parent('li').addClass('disabled');
        } else {
          $(this).parent('a').parent('li').removeClass('disabled');
        }
      }


    });

    //check if any disabled
    if ($("i.sim-tree-checkbox").parent('a').parent('li').hasClass('disabled')) {
      $('a#linkCategories').css('display', 'block');
    } else {
      $('a#linkCategories').css('display', 'none');
    }
  }



  onChangeDebter(event: Event) {

    var selected_group = this.debterdd.nativeElement.value;

    checkIt(false);

    $("#hdn_existingcategories").val('');
    this.toggleCheckbox('');

    $("#showloader").addClass("loader");
    $(".loader_txt").show();
    // this.debterRulesService.getDebtorCategories(selected_group);
    this.http.post<Response>(environment.webservicebaseUrl + "/dbt-rules-cats", { debter_id: selected_group })
      .pipe(map(responseData => {
        let cat_ids = "";
        if (responseData.debter_cats.length > 0) {
          cat_ids = responseData.debter_cats[0]['category_ids'];
        }

        //if (responseData.debter_cats.hasOwnProperty('category_ids')) {

        //}

        return cat_ids;
      }))
      .subscribe(responseData => {
        $("#showloader").removeClass("loader");
        $(".loader_txt").hide();
        //localStorage.setItem("debterCats", responseData);

        //let category_ids = localStorage.getItem("debterCats");
        let category_ids = responseData;
        this.category_ids = category_ids;

        if (category_ids != "") {


          let cat_id_arr = category_ids?.split(',');

          $.each(cat_id_arr, function (key, value) {

            var $li = $("li[data-id='" + value + "']");
            checkGiven($li, true);
          });
          $("#hdn_existingcategories").val(this.category_ids);

        } else {
          //checkIt(false);//zzp
        }

        this.toggleCheckbox('none');//add disabled
        $("#flexCheckDefault").prop('checked', false);


      });
  };

  onLinkCategories(event: Event) {
    event.preventDefault();
    this.toggleCheckbox('');
  }

  showDivMessage(msg) {
    $('<div class="alert alert-success" role="alert">' + msg + '</div>').insertBefore("#data_filters1");

    window.setTimeout(function () {
      $(".alert").fadeTo(500, 0).slideUp(500, function () {
        $(this).remove();
      });
    }, 4000);
  }

  getCopyFromDebtor() {
    this.from_debters = [];
    this.http.get<any>(environment.webservicebaseUrl + "/list-copy-debtors").subscribe(responseData => {
      if (responseData["error"] == null) {
        responseData["rows"].forEach((value, key) => {
          this.from_debters.push({ magento_id: value["magento_id"], group_alias: value["group_alias"] },
          );
        });
      }
    });
  }

  onCopyGroup(event: Event) {
    var source_group_id = $('#parent_debt_group').val();
    var child_group_id = $('#child_debt_group').val();

    if (source_group_id == '') {
      alert('Please select Group to copy FROM.');
      $('#parent_debt_group').trigger('focus');
      return false;
    } else if (child_group_id == '') {
      alert('Please select Group to copy TO.');
      $('#child_debt_group').trigger('focus');
      return false;
    } else if (confirm("Existing products of TO DEBTER will be unassinged and their prices will be set to ZERO. Are you sure you want to continue?")) {

      this.http.post<any>(environment.webservicebaseUrl + "/copy-debters", { source_group_id: source_group_id, destination_group_id: child_group_id }).subscribe(responseData => {
        // var res = jQuery.parseJSON(data);
        //showDivMessage(res["msg"]);
        if (responseData["msg"]) {
          this.showDivMessage(responseData["msg"]);
          this.getCopyFromDebtor();
        }
        $('.reduce_width').val('');
      });
    }
    return true;
  }

}