import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, Data, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PageTitleService } from './page-title.service';
import { BehaviorSubject, of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PageTitleService', () => {
  let service: PageTitleService;
  let routerEvents$: BehaviorSubject<any>;
  let mockTitle: Title;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: ActivatedRoute;

  beforeEach(() => {
    routerEvents$ = new BehaviorSubject<any>(null);

    mockTitle = {
      setTitle: vi.fn(),
    } as unknown as Title;

    mockRouter = {
      events: routerEvents$.asObservable(),
    };

    const data$: BehaviorSubject<Data> = new BehaviorSubject<Data>({});
    mockActivatedRoute = {
      firstChild: {
        firstChild: {
          data: data$.asObservable(),
        } as any,
      } as any,
    } as ActivatedRoute;

    TestBed.configureTestingModule({
      providers: [
        PageTitleService,
        { provide: Title, useValue: mockTitle },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    service = TestBed.inject(PageTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set default title when no title in data', () => {
    service.init();

    routerEvents$.next(new NavigationEnd(1, '/test', '/test'));

    expect(mockTitle.setTitle).toHaveBeenCalledWith(
      'EDUVA - Học, Học Nữa, Học Mãi'
    );
  });

  it('should set custom title when data.title exists', () => {
    const customData$: BehaviorSubject<Data> = new BehaviorSubject<Data>({
      title: 'Dashboard',
    });

    (mockActivatedRoute.firstChild!.firstChild! as any).data =
      customData$.asObservable();

    service.init();

    routerEvents$.next(new NavigationEnd(2, '/dashboard', '/dashboard'));

    expect(mockTitle.setTitle).toHaveBeenCalledWith('Dashboard | by EDUVA');
  });
});
