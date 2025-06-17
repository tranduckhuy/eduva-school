import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { GlobalModalService } from '../../services/global-modal/global-modal.service';
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

  openModal() {
    this.globalModalService.open(
      ImportAccountModalsComponent,
      '',
      'max-w-[800px]'
    );
  }
}
