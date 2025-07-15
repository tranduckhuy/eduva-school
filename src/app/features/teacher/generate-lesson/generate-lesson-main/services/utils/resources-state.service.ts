import { computed, Injectable, signal } from '@angular/core';

export type SourceItem = {
  id: string;
  name: string;
  checked: boolean;
  isUploading?: boolean;
  type: 'pdf' | 'txt';
  file?: File;
};

@Injectable({
  providedIn: 'root',
})
export class ResourcesStateService {
  private readonly sourceListSignal = signal<SourceItem[]>([]);
  sourceList = this.sourceListSignal.asReadonly();

  private readonly hasInteractedSignal = signal(false);
  hasInteracted = this.hasInteractedSignal.asReadonly();

  private readonly isLoadingSignal = signal(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  private readonly hasGeneratedSuccessfullySignal = signal(false);
  readonly hasGeneratedSuccessfully =
    this.hasGeneratedSuccessfullySignal.asReadonly();

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

  markGeneratedSuccess() {
    this.hasGeneratedSuccessfullySignal.set(true);
  }

  resetGeneratedStatus() {
    this.hasGeneratedSuccessfullySignal.set(false);
  }
}
