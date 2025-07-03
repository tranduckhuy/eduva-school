import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAvatarModalComponent } from './update-avatar-modal.component';

describe('UpdateAvatarModalComponent', () => {
  let component: UpdateAvatarModalComponent;
  let fixture: ComponentFixture<UpdateAvatarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAvatarModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateAvatarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
