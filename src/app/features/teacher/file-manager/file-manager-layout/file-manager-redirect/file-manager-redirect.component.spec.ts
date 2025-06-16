import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileManagerRedirectComponent } from './file-manager-redirect.component';

describe('FileManagerRedirectComponent', () => {
  let component: FileManagerRedirectComponent;
  let fixture: ComponentFixture<FileManagerRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileManagerRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileManagerRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
