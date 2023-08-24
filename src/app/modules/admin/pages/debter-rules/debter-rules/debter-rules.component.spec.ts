import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebterRulesComponent } from './debter-rules.component';

describe('DebterRulesComponent', () => {
  let component: DebterRulesComponent;
  let fixture: ComponentFixture<DebterRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebterRulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebterRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
