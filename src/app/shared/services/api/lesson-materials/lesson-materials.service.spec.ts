import { TestBed } from '@angular/core/testing';

import { LessonMaterialsService } from './lesson-materials.service';

describe('LessonMaterialsService', () => {
  let service: LessonMaterialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonMaterialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
