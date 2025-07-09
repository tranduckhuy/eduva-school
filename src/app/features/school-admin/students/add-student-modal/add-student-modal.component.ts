import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

@Component({
  selector: 'app-add-student-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormControlComponent,
  ],
  templateUrl: './add-student-modal.component.html',
  styleUrl: './add-student-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStudentModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly globalModalService = inject(GlobalModalService);

  form: FormGroup;

  // signal
  submitted = signal<boolean>(false);
  name = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');

  constructor() {
    this.form = this.fb.group({});
  }

  // function
  onSubmit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;
    // Submit logic
  }

  closeModal() {
    this.globalModalService.close();
  }
}
