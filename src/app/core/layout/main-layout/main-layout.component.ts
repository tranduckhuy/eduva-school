import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { RouteMetadataDirective } from '../../../shared/directives/route-metadata/route-metadata.directive';
import { LayoutHeadingService } from '../../../shared/services/layout-heading/layout-heading.service';
import { HeaderComponent } from '../header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { LayoutHeadingComponent } from '../layout-heading/layout-heading.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouteMetadataDirective,
    HeaderComponent,
    NavbarComponent,
    LayoutHeadingComponent,
  ],
  template: `
    <div [ngClass]="isSidebarCollapsed() ? 'sidebar-collapsed' : ''">
      <!-- Navbar -->
      <div class="navbar" #navbar>
        <app-navbar
          (closeSidebar)="toggleSidebar()"
          [isSidebarCollapsed]="isSidebarCollapsed()" />
      </div>

      <!-- Overlay -->
      <div
        (click)="toggleSidebar()"
        class="invisible fixed inset-0 z-20 bg-[#0f172a80] transition-all duration-100 ease-linear"
        [ngClass]="{
          'md:visible': !isSidebarCollapsed(),
        }"></div>

      <!-- Main Content -->
      <div class="main-content md:!pl-0" #mainElement>
        <app-header
          (toggleSidebar)="manualToggleSidebar()"
          [isManuallyToggled]="isManuallyToggled()" />

        <main routeMetadata class="e-container-fluid mb-10 mt-[94px]">
          <div class="px-3">
            <app-layout-heading [heading]="heading()" />
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styleUrl: './main-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly layoutHeadingService = inject(LayoutHeadingService);
  private readonly destroyRef = inject(DestroyRef);

  heading = this.layoutHeadingService.heading;
  navbar = viewChild<ElementRef>('navbar');
  mainElement = viewChild<ElementRef>('mainElement');

  isSidebarCollapsed = signal<boolean>(false);
  isManuallyToggled = signal<boolean>(true);

  constructor() {
    this.checkScreenSize();

    afterNextRender(() => {
      // Set up resize observer
      fromEvent(window, 'resize')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.checkScreenSize();
        });

      // Only execute if window width is greater than 991.98px
      if (window.innerWidth >= 992) {
        const navbarElement = this.navbar()?.nativeElement;
        if (navbarElement) {
          navbarElement.addEventListener('mouseenter', () => {
            // Only expand if collapsed and not manually toggled
            if (this.isSidebarCollapsed() && !this.isManuallyToggled()) {
              this.isSidebarCollapsed.set(false);
              const mainEl = this.mainElement()?.nativeElement;
              if (mainEl) {
                mainEl.style.paddingLeft = '80px';
              }
            }
          });

          navbarElement.addEventListener('mouseleave', () => {
            // Only collapse if not manually toggled
            const mainEl = this.mainElement()?.nativeElement;
            if (mainEl && !this.isManuallyToggled()) {
              mainEl.style.paddingLeft = '80px';
            }
            if (!this.isManuallyToggled()) {
              this.isSidebarCollapsed.set(true);
            }
          });
        }
      }
    });
  }

  private checkScreenSize(): void {
    if (window.innerWidth > 991.98) {
      this.isSidebarCollapsed.set(false);
      this.isManuallyToggled.set(true);

      // Adjust padding if needed
      const mainEl = this.mainElement()?.nativeElement;
      if (mainEl) {
        mainEl.style.paddingLeft = '250px';
      }
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  manualToggleSidebar() {
    this.isManuallyToggled.set(!this.isManuallyToggled());
    const mainEl = this.mainElement()?.nativeElement;
    if (this.isManuallyToggled()) {
      mainEl && (mainEl.style.paddingLeft = '250px');
    } else {
      mainEl && (mainEl.style.paddingLeft = '80px');
    }
    this.toggleSidebar();
  }
}
