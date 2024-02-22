import { TestBed } from '@angular/core/testing';

import { SimtreeService } from './simtree.service';

describe('SimtreeService', () => {
  let service: SimtreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimtreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
