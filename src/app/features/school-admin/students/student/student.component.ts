import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { UserService } from '../../../../shared/services/api/user/user.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormControlComponent, ButtonComponent, RouterLink],
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
