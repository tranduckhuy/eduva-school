import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileManagerSidebarComponent } from './file-manager-sidebar.component';

describe('FileManagerSidebarComponent', () => {
  let component: FileManagerSidebarComponent;
  let fixture: ComponentFixture<FileManagerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileManagerSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileManagerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
