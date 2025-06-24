import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

@Component({
  selector: 'app-add-teacher-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, FormControlComponent],
  templateUrl: './add-teacher-modal.component.html',
  styleUrl: './add-teacher-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTeacherModalComponent {
  private readonly globalModalService = inject(GlobalModalService);

  // signal
  submitted = signal<boolean>(false);
  name = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');
  isContentModerator = signal<boolean>(false);

  // function
  onSubmit(form: NgForm) {
    this.submitted.set(true);
    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }
    // Submit logic
  }

  closeModal() {
    this.globalModalService.close();
  }
}
