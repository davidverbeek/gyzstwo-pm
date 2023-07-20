import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
declare var simTree: any;
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { PmCategoryService } from '../../../../../services/pm.category.service';

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {

  list: string;
  constructor(private http: HttpClient, private categoryService: PmCategoryService) { }

  @ViewChild('allSelectedCats') allSelectedCats: ElementRef;

  /*list = [{
    "id": '1',
    "pid": '',
    "name": "JavaScript",
  },
  {
    "id": '11',
    "pid": '1', // parent ID
    "name": "Angular"
  },
  {
    "id": '12',
    "pid": '1',
    "name": "React"
  }, {
    "id": '13',
    "pid": '1',
    "name": "Vuejs"
  }, {
    "id": '14',
    "pid": '1',
    "name": "jQueryScript.Net"
  },
  {
    "id": '2',
    "pid": '',
    "name": "HTML5"
  },
  {
    "id": '3',
    "pid": '',
    "name": "CSS3",
    "disabled": true
  }]; */


 

    ngOnInit() {
       // console.log("left");
        this.http.get<any>(environment.webservicebaseUrl + "/all-categories").subscribe(data => {
            this.list = data.categories;
          //  console.log(data.categories);

            var tree = simTree({
                el: '#tree',
                data: this.list,
                check: true,
                linkParent: true,
                expand: 'expand',
                checked: 'checked',


                onClick: function (item) {
                    //console.log(item);

                },
                onChange: function (item) {
                    var selectedCategories = new Array();
                    $.each(item, function (key, value) {
                        selectedCategories.push(value["id"]);
                    });
                    $("#hdn_selectedcategories").val(selectedCategories);
                    $("#btnloadcats").click();
                },
                done: function () {
                    $('#flexCheckDefault').prop('checked', true)
                }
            });
            this.toggleAllCategories(true);
        });

        setTimeout(function () {
            var simtmp = 0;
            $("ul.sim-tree ul").each(function () {
                if (simtmp < 2) {
                    $(this).addClass("show");
                }
                simtmp++;
            });

            var simtreehideicontmp = 0;
            $(".sim-tree-spread").each(function () {
                if (simtreehideicontmp < 2) {
                    $(this).hide();
                }
                simtreehideicontmp++;
            });

            var simtreehidetexttmp = 0;
            $("a .sim-tree-checkbox").each(function () {
                if (simtreehidetexttmp < 2) {
                    $(this).parent().html("");
                    $(this).hide();
                }
                simtreehidetexttmp++;
            });

        }, 3000);

    }



    btncats() {
        this.categoryService.categorySelected.next(this.allSelectedCats.nativeElement.value);
    }

    checkAllcats() {
        var current_status = $('#flexCheckDefault').prop('checked');
        let cat_all_str: any;
        cat_all_str = $("#hdn_selectedcategories").val();
        if ($('input.show_deb_cols').is(":checked") && cat_all_str != '' && cat_all_str != '-1') {//means this is a group list
            let cat_all_arr = cat_all_str.split(',');
            if (current_status) { // check all hiddencategories
                $.each(cat_all_arr, function (key, value) {
                    var $li = $('li[data-id=' + value + ']');
                    this.checkGiven($li, true, true);
                });
            } else { //uncheck all hiddencategories
                $.each(cat_all_arr, function (key, value) {
                    var $li = $('li[data-id=' + value + ']');
                    this.checkGiven($li, false, true);
                });
            }
        } else if (current_status) {
            this.toggleAllCategories(current_status);
        } else {
            this.toggleAllCategories(current_status);
        }
    }

    /**
     * name
     */
    toggleAllCategories(status) {
        var any_disabled = false;
        $('a>i.sim-tree-checkbox').each(function (index) {
            if ($(this).parent('a').parent('li').hasClass('disabled')) {
                any_disabled = true;
            }

            if (any_disabled) {
                return false;
            }
            return;
        });

        if (!any_disabled) {
            if (status) {
                $("i.sim-tree-checkbox").addClass('checked');
            } else {
                $("i.sim-tree-checkbox").removeClass('checked');
            }
        }
        return true;
    }
}