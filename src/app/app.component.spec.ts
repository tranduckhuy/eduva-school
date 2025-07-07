import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { PageTitleService } from './shared/services/core/page-title/page-title.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AppComponent', () => {
  let pageTitleServiceMock: { init: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    pageTitleServiceMock = {
      init: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: PageTitleService, useValue: pageTitleServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the AppComponent', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call pageTitleService.init() on ngOnInit', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(pageTitleServiceMock.init).toHaveBeenCalled();
  });

  it('should contain router-outlet in DOM', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });
});
