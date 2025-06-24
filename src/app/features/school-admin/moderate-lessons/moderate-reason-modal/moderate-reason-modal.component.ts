import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { MODAL_DATA } from '../../../../shared/services/layout/global-modal/modal-data.token';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

interface ModerateReasonModalData {
  isApproved: boolean;
}
@Component({
  selector: 'app-moderate-reason-modal',
  standalone: true,
  imports: [ButtonModule, FormControlComponent, FormsModule],
  templateUrl: './moderate-reason-modal.component.html',
  styleUrl: './moderate-reason-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerateReasonModalComponent {
  private readonly globalModalService = inject(GlobalModalService);
  readonly modalData = inject<ModerateReasonModalData>(MODAL_DATA);

  reason = signal<string>('');
  submitted = signal<boolean>(false);

  onSubmit(form: NgForm) {
    this.submitted.set(true);
  }

  closeModal() {
    this.globalModalService.close();
  }
}
