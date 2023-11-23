import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
declare var simTree: any;
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { PmCategoryService } from '../../../../../services/pm.category.service';
import { SimtreeService } from '../../../../../services/simtree.service';
declare function checkGiven(any, boolean): void;
declare function checkIt(boolean): void;

@Component({
    selector: 'app-left',
    templateUrl: './left.component.html',
    styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {

    list: string;
    cats: string = "";
    columnApi: any;
    constructor(private http: HttpClient, private categoryService: PmCategoryService, private simtreeService: SimtreeService) {
    }

    @ViewChild('allSelectedCats') allSelectedCats: ElementRef;

    ngOnInit() {

        this.simtreeService.refresh$.subscribe(() => {
            $('#tree').empty();
            this.http.get<any>(environment.webservicebaseUrl + "/all-categories").subscribe(data => {
                // this.simtreeService.refresh$.subscribe(() => {
                this.list = data.categories;

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
                    onChange: (item) => {


                        var selectedCategories = new Array();
                        $.each(item, function (key, value) {
                            selectedCategories.push(value["id"]);
                        });
                        // if (selectedCategories.length > 0) {
                        $("#hdn_selectedcategories").val(selectedCategories);
                        // }

                        $("#btnloadcats").trigger('click');

                    },
                    done: () => {
                        $('#flexCheckDefault').prop('checked', true);
                        this.toggleAllCategories(true);

                        var left_cats = this.getTreeCategories();

                        $('#hdn_selectedcategories').val(left_cats);
                        //$("#btnloadcats").trigger('click');
                    }
                });

                /*11/22/23 var path = window.location.pathname;
                if (path.split("/").pop() == "debter-rules") {
                    $('#flexCheckDefault').prop('checked', false);
                    $('a>i.sim-tree-checkbox').each(function (index) {
                        $(this).removeClass('checked');
                    });
                } */
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

            });



        });
    }

    btncats() {
        this.categoryService.categorySelected.next(this.allSelectedCats.nativeElement.value);
    }


    checkAllcats() {
        var current_status = $('#flexCheckDefault').prop('checked');
        let cat_all_str: any;
        cat_all_str = $("#hdn_selectedcategories").val();

        if ($('.show_deb_cols').find("input[type='checkbox']").is(':checked') && cat_all_str != '' && cat_all_str != '-1') {//means this is a group list

            let cat_all_arr = cat_all_str.split(',');
            if (current_status) { // check all hiddencategories

                $.each(cat_all_arr, function (key, value) {
                    var $li = $('li[data-id=' + value + ']');
                    checkGiven($li, true);
                });

            } else { //uncheck all hiddencategories
                $.each(cat_all_arr, function (key, value) {
                    var $li = $('li[data-id=' + value + ']');
                    checkGiven($li, false);
                });
            }
        } else if (cat_all_str == '-1') {
            this.toggleAllCategories(current_status);
            var left_cats = this.getTreeCategories();
            $('#hdn_selectedcategories').val(left_cats);
        } else {
            this.toggleAllCategories(current_status);
            var left_cats = this.getTreeCategories();
            $('#hdn_selectedcategories').val(left_cats);
        }

        $('#btnloadcats').trigger('click');
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


    getTreeCategories() {
        var selected_categories = "-1";

        if ($('a>i.sim-tree-checkbox').hasClass('checked')) {
            var updated_cats = new Array();
            $.each($('.sim-tree-checkbox'), function (index, value) {
                if ($(this).hasClass('checked')) {
                    updated_cats.push($(this).parent('a').parent('li').attr('data-id'));
                }
            });
            selected_categories = updated_cats.toString();
        }
        return selected_categories;
    }//end getTreeCategories()


}