import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchoolInformationComponent } from './add-school-information.component';

describe('AddSchoolInformationComponent', () => {
  let component: AddSchoolInformationComponent;
  let fixture: ComponentFixture<AddSchoolInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSchoolInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSchoolInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
