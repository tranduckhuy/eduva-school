import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTypeFilterComponent } from './file-type-filter.component';

describe('FileTypeFilterComponent', () => {
  let component: FileTypeFilterComponent;
  let fixture: ComponentFixture<FileTypeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileTypeFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
