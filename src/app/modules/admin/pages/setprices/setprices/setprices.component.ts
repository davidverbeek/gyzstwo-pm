import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef, GridReadyEvent, IServerSideDatasource, ServerSideStoreType, RowClassParams, CellValueChangedEvent, CellEditingStoppedEvent, DragStoppedEvent, FullWidthCellKeyDownEvent, GetRowIdFunc, GetRowIdParams, SideBarDef, PaginationChangedEvent
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import { environment } from 'src/environments/environment';
import { PmCategoryService } from '../../../../../services/pm.category.service';
import { PmSidebarService } from '../../../../../services/pm-sidebar.service';
import { SideSetPricesComponent } from 'src/app/modules/admin/pages/setprices/setprices/side-set-prices/side-set-prices.component';
import { LoadDebtorsService } from 'src/app/services/load-debtors.service';
import { PricehistoryComponent } from 'src/app/modules/admin/pages/setprices/pricehistory/pricehistory.component';
import { SimtreeService } from '../../../../../services/simtree.service';

declare function checkGiven(any, boolean): void;
declare function checkIt(boolean): void;

//import { PmDebterService } from '../../../../../services/load-debtors.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-setprices',
  templateUrl: './setprices.component.html',
  styleUrls: ['./setprices.component.css']
})
export class SetpricesComponent implements OnInit {

  api: any;
  gridParams: any;
  columnApi: any;
  cats: String = "";
  flag_of_cat_change: Number = 0;
  categoryChanged: String = "0";
  updatedProducts: any = [];
  subcat: any;
  subbtnclicked: any;
  chkAllCount: string;
  chkAllProducts: any;
  isChkAllChecked: number = 0;
  fileUploadDone: any;

  public rowModelType: 'serverSide' = 'serverSide';
  public serverSideStoreType: ServerSideStoreType = 'partial';
  public fillHandleDirection: 'x' | 'y' | 'xy' = 'x';
  all_debtors: any = [];
  deb_products: any = [];
  debterProds: any = [];
  debter_product_data = "";
  product_brands: any = [];
  product_supplier: any = [];
  redo_swap: any = [];
  undo_swap: any = [];
  undo_swap_rowdata: Record<string, any> = {};
  context: any
  updatePriceCompleted: boolean = true;
  //public rowModelType: 'serverSide';

  public paginationPageSize = 500;
  public cacheBlockSize = 500;
  rowStyle = { background: '' };
  newArray: any[] = [];

  getRowStyle = (params: RowClassParams) => this.rowStyle;

  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    { field: 'product_id', headerName: 'ID', sortable: true, filter: 'number', hide: true },
    {
      field: 'supplier_type', headerName: 'Leverancier', sortable: true, filter: 'agSetColumnFilter', filterParams: {
        values: params => {
          this.product_supplier = this.categoryService.product_supplier_arr;

          // simulating async delay
          setTimeout(() => params.success(this.product_supplier), 500);

        },
        refreshValuesOnOpen: true
      },
      cellRenderer: params => {
        var supplier_value = params.value;
        var updated_product_count = "";
        var is_activated = "";
        if (params.data.mag_updated_product_cnt != 0) {
          updated_product_count = '<i class="fa fa-bell-o" style="position: absolute; left: 5px; top: 19px;"></i><span class="label label-warning" style="position: absolute;top: 9px;left: 12px; text-align: center; font-size: 9px; padding: 2px 2px;">' + params.data.mag_updated_product_cnt + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
        }
        if (params.data.is_activated == 1) {
          is_activated = '<i class="fa fa-fw fa-check-square-o" style="color:green;"></i>';
        }
        return updated_product_count + is_activated + supplier_value;
      }
    },
    { field: 'name', headerName: 'Naam', sortable: true, filter: 'text' },
    { field: 'sku', headerName: 'SKU', sortable: true, filter: 'text', cellRenderer: PricehistoryComponent },
    { field: 'supplier_sku', headerName: 'SKU (Sup)', sortable: true, filter: 'text', hide: true },
    { field: 'eancode', headerName: 'Ean', sortable: true, filter: 'text', hide: true },
    {
      field: 'merk', headerName: 'Merk', sortable: true, filter: 'agSetColumnFilter', filterParams: {
        values: params => {
          this.product_brands = this.categoryService.product_brand_arr;

          // simulating async delay
          setTimeout(() => params.success(this.product_brands), 500);
        },
        refreshValuesOnOpen: true
      }
    },
    { field: 'gross_unit_price', headerName: 'Brutopr', sortable: true, filter: 'number', hide: true },
    { field: 'supplier_discount_gross_price', headerName: 'Korting brutopr', sortable: true, filter: 'number', hide: true },
    { field: 'net_unit_price', headerName: 'Nettopr Lev', sortable: true, filter: 'number', hide: true },
    { field: 'idealeverpakking', headerName: 'Ideal.verp', sortable: true, filter: 'number', hide: true },
    { field: 'afwijkenidealeverpakking', headerName: 'Afw.Ideal.verp', sortable: true, filter: 'number', hide: true },
    {
      field: 'buying_price', headerName: 'PM Inkpr', sortable: true, filter: 'number',
      cellRenderer: params => {
        var bp_icon = "";
        if (params.data.buying_price > params.data.net_unit_price) {
          bp_icon = '<i class="fa fa-long-arrow-up" aria-hidden="true" style="color:green; cursor:pointer;" title="' + params.data.net_unit_price + '=>' + params.data.buying_price + '"></i>';
        } else if (params.data.buying_price < params.data.net_unit_price) {
          bp_icon = '<i class="fa fa-long-arrow-down" aria-hidden="true" style="color:red; cursor:pointer;" title="' + params.data.net_unit_price + '=>' + params.data.buying_price + '"></i>';
        }
        return '' + bp_icon + ' ' + params.value + '';
      }
    },
    {
      field: 'selling_price', headerName: 'PM Vkpr', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' },
      cellRenderer: params => {
        var sp_icon = "";
        if (params.data.selling_price > params.data.webshop_selling_price) {
          sp_icon = '<i class="fa fa-long-arrow-up" aria-hidden="true" style="color:green; cursor:pointer;" title="' + params.data.webshop_selling_price + '=>' + params.data.selling_price + '"></i>';
        } else if (params.data.selling_price < params.data.webshop_selling_price) {
          sp_icon = '<i class="fa fa-long-arrow-down" aria-hidden="true" style="color:red; cursor:pointer;" title="' + params.data.webshop_selling_price + '=>' + params.data.selling_price + '"></i>';
        }
        return '' + sp_icon + ' ' + params.value + '';
      }
    },
    { field: 'profit_percentage', headerName: 'Marge Inkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'profit_percentage_selling_price', headerName: 'Marge Verkpr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'discount_on_gross_price', headerName: 'Korting Brupr %', sortable: true, filter: 'number', editable: true, cellStyle: { 'background-color': '#ffffcc' } },
    { field: 'percentage_increase', headerName: 'Stijging %', sortable: true, filter: 'number' },
    { field: 'magento_status', headerName: 'Status', sortable: true, filter: 'number', hide: true },
    { field: 'webshop_selling_price', headerName: 'WS Vkpr', sortable: true, filter: 'number', hide: true },
    { field: 'is_updated', headerName: 'Is Updated', sortable: true, filter: 'number', hide: true },
    { field: 'is_updated_skwirrel', headerName: 'Is Skwirrel Updated', sortable: true, filter: 'number', hide: true },
    /*
    {
      field: 'lowest_price',
      headerName: 'B.S. (L.P)',
      sortable: true,
      filter: 'agNumberColumnFilter',
      hide: true
    },
    {
      field: 'highest_price',
      headerName: 'B.S. (H.P)',
      filter: 'agNumberColumnFilter',
      sortable: true,
      hide: true
    },
     { field: 'lp_diff_percentage', headerName: 'B.S. (L.P %)', sortable: true, filter: 'agNumberColumnFilter', hide: true },
    { field: 'hp_diff_percentage', headerName: 'B.S. (H.P %)', sortable: true, filter: 'agNumberColumnFilter', hide: true },
    { field: 'price_competition_score', headerName: 'PCS', sortable: true, filter: 'agNumberColumnFilter', hide: true },
    { field: 'position', headerName: 'Positie', sortable: true, filter: 'agNumberColumnFilter', hide: true },
    { field: 'number_competitors', headerName: 'Aantal CC', sortable: true, filter: 'agNumberColumnFilter', hide: true },
    {
      field: 'productset_incl_dispatch', headerName: 'Productset', sortable: true,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: params => {
          // async update simulated using setTimeout()
          setTimeout(() => {
            // fetch values from server
            let values: any = [];
            this.http.get(environment.webservicebaseUrl + "/get_productset_options")
              .pipe(map(responseData => {
                let product_ids: any = [];

                responseData["msg"].forEach(function1);

                function function1(currentValue, index) {
                  product_ids.push(currentValue.productset)
                }
                return product_ids;
              }))
              .subscribe(
                responseData => {
                  values = responseData;
                  params.success(responseData);
                });
          }, 3000);
        },
        // refreshValuesOnOpen: true
      },
      hide: true
    },
    { field: 'price_of_the_next_excl_shipping', headerName: 'Next price', sortable: true, filter: 'agNumberColumnFilter', hide: true },
   */  { field: 'is_activated', headerName: 'Is Activated', sortable: true, filter: 'number', hide: true }
  ];

  public customToolPanelColumnDefs: any = [];



  constructor(private http: HttpClient, private categoryService: PmCategoryService, private sidebarService: PmSidebarService, private loaddebtorsService: LoadDebtorsService, private simtree_service: SimtreeService) {

    this.newArray = this.columnDefs.map((item) => ({
      headerName: item.headerName,
      field: item.field,
    }));

    if (localStorage.getItem("debtorCols") != null) {

      let debColString = localStorage.getItem("debtorCols");

      let deb_columns = [];
      deb_columns = JSON.parse(debColString || '{}');
      let arrayOfObjects: any = [];
      let arrayOfObjects_mbp: any = [];
      let arrayOfObjects_msp: any = [];
      let arrayOfObjects_dgp: any = [];
      for (const [key, value] of Object.entries(deb_columns)) {

        let debcellbg_color = "";
        let checkbox_class = "";
        if (value["type"] == "debsp") {
          debcellbg_color = "#90ee90";
          checkbox_class = "show_cols_dsp";
        } else if (value["type"] == "debppbp") {
          debcellbg_color = "#7ac3ff";
          checkbox_class = "show_cols_dmbp";
        } else if (value["type"] == "debppsp") {
          debcellbg_color = "#fffd6e";
          checkbox_class = "show_cols_dmsp";
        } else if (value["type"] == "debdgp") {
          debcellbg_color = "#fc6b6b";
          checkbox_class = "show_cols_ddgp";
        }
        //'.show_cols_dmbp, .show_cols_dmsp, .show_cols_ddgp, .show_cols_dsp'

        let definition: ColDef = {
          headerName: value["group_alias"], field: value["customer_group_name"], sortable: true, filter: 'number',
          editable: (params) => {

            var group_name_product = false;
            var column_name: string = value["customer_group_name"];
            var column_name_seperated = column_name.split('_');
            this.debterProds.forEach((value, key) => {
              if (column_name_seperated[1] in value) {
                const x = value;
                var debter_name_product_ids = value[column_name_seperated[1]];
                if (debter_name_product_ids.indexOf(params.data.product_id) !== -1) {
                  group_name_product = true;
                }
              }

            });
            return group_name_product;
          }, hide: true,
          cellStyle: params => {
            var status_of_debter_product = this.checkIfDebterProduct(params.data.product_id, value["customer_group_name"]);
            if (status_of_debter_product) {
              //mark police cells as red
              return { backgroundColor: debcellbg_color };
            } else {
              return { backgroundColor: "#808080" };//grey
            }
          }, toolPanelClass: 'show_deb_cols ' + checkbox_class
        };


        this.columnDefs.push(definition);



        let deb_fields: string = value["customer_group_name"];
        if (deb_fields.indexOf("_debter_selling_price") !== -1) {
          const dynamicObject = {
            headerName: value['group_alias'],
            field: value['customer_group_name'], // Generate an array of sub-objects
          };
          arrayOfObjects.push(dynamicObject);
        } else if (deb_fields.indexOf("_margin_on_buying_price") !== -1) {
          const dynamicObject_mbp = {
            headerName: value['group_alias'],
            field: value['customer_group_name'], // Generate an array of sub-objects
          };
          arrayOfObjects_mbp.push(dynamicObject_mbp);
        } else if (deb_fields.indexOf("_margin_on_selling_price") !== -1) {
          const dynamicObject_msp = {
            headerName: value['group_alias'],
            field: value['customer_group_name'], // Generate an array of sub-objects
          };
          arrayOfObjects_msp.push(dynamicObject_msp);
        } else {
          const dynamicObject_dgp = {
            headerName: value['group_alias'],
            field: value['customer_group_name'], // Generate an array of sub-objects
          };
          arrayOfObjects_dgp.push(dynamicObject_dgp);
        }


      };



      this.customToolPanelColumnDefs.push(...this.newArray);




      var newArray_2 = [

        {
          headerName: 'All SP',
          children: arrayOfObjects,
        },
        {
          headerName: 'All Marg.BP',
          children: arrayOfObjects_mbp,
        },
        {
          headerName: 'All Marg.SP',
          children: arrayOfObjects_msp,
        },
        {
          headerName: 'All Discount GP',
          children: arrayOfObjects_dgp,
        },

      ];

      this.customToolPanelColumnDefs.push(...newArray_2);

    }

    if (localStorage.getItem("allDebts") != null) {
      let alldebString = localStorage.getItem("allDebts");
      this.all_debtors = JSON.parse(alldebString || '{}');
    }


    this.http.get(environment.webservicebaseUrl + "/all-debtor-product").subscribe(responseData => {

      if (responseData["msg"]) {
        responseData["msg"].forEach((value, key) => {
          var element = {};
          element[value["customer_group_name"]] = value["product_ids"];

          this.debterProds.push(element);
        });
      }

    });

    this.context = {
      componentParent: this
    }
  }



  ngOnInit() {
    this.subcat = this.categoryService.categorySelected.subscribe((allselectedcats) => {
      // this.cats = allselectedcats;
      this.cats = allselectedcats['hdn_selectedcats'];
      this.flag_of_cat_change = allselectedcats['flag'];
      this.updatedProducts = [];
      this.loadAGGrid();
    });

    this.fileUploadDone = this.sidebarService.loadAgGrid.subscribe((isUploaded) => {
      if (isUploaded == 1) {
        this.loadAGGrid();
      }
    });

    this.subbtnclicked = this.sidebarService.btnClicked.subscribe((priceType) => {

      // console.log(priceType);

      if (this.undo_swap.length > 0 && priceType["update_type"] == "undo") {
        this.undo_swap.forEach((element: any) => {
          //if (element.update_type == priceType['type']) {
          this.formProductData(this.undo_swap_rowdata[element.product_id], priceType);
          //}
        });

        this.undo_swap = [];
        this.undo_swap_rowdata = [];
      }


      var idsToUpdate = this.api.getSelectedNodes().map(function (node) {
        return node.data.product_id;
      });



      var err = 0;
      if (idsToUpdate.length == 0) {
        alert("Please select record first!!");
      } else {
        if (typeof priceType["type"] == "undefined") {
          alert("Please select price type");
          err = 1;
        }
        if (priceType["update_type"] == "update" && priceType["val"] == "") {
          alert("Please enter value");
          err = 1;
        }
        if (err == 0) {
          if (this.isChkAllChecked == 0) {

            this.api.forEachNode((rowNode) => {
              if (idsToUpdate.indexOf(rowNode.data.product_id) >= 0) {

                if (priceType["customer_group_selected"] != '') {
                  let deb_grp = priceType["customer_group_selected"].split('|||');

                  if (!this.checkIfDebterProduct(rowNode.data.product_id, "debgrp_" + deb_grp[0] + "")) {
                    return;
                  }
                }

                var updated = JSON.parse(JSON.stringify(rowNode.data));

                if (priceType["update_type"] == "update") {
                  this.undo_swap_rowdata[rowNode.data.product_id] = updated;

                  if (priceType["type"] == "selling_price") {
                    this.redo_swap[rowNode.data.product_id] = rowNode.data.selling_price;
                    const newData = { product_id: rowNode.data.product_id, 'before_price': rowNode.data.selling_price, 'update_type': priceType["type"] };
                    this.undo_swap.push(newData);
                  } else if (priceType["type"] == "profit_percentage") {
                    this.redo_swap[rowNode.data.product_id] = rowNode.data.profit_percentage;
                    const newData = { product_id: rowNode.data.product_id, 'before_price': rowNode.data.profit_percentage, 'update_type': priceType["type"] };
                    this.undo_swap.push(newData);
                  } else if (priceType["type"] == "profit_percentage_selling_price") {
                    this.redo_swap[rowNode.data.product_id] = rowNode.data.profit_percentage_selling_price;
                    const newData = { product_id: rowNode.data.product_id, 'before_price': rowNode.data.profit_percentage_selling_price, 'update_type': priceType["type"] };
                    this.undo_swap.push(newData);
                  } else if (priceType["type"] == "discount_on_gross_price") {
                    this.redo_swap[rowNode.data.product_id] = rowNode.data.discount_on_gross_price;
                    const newData = { product_id: rowNode.data.product_id, 'before_price': rowNode.data.discount_on_gross_price, 'update_type': priceType["type"] };
                    this.undo_swap.push(newData);
                  }

                  this.formProductData(updated, priceType);
                }
              }
            });
          } else if (this.isChkAllChecked == 1) {
            if ((this.chkAllProducts["msg"]).length > 0) {
              this.chkAllCount = "(Please Wait ...)";
              this.chkAllProducts["msg"].forEach(
                (value, key) => {
                  if (priceType["customer_group_selected"] != '') {
                    let deb_grp = priceType["customer_group_selected"].split('|||');

                    if (!this.checkIfDebterProduct(value.product_id, "debgrp_" + deb_grp[0] + "")) {
                      return;
                    }
                  }

                  if (priceType["update_type"] == "update") {
                    this.undo_swap_rowdata[value.product_id] = value;

                    this.undo_swap.push({ product_id: value.product_id });
                    if (priceType["type"] == "selling_price") {
                      this.redo_swap[value.product_id] = value.selling_price;
                    } else if (priceType["type"] == "profit_percentage") {
                      this.redo_swap[value.product_id] = value.profit_percentage;
                      //this.undo_swap[value.product_id] = value.profit_percentage;
                    } else if (priceType["type"] == "profit_percentage_selling_price") {
                      this.redo_swap[value.product_id] = value.profit_percentage_selling_price;
                      // this.undo_swap[value.product_id] = value.profit_percentage_selling_price;
                    } else if (priceType["type"] == "discount_on_gross_price") {
                      this.redo_swap[value.product_id] = value.discount_on_gross_price;
                      // this.undo_swap[value.product_id] = value.discount_on_gross_price;
                    }
                    this.formProductData(value, priceType);
                  }
                }
              )

            }
          }

          this.saveUpdatedProducts(this.updatedProducts);

        }
      }
      if (this.updatedProducts.length > 0) {
        $('#btnundo').removeAttr("disabled");
        $('#btnredo').removeAttr("disabled");
      }
    });

    /* 11/22/23 $('#flexCheckDefault').prop('checked', true);
  
    $('a>i.sim-tree-checkbox').each(function (index) {
      $(this).addClass('checked');
    }); */



  }

  ngOnDestroy() {
    this.subcat.unsubscribe();
    this.subbtnclicked.unsubscribe();
    this.fileUploadDone.unsubscribe();
  }

  showUpdated(event) {
    var filter_val = "";
    if (event.target.checked) {
      filter_val = "1";
    }

    let filterComponent = this.api.getFilterInstance('is_updated');
    filterComponent.setModel({
      type: "equals",
      filter: filter_val
    });
    this.api.onFilterChanged();
  }
  resetFilters() {
    this.api.setFilterModel(null);
  }
  ShowNegative(event) {
    var filter_val = "";
    if (event.target.checked) {
      filter_val = "0";
    }

    let filterComponent = this.api.getFilterInstance('profit_percentage');
    filterComponent.setModel({
      type: "lessThan",
      filter: filter_val
    });
    /*
    let filterComponent1 = this.api.getFilterInstance('group_4027100_margin_on_buying_price');
    filterComponent1.setModel({
      type: "lessThan",
      filter: 0
    });
    */

    this.api.onFilterChanged();
  }

  activateUpdated() {
    if (confirm("Are you sure you want to active the updated records?")) {
      this.http.get(environment.webservicebaseUrl + "/activate-updated-products").subscribe(responseData => {
        if (responseData["msg"] == "done") {
          this.loadAGGrid();
        }
      });
    }
  }

  formProductData(prodData, priceType) {
    let new_selling_price = prodData.selling_price;
    let new_profit_percentage = prodData.profit_percentage;
    let new_profit_percentage_selling_price = prodData.profit_percentage_selling_price;
    let new_discount_on_gross_price = prodData.discount_on_gross_price;
    let debField = "";
    if (priceType["update_type"] == "update") {
      if (priceType["type"] == "selling_price") {
        new_selling_price = (1 + (priceType["val"] / 100)) * prodData.selling_price;
      } else if (priceType["type"] == "profit_percentage") {
        new_profit_percentage = priceType["val"];
      } else if (priceType["type"] == "profit_percentage_selling_price") {
        new_profit_percentage_selling_price = priceType["val"];
      } else if (priceType["type"] == "discount_on_gross_price") {
        new_discount_on_gross_price = priceType["val"];
      }
    } /*else if (priceType["update_type"] == "undo") {
      if (priceType["type"] == "selling_price") {
        new_selling_price = this.undo_swap[prodData.product_id];
      } else if (priceType["type"] == "profit_percentage") {
        new_profit_percentage = this.undo_swap[prodData.product_id];
      } else if (priceType["type"] == "profit_percentage_selling_price") {
        new_profit_percentage_selling_price = this.undo_swap[prodData.product_id];
      } else if (priceType["type"] == "discount_on_gross_price") {
        new_discount_on_gross_price = this.undo_swap[prodData.product_id];
      }
    }   else {
      if (priceType["type"] == "selling_price") {
        new_selling_price = this.redo_swap[prodData.product_id];
      } else if (priceType["type"] == "profit_percentage") {
        new_profit_percentage = this.redo_swap[prodData.product_id];
      } else if (priceType["type"] == "profit_percentage_selling_price") {
        new_profit_percentage_selling_price = this.redo_swap[prodData.product_id];
      } else if (priceType["type"] == "discount_on_gross_price") {
        new_discount_on_gross_price = this.redo_swap[prodData.product_id];
      }
    } */

    var prepareProductData = [];
    prepareProductData["field"] = priceType["type"];
    prepareProductData["product_id"] = prodData.product_id;
    prepareProductData["buying_price"] = prodData.buying_price;
    prepareProductData["selling_price"] = new_selling_price;
    prepareProductData["profit_percentage"] = new_profit_percentage;
    prepareProductData["profit_percentage_selling_price"] = new_profit_percentage_selling_price;
    prepareProductData["discount_on_gross_price"] = new_discount_on_gross_price;
    prepareProductData["percentage_increase"] = prodData.percentage_increase;
    prepareProductData["gross_unit_price"] = prodData.gross_unit_price;


    /* For History */
    prepareProductData["idealeverpakking"] = prodData.idealeverpakking;
    prepareProductData["afwijkenidealeverpakking"] = prodData.afwijkenidealeverpakking;

    prepareProductData["webshop_net_unit_price"] = prodData.webshop_net_unit_price;
    prepareProductData["webshop_gross_unit_price"] = prodData.webshop_gross_unit_price;
    prepareProductData["webshop_idealeverpakking"] = prodData.webshop_idealeverpakking;
    prepareProductData["webshop_afwijkenidealeverpakking"] = prodData.webshop_afwijkenidealeverpakking;
    prepareProductData["webshop_buying_price"] = prodData.webshop_buying_price;
    prepareProductData["webshop_selling_price"] = prodData.webshop_selling_price;


    if (priceType["customer_group_selected"] != "") {
      let selCgData = (priceType["customer_group_selected"]).split("|||");

      if (priceType["update_type"] == "update") {
        if (priceType["type"] == "selling_price") {
          debField = "group_" + selCgData[0] + "_debter_selling_price";
          new_selling_price = (1 + (priceType["val"] / 100)) * prodData[debField];
        } else if (priceType["type"] == "profit_percentage") {
          debField = "group_" + selCgData[0] + "_margin_on_buying_price";
        } else if (priceType["type"] == "profit_percentage_selling_price") {
          debField = "group_" + selCgData[0] + "_margin_on_selling_price";
        } else if (priceType["type"] == "discount_on_gross_price") {
          debField = "group_" + selCgData[0] + "_discount_on_grossprice_b_on_deb_selling_price";
        }
      } else {//undo
        if (priceType["type"] == "selling_price") {
          debField = "group_" + selCgData[0] + "_debter_selling_price";
          new_selling_price = prodData[debField];
        } else if (priceType["type"] == "profit_percentage") {
          debField = "group_" + selCgData[0] + "_margin_on_buying_price";
          new_profit_percentage = prodData[debField];
        } else if (priceType["type"] == "profit_percentage_selling_price") {
          debField = "group_" + selCgData[0] + "_margin_on_selling_price";
          new_profit_percentage_selling_price = prodData[debField];
        } else if (priceType["type"] == "discount_on_gross_price") {
          debField = "group_" + selCgData[0] + "_discount_on_grossprice_b_on_deb_selling_price";
          new_discount_on_gross_price = prodData[debField];
        }

      }


      prepareProductData["field"] = debField;
      prepareProductData["debtor"] = selCgData[0];
      prepareProductData["debtor_id"] = selCgData[1];
      prepareProductData["group_" + selCgData[0] + "_debter_selling_price"] = new_selling_price;
      prepareProductData["group_" + selCgData[0] + "_margin_on_buying_price"] = new_profit_percentage;
      prepareProductData["group_" + selCgData[0] + "_margin_on_selling_price"] = new_profit_percentage_selling_price;
      prepareProductData["group_" + selCgData[0] + "_discount_on_grossprice_b_on_deb_selling_price"] = new_discount_on_gross_price;
    }
    this.createProductData(prepareProductData);
  }

  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
          // prevents custom layout changing when columns are reordered in the grid
          suppressSyncLayoutWithGrid: true,
          // prevents columns being reordered from the columns tool panel
          suppressColumnMove: true,
        },
      },
      {
        id: 'sideSetPrices',
        labelDefault: 'Miscellaneous',
        labelKey: 'sideSetPrices',
        iconKey: 'app-side-set-prices',
        toolPanel: SideSetPricesComponent,
      },
    ],
    defaultToolPanel: 'columns',
    hiddenByDefault: true,
  };


  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 115,
    resizable: true
  };

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.product_id;
  };

  // Data that gets displayed in the grid
  public rowData: any;



  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;



  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    this.api = params.api;
    this.gridParams = params;
    this.columnApi = params.columnApi;
    this.loadAGGrid();

    this.setCustomGroupLayout();
    this.agGrid.api.setSideBarVisible(true);

    this.getRowStyle = function (params) {
      if (typeof params.data != "undefined") {
        if (params.data.is_updated == 1 || params.data.is_updated_skwirrel == 1 || params.data.is_activated == 1) {
          return { background: '#bce0bc' };
        } else {
          return { background: '' };
        }
      }
      return { background: '' };
    };
  }

  loadAGGrid() {
    let selected_categories: String = '-1';
    var is_debter_checked = 0;
    $('.show_cols_dmbp, .show_cols_dmsp, .show_cols_ddgp, .show_cols_dsp').each(function (index) {
      if ($(this).is(':checked') && is_debter_checked == 0) {
        is_debter_checked = 1;
      }
    });
    if (this.flag_of_cat_change == 0) {
      if ($('a>i.sim-tree-checkbox').hasClass('checked')) {
        let updated_cats = new Array();
        //let collect_category_ids = new Array();
        $.each($('.sim-tree-checkbox'), function (index, value) {
          if ($(this).hasClass('checked')) {
            updated_cats.push($(this).parent('a').parent('li').attr('data-id'));
          }
        });
        selected_categories = updated_cats.toString();
      }
    } else if (is_debter_checked == 1) {
      selected_categories = this.cats;
    } else {//this is loading case
      selected_categories = this.cats;
    }

    var cat_all_str = selected_categories;
    /*  if ($('.show_deb_cols').find("input[type='checkbox']").is(':checked') && cat_all_str != '' && cat_all_str != '-1') {//means this is a group list
       if (!$('#flexCheckDefault').is(':checked')) {
         cat_all_str = '-1';
       }
     } */
    var datasource = createServerSideDatasource(this.gridParams, cat_all_str);
    this.api.setServerSideDatasource(datasource);
    this.fillHandleDirection = 'y';
    this.product_brands = this.categoryService.setCategoryBrands(this.cats);
  }



  onCellValueChanged(event: CellValueChangedEvent) {
    const newValue = event.newValue;
    if (isNaN(Number(event.newValue)) || (typeof newValue === 'string' && !(newValue.trim()))) {
      const columnName_1 = event.column.getColId();
      alert('Please enter numeric value');
      event.node.setDataValue(columnName_1, event.oldValue);
      //return false;
    } else {
      var prepareProductData = [];
      var checkforDebtor: any = [];
      prepareProductData["field"] = event.colDef.field;
      prepareProductData["product_id"] = event.data.product_id;
      prepareProductData["buying_price"] = event.data.buying_price;
      prepareProductData["selling_price"] = event.data.selling_price;
      prepareProductData["profit_percentage"] = event.data.profit_percentage;
      prepareProductData["profit_percentage_selling_price"] = event.data.profit_percentage_selling_price;
      prepareProductData["discount_on_gross_price"] = event.data.discount_on_gross_price;
      prepareProductData["percentage_increase"] = event.data.percentage_increase;
      prepareProductData["gross_unit_price"] = event.data.gross_unit_price;

      /* For History */
      prepareProductData["idealeverpakking"] = event.data.idealeverpakking;
      prepareProductData["afwijkenidealeverpakking"] = event.data.afwijkenidealeverpakking;

      prepareProductData["webshop_net_unit_price"] = event.data.webshop_net_unit_price;
      prepareProductData["webshop_gross_unit_price"] = event.data.webshop_gross_unit_price;
      prepareProductData["webshop_idealeverpakking"] = event.data.webshop_idealeverpakking;
      prepareProductData["webshop_afwijkenidealeverpakking"] = event.data.webshop_afwijkenidealeverpakking;
      prepareProductData["webshop_buying_price"] = event.data.webshop_buying_price;
      prepareProductData["webshop_selling_price"] = event.data.webshop_selling_price;

      checkforDebtor = (event.colDef.field)?.split("_");
      if (checkforDebtor[0] == "group") {
        prepareProductData["debtor"] = checkforDebtor[1];
        let debData = (this.all_debtors[checkforDebtor[1]]).split("|||");
        prepareProductData["debtor_id"] = debData[0];
        prepareProductData["group_" + checkforDebtor[1] + "_debter_selling_price"] = event.data["group_" + checkforDebtor[1] + "_debter_selling_price"];
        prepareProductData["group_" + checkforDebtor[1] + "_margin_on_buying_price"] = event.data["group_" + checkforDebtor[1] + "_margin_on_buying_price"];
        prepareProductData["group_" + checkforDebtor[1] + "_margin_on_selling_price"] = event.data["group_" + checkforDebtor[1] + "_margin_on_selling_price"];
        prepareProductData["group_" + checkforDebtor[1] + "_discount_on_grossprice_b_on_deb_selling_price"] = event.data["group_" + checkforDebtor[1] + "_discount_on_grossprice_b_on_deb_selling_price"];
      }
      this.createProductData(prepareProductData);
      //console.log(event.colDef.field);
    }
  }

  onPaginationChanged(event: PaginationChangedEvent) {
    if (event.animate) {
      if (this.isChkAllChecked == 1) {
        this.api.forEachNode((rowNode) => {
          rowNode.setSelected(true)
        });
      } else {
        this.api.forEachNode((rowNode) => {
          rowNode.setSelected(false)
        });
      }
    }
  }

  createProductData(preparedProductData: any) {
    var productData = {};
    productData["field"] = preparedProductData["field"];
    productData["product_id"] = preparedProductData["product_id"];
    productData["buying_price"] = preparedProductData["buying_price"];
    productData["selling_price"] = preparedProductData["selling_price"];
    productData["profit_percentage"] = preparedProductData["profit_percentage"];
    productData["profit_percentage_selling_price"] = preparedProductData["profit_percentage_selling_price"];
    productData["discount_on_gross_price"] = preparedProductData["discount_on_gross_price"];
    productData["percentage_increase"] = preparedProductData["percentage_increase"];
    productData["gross_unit_price"] = preparedProductData["gross_unit_price"];


    /* For History */
    productData["idealeverpakking"] = preparedProductData["idealeverpakking"];
    productData["afwijkenidealeverpakking"] = preparedProductData["afwijkenidealeverpakking"];

    productData["webshop_net_unit_price"] = preparedProductData["webshop_net_unit_price"];
    productData["webshop_gross_unit_price"] = preparedProductData["webshop_gross_unit_price"];
    productData["webshop_idealeverpakking"] = preparedProductData["webshop_idealeverpakking"];
    productData["webshop_afwijkenidealeverpakking"] = preparedProductData["webshop_afwijkenidealeverpakking"];
    productData["webshop_buying_price"] = preparedProductData["webshop_buying_price"];
    productData["webshop_selling_price"] = preparedProductData["webshop_selling_price"];

    if (typeof preparedProductData["debtor"] != "undefined") {
      productData["debtor"] = preparedProductData["debtor"];
      productData["debtor_id"] = preparedProductData["debtor_id"];
      productData["group_" + preparedProductData["debtor"] + "_debter_selling_price"] = preparedProductData["group_" + preparedProductData["debtor"] + "_debter_selling_price"];
      productData["group_" + preparedProductData["debtor"] + "_margin_on_buying_price"] = preparedProductData["group_" + preparedProductData["debtor"] + "_margin_on_buying_price"];
      productData["group_" + preparedProductData["debtor"] + "_margin_on_selling_price"] = preparedProductData["group_" + preparedProductData["debtor"] + "_margin_on_selling_price"];
      productData["group_" + preparedProductData["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"] = preparedProductData["group_" + preparedProductData["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"];
    }
    var processedData;
    processedData = processUpdatedProduct(productData);
    this.updatedProducts[preparedProductData["product_id"]] = processedData;
  }

  onCellEditingStopped(event: CellEditingStoppedEvent) {
    /*  if (isNaN(Number(event.newValue)) || !(event.newValue.trim())) {
       const columnName_1 = event.column.getColId();
       alert('Please enter numeric value');
       event.node.setDataValue(columnName_1, event.oldValue);
       return false;
     } */


    //console.log(this.updatedProducts);
    this.saveUpdatedProducts(this.updatedProducts);
    /* this.saveRow(this.updatedProducts); 
    setTimeout(()=>{                          
      this.updatedProducts = [];
      console.log(this.updatedProducts);
    }, 3000);
    */
  }
  onDragStopped(event: DragStoppedEvent) {
    //console.log(this.updatedProducts);
    this.saveUpdatedProducts(this.updatedProducts);
    /* this.saveRow(this.updatedProducts);
    this.updatedProducts = []; */
  }
  onCellKeyDown(e: FullWidthCellKeyDownEvent) {
    var keyPressed = (e.event as KeyboardEvent).key;
    if (keyPressed == "z") {
      //console.log(this.updatedProducts);
      this.saveUpdatedProducts(this.updatedProducts);
      /* this.saveRow(this.updatedProducts);
      this.updatedProducts = []; */
    }
  }

  onColumnVisible(e) {
    //console.log('Event Column Visible', e);

    // i will change visibility of debter cols
    // if atlease one debter col is visible then to show button
    //if none debter cols is visible then hide button
    e.columns.forEach(column => {
      if (column.colDef.toolPanelClass != undefined) {
        if (column.visible) {
          if ($("label[for='btnDebCategories']").parent('div').css('display') != 'inline') {
            $("label[for='btnDebCategories']").parent('div').css('display', 'inline');
          }
          $("#btnDebCategories").css("opacity", 1);
          $('#btnDebCategories').removeAttr('disabled');
        } else {
          if ($('div.show_deb_cols .ag-column-select-checkbox .ag-checkbox-input-wrapper input:checked').length === 0) {
            $("label[for='btnDebCategories']").parent('div').css('display', 'none');
            this.onApplyDebterCategories();
          } else {
            if ($("label[for='btnDebCategories']").parent('div').css('display') != 'inline') {
              $("label[for='btnDebCategories']").parent('div').css('display', 'inline');
            }
            $("#btnDebCategories").css("opacity", 1);
            $('#btnDebCategories').removeAttr('disabled');
          }
        }
      }
    });
  }

  onBtnClicked() {
    var rowNode = this.api.getRowNode('13');
    //console.log(rowNode);
    rowNode.setDataValue('selling_price', "100");
    //console.log(rowNode);
    //const newData = rowNode.data;
    //newData.selling_price = "250";

    //rowNode.updateData(newData);
  }
  //onRowClicked(event: any) {$("#imagemodal").modal("show");}
  onRowSelected(event) {
    /* window.alert(
      'row ' + event.node.data.sku + ' selected = ' + event.node.isSelected()
    ); */
  }

  onSelectionChanged(event) {
    // var rowCount = event.api.getSelectedNodes().length;
    if (this.undo_swap.length == 0) {
      $('#btnundo').attr('disabled', 'disabled');
    }
    //window.alert('selection changed, ' + rowCount + ' rows selected');
  }

  saveRow(updatedProducts) {
    updatedProducts.forEach(
      (value, key) => {
        var rowNode = this.api.getRowNode(key.toString());
        if (typeof value["debtor"] != "undefined") {
          var updated = JSON.parse(JSON.stringify(rowNode.data));
          updated["group_" + value["debtor"] + "_debter_selling_price"] = value["group_" + value["debtor"] + "_debter_selling_price"];
          updated["group_" + value["debtor"] + "_margin_on_buying_price"] = value["group_" + value["debtor"] + "_margin_on_buying_price"];
          updated["group_" + value["debtor"] + "_margin_on_selling_price"] = value["group_" + value["debtor"] + "_margin_on_selling_price"];
          updated["group_" + value["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"] = value["group_" + value["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"];
          rowNode.setData(updated);
          /*  rowNode.setDataValue("group_" + value["debtor"] + "_debter_selling_price", value["group_" + value["debtor"] + "_debter_selling_price"]);
           rowNode.setDataValue("group_" + value["debtor"] + "_margin_on_buying_price", value["group_" + value["debtor"] + "_margin_on_buying_price"]);
           rowNode.setDataValue("group_" + value["debtor"] + "_margin_on_selling_price", value["group_" + value["debtor"] + "_margin_on_selling_price"]);
           rowNode.setDataValue("group_" + value["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price", value["group_" + value["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"]); */
        } else {
          var updated = JSON.parse(JSON.stringify(rowNode.data));

          updated["selling_price"] = value["selling_price"];
          updated["profit_percentage"] = value["profit_percentage"];
          updated["profit_percentage_selling_price"] = value["profit_percentage_selling_price"];
          updated["discount_on_gross_price"] = value["discount_on_gross_price"];
          updated["percentage_increase"] = value["percentage_increase"];
          rowNode.setData(updated);

          /* rowNode.setDataValue('selling_price', value["selling_price"]);
          rowNode.setDataValue('profit_percentage', value["profit_percentage"]);
          rowNode.setDataValue('profit_percentage_selling_price', value["profit_percentage_selling_price"]);
          rowNode.setDataValue('discount_on_gross_price', value["discount_on_gross_price"]); */
        }
      }
    );
    //this.updatedProducts = [];
  }

  saveUpdatedProducts(processedData) {

    if (processedData.length > 0) {
      var filterProcessData = processedData.filter(function () { return true; });
      this.http.post(environment.webservicebaseUrl + "/save-products", filterProcessData).subscribe(responseData => {
        if (responseData["msg"] == "done") {
          if (this.isChkAllChecked == 0) {
            let finalPdata = this.updatedProducts;
            this.updatedProducts = [];
            this.saveRow(finalPdata);
            this.updatePriceCompleted = false;
          } else if (this.isChkAllChecked == 1) {
            this.chkAllCount = "(" + (this.chkAllProducts["msg"]).length + " Products Updated Successfully)";
            this.updatedProducts = [];
            this.loadAGGrid();
            this.updatePriceCompleted = false;
          }
        }
      });
    }
  }

  getAllProducts(event) {
    if (event.target.checked) {
      var currentsql = localStorage.getItem("currentSql")?.trim();
      this.chkAllCount = "(Please Wait ...)";
      this.http.post(environment.webservicebaseUrl + "/all-products", currentsql).subscribe(responseData => {
        this.chkAllProducts = responseData;
        this.chkAllCount = "(" + responseData["msg"].length + ")";
        this.isChkAllChecked = 1;

        this.api.forEachNode((rowNode) => {
          rowNode.setSelected(true)
        });

      });
    } else {
      this.chkAllCount = "";
      this.chkAllProducts = "";
      this.isChkAllChecked = 0;

      this.api.forEachNode((rowNode) => {
        rowNode.setSelected(false)
      });

    }
  }



  onApplyDebterCategories() {
    let selected_group = new Array();
    let unique_group = new Array();
    //$('.show_cols_dmbp, .show_cols_dmsp, .show_cols_ddgp, .show_cols_dsp').each(function (index) {
    $('.show_deb_cols').each(function (index) {
      var checkbox_group = "";
      if ($(this).find("input[type='checkbox']").is(':checked')) {
        checkbox_group = $(this).find("span.ag-column-select-column-label").text();
        var myArray = checkbox_group.split("(");
        var myArray_2 = myArray[1].split(")");
        selected_group.push(myArray_2[0]);
      }
    });
    unique_group = removeDuplicates(selected_group);
    const toObject = Object.assign({}, unique_group);

    if ($.isEmptyObject(selected_group)) {
      $("#hdn_selectedcategories").val('');
      checkIt(true);
      $("i.sim-tree-checkbox").parent('a').parent('li').removeClass('disabled');
      $("#flexCheckDefault").removeAttr("disabled");
      this.cats = '';
      this.loadAGGrid();
    } else {
      this.http.post(environment.webservicebaseUrl + "/dbt-alias-cats", toObject)
        .pipe(map(responseData => {
          const category_ids: string[] = [];

          responseData["rows"].forEach(function1);

          function function1(currentValue, index) {
            // console.log("Index in array is: " + index + " ::  Value is: " + currentValue.product_id);
            category_ids.push(currentValue.category_ids);
          }
          let comma_sperated_ids = category_ids.toString();
          return comma_sperated_ids;
        }))
        .subscribe(
          responseData => {
            //$("#btnDebCategories").css("opacity", 0.5);
            $("#btnDebCategories").find('span.loading-img-update').css({ "display": "inline-block" });
            $("#btnDebCategories").attr('disabled', 'disabled');

            var debter_cats = responseData;
            $("#hdn_selectedcategories").val(debter_cats);
            checkIt(false);
            if (debter_cats != "") { // means status = checked
              $('#flexCheckDefault').prop('checked', true);

              var cat_id_arr = debter_cats.split(',');
              $.each(cat_id_arr, function (key, value) {
                var $li = $('li[data-id=' + value + ']');
                checkGiven($li, true);
              });
              this.toggleCheckbox('none');
            } else { // remove category filter
              $("i.sim-tree-checkbox").parent('a').parent('li').addClass('disabled');
              $("#flexCheckDefault").attr("disabled", "true");
            }
            $("#btnDebCategories").css("opacity", 0.5);
            $("#btnDebCategories").find('span.loading-img-update').css({ "display": "none" });

            this.cats = debter_cats;
            this.loadAGGrid();


          });
    }
  }//end onApplyDebterCategories()

  setCustomGroupLayout() {

    var columnToolPanel = this.api.getToolPanelInstance('columns');
    columnToolPanel.setColumnLayout(this.customToolPanelColumnDefs);

  }

  toggleCheckbox(new_status) {
    $('a>i.sim-tree-checkbox').each(function (index) {
      $(this).parent('a').parent('li').removeClass('disabled');
      if (!$(this).hasClass('checked')) {
        if (new_status == 'none') {
          $(this).parent('a').parent('li').addClass('disabled');
        } else {
          $(this).parent('a').parent('li').removeClass('disabled');
        }
      }
    });
  }

  checkIfDebterProduct(product_id, current_group_name) {
    var group_name_product = false;
    var column_name: string = current_group_name;
    var column_name_seperated = column_name.split('_');
    this.debterProds.forEach((value, key) => {
      if (column_name_seperated[1] in value) {
        const x = value;
        var debter_name_product_ids = value[column_name_seperated[1]];
        if (debter_name_product_ids.indexOf(product_id) !== -1) {
          group_name_product = true;
        }
      }

    });
    return group_name_product;
  }
}

function removeDuplicates(arr: any[]) {
  return arr.filter((item,
    index) => arr.indexOf(item) === index);
}


function createServerSideDatasource(server: any, cats: any): IServerSideDatasource {
  return {
    getRows(params) {

      params.request["cats"] = cats;
      if (params.request["sortModel"].length == 0) {
        params.request["sortModel"] = [{ sort: 'desc', colId: 'mag_updated_product_cnt' }];
      }

      fetch(environment.webservicebaseUrl + "/pm-products", {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { "Content-Type": "application/json; charset=utf-8" }
      })
        .then(httpResponse => httpResponse.json())
        .then(response => {

          //console.log(response);
          if (response.lastRow == null) {
            response.lastRow = 0;
          }
          //params.successCallback(response.rows, response.lastRow);
          var limitIndex = (response.currentSql).indexOf("limit");
          localStorage.setItem("currentSql", (response.currentSql).substring(0, limitIndex));
          params.success({ rowData: response.rows, rowCount: response.lastRow })

        })
        .catch(error => {
          // params.failCallback();
          params.fail();
        })
    }
  };
}

function processUpdatedProduct(productData) {
  var bp = parseFloat(productData.buying_price);
  var sp = parseFloat(productData.selling_price);
  var gup = (parseFloat(productData.gross_unit_price) == 0 ? 1 : parseFloat(productData.gross_unit_price));
  var wsp = parseFloat(productData.webshop_selling_price);

  switch (productData.field) {
    case "selling_price":
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
      productData["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
      productData["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
    case "profit_percentage":
      var pp = parseFloat(productData.profit_percentage);
      sp = ((1 + (pp / 100)) * bp);
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = pp.toFixed(4);
      productData["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
      productData["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
    case "profit_percentage_selling_price":
      var ppsp = parseFloat(productData.profit_percentage_selling_price);
      sp = (bp / (1 - (ppsp / 100)));
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
      productData["profit_percentage_selling_price"] = ppsp.toFixed(4);
      productData["discount_on_gross_price"] = ((1 - (sp / gup)) * 100).toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
    case "discount_on_gross_price":
      var dgp = parseFloat(productData.discount_on_gross_price);
      sp = ((1 - (dgp / 100)) * gup);
      productData["selling_price"] = sp.toFixed(4);
      productData["profit_percentage"] = (((sp - bp) / bp) * 100).toFixed(4);
      productData["profit_percentage_selling_price"] = (((sp - bp) / sp) * 100).toFixed(4);
      productData["discount_on_gross_price"] = dgp.toFixed(4);
      productData["percentage_increase"] = (((sp - wsp) / wsp) * 100).toFixed(4);
      break;
    default:
      if (typeof productData["debtor"] != "undefined") {
        var debsp = parseFloat(productData["group_" + productData["debtor"] + "_debter_selling_price"]);
        var debcoltypes = productData["field"].replace("group_" + productData["debtor"] + "_", "");
        if (debcoltypes == "debter_selling_price") {
          productData["group_" + productData["debtor"] + "_debter_selling_price"] = debsp.toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_buying_price"] = (((debsp - bp) / bp) * 100).toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_selling_price"] = (((debsp - bp) / debsp) * 100).toFixed(4);
          productData["group_" + productData["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"] = ((1 - (debsp / gup)) * 100).toFixed(4);
        } else if (debcoltypes == "margin_on_buying_price") {
          var debpp = parseFloat(productData["group_" + productData["debtor"] + "_margin_on_buying_price"]);
          debsp = ((1 + (debpp / 100)) * bp);

          productData["group_" + productData["debtor"] + "_debter_selling_price"] = debsp.toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_buying_price"] = debpp.toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_selling_price"] = (((debsp - bp) / debsp) * 100).toFixed(4);
          productData["group_" + productData["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"] = ((1 - (debsp / gup)) * 100).toFixed(4);
        } else if (debcoltypes == "margin_on_selling_price") {
          var debppsp = parseFloat(productData["group_" + productData["debtor"] + "_margin_on_selling_price"]);
          debsp = (bp / (1 - (debppsp / 100)));

          productData["group_" + productData["debtor"] + "_debter_selling_price"] = debsp.toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_buying_price"] = (((debsp - bp) / bp) * 100).toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_selling_price"] = debppsp.toFixed(4);
          productData["group_" + productData["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"] = ((1 - (debsp / gup)) * 100).toFixed(4);
        } else if (debcoltypes == "discount_on_grossprice_b_on_deb_selling_price") {
          var debdgp = parseFloat(productData["group_" + productData["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"]);
          debsp = ((1 - (debdgp / 100)) * gup);

          productData["group_" + productData["debtor"] + "_debter_selling_price"] = debsp.toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_buying_price"] = (((debsp - bp) / bp) * 100).toFixed(4);
          productData["group_" + productData["debtor"] + "_margin_on_selling_price"] = (((debsp - bp) / debsp) * 100).toFixed(4);
          productData["group_" + productData["debtor"] + "_discount_on_grossprice_b_on_deb_selling_price"] = debdgp.toFixed(4);
        }

        //console.log("hey"+productData["debtor"]);
        //console.log(debcoltypes);
      }
      break;
  }

  return productData;
}

