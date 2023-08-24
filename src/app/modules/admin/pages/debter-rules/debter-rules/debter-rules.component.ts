
import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

declare function checkGiven(any, boolean): void;
declare function checkIt(boolean): void;
import { environment } from 'src/environments/environment';
import { PmCategoryService } from '../../../../../services/pm.category.service';
import { LoadDebtorsService } from '../../../../../services/load-debtors.service';


import { HttpClient } from '@angular/common/http';
import { Dropdown } from 'bootstrap';
import { Element } from '@angular/compiler';

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
    $('#flexCheckDefault').prop('checked', false);
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
      this.categoryService.getProducts(filterProcessData_1);
      let reset_product_ids = localStorage.getItem("categoryProds");

      let debter_group = '';
      let debColString = localStorage.getItem("allDebts");
      let deb_columns_new = [];
      deb_columns_new = JSON.parse(debColString || '{}');
      for (const [key, value] of Object.entries(deb_columns_new)) {
        let part: string = value;
        var magento_id = part.substring(0, 2);
        if (magento_id == selected_group) {
          debter_group = key;
          break;
        }
      }
      //console.log(debter_group);
      if (reset_product_ids != "") {
        this.debterRulesService.resetDebterPrices(debter_group, reset_product_ids);
      }
    }

    var filterProcessData = updated_cats.filter(function () { return true; });
    this.categoryService.getProducts(filterProcessData);
    let category_product_ids = localStorage.getItem("categoryProds");

    var debterData = new Array();
    var pageData = {};
    var processedData;
    pageData["category_ids"] = updated_cats.filter(function () { return true; }).toString();
    pageData["product_ids"] = category_product_ids;
    pageData["customer_group"] = selected_group;
    processedData = pageData;
    debterData = processedData;

    this.http.post(environment.webservicebaseUrl + "/save-debter-rules", debterData).subscribe(responseData => {
      if (responseData["msg"] == "done") {
        //to show success message in the page
        $('<div class="alert alert-success" role="alert">Data is saved successfully!</div>').insertBefore("#data_filters1");

        window.setTimeout(function () {
          $(".alert").fadeTo(500, 0).slideUp(500, function () {
            $(this).remove();
          });
        }, 4000);
        $('.ddfields').val("");
        $(".sim-tree-checkbox").removeClass('checked');
        $('a#linkCategories').css('display', 'none');
        $("#flexCheckDefault").prop('checked', false);
        this.toggleCheckbox('');
      }
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
    this.debterRulesService.getDebtorCategories(selected_group);
    let category_ids = localStorage.getItem("debterCats");
    console.log(category_ids + "206");
    this.category_ids = category_ids;

    if (category_ids) {


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

  };

  onLinkCategories(event: Event) {
    event.preventDefault();
    this.toggleCheckbox('');
  }

}