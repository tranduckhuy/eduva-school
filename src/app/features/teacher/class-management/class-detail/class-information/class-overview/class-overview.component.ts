import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'class-overview',
  standalone: true,
  imports: [ButtonModule, AccordionModule, ConfirmPopupModule],
  templateUrl: './class-overview.component.html',
  styleUrl: './class-overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassOverviewComponent {
  private readonly confirmationService = inject(ConfirmationService);

  confirmRefresh(event: Event) {
    this.confirmationService.confirm({
      key: 'popup',
      target: event.target as EventTarget,
      message: 'Bạn có muốn làm mới mã lớp không?',
      rejectButtonProps: {
        label: 'Không',
        size: 'small',
        severity: 'secondary',
        styleClass: 'h-[30px]',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Có',
        size: 'small',
        severity: 'info',
        styleClass: 'h-[30px]',
        outlined: true,
      },
    });
  }
}
