
import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
//declare checkGiven();
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
  // @ViewChild(LeftComponent) jyoti;
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




  getProductsOfCategories(cats) {
    /*  var product_ids = {};
     this.http.get(environment.webservicebaseUrl + "/catpro-products", cats).subscribe(responseData => {
       this.product_ids_arr = responseData;
 
       responseData["products_of_cats"].forEach(function1);
 
       function function1(currentValue, index) {
         // console.log("Index in array is: " + index + " ::  Value is: " + currentValue.product_id);
         //product_ids.push(currentValue.product_id)
       }
       // if (responseData["products_of_cats"] == "done") { }
     });
 
     //return product_ids;
 
     //console.log(this.product_ids_arr); */
  }//end getProductsOfCategories()

  //postData: { debter: string, categories: string }
  onSaveChanges() {

    //var selected_group = $("#sel_debt_group").val();
    var selected_group = this.debterdd.nativeElement.value; //alert(selected_group);
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
    //console.log();
    //i think no need  $("#hdn_existingcategories").val(updated_cats); alert('check');
    //var selected_cat_new = $("#hdn_existingcategories").val();

    //var customerGroup = selected_group;
    let check_old_is_removed: any = [];
    let old_cats_arr: any = [];
    //var catIdNew = $("#hdn_existingcategories").val();;
    var catId_new_arr = updated_cats;
    if (old_cats != "") {
      old_cats_arr = old_cats.split(',');
      check_old_is_removed =
        old_cats_arr.filter((element) => !catId_new_arr.includes(element));
    } else {
      check_old_is_removed = catId_new_arr;
    }

    //let removed = delete catId_new_arr[0];
    //console.log(catId_new_arr);
    // var old_cats_arr = ['2211', '2199'];
    // var old_cats_arr = [];
    // let check_old_is_removed = old_cats_arr.filter(item => catId_new_arr.indexOf(item) < 0);


    //var reset_product_ids = new Array();
    console.log(old_cats_arr);
    //console.log(catId_new_arr);
    console.log(check_old_is_removed);
    // console.log(check_old_is_removed); // ["e", "f", "g"]
    if (old_cats != "" && check_old_is_removed.length > 0) {
      alert('diff');
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
      console.log(debter_group);
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
          // $('a#linkCategories').css('display', 'block');
        } else {
          //console.log($(this).parent('a').parent('li'));
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
    // console.log(event); alert(event.target.);

    //get selected customer group
    //let selected_group: any = $('#sel_debt_group').val();//zzp, Annamer M
    var selected_group = this.debterdd.nativeElement.value; //alert(selected_group);

    checkIt(false);//uncheckall checkbox
    //remove disabled
    $("#hdn_existingcategories").val('');//erase existing cats
    //$("#hdn_selectedcategories").val('');//erase selcted cats
    this.toggleCheckbox('');
    this.debterRulesService.getDebtorCategories(selected_group);
    let category_ids = localStorage.getItem("debterCats");
    console.log(category_ids + "206");
    this.category_ids = category_ids;
    //console.log(category_ids); alert('188');
    if (category_ids) {
      alert('191');

      let cat_id_arr = category_ids?.split(',');
      //console.log(cat_id_arr); console.log('fff');
      $.each(cat_id_arr, function (key, value) {

        var $li = $("li[data-id='" + value + "']");
        checkGiven($li, true);
      });
      $("#hdn_existingcategories").val(this.category_ids);
      //this.existingCats.nativeElement.value(category_ids);
    } else {
      //checkIt(false);//zzp
    }
    this.toggleCheckbox('none');//add disabled
    $("#flexCheckDefault").prop('checked', false);//uncheck checkAll
    // var cat_id_arr = category_ids.categor.split(',');
    /*  this.http.post(environment.webservicebaseUrl + "/db-rules-cats", selected_group).subscribe(responseData => {
       console.log(responseData["msg"] + "debter_ts_69");
       if (responseData["msg"] == "done") {
 
       }
     }); */



    /*  request.done((response_data) => {
       var resp_obj = response_data;
       if (resp_obj["msg"]) {
         // select these categories
         var categories_str = resp_obj["msg"];
         var cat_id_arr = categories_str.split(',');
 
         $.each(cat_id_arr, function (key, value) {
           var $li = $("li[data-id='" + value + "']");
           checkGiven($li, true);
 
         });
         $("#hdn_existingcategories").val(resp_obj["msg"]);
       } else {
         checkIt(false);
       }
       this.toggleCheckbox('none');
       $("#flexCheckDefault").prop('checked', false);
     }); */

  };

  onLinkCategories(event: Event) {
    event.preventDefault();
    this.toggleCheckbox('');
  }

}