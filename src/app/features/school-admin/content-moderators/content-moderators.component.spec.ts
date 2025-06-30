import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentModeratorsComponent } from './content-moderators.component';

describe('ContentModeratorsComponent', () => {
  let component: ContentModeratorsComponent;
  let fixture: ComponentFixture<ContentModeratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentModeratorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentModeratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
