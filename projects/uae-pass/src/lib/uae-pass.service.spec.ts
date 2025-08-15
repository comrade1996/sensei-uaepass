import { TestBed } from '@angular/core/testing';

import { UaePassService } from './uae-pass.service';

describe('UaePassService', () => {
  let service: UaePassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UaePassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
