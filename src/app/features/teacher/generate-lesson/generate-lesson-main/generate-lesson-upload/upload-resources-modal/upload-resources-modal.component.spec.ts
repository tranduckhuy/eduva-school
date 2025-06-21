import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadResourcesModalComponent } from './upload-resources-modal.component';

describe('UploadResourcesModalComponent', () => {
  let component: UploadResourcesModalComponent;
  let fixture: ComponentFixture<UploadResourcesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadResourcesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadResourcesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
