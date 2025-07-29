import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { SkeletonModule } from 'primeng/skeleton';

import { SchoolService } from '../../../shared/services/api/school/school.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';

import { customEmailValidator } from '../../../shared/utils/form-validators';

import {
  VIETNAM_PHONE_REGEX,
  WELL_URI_REGEX,
} from '../../../shared/constants/common.constant';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormControlComponent } from '../../../shared/components/form-control/form-control.component';
import { SchoolInformationSkeletonComponent } from '../../../shared/components/skeleton/school-information-skeleton/school-information-skeleton.component';

import { type CreateSchoolRequest } from '../../../shared/models/api/request/command/create-school-request.model';

@Component({
  selector: 'app-school-information',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SkeletonModule,
    ButtonComponent,
    FormControlComponent,
    SchoolInformationSkeletonComponent,
  ],
  templateUrl: './school-information.component.html',
  styleUrl: './school-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolInformationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly schoolService = inject(SchoolService);
  private readonly loadingService = inject(LoadingService);

  schoolDetail = this.schoolService.schoolDetail;
  isLoadingGet = this.loadingService.is('get-current-school');
  isLoadingUpdate = this.loadingService.is('update-school-information');

  isEdit = signal<boolean>(false);
  submitted = signal<boolean>(false);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      contactEmail: ['', [Validators.required, customEmailValidator]],
      contactPhone: [
        '',
        [Validators.required, Validators.pattern(VIETNAM_PHONE_REGEX)],
      ],
      address: ['', Validators.required],
      websiteUrl: ['', Validators.pattern(WELL_URI_REGEX)],
    });
  }

  ngOnInit(): void {
    this.schoolService.getCurrentSchoolInformation().subscribe({
      next: () =>
        this.form.patchValue({
          name: this.schoolDetail()?.name,
          contactEmail: this.schoolDetail()?.contactEmail,
          contactPhone: this.schoolDetail()?.contactPhone,
          address: this.schoolDetail()?.address,
          websiteUrl: this.schoolDetail()?.websiteUrl,
        }),
    });
  }

  onSubmit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    const schoolId = this.schoolDetail()?.id;

    if (this.form.invalid || !schoolId) return;

    const request: CreateSchoolRequest = this.form.value;
    this.schoolService.updateSchool(schoolId, request).subscribe({
      next: () => this.toggleEdit(),
    });
  }

  toggleEdit() {
    this.isEdit.set(!this.isEdit());
  }
}
