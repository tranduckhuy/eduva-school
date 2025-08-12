import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './choose-image-modal.component.html',
  styleUrl: './choose-image-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseImageModalComponent implements OnInit {
  private readonly uploadFileService = inject(UploadFileService);
  readonly modalData = inject(MODAL_DATA) as ChooseImageModalData;

  readonly backgroundImageUrls = signal<string[]>([]);
  readonly selectedImageUrl = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadBackgroundImageUrls();
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

  private async loadBackgroundImageUrls(): Promise<void> {
    this.isLoading.set(true);
    try {
      const urls =
        await this.uploadFileService.getPublicUrls('classroom-images');

      // ? Sort URLs to put current image first if it exists
      const sortedUrls = this.sortUrlsWithCurrentFirst(urls);

      this.backgroundImageUrls.set(sortedUrls);

      // ? Set current image as selected if it exists
      if (this.modalData.currentImageUrl) {
        this.selectedImageUrl.set(this.modalData.currentImageUrl);
      }

      this.isLoading.set(false);
    } catch {
      this.isLoading.set(false);
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
}
