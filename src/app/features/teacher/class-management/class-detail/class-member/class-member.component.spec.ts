import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassMemberComponent } from './class-member.component';

describe('ClassMemberComponent', () => {
  let component: ClassMemberComponent;
  let fixture: ComponentFixture<ClassMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
