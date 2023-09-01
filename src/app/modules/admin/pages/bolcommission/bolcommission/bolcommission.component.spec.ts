import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolcommissionComponent } from './bolcommission.component';

describe('BolcommissionComponent', () => {
  let component: BolcommissionComponent;
  let fixture: ComponentFixture<BolcommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BolcommissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolcommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
