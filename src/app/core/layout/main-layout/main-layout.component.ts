import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  DestroyRef,
  afterNextRender,
  viewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { fromEvent } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { RouteMetadataDirective } from '../../../shared/directives/route-metadata/route-metadata.directive';
import { LayoutHeadingService } from '../../../shared/services/layout/layout-heading/layout-heading.service';

import { HeaderComponent } from '../header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { LayoutHeadingComponent } from '../layout-heading/layout-heading.component';
import { GlobalModalHostComponent } from '../../../shared/components/global-modal-host/global-modal-host.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    ConfirmDialogModule,
    RouteMetadataDirective,
    HeaderComponent,
    NavbarComponent,
    LayoutHeadingComponent,
    GlobalModalHostComponent,
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
          [isSmallScreen]="isSmallScreen()"
          [isManuallyToggled]="isManuallyToggled()" />

        <main routeMetadata class="e-container-fluid mb-10 mt-[94px]">
          <div class="px-3 lg:px-2">
            <app-layout-heading [heading]="heading()" />

            <router-outlet />
          </div>
        </main>
      </div>
    </div>

    <p-toast />
    <p-confirmdialog [baseZIndex]="1000" />
    <app-global-modal-host />
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

  isSmallScreen = signal<boolean>(false);
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
            if (this.isSidebarCollapsed() && !this.isManuallyToggled()) {
              this.isSidebarCollapsed.set(false);
              const mainEl = this.mainElement()?.nativeElement;
              if (mainEl) {
                mainEl.style.paddingLeft = '80px';
              }
            }
          });

          navbarElement.addEventListener('mouseleave', () => {
            if (!this.isManuallyToggled()) {
              this.isSidebarCollapsed.set(true);
              const mainEl = this.mainElement()?.nativeElement;
              if (mainEl) {
                mainEl.style.paddingLeft = '80px';
              }
            }
          });
        }
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  manualToggleSidebar() {
    const next = !this.isManuallyToggled();
    this.isManuallyToggled.set(next);

    const mainEl = this.mainElement()?.nativeElement;
    if (mainEl) {
      if (this.isSmallScreen()) {
        mainEl.style.paddingLeft = '0';
      } else {
        mainEl.style.paddingLeft = next ? '250px' : '80px';
      }
    }

    this.toggleSidebar();
  }

  private checkScreenSize(): void {
    const small = window.innerWidth <= 991.98;
    this.isSmallScreen.set(small);

    if (small) {
      this.isSidebarCollapsed.set(true);
      this.isManuallyToggled.set(false);
    } else {
      this.isSidebarCollapsed.set(false);
      this.isManuallyToggled.set(true);
    }

    const mainEl = this.mainElement()?.nativeElement;
    if (mainEl) {
      let paddingLeft = '0';

      if (!small) {
        paddingLeft = this.isManuallyToggled() ? '250px' : '80px';
      }

      mainEl.style.paddingLeft = paddingLeft;
    }
  }
}
