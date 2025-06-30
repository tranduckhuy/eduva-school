import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { UserService } from '../../../../shared/services/api/user/user.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-content-moderator',
  standalone: true,
  imports: [FormControlComponent, ButtonComponent, RouterLink],

  templateUrl: './content-moderator.component.html',
  styleUrl: './content-moderator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentModeratorComponent {
  private readonly userService = inject(UserService);
  private readonly loadingService = inject(LoadingService);

  contentModeratorId = input.required<string>();

  isLoading = this.loadingService;
  contentModeratorDetail = this.userService.userDetail;

  ngOnInit(): void {
    this.userService.getUserDetailById(this.contentModeratorId()).subscribe();
  }
}
