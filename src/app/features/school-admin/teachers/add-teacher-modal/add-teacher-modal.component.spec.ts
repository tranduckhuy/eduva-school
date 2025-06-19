import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeacherModalComponent } from './add-teacher-modal.component';

describe('AddTeacherModalComponent', () => {
  let component: AddTeacherModalComponent;
  let fixture: ComponentFixture<AddTeacherModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTeacherModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTeacherModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
