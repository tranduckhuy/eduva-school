import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSettingsModalComponent } from './generate-settings-modal.component';

describe('GenerateSettingsModalComponent', () => {
  let component: GenerateSettingsModalComponent;
  let fixture: ComponentFixture<GenerateSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateSettingsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
