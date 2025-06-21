import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { GlobalModalService } from '../../../../shared/services/global-modal/global-modal.service';
import { ButtonModule } from 'primeng/button';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { FormsModule, NgForm } from '@angular/forms';
import { MODAL_DATA } from '../../../../shared/constants/modal-data.token';

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
  readonly modalData = inject(MODAL_DATA);

  reason = signal<string>('');
  submitted = signal<boolean>(false);

  onSubmit(form: NgForm) {
    this.submitted.set(true);
  }

  closeModal() {
    this.globalModalService.close();
  }
}
