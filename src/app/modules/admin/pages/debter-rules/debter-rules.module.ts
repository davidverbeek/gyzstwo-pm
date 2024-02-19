import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebterRulesComponent } from './debter-rules/debter-rules.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DebterRulesComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ]
})
export class DebterRulesModule { }
