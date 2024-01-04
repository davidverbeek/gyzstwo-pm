import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
declare var simTree: any;
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { PmCategoryService } from '../../../../../services/pm.category.service';
import { SimtreeService } from '../../../../../services/simtree.service';
import { ActivatedRoute } from '@angular/router';
declare function checkGiven(any, boolean): void;
declare function checkIt(boolean): void;
declare function setParentCheck(any): void;
declare function doCheck(any): void;

@Component({
    selector: 'app-left',
    templateUrl: './left.component.html',
    styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {

    list: any;
    cats: string = "";
    columnApi: any;
    flag_hdn: any = [];

    constructor(private http: HttpClient, private categoryService: PmCategoryService, private simtreeService: SimtreeService, private route: ActivatedRoute) {
    }

    @ViewChild('allSelectedCats') allSelectedCats: ElementRef;

    ngOnInit() {

        this.simtreeService.refresh$.subscribe(() => {
            $('#tree').empty();
            this.http.get<any>(environment.webservicebaseUrl + "/all-categories").subscribe(data => {
                // this.simtreeService.refresh$.subscribe(() => {
                this.list = data.rows;

                //console.log(this.list);

                /*   this.list = [{
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
                      "name": "JavaScript"
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
                      "disabled": true // is disabled?
                  }]; */



                var tree = simTree({
                    el: '#tree',
                    data: this.list,
                    check: true,
                    linkParent: true,

                    response: {
                        name: 'name',
                        id: 'id',
                        pid: 'pid',
                        checked: 'checked',
                        expand: false
                    },





                    onClick: function (item) {
                        alert('hh');
                        //this.click = 1;
                        $.each(item, function (key, value) {
                            console.log(value["id"]);
                            /*  var $li = $('li[data-id=' + value["id"] + ']');
                             var data = $li.data();
                             var $a = $li.children('a');
                             var $check = $a.children('.sim-tree-checkbox');
                             if ($check.hasClass('checked')) {
                                 $check.removeClass('checked');
                                 //  $li.data('checked', false);
                             } else {
                                 $check.addClass('checked');
                                 //$li.data('checked', true);
                             }
                             setParentCheck($li); */
                        });

                    },
                    onChange: (item) => {
                        alert('hh4');
                        $.each(item, function (key, value) {
                            console.log('jy' + value["id"]);
                        });

                        /*  if (this.is_click == 0) {
                             this.is_click = 2;
                             var selectedCategories = new Array();
                             $.each(item, function (key, value) {
                                 //console.log(value["id"]);
                                 var $li = $('li[data-id=' + value["id"] + ']');
                                 var data = $li.data();
                                 var $a = $li.children('a');
                                 var $check = $a.children('.sim-tree-checkbox');
                                 var is_checked = $check.hasClass('checked');
                                 if (is_checked === true) {
                                     $check.removeClass('sim-tree-semi').addClass('checked');
                                 } else if (is_checked === false) {
                                     $check.removeClass('checked sim-tree-semi');
                                 } else if (is_checked === 'semi') {
                                     $check.removeClass('checked').addClass('sim-tree-semi');
                                 }
                                 $li.data('checked', is_checked);
                                 setParentCheck($li);
 
                             });
                         } */




                        //doCheck(e, t, i);
                        //console.log($("li[data-id='" + item.id + "'").find('a').children().removeClass('checked'));


                        $("#chkall").prop('checked', false);
                        this.flag_hdn['flag'] = 0;
                        this.flag_hdn['hdn_selectedcats'] = $("#hdn_selectedcategories").val();
                        $("#btnloadcats").trigger('click');
                    },
                    done: () => {

                        alert('hh5');
                        console.log('done');
                        if (this.route.children[0].component?.name == 'SetpricesComponent') {
                            $('#flexCheckDefault').prop('checked', true);
                            this.toggleAllCategories(true);
                        } else if (this.route.children[0].component?.name == 'DebterRulesComponent') {
                            $('#flexCheckDefault').prop('checked', false);
                        }

                        this.flag_hdn['flag'] = 0;
                        this.flag_hdn['hdn_selectedcats'] = $("#hdn_selectedcategories").val();
                        $("#btnloadcats").trigger('click');
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
        //this.categoryService.categorySelected.next(this.allSelectedCats.nativeElement.value);
        this.categoryService.categorySelected.next(this.flag_hdn);
    }


    checkAllcats() {
        var current_status = $('#flexCheckDefault').prop('checked');
        let cat_all_str: any;
        cat_all_str = $("#hdn_selectedcategories").val();

        if ($('.show_deb_cols').find("input[type='checkbox']").is(':checked') && cat_all_str != '' && cat_all_str != '-1') {//means this is a group list
            let cat_all_arr = cat_all_str.split(',');
            if (current_status) {
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
        } else {
            this.toggleAllCategories(current_status);
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