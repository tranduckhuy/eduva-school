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
  selector: 'app-teacher',
  standalone: true,
  imports: [FormControlComponent, ButtonComponent, RouterLink],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherComponent {
  private readonly userService = inject(UserService);
  private readonly loadingService = inject(LoadingService);

  teacherId = input.required<string>();

  isLoading = this.loadingService;
  teacherDetail = this.userService.userDetail;

  ngOnInit(): void {
    this.userService.getUserDetailById(this.teacherId()).subscribe();
  }
}
