import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { ReadonlyModeService } from '../../services/core/readonly-mode/readonly-mode.service';

@Directive({
  selector: '[appReadonlyMode]',
  standalone: true,
})
export class ReadonlyModeDirective {
  // todo Readonly mode for user have extended 14 days can just "read (GET)" data from server
  // todo and can not "create (POST)" or "update (PUT & DELETE)" data
  // todo Can check "boolean" from UserProfile for this logic if Backend have that field in UserProfile
  // ! Use this directive on each "Element" that you want it can not request "create (POST)" or "update (PUT & DELETE)" data

  private readonly readonlyService = inject(ReadonlyModeService);
  private readonly vcr = inject(ViewContainerRef);
  private readonly tpl = inject(TemplateRef<any>);

  appReadonlyDisable = input<boolean>(false);

  constructor() {
    effect(() => {
      this.vcr.clear();
      const isReadonly = this.readonlyService.isReadonly();
      const shouldShow = this.appReadonlyDisable() ? !isReadonly : isReadonly;

      if (!shouldShow) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}
