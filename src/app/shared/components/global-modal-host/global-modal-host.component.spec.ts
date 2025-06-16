import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalModalHostComponent } from './global-modal-host.component';

describe('GlobalModalHostComponent', () => {
  let component: GlobalModalHostComponent;
  let fixture: ComponentFixture<GlobalModalHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalModalHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalModalHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
