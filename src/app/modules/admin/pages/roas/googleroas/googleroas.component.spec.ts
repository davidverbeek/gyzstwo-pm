import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleroasComponent } from './googleroas.component';

describe('GoogleroasComponent', () => {
  let component: GoogleroasComponent;
  let fixture: ComponentFixture<GoogleroasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleroasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleroasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
