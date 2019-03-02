import { TestBed } from '@angular/core/testing';

import { TranslateService } from './translate.service';

describe('TranslateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TranslateService = TestBed.get(TranslateService);
    expect(service).toBeTruthy();
  });
});
