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
    console.log("left");
    this.http.get<any>(environment.webservicebaseUrl + "/all-categories").subscribe(data => {
      this.list = data.categories;
      //console.log(data.categories);
      
      var tree = simTree({
        el: '#tree',
        data: this.list,
        check: true,
        linkParent: true,
        //check: true,
        onClick: function (item) {
          //console.log(item);

        },
        onChange: function (item) {
          var selectedCategories = new Array();
          $.each( item, function( key, value ) {
              selectedCategories.push(value["id"]);
          });
          $("#selected_cats").val(selectedCategories);
          $("#btnloadcats").click();
        }
      });
    })
  }

  btncats() {
    this.categoryService.categorySelected.next(this.allSelectedCats.nativeElement.value);
  } 

}





