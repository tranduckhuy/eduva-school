import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { GlobalModalService } from '../../services/layout/global-modal/global-modal.service';

import { ButtonComponent } from '../button/button.component';
import { ImportAccountModalsComponent } from './import-account-modals/import-account-modals.component';

@Component({
  selector: 'app-import-accounts',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './import-accounts.component.html',
  styleUrl: './import-accounts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAccountsComponent {
  private readonly globalModalService = inject(GlobalModalService);

  // input
  readonly title = input<string>();
  openModal() {
    this.globalModalService.open(ImportAccountModalsComponent, {
      title: this.title(),
    });
  }
}
