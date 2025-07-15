import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { ProgressBar } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';

type UploadModalData = {
  onUploaded: (file: File) => void;
  current: number;
  max: number;
};

@Component({
  selector: 'upload-resources-modal',
  standalone: true,
  imports: [CommonModule, FileUpload, ProgressBar, ButtonModule, TooltipModule],
  templateUrl: './upload-resources-modal.component.html',
  styleUrl: './upload-resources-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadResourcesModalComponent {
  private readonly modalService = inject(GlobalModalService);

  fileUploaded = output<{ fileName: string; lastModified: number }>();

  get modalData(): UploadModalData {
    return this.modalService.data() as UploadModalData;
  }

  get current(): number {
    return this.modalData.current;
  }

  get max(): number {
    return this.modalData.max;
  }

  onSelectFile(event: FileSelectEvent) {
    const file = event.files?.[0];
    if (file) {
      this.modalData.onUploaded?.(file);
      this.closeModal();
    }
  }

  closeModal() {
    this.modalService.close();
  }
}
