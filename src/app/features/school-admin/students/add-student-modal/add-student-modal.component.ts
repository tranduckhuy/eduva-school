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
  selector: 'app-add-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, FormControlComponent],
  templateUrl: './add-student-modal.component.html',
  styleUrl: './add-student-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStudentModalComponent {
  private readonly globalModalService = inject(GlobalModalService);

  // signal
  submitted = signal<boolean>(false);
  name = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');

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
