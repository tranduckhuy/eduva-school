import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopActiveSchoolsComponent } from './top-active-schools.component';

describe('TopActiveSchoolsComponent', () => {
  let component: TopActiveSchoolsComponent;
  let fixture: ComponentFixture<TopActiveSchoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopActiveSchoolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopActiveSchoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
