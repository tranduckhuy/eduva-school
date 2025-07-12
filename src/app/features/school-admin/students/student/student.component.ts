import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { UserService } from '../../../../shared/services/api/user/user.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormControlComponent],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentComponent {
  private readonly userService = inject(UserService);
  private readonly loadingService = inject(LoadingService);

  studentId = input.required<string>();

  isLoading = this.loadingService;
  studentDetail = this.userService.userDetail;

  ngOnInit(): void {
    this.userService.getUserDetailById(this.studentId()).subscribe();
  }
}
