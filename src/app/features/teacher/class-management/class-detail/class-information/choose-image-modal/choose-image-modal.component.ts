import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../../../shared/services/core/loading/loading.service';
import { UploadFileService } from '../../../../../../shared/services/api/file/upload-file.service';
import { MODAL_DATA } from '../../../../../../shared/tokens/injection/modal-data.token';

interface ChooseImageModalData {
  currentImageUrl?: string;
  onImageSelected: (selectedImageUrl: string) => void;
  onModalClosed: () => void;
}

@Component({
  selector: 'app-choose-image-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './choose-image-modal.component.html',
  styleUrl: './choose-image-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseImageModalComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly uploadFileService = inject(UploadFileService);
  readonly modalData = inject(MODAL_DATA) as ChooseImageModalData;

  readonly isLoading = this.loadingService.is('update-class-information');
  readonly backgroundImageUrls = signal<string[]>([]);
  readonly selectedImageUrl = signal<string>('');

  async ngOnInit(): Promise<void> {
    await this.loadBackgroundImageUrls();
  }

  private async loadBackgroundImageUrls(): Promise<void> {
    try {
      const urls = await this.uploadFileService.getBackgroundImageUrls();

      // ? Sort URLs to put current image first if it exists
      const sortedUrls = this.sortUrlsWithCurrentFirst(urls);

      this.backgroundImageUrls.set(sortedUrls);

      // ? Set current image as selected if it exists
      if (this.modalData.currentImageUrl) {
        this.selectedImageUrl.set(this.modalData.currentImageUrl);
      }
    } catch (error) {
      this.backgroundImageUrls.set([]);
    }
  }

  private sortUrlsWithCurrentFirst(urls: string[]): string[] {
    if (!this.modalData.currentImageUrl) {
      return urls;
    }

    const currentUrl = this.modalData.currentImageUrl;
    const currentUrlIndex = urls.findIndex(url => url === currentUrl);

    if (currentUrlIndex === -1) {
      // ? If current URL is not in the list, add it at the beginning
      return [currentUrl, ...urls];
    }

    // ? Move current URL to the beginning
    const filteredUrls = urls.filter(url => url !== currentUrl);
    return [currentUrl, ...filteredUrls];
  }

  selectImage(imageUrl: string) {
    this.selectedImageUrl.set(imageUrl);
  }

  onSave() {
    const selectedUrl = this.selectedImageUrl();
    if (selectedUrl && this.modalData.onImageSelected) {
      this.modalData.onImageSelected(selectedUrl);
    }
    this.closeModal();
  }

  closeModal() {
    if (this.modalData.onModalClosed) {
      this.modalData.onModalClosed();
    }
  }
}
