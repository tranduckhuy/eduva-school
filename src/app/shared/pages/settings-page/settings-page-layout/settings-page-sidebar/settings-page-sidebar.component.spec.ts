import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPageSidebarComponent } from './settings-page-sidebar.component';

describe('SettingsPageSidebarComponent', () => {
  let component: SettingsPageSidebarComponent;
  let fixture: ComponentFixture<SettingsPageSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsPageSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
