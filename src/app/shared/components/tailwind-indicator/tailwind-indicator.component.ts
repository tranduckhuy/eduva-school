import { ChangeDetectionStrategy, Component, isDevMode } from '@angular/core';

@Component({
  selector: 'app-tailwind-indicator',
  standalone: true,
  imports: [],
  template: `
    @if (_isDevMode) {
      <div
        class="dark:bg-white dark:text-gray-800 fixed bottom-1 left-1 z-[99999] flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-4 text-xs text-white">
        <div class="block xxxxl:hidden" title="xxxxxl: >=1800px">xxxxxl</div>
        <div class="hidden xxxxl:block xxxl:hidden" title="xxxxl: >=1600px">
          xxxxl
        </div>
        <div class="hidden xxxl:block xxl:hidden" title="xxxl: >=1500px">
          xxxl
        </div>
        <div class="hidden xxl:block xl:hidden" title="xxl: >=1400px">xxl</div>
        <div class="hidden xl:block lg:hidden" title="xl: >=1200px && <1400">
          xl
        </div>
        <div class="hidden lg:block md:hidden" title="lg: >=992px && <1024px">
          lg
        </div>
        <div class="hidden md:block sm:hidden" title="md: >=768px && <992px">
          md
        </div>
        <div class="hidden sm:block xs:hidden" title="sm: >=576px && <768px">
          sm
        </div>
        <div class="hidden xs:block" title="xs: <567px">xs</div>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TailwindIndicatorComponent {
  protected readonly _isDevMode = isDevMode();
}
