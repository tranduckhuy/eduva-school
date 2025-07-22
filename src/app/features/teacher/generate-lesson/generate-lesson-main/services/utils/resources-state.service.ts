import { Injectable, signal, computed } from '@angular/core';

import { type ContentType } from '../../../../../../shared/models/enum/lesson-material.enum';

import { type LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';

export type SourceItem = {
  id: string;
  name: string;
  checked: boolean;
  isUploading?: boolean;
  type: 'pdf' | 'txt';
  file?: File;
};

export interface AiGeneratedMetadata {
  title: string;
  contentType: ContentType;
  duration: number;
  fileSize: number;
  blobName: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResourcesStateService {
  // ? Signal State Management
  private readonly sourceListSignal = signal<SourceItem[]>([]);
  sourceList = this.sourceListSignal.asReadonly();

  private readonly isLoadingSignal = signal(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  private readonly hasInteractedSignal = signal(false);
  hasInteracted = this.hasInteractedSignal.asReadonly();

  private readonly hasPreviewContentSignal = signal(false);
  readonly hasPreviewContentSuccessfully =
    this.hasPreviewContentSignal.asReadonly();

  private readonly hasGeneratedSuccessfullySignal = signal(false);
  readonly hasGeneratedSuccessfully =
    this.hasGeneratedSuccessfullySignal.asReadonly();

  private readonly generatedTypeSignal = signal<LessonGenerationType | null>(
    null
  );
  readonly generatedType = this.generatedTypeSignal.asReadonly();

  private readonly aiGeneratedMetadataSignal =
    signal<AiGeneratedMetadata | null>(null);
  readonly aiGeneratedMetadata = this.aiGeneratedMetadataSignal.asReadonly();

  // ? Computed
  readonly checkedFiles = computed(() =>
    this.sourceListSignal()
      .filter(i => i.checked && !i.isUploading && i.file)
      .map(i => i.file as File)
  );

  readonly totalSources = computed(() => this.sourceListSignal().length);

  readonly totalCheckedSources = computed(
    () =>
      this.sourceListSignal().filter(i => i.checked && !i.isUploading).length
  );

  updateSourceList(updateFn: (items: SourceItem[]) => SourceItem[]) {
    this.sourceListSignal.update(updateFn);
  }

  updateHasInteracted(value: boolean) {
    this.hasInteractedSignal.set(value);
  }

  updateIsLoading(value: boolean) {
    this.isLoadingSignal.set(value);
  }

  markGeneratedPreviewContentSuccess() {
    this.hasPreviewContentSignal.set(true);
  }

  resetGeneratedPreviewContentStatus() {
    this.hasPreviewContentSignal.set(false);
  }

  markGeneratedSuccess() {
    this.hasGeneratedSuccessfullySignal.set(true);
  }

  resetGeneratedStatus() {
    this.hasGeneratedSuccessfullySignal.set(false);
  }

  setGeneratedType(type: LessonGenerationType) {
    this.generatedTypeSignal.set(type);
  }

  setAiGeneratedMetadata(data: AiGeneratedMetadata) {
    this.aiGeneratedMetadataSignal.set(data);
  }

  clearAiGeneratedMetadata() {
    this.aiGeneratedMetadataSignal.set(null);
  }
}
