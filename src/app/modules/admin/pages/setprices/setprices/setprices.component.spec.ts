import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetpricesComponent } from './setprices.component';

describe('SetpricesComponent', () => {
  let component: SetpricesComponent;
  let fixture: ComponentFixture<SetpricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetpricesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetpricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
