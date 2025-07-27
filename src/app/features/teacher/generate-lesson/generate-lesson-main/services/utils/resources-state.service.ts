import { Injectable, signal, computed } from '@angular/core';

import { type ContentType } from '../../../../../../shared/models/enum/lesson-material.enum';

import { type LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';

export type SourceItem = {
  id: string;
  name: string;
  checked: boolean;
  isUploading?: boolean;
  type: 'pdf' | 'docx';
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

  private readonly aiGeneratedMetadataMapSignal = signal<Record<
    LessonGenerationType,
    AiGeneratedMetadata
  > | null>(null);
  readonly aiGeneratedMetadataMap =
    this.aiGeneratedMetadataMapSignal.asReadonly();

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

  setAiGeneratedMetadata(
    type: LessonGenerationType,
    metadata: AiGeneratedMetadata
  ) {
    const current = this.aiGeneratedMetadataMapSignal() ?? {};
    this.aiGeneratedMetadataMapSignal.set({
      ...current,
      [type]: metadata,
    } as Record<LessonGenerationType, AiGeneratedMetadata>);
  }

  clearAiGeneratedMetadata() {
    this.aiGeneratedMetadataMapSignal.set(null);
  }

  resetAll(): void {
    this.sourceListSignal.set([]);
    this.isLoadingSignal.set(false);
    this.hasInteractedSignal.set(false);
    this.hasPreviewContentSignal.set(false);
    this.hasGeneratedSuccessfullySignal.set(false);
    this.generatedTypeSignal.set(null);
    this.aiGeneratedMetadataMapSignal.set(null);
  }
}
