import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideSetPricesComponent } from './side-set-prices.component';

describe('SideSetPricesComponent', () => {
  let component: SideSetPricesComponent;
  let fixture: ComponentFixture<SideSetPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideSetPricesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideSetPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
